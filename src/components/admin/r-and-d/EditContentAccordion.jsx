import React, { Component } from "react";
import {
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import TinyMCE from "react-tinymce";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
} from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";

// import "react-datepicker/dist/react-datepicker.css";

const setDateValue = (cell) => {
  if (cell && cell != "") {
    var date = new Date(cell);
    var formatedDate = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;
    return formatedDate;
  } else {
    return "---";
  }
};

const initialValues = {
  title: "",
  end_date: "",
  description: "",
  status: "",
  content_tab_image: "",
};

class EditOffer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "In-Active" },
      ],
    };
  }

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("offer-images"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    console.log(values);
    let method = "";
    let url = "";
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);

    formData.append("status", values.status);
    method = "PUT";
    url = `/api/rnd/rnd_content_tab/${this.props.match.params.id}`;
    if (this.state.content_tab_image) {
      if (this.state.content_tab_image.size > FILE_SIZE) {
        actions.setErrors({
          content_tab_image: "The file exceeds maximum size.",
        });
        actions.setSubmitting(false);
      } else {
        formData.append("content_tab_image", this.state.content_tab_image);
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
              text: "Record added successfully.",
              icon: "success",
            }).then(() => {
              this.props.history.push("/rnd/rnd_content_tab");
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
            this.props.history.push("/offers");
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

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("content_tab_image");
    setFieldValue("content_tab_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        content_tab_image: "",
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
        content_tab_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        content_tab_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        content_tab_image: "",
        isValidFile: false,
      });
    }
  };

  render() {
    const { NewAccordionDetails } = this.props.location.state;

    const newInitialValues = Object.assign(initialValues, {
      content_tab_image: "",
      title: htmlDecode(NewAccordionDetails.title),
      content: htmlDecode(NewAccordionDetails.content),
      status: NewAccordionDetails.status,
    });

    const validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter the title"),
      content: Yup.string().required("Enter some Content"),
      content_tab_image: Yup.string()
        .notRequired()
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (content_tab_image) => {
            if (content_tab_image) {
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
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Content Tab
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
                                  Title
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="title"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Title"
                                  autoComplete="off"
                                  value={values.title}
                                />
                                {errors.title && touched.title ? (
                                  <span className="errorMsg">
                                    {errors.title}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Content
                                  <span className="impField">*</span>
                                </label>

                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <TinyMCE
                                  name="content"
                                  content={values.content}
                                  config={{
                                    menubar: false,
                                    branding: false,
                                    selector: "textarea",
                                    height: 400,
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
                                  onChange={(e) => {
                                    setFieldValue(
                                      "content",
                                      e.target.getContent()
                                    );
                                  }}
                                />

                                {errors.content && touched.content ? (
                                  <span className="errorMsg">
                                    {errors.content}
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
                                  <br /> <i>
                                    {this.state.validationMessage}
                                  </i>{" "}
                                </label>
                                <Field
                                  name="content_tab_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Content Tab Image"
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
                                {errors.content_tab_image &&
                                touched.content_tab_image ? (
                                  <span className="errorMsg">
                                    {errors.content_tab_image}
                                  </span>
                                ) : null}
                              </div>
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
                                  {this.state.selectStatus.map((val, i) => (
                                    <option key={i} value={val.value}>
                                      {val.label}
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
                          {this.props.match.params.id > 0
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
export default EditOffer;
