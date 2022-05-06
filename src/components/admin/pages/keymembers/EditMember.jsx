import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import TinyMCE from "react-tinymce";
// import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
// import { showErrorMessage } from "../../../../shared/handle_error";
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

import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

const stringFormat = (str) => {
  str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
  str = str.split(" ");
  const strArr = [];
  console.log(str);

  for (let i in str) {
    if (str[i] !== "") {
      strArr.push(str[i]);
    }
  }
  const formatedString = strArr.join("-");
  return formatedString.toLowerCase();
};

class EditMember extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
    };
  }

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("member_image");
    setFieldValue("member_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        member_image: "",
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
        member_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        member_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        member_image: "",
        isValidFile: false,
      });
    }
  };

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("KeyMember"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    console.log(values);
    // let formData = new FormData();

    // formData.append("doctor_name", values.doctor_name);
    // formData.append("education", values.education);
    // formData.append("expertise", values.expertise);
    // formData.append("designation", values.designation);
    // formData.append("status", String(values.status));

    // let url = `/api/department/doctor/${this.props.match.params.id}`;
    // let method = "PUT";
    // if (this.state.doctor_image) {
    //   if (this.state.doctor_image.size > FILE_SIZE) {
    //     actions.setErrors({
    //       doctor_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
    //     });
    //     actions.setSubmitting(false);
    //   } else {
    //     getHeightWidth(this.state.doctor_image).then((dimension) => {
    //       const { height, width } = dimension;
    //       const offerDimension = getResolution("keyMember");

    //       if (
    //         height != offerDimension.height ||
    //         width != offerDimension.width
    //       ) {
    //         //    actions.setErrors({ file: "The file is not of desired height and width" });
    //         actions.setErrors({
    //           doctor_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
    //         });
    //         actions.setSubmitting(false);
    //       } else {
    //         formData.append("doctor_image", this.state.doctor_image);

    //         API({
    //           method: method,
    //           url: url,
    //           data: formData,
    //         })
    //           .then((res) => {
    //             this.setState({ showModal: false });
    //             swal({
    //               closeOnClickOutside: false,
    //               title: "Success",
    //               text: "Record updated successfully.",
    //               icon: "success",
    //             }).then(() => {
    //               this.props.history.push("/department/doctor");
    //             });
    //           })
    //           .catch((err) => {
    //             this.setState({ showModalLoader: false });
    //             if (err.data.status === 3) {
    //               this.setState({
    //                 showModal: false,
    //               });
    //               showErrorMessage(err, this.props);
    //             } else {
    //               actions.setErrors(err.data.errors);
    //               actions.setSubmitting(false);
    //             }
    //           });
    //       }
    //     });
    //   }
    // } else {
    //   API({
    //     method: method,
    //     url: url,
    //     data: formData,
    //   })
    //     .then((res) => {
    //       this.setState({ showModal: false });
    //       swal({
    //         closeOnClickOutside: false,
    //         title: "Success",
    //         text: "Record updated successfully.",
    //         icon: "success",
    //       }).then(() => {
    //         this.props.history.push("/department/doctor");
    //       });
    //     })
    //     .catch((err) => {
    //       this.setState({ showModalLoader: false });
    //       if (err.data.status === 3) {
    //         this.setState({
    //           showModal: false,
    //         });
    //         showErrorMessage(err, this.props);
    //       } else {
    //         actions.setErrors(err.data.errors);
    //         actions.setSubmitting(false);
    //       }
    //     });
    // }
  };

  render() {
    const initialValues = {
      member_image: "",
      designation: "",
      member_id: "",
      status: "",
      member_name: "",
      about_member: "",
    };

    // const newInitialValues = {
    //     member_image: "",
    //     member_name: htmlDecode(alldata.member_name),
    //     about_member: htmlDecode(alldata.about_member),
    //     designation: htmlDecode(alldata.designation),
    //     status: alldata.status,
    //   };

      
    const validateStopFlag = Yup.object().shape({
        member_image: Yup.string()
        .notRequired()
        .test(
          "doctorimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (member_image) => {
            if (member_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      member_name: Yup.string()
        .min(5, "please add at least five characters")
        .max(100, "doctor name cannot be more than 100  characters")
        .required("Please enter name")
        .matches(
          /^[a-zA-Z'.]+( [a-zA-Z'.]+)*$/,
          "Member name validation field"
        ),
      designation: Yup.string()
        .required("Please enter designation")
        .matches(
          /^([A-Za-z0-9_(),&@!?#'-.\/]+\s?)*$/,
          "designation validation field"
        ),
      about_member: Yup.string().required("Please enter about"),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Key Member
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
                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="member_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter member name"
                                  autoComplete="off"
                                  value={values.member_name}
                                />

                                {errors.member_name && touched.member_name ? (
                                  <span className="errorMsg">
                                    {errors.member_name}
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
                                  <br />{" "}
                                  <i> {this.state.fileValidationMessage}</i>
                                  <br /> <i>{this.state.validationMessage}</i>
                                </label>
                                <Field
                                  name="member_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Choose image file"
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

                                {errors.member_image && touched.member_image ? (
                                  <span className="errorMsg">
                                    {errors.member_image}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Designation
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="designation"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter designation"
                                  autoComplete="off"
                                  value={values.designation}
                                />
                                {errors.designation && touched.designation ? (
                                  <span className="errorMsg">
                                    {errors.designation}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  About
                                  <span className="impField">*</span>
                                </label>

                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <TinyMCE
                                  name="about_member"
                                  config={{
                                    menubar: false,
                                    branding: false,
                                    selector: "textarea",
                                    height: 350,
                                    plugins: [
                                      "advlist autolink lists link image charmap print preview anchor",
                                      "searchreplace wordcount visualblocks code fullscreen",
                                      "insertdatetime media table contextmenu paste code",
                                    ],
                                    // plugins:
                                    //     "link table hr visualblocks code placeholder lists autoresize textcolor",
                                    font_formats:
                                      "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats",
                                    toolbar:
                                      "bold italic strikethrough superscript subscript | forecolor backcolor | removeformat underline | link unlink | alignleft aligncenter alignright alignjustify | numlist bullist | blockquote table  hr | visualblocks code | fontselect | link image",
                                    content_css:
                                      "//www.tinymce.com/css/codepen.min.css",
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
                                  onChange={(e) => {
                                    setFieldValue(
                                      "about_member",
                                      e.target.getContent()
                                    );
                                  }}
                                />

                                {values.about_member === "" ? (
                                  <span className="errorMsg">
                                    {errors.about_member}
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
                          {this.state.member_id > 0
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
export default EditMember;