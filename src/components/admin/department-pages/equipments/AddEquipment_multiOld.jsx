/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { Row, Col, Button, Alert } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import { trimString } from "../../../../shared/helper";
import Select from "react-select";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Layout from "../../layout/Layout";
import TinyMCE from "react-tinymce";
import { tinymce } from "react-tinymce";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

// const stringFormat = (str) => {
//   str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
//   str = str.split(" ");
//   const strArr = [];
//   console.log(str);

//   for (let i in str) {
//     if (str[i] !== "") {
//       strArr.push(str[i]);
//     }
//   }
//   const formatedString = strArr.join("-");
//   return formatedString.toLowerCase();
// };

const removeDropZoneFiles = (fileName, objRef, setErrors) => {
  var newArr = [];
  for (let index = 0; index < objRef.state.files.length; index++) {
    const element = objRef.state.files[index];

    if (fileName === element.name) {
    } else {
      newArr.push(element);
    }
  }

  var fileListHtml = newArr.map((file) => (
    <Alert key={file.name}>
      <span onClick={() => removeDropZoneFiles(file.name, objRef, setErrors)}>
        <i className="far fa-times-circle"></i>
      </span>{" "}
      {file.name}
    </Alert>
  ));
  setErrors({ files: "" });
  objRef.setState({
    files: newArr,
    filesHtml: fileListHtml,
  });
};

class AddEquipment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      files: [],
      equipment_id: 0,
      prev_files: [],
      file_name: [],
      clonePrevFiles: [],
      isValidFile: false,
    };
  }

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("equipment"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    let postdata = {
      equipment_name: values.equipment_name,
      equipment_description: values.equipment_description,
      images: this.state.files,
      date_posted: new Date().toLocaleString(),
      status: String(values.status),
    };
    console.log("postdata", postdata);

    //file upload
    // if (this.state.files && this.state.files.length > 0) {
    //   for (let index = 0; index < this.state.files.length; index++) {
    //     if (this.state.files[index].size > FILE_SIZE) {
    //       actions.setErrors({ files: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
    //       actions.setSubmitting(false);
    //     } else {
    //       const element = this.state.files[index];
    //       formData.append("file", element);
    //     }
    //   }
    //   // for (const file of this.state.files) {
    //   //     alert(file);
    //   //     formData.append('file', file)
    //   // }
    //   //formData.append('file', this.state.file);
    // } else {
    //   formData.append("file", "");
    // }
    let formData = new FormData();

    formData.append("equipment_name", values.equipment_name);
    formData.append("equipment_description", values.equipment_description);
    formData.append("status", String(values.status));

    let url = `/api/department/equipment`;
    let method = "POST";
    console.log("this.state.files.size false", this.state.files[0].size);
    // actions.setSubmitting(false);

    if (this.state.files && this.state.files.length > 0) {
      let element = [];
      for (let index = 0; index < this.state.files.length; index++) {
        if (this.state.files[index].size > FILE_SIZE) {
          actions.setErrors({ files: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
          actions.setSubmitting(false);
        }
        // if (this.state.files.size > FILE_SIZE) {
        //   actions.setErrors({ files: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        //   actions.setSubmitting(false);
        // }
        else {
          getHeightWidth(this.state.files[index]).then((dimension) => {
            const { height, width } = dimension;
            const offerDimension = getResolution("equipment");
            if (
              height != offerDimension.height ||
              width != offerDimension.width
            ) {
              console.log("didnt match");
              actions.setErrors({
                files: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
              });
              actions.setSubmitting(false);
            } else {
              // formData.append("images", this.state.images);
              element.push(this.state.files[index].name)
              
              // formData.append("images", element);
              console.log(" element", element);

              // API({
              //   method: method,
              //   url: url,
              //   data: formData,
              // })
              //   .then((res) => {
              //     this.setState({ showModal: false, images: "" });
              //     swal({
              //       closeOnClickOutside: false,
              //       title: "Success",
              //       text: "Added Successfully",
              //       icon: "success",
              //     }).then(() => {
              //       this.props.history.push("/department/equipment");
              //     });
              //   })
              //   .catch((err) => {
              //     this.setState({
              //       closeModal: true,
              //       showModalLoader: false,
              //       images: "",
              //     });
              //     if (err.data.status === 3) {
              //       showErrorMessage(err, this.props);
              //     } else {
              //       actions.setErrors(err.data.errors);
              //       actions.setSubmitting(false);
              //     }
              //   });
            }
           
          });
        }
      }
      this.setState({
        file_name : element,
      });
      // console.log(' element here', element)

      formData.append("images", this.state.file_name);

      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false, images: "" });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Added Successfully",
            icon: "success",
          }).then(() => {
            this.props.history.push("/department/equipment");
          });
        })
        .catch((err) => {
          this.setState({
            closeModal: true,
            showModalLoader: false,
            images: "",
          });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };

  setDropZoneFiles = (acceptedFiles, setErrors, setFieldValue) => {
    console.log(" acceptedFiles", acceptedFiles);
    setErrors({ files: false });
    this.setState({
      isValidFile: true,
    });
    setFieldValue(this.state.files);

    var prevFiles = this.state.files;
    var newFiles;
    if (prevFiles.length > 0) {
      // console.log('acceptedFiles.length',acceptedFiles, acceptedFiles.length)
      for (let index = 0; index < acceptedFiles.length; index++) {
        var remove = 0;

        for (let index2 = 0; index2 < prevFiles.length; index2++) {
          if (acceptedFiles[index].name === prevFiles[index2].name) {
            remove = 1;
            break;
          }
        }
        if (remove === 0) {
          prevFiles.push(acceptedFiles[index]);
        }
      }
      newFiles = prevFiles;
    } else {
      newFiles = acceptedFiles;
    }

    var fileListHtml = newFiles.map((file) => (
      <Alert key={file.name}>
        <span onClick={() => removeDropZoneFiles(file.name, this, setErrors)}>
          <i className="far fa-times-circle"></i>
        </span>{" "}
        {trimString(25, file.name)}
      </Alert>
    ));
    console.log("newFiles ", newFiles);
    console.log("fileListHtml", fileListHtml);
    this.setState({
      files: newFiles,
      filesHtml: fileListHtml,
    });
  };

  // showAttachments = () => {
  //   console.log('this.state.files', this.state.files)
  //   var fileListHtml = this.state.files.map((file) => (
  //     <Alert key={file.upload_id}>
  //       <span onClick={() => this.removeDropZoneFiles(file.upload_id)}>
  //         <i className="far fa-times-circle" style={{ cursor: "pointer" }}></i>
  //       </span>{" "}
  //       <span
  //         onClick={(e) =>
  //           this.redirectUrlTask(e, `${file.upload_id}`)
  //         }
  //       >
  //         <i className="fa fa-download" style={{ cursor: "pointer" }}></i>
  //       </span>{" "}
  //       {file.actual_files}
  //     </Alert>
  //   ));

  //   return fileListHtml;
  // };

  // removeProformaGenpactFile = () => {
  //   let prevState = this.state.currRow;
  //   prevState.download_url = "";
  //   prevState.file_name = "";
  //   //prevState.proforma_id = 0;
  //   this.setState({ currRow: prevState });
  // };

  render() {
    const initialValues = {
      id: "",
      equipment_name: "",
      equipment_description: "",
      files: [],
      images: "",
      date_posted: "",
      status: "",
    };
    // console.log('this.state.isValidFile',this.state.isValidFile)

    const validateStopFlag = Yup.object().shape({
      files: Yup.mixed()
        .required("Please select image")
        .test(
          "equipmentimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      equipment_name: Yup.string().required(
        "Please enter equipment & instrument name"
      ),
      equipment_description: Yup.string().required("Please enter description"),
      status: Yup.number().required("Please select status"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Equipment
              <small />
            </h1>
            <input
              type="button"
              value="Go Back"
              className="btn btn-warning btn-sm"
              onClick={() => {
                window.history.go(-1);
                return false;
              }}
              style={{ right: "9px", position: "absolute", top: "13px" }}
            />
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validateStopFlag}
                  onSubmit={this.handleSubmitEvent}
                >
                  {({
                    values,
                    errors,
                    touched,
                    isValid,
                    isSubmitting,
                    setFieldValue,
                    setFieldTouched,
                    handleChange,
                    setErrors,
                  }) => {
                    return (
                      <Form>
                        {console.log("errors formik", errors)}
                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Equipment & Instrument Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="equipment_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Equipment  Name"
                                  autoComplete="off"
                                  value={values.equipment_name}
                                />
                                {errors.equipment_name &&
                                touched.equipment_name ? (
                                  <span className="errorMsg">
                                    {errors.equipment_name}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={6} md={6}>
                              <div className="form-group custom-file-upload">
                                <label> Upload Image</label>
                                <Dropzone
                                  onDrop={(acceptedFiles) =>
                                    this.setDropZoneFiles(
                                      acceptedFiles,
                                      setErrors,
                                      setFieldValue
                                    )
                                  }
                                  multiple={true}
                                  accept="image/jpeg, image/png, image/jpg"
                                >
                                  {({ getRootProps, getInputProps }) => (
                                    <section>
                                      <div
                                        {...getRootProps()}
                                        className="custom-file-upload-header"
                                      >
                                        <input {...getInputProps()} />
                                        <p>Choose file</p>
                                      </div>
                                      <div className="custom-file-upload-area">
                                        {console.log(
                                          "this.state.files",
                                          this.state.files,
                                          this.state.filesHtml
                                        )}
                                        {/* { this.state.filesHtml &&
                                          this.showAttachments()
                                        } */}
                                        {/* {this.state.currRow.proforma_id > 0 && this.showAttachments()} */}
                                        {/* {this.state.clone_sub === 1 &&
                                          this.showAttachments()}
                                        {this.state.clone_main_task === 1 &&
                                          this.showAttachments()} */}
                                        {this.state.filesHtml}
                                      </div>
                                    </section>
                                  )}
                                </Dropzone>

                                {errors.files || touched.files ? (
                                  <p className="sub-task-er-msg sub-task-er-msg3">
                                    {errors.files}
                                  </p>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Description
                                  <span className="impField">*</span>
                                </label>
                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <Editor
                                  content={values.equipment_description}
                                  init={{
                                    selector: "textarea",
                                    height: 300,
                                    menubar: false,
                                    plugins: [
                                      "advlist autolink lists link image charmap print preview anchor",
                                      "searchreplace visualblocks code fullscreen",
                                      "insertdatetime media table paste code help wordcount",
                                    ],
                                    toolbar:
                                      "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                                    // content_css: '//www.tinymce.com/css/codepen.min.css',
                                    content_style:
                                      "body { font-family:Helvetica,Arial,sans-serif; font-size:10px, }",
                                    file_browser_callback_types: "image",
                                    file_picker_callback: function (
                                      callback,
                                      value,
                                      meta
                                    ) {
                                      if (meta.filetype == "image") {
                                        var input =
                                          document.getElementById("my-file");
                                        input.click();
                                        input.onchange = function () {
                                          var file = input.files[0];
                                          var reader = new FileReader();
                                          reader.onload = function (e) {
                                            console.log("name", value);
                                            callback(e.target.result, {
                                              alt: file.name,
                                            });
                                          };
                                          reader.readAsDataURL(file);
                                        };
                                      }
                                    },
                                    paste_data_images: true,
                                  }}
                                  onEditorChange={(value) =>
                                    setFieldValue(
                                      "equipment_description",
                                      value
                                    )
                                  }
                                />

                                {errors.equipment_description &&
                                touched.equipment_description ? (
                                  <span className="errorMsg">
                                    {errors.equipment_description}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>

                          <hr className="blue" />
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Status
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="status"
                                  component="select"
                                  className={`selectArowGray form-control`}
                                  autoComplete="off"
                                  value={values.status}
                                >
                                  <option key="-1" value="">
                                    Select
                                  </option>
                                  {this.state.selectStatus.map((status, i) => (
                                    <option key={i} value={status.value}>
                                      {status.label}
                                    </option>
                                  ))}
                                </Field>
                                {errors.status && touched.status ? (
                                  <span className="errorMsg">
                                    {errors.status}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <button
                          className={`btn btn-success btn-sm ${
                            isValid ? "btn-custom-green" : "btn-disable"
                          } m-r-10`}
                          type="submit"
                          disabled={
                            isValid ? (isSubmitting ? true : false) : true
                          }
                        >
                          {console.log("isSubmitting", isSubmitting)}
                          {console.log("isValid", isValid)}
                          {this.state.equipment_id > 0
                            ? isSubmitting
                              ? "Updating..."
                              : "Update"
                            : isSubmitting
                            ? "Submitting..."
                            : "Submit"}
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default AddEquipment;

/**
 SHOW MULTIPLE IMAGES

import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import swal from "sweetalert";
import Select from "react-select";
import Layout from "../../layout/Layout";

import {
  htmlDecode,
  getHeightWidth,
  getHeightWidthFromURL,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Switch from "react-switch";

import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../../shared/handle_error";
import dateFormat from "dateformat";

/For Tooltip/

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={["hover"]}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}
/For Tooltip/

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.editEquipment(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={(e) => refObj.chageStatus(cell, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

const imageFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      {row.images.map((val, index) => {
        return (
          <LinkWithTooltip
            tooltip="Click to see picture"
            href="#"
            // clicked={(e) => refObj.imageModalShowHandler(val.equipment_image)}
            id="tooltip-1"
            key={index}
          >
            <img
              src={val.equipment_image}
              alt="Equipment"
              height="30"
              onClick={(e) =>
                refObj.imageModalShowHandler(e, val.equipment_image)
              }
            />
          </LinkWithTooltip>
        );
      })}
    </div>
  );
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
  return cell.replace(".png", " ");
};

const EquipmentStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const setType = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return " Request A Callback";
  } else if (cell === 2) {
    return "Home Collection";
  } else if (cell === 3) {
    return " Covid19 Enquiry";
  } else if (cell === 9) {
    return " Contact Us";
  } else if (cell === 10) {
    return " Feedback";
  } else if (cell === 8) {
    return " Become A Vendor";
  } else if (cell === 7) {
    return " Become A Partner";
  } else if (cell === 11) {
    return " Prescription Upload";
  }
};

// eslint-disable-next-line no-unused-vars
const generateCheckbox = (refObj) => (cell, row) => {
  let defaultChecked = false;

  if (refObj.state.checkedRows.includes(row.id)) {
    defaultChecked = true;
  }

  return (
    <input
      type="checkbox"
      checked={defaultChecked}
      onChange={(e) => {
        let prev = refObj.state.checkedRows;
        if (e.target.checked) {
          prev.push(row.id);
        } else {
          let index = prev.indexOf(row.id);
          prev.splice(index, 1);
        }
        refObj.setState({ checkedRows: prev });
      }}
      className={`genCheck`}
    />
  );
};

// eslint-disable-next-line no-unused-vars
const options = [
  { value: "1", label: "Request A Callback" },
  { value: "2", label: "Home Collection" },
  { value: "3", label: "Covid19 Enquiry" },
  { value: "7", label: "Become A Partner" },
  { value: "8", label: "Become A Vendor" },
  { value: "9", label: "Contact Us" },
  { value: "10", label: "Feedback" },
  { value: "11", label: "Prescription Upload" },
];

// const initialValues = {
//   id: "",
//   equipment_name: "",
//   equipment_description: "",
//   equipment_image: "",
//   date_posted: "",
//   status: "",
// };

class Equipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      equipmentDetails: [],
      selectedOption: [],
      checkedRows: [],
      isLoading: false,
      showModal: false,
      equipment_id: 0,
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
      type: "",

      alldata: [],
      equipmentSearch: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      message: "",
    };
  }

  componentDidMount() {
    this.getEquipmentList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getEquipmentList(pageNumber > 0 ? pageNumber : 1);
  };

  getEquipmentList = (page = 1) => {
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;
    // let type = '';
    //   if(this.state.selectedOption.length > 0){
    //     type = this.state.selectedOption.map((val)=>{return val.value}).join(',');
    // }

    API.get(
      `/api/department/equipment?page=${page}&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
          totalCount: Number(res.data.count),

          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  equipmentSearch = (e) => {
    e.preventDefault();
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;
    // let type = '';
    //   if(this.state.selectedOption.length > 0){
    //     type = this.state.selectedOption.map((val)=>{return val.value}).join(',');
    // }

    if (
      equipment_name === "" &&
      equipment_description === "" &&
      status === ""
    ) {
      return false;
    }

    API.get(
      `/api/department/equipment?page=1&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,

          equipment_name: equipment_name,
          equipment_description: equipment_description,
          status: status,
          // type = type,

          activePage: 1,
          remove_search: true,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  clearSearch = () => {
    document.getElementById("equipment_name").value = "";
    document.getElementById("equipment_description").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        equipment_description: "",
        equipment_name: "",
        status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getEquipmentList();
      }
    );
  };

  //change status
  chageStatus = (cell, status) => {
    API.put(`/api/department/equipment/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Status updated successfully.",
          icon: "success",
        }).then(() => {
          this.getEquipmentList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  //delete
  confirmDelete = (event, id) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.deleteEquipment(id);
      }
    });
  };

  deleteEquipment = (id) => {
    API.post(`/api/department/equipment/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getEquipmentList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  renderShowsTotal = (start, to, total) => {
    return (
      <span className="pageShow">
        Showing {start} to {to}, of {total} records
      </span>
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  //for edit/add part
  editEquipment(e, id) {
    e.preventDefault();

    API.get(`/api/department/equipment/${id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/department/edit-equipment/" + id,
          state: {
            alldata: res.data.data[0],
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      // id: "",
      alldata: "",
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
      // equipmentDetails: "",
      equipment_id: 0,
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualEquipment(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  //image modal
  imageModalShowHandler = (e, url) => {
    e.preventDefault();
    console.log("url", url);
    this.setState({ thumbNailModal: true, equipment_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, equipment_image: "" });
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Equipments & Instruments
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) =>
                      this.props.history.push({
                        pathname: "/department/add-equipment",
                        state: { alldata: this.state.alldata },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Equipment &
                    Instrument
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_name"
                      id="equipment_name"
                      placeholder="Filter by Equipment Name"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_description"
                      id="equipment_description"
                      placeholder="Filter by Description"
                    />
                  </div>
                  {/ <div>
                    <Select
                      placeholder="Select Type"
                      width={250}
                      isMulti
                      isClearable={true}
                      isSearchable={true}
                      value={this.state.selectedOption}
                      onChange={(e) => {
                        let sel = [];
                        if (e != null) {
                          sel = e
                        }
                        this.setState({ selectedOption: sel });
                      }}
                      options={options}
                    />
                  </div> /}

                  <div className="">
                    <select name="status" id="status" className="form-control">
                      <option value="">Select Status</option>
                      {this.state.selectStatus.map((val) => {
                        return (
                          <option key={val.value} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.equipmentSearch(e)}
                    />
                    {this.state.remove_search ? (
                      <a
                        onClick={() => this.clearSearch()}
                        className="btn btn-danger btn-sm"
                      >
                        {" "}
                        Remove{" "}
                      </a>
                    ) : null}
                  </div>
                  <div className="clearfix"></div>
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable
                  wrapperClasses="table-responsive"
                  data={this.state.equipmentDetails}
                >
                  {/ <TableHeaderColumn
                    dataField="type"
                    dataFormat={generateCheckbox(this)}
                    width="5%"
                  >

                  </TableHeaderColumn> /}
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={setType(this)}
                  >
                    Type
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="id"
                    dataAlign=""
                    width="125"
                    dataFormat={imageFormatter(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    isKey
                    dataField="equipment_name"
                    dataFormat={setName(this)}
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Equipment & Instrument Name
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="equipment_description"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Description
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Post Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={EquipmentStatus(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Status
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>

                {this.state.totalCount > 10 ? (
                  <Row>
                    <Col md={12}>
                      <div className="paginationOuter text-right">
                        <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={10}
                          totalItemsCount={Number(this.state.totalCount)}
                          itemClass="nav-item"
                          linkClass="nav-link"
                          activeClass="active"
                          onChange={this.handlePageChange}
                        />
                      </div>
                    </Col>
                  </Row>
                ) : null}

                {/ =====Image modal===== /}
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    Equipment & Instrument Image
                  </Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.equipment_image}
                          alt="Equipment Image"
                        ></img>
                      </div>
                    </center>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default Equipment;

 */
