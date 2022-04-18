/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
// import { Editor } from "@tinymce/tinymce-react";
import TinyMCE from "react-tinymce";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
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
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

class AddPublication extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      publication_id: 0,
    };
  }

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("publication_image");
    setFieldValue("publication_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        publication_image: "",
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
        publication_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        publication_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        publication_image: "",
        isValidFile: false,
      });
    }
  };

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("publications"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    // let postdata = {
    //   publication_heading: values.publication_heading,
    //   publication_description: values.publication_description,
    //   short_name: values.short_name,
    //   publication_image: values.publication_image,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };

    let formData = new FormData();

    formData.append("publication_heading", values.publication_heading);
    formData.append("publication_description", values.publication_description);
    formData.append("short_name", `PUB-${values.short_name}`);
    formData.append("status", String(values.status));

    let url = `/api/department/publication`;
    let method = "POST";
    if (this.state.publication_image.size > FILE_SIZE) {
      actions.setErrors({
        publication_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
      });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.publication_image).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("publications");
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({
            publication_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
          });
          actions.setSubmitting(false);
        } else {
          formData.append("publication_image", this.state.publication_image);

          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, publication_image: "" });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.props.history.push("/department/publications");
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                publication_image: "",
              });
              if (err.data.status === 3) {
                showErrorMessage(err, this.props);
              } else {
                actions.setErrors(err.data.errors);
                actions.setSubmitting(false);
              }
            });
        }
      });
    }
  };

  render() {
    const initialValues = {
      id: "",
      publication_heading: "",
      publication_description: "",
      short_name: "",
      publication_image: "",
      date_posted: "",
      status: "",
    };
    const validateStopFlag = Yup.object().shape({
      publication_image: Yup.mixed()
        .required("Please select image")
        .test(
          "Publicationsimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
        short_name: Yup.string()
        .min(5, "please add at least five characters")
        .max(30, "short name cannot be more than 30  characters")
        .required("Please enter short name")
        .matches(/^([A-Za-z0-9_(),&@!?#'-.\/]+\s?)*$/, "short name validation field"),
      // publication_heading: Yup.string().required(
      //   "Please enter publication heading"
      // ),
      publication_heading: Yup.string()
        .min(5, "please add at least five characters")
        .max(100, "publication heading cannot be more than 100  characters")
        .required("Please enter publication heading")
        .matches(/^([A-Za-z0-9_(),&@!?#'-.\/]+\s?)*$/, "publication heading validation field"),
      publication_description: Yup.string().required("Please enter description"),
      status: Yup.number().required("Please select status"),
      // status: Yup.string()
      //   .trim()
      //   .required("Please select status")
      //   .matches(/^[0|1]$/, "Invalid status selected"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Publication
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
                                  Publication Heading
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="publication_heading"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Publication Heading"
                                  autoComplete="off"
                                  value={values.publication_heading}
                                />
                                {errors.publication_heading &&
                                touched.publication_heading ? (
                                  <span className="errorMsg">
                                    {errors.publication_heading}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Short Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="short_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Short Name"
                                  autoComplete="off"
                                  value={values.short_name}
                                />
                                {errors.short_name && touched.short_name ? (
                                  <span className="errorMsg">
                                    {errors.short_name}
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
                                  name="publication_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Publication Image"
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

                                {errors.publication_image &&
                                touched.publication_image ? (
                                  <span className="errorMsg">
                                    {errors.publication_image}
                                  </span>
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
                                <TinyMCE
                                  name="publication_description"
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
                                      "publication_description",
                                      e.target.getContent()
                                    );
                                  }}
                                />
                                  {/* {console.log( "values.publication_description",  values.publication_description )}
                                  {console.log( "values.publication_description",  typeof(values.publication_description) )} */}
                                  {values.publication_description === "" ? (
                                    <span className="errorMsg">{errors.publication_description}</span>
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
                          {this.state.publication_id > 0
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
export default AddPublication;
