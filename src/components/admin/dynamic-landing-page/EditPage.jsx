import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
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
} from "../../../shared/helper";
import Layout from "../layout/Layout";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.
import whitelogo from "../../../assets/images/drreddylogo_white.png";

const stringFormat = (str) => {
  str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
  str = str.split(" ");
  const strArr = [];
  for (let i in str) {
    if (str[i] !== "") {
      strArr.push(str[i]);
    }
  }
  const formatedString = strArr.join("-");
  return formatedString.toLowerCase();
};

const initialValues = {
  image: "",
  second_lead_landing_page_image: "",
  page_name: "",
  page_slug: "",
  feedback: "",
};

class AddPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dynamicLandingPageDetails: {},
      isLoading: false,
      showModal: false,
      page_name: "",
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      // thumbNailModal: false,
      apiAfterValidation: true,
      dynamic_landing_page_id: 0,
      status: "",
      avalible_slug: [],
    };
    this.setState({ dynamic_landing_page_id: this.props.match.params.id });
  }

  componentDidMount() {
    let id = this.props.match.params.id;
    this.setState({ dynamic_landing_page_id: id });
    //alert(this.props.match.params.id )
    this.getIndividualDynamicLandingPage(this.props.match.params.id);
  }
  getIndividualDynamicLandingPage(id) {
    API.get(`/api/llp/lead_landing_page/${id}`)
      .then((res) => {
        this.setState({
          dynamicLandingPageDetails: res.data.data[0],
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  handleSubmitEvent = (values, actions) => {
    let url = "";
    let method = "";

    let formData = new FormData();
    formData.append("page_name", values.page_name);
    formData.append("status", values.status);
    formData.append("content", values.content);
    formData.append("page_slug", values.page_slug);

    if (this.state.image) {
      if (this.state.image.size > FILE_SIZE) {
        actions.setErrors({ image: "The file exceeds maximum size." });
        actions.setSubmitting(false);
      } else {
        formData.append("lead_landing_page_image", this.state.image);
      }
    }
    if (this.state.second_lead_landing_page_image) {
      if (this.state.second_lead_landing_page_image.size > FILE_SIZE) {
        actions.setErrors({
          second_lead_landing_page_image: "The file exceeds maximum size.",
        });
        actions.setSubmitting(false);
      } else {
        formData.append(
          "second_lead_landing_page_image",
          this.state.second_lead_landing_page_image
        );
      }
    }

    if (this.state.dynamic_landing_page_id > 0) {
      url = `/api/llp/lead_landing_page/${this.state.dynamic_landing_page_id}`;
      method = "PUT";
    } else {
      url = `/api/llp/lead_landing_page`;
      method = "POST";
    }

    if (this.state.apiAfterValidation == true) {
      API({
        url: url,
        method: method,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false, image: "" });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text:
              method === "PUT" ? "Updated Successfully" : "Added Successfully",
            icon: "success",
          }).then(() => {
            this.props.history.push("/dynamic_landing_page/page");
          });
        })
        .catch((err) => {
          this.setState({ closeModal: true, showModalLoader: false });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("image");
    setFieldValue("image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        image: "",
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
        image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        image: "",
        isValidFile: false,
      });
    }
  };
  fileChangedHandlerMobile = (
    event,
    setFieldTouched,
    setFieldValue,
    setErrors
  ) => {
    setFieldTouched("second_lead_landing_page_image");
    setFieldValue("second_lead_landing_page_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        second_lead_landing_page_image: "",
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
        second_lead_landing_page_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        second_lead_landing_page_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        second_lead_landing_page_image: "",
        isValidFile: false,
      });
    }
  };

  render() {
    const { dynamicLandingPageDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      image: "",
      second_lead_landing_page_image: "",
      page_name: dynamicLandingPageDetails.name
        ? htmlDecode(dynamicLandingPageDetails.name)
        : "",
      page_slug: dynamicLandingPageDetails.slug
        ? htmlDecode(dynamicLandingPageDetails.slug)
        : "",
      content: dynamicLandingPageDetails.content
        ? htmlDecode(dynamicLandingPageDetails.content)
        : "",

      status:
        dynamicLandingPageDetails.status ||
        +dynamicLandingPageDetails.status === 0
          ? dynamicLandingPageDetails.status.toString()
          : "",
    });
    let validateStopFlag = {};

    if (this.state.dynamic_landing_page_id > 0) {
      validateStopFlag = Yup.object().shape({
        page_name: Yup.string().required("Please enter the name"),
        page_slug: Yup.string()
          .matches(
            /^[a-zA-Z-]+$/,
            "Please enter the page slug without any special character"
          )
          .required("Please enter the page slug"),
        content: Yup.string(),

        image: Yup.string()
          .notRequired()
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            (image) => {
              if (image) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        second_lead_landing_page_image: Yup.string()
          .notRequired()
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            (image) => {
              if (image) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        page_name: Yup.string().required("Please enter the name"),
        page_slug: Yup.string()
          .matches(
            /^[a-zA-Z-]+$/,
            "Please enter the page slug without any apecial chracter"
          )
          .required("Please enter the page slug"),
        content: Yup.string(),

        image: Yup.string()
          .required("Please select the image")
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            () => this.state.isValidFile
          ),

        second_lead_landing_page_image: Yup.string()
          .required("Please select the image")
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            () => this.state.isValidFile
          ),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    }

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Page
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
                        {this.state.showModalLoader === true ? (
                          <div className="loading_reddy_outer">
                            <div className="loading_reddy">
                              <img src={whitelogo} alt="loader" />
                            </div>
                          </div>
                        ) : (
                          ""
                        )}

                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Page Name
                                  {this.state.dynamic_landing_page_id >
                                  0 ? null : (
                                    <span className="impField">*</span>
                                  )}
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="page_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter name"
                                  autoComplete="off"
                                  value={values.page_name}
                                />
                                {errors.page_name && touched.page_name ? (
                                  <span className="errorMsg">
                                    {errors.page_name}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Page Slug
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="page_slug"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter page slug"
                                  autoComplete="off"
                                  value={values.page_slug}
                                />
                                {errors.page_slug && touched.page_slug ? (
                                  <span className="errorMsg">
                                    {errors.page_slug}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Upload Image(Desktop)
                                  {this.state.dynamic_landing_page_id == 0 ? (
                                    <span className="impField">*</span>
                                  ) : null}
                                  <br />{" "}
                                  <i> {this.state.fileValidationMessage}</i>
                                  <br /> <i>{this.state.validationMessage}</i>
                                </label>
                                <Field
                                  name="image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Banner File"
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
                                {errors.image && touched.image ? (
                                  <span className="errorMsg">
                                    {errors.image}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Upload Image(Mobile)
                                  {this.state.dynamic_landing_page_id == 0 ? (
                                    <span className="impField">*</span>
                                  ) : null}
                                  <br />{" "}
                                  <i> {this.state.fileValidationMessage}</i>
                                  <br /> <i>{this.state.validationMessage}</i>
                                </label>
                                <Field
                                  name="second_lead_landing_page_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Banner File"
                                  autoComplete="off"
                                  onChange={(e) => {
                                    this.fileChangedHandlerMobile(
                                      e,
                                      setFieldTouched,
                                      setFieldValue,
                                      setErrors
                                    );
                                  }}
                                />
                                {errors.second_lead_landing_page_image &&
                                touched.second_lead_landing_page_image ? (
                                  <span className="errorMsg">
                                    {errors.second_lead_landing_page_image}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <label>Banner Contet</label>
                              <Editor
                                value={values.content}
                                init={{
                                  height: 200,
                                  menubar: false,
                                  extended_valid_elements: "span",
                                  keep_styles: true,

                                  plugins: [
                                    "advlist autolink lists link image charmap print preview anchor",
                                    "searchreplace visualblocks  code fullscreen",
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
                                          // console.log(
                                          //   "name",
                                          //   e.target.result
                                          // );
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
                                  setFieldValue("content", value)
                                }
                              />
                              {errors.content && touched.content ? (
                                <span className="errorMsg">
                                  {errors.content}
                                </span>
                              ) : null}
                            </Col>
                          </Row>
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
                          {this.state.dynamic_landing_page_id > 0
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
export default AddPage;
