import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import Select from "react-select";
import Layout from "../../layout/Layout";

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
import TinyMCE from "react-tinymce";
import { tinymce } from "react-tinymce";
import TagsInput from "react-tagsinput";
import { values } from "methods";
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

class EditEquipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      equipment_id: this.props.match.params.id,
    };
  }
  


  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("equipment_image");
    setFieldValue("equipment_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        equipment_image: "",
        isValidFile: true,
      });
      return;
    }
    if (
      event.target.files[0] &&
      SUPPORTED_FORMATS.includes(event.target.files[0].type)
    ) {
      //Supported
      this.setState({
        equipment_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        equipment_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        equipment_image: "",
        isValidFile: false,
      });
    }
  };

  componentDidMount() {
    console.log('this.props.location.state',this.props.location.state)
    console.log('component')
    this.setState({
      validationMessage: generateResolutionText("equipment"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    let postdata = {
      // job_id: this.state.jobDetails.job_id ? this.state.jobDetails.job_id : '',
      equipment_name: values.equipment_name,
      equipment_description: values.equipment_description,
      equipment_image: values.equipment_image,
      date_posted: new Date().toLocaleString(),
      status: String(values.status),
    };
    console.log("postdata edit", postdata);

    let formData = new FormData();

    formData.append("equipment_name", values.equipment_name);
    formData.append("equipment_description", values.equipment_description);
    formData.append("status", String(values.status));


    let url = `/api/department/equipment/${this.props.match.params.id}`;
    let method = "PUT";
    if (this.state.equipment_image) {
      if (this.state.equipment_image.size > FILE_SIZE) {
        actions.setErrors({
          equipment_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
        });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.equipment_image).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("equipment");

          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({
              equipment_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
            });
            actions.setSubmitting(false);
          } else {
            formData.append("equipment_image", this.state.equipment_image);

            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Record updated successfully.",
                  icon: "success",
                }).then(() => {
                  this.props.history.push("/department/equipment");
                });
              })
              .catch((err) => {
                this.setState({ showModalLoader: false });
                if (err.data.status === 3) {
                  this.setState({
                    showModal: false,
                  });
                  showErrorMessage(err, this.props);
                } else {
                  actions.setErrors(err.data.errors);
                  actions.setSubmitting(false);
                }
              });
          }
        });
      }
    } else {
      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/department/equipment");
          });
        })
        .catch((err) => {
          this.setState({ showModalLoader: false });
          if (err.data.status === 3) {
            this.setState({
              showModal: false,
            });
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };

  render() {
    const { alldata } = this.props.location.state;
    console.log('alldata',alldata)

    const initialValues = {
      id: "",
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
    };

    const newInitialValues = {
      equipment_image: "",
      equipment_name: htmlDecode(alldata.equipment_name),
      equipment_description: htmlDecode(alldata.equipment_description),
      status: alldata.status,
    };

    const validateStopFlag = Yup.object().shape({
      equipment_image: Yup.string()
        .notRequired()
        .test(
          "equipmentimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (equipment_image) => {
            if (equipment_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
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
              Edit Equipment
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
                  initialValues={newInitialValues}
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
                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                Equipment Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="equipment_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Equipment Name"
                                  autoComplete="off"
                                  value={values.equipment_name}
                                />
                                {errors.equipment_name && touched.equipment_name ? (
                                  <span className="errorMsg">
                                    {errors.equipment_name}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Upload Image
                                  <span className="impField">*</span>
                                  <br />{" "}
                                  <i> {this.state.fileValidationMessage}</i>
                                  <br /> <i>{this.state.validationMessage}</i>
                                </label>
                                <Field
                                  name="equipment_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Equipment Image"
                                  autoComplete="off"
                                  onChange={(e) => {
                                    this.fileChangedHandler(
                                      e,
                                      setFieldTouched,
                                      setFieldValue,
                                      setErrors
                                    );
                                  }}
                                />

                                {errors.equipment_image && touched.equipment_image ? (
                                  <span className="errorMsg">
                                    {errors.equipment_image}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Equipment Description
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
                                  initialValue={values.equipment_description}
                                  init={{
                                    height: 150,
                                    menubar: false,
                                    plugins: [
                                      "advlist autolink lists link image charmap print preview anchor",
                                      "searchreplace visualblocks code fullscreen",
                                      "insertdatetime media table paste code help wordcount",
                                    ],
                                    toolbar:
                                      "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                                    content_style:
                                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
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
                                            console.log(
                                              "name",
                                              e.target.result
                                            );
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
                                    setFieldValue("equipment_description", value)
                                  }
                                />

                                {errors.equipment_description && touched.equipment_description ? (
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
export default EditEquipment;
