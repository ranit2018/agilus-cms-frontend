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

class AddBlog extends Component {
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
    setFieldTouched("featured_image");
    setFieldValue("featured_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        featured_image: "",
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
        featured_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        featured_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        featured_image: "",
        isValidFile: false,
      });
    }
  };

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("blog"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  handleSubmitEvent = (values, actions) => {
    console.log(values);
    let method = "POST";
    let url = "/api/blog";
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.category_id.length > 1) {
      for (let i in values.category_id) {
        formData.append("category_id", values.category_id[i]);
      }
    } else {
      console.log("else");
      formData.append("category_id[]", values.category_id);
    }
    formData.append("keywords", values.keywords.toString());
    formData.append("content", values.content);
    formData.append("permalink", values.permalink);
    formData.append("blog_subtext", values.blog_subtext);
    formData.append("meta_title", values.meta_title);
    formData.append("meta_description", values.meta_description);
    formData.append("author_name", values.author_name);
    formData.append("author_bio", values.author_bio);
    formData.append("status", values.status);
    if (this.state.featured_image) {
      if (this.state.featured_image.size > FILE_SIZE) {
        actions.setErrors({
          featured_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
        });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.featured_image).then((dimension) => {
          const { height, width } = dimension;
          const blogDimension = getResolution("blog");
          if (height != blogDimension.height || width != blogDimension.width) {
            actions.setErrors({
              featured_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
            });
            actions.setSubmitting(false);
          } else {
            formData.append("featured_image", this.state.featured_image);
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
                  this.props.history.push("/blogs");
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
    }
  };

  render() {
    const initialValues = {
      featured_image: "",
      title: "",
      content: "",
      category_id: "",
      status: "",
      medium_id: "",
      permalink: "",
      blog_subtext: "",
      keywords: [],
      meta_title: "",
      meta_description: "",
      author_name: "",
      author_bio: "",
    };
    const validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter the title"),
      content: Yup.string().required("Please enter the Content"),
      category_id: Yup.array()
        .ensure()
        .min(1, "Please add at least one category name")
        .of(Yup.string().ensure().required("category name cannot be empty")),
      keywords: Yup.string().required("Please enter the keyword"),
      featured_image: Yup.string()
        .required("Please select the image")
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      permalink: Yup.string()
        .required("Please enter the permalink")
        .matches(/^[a-zA-Z0-9\-\s]*$/, "Only '-' is allowed in permalink"),
      meta_title: Yup.string().required("Please enter the meta title"),
      author_name: Yup.string().required("Please enter the author name"),
      author_bio: Yup.string().required("Please enter the author bio"),
      meta_description: Yup.string().required(
        "Please enter the meta description"
      ),
      blog_subtext: Yup.string().required("Please enter the blog subtext"),
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
              Add Blog
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
                                  Title
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="title"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter title"
                                  autoComplete="off"
                                  value={values.title}
                                  onChange={(e) => {
                                    setFieldValue("title", e.target.value);
                                    setFieldValue(
                                      "permalink",
                                      stringFormat(e.target.value)
                                    );
                                  }}
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
                                  Choose Category
                                  <span className="impField">*</span>
                                </label>
                                <Select
                                  isMulti
                                  name="category_id[]"
                                  options={
                                    this.props.location.state.categoryList
                                  }
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onChange={(evt) => {
                                    if (evt === null) {
                                      setFieldValue("category_id", []);
                                    } else {
                                      setFieldValue(
                                        "category_id",
                                        [].slice
                                          .call(evt)
                                          .map((val) => val.value)
                                      );
                                    }
                                  }}
                                  placeholder="Category name"
                                  onBlur={() => setFieldTouched("medium_id")}
                                />
                                {errors.category_id && touched.category_id ? (
                                  <span className="errorMsg">
                                    {errors.category_id}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Author Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="author_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter author name"
                                  autoComplete="off"
                                  value={values.author_name}
                                />

                                {errors.author_name && touched.author_name ? (
                                  <span className="errorMsg">
                                    {errors.author_name}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Author Bio
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="author_bio"
                                  as="textarea"
                                  className={`form-control`}
                                  placeholder="Enter author bio"
                                  autoComplete="off"
                                  value={values.author_bio}
                                />

                                {errors.author_bio && touched.author_bio ? (
                                  <span className="errorMsg">
                                    {errors.author_bio}
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
                                  name="featured_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Blog File"
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

                                {errors.featured_image &&
                                touched.featured_image ? (
                                  <span className="errorMsg">
                                    {errors.featured_image}
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
                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <Editor
                                  initialValue={values.content}
                                  init={{
                                    height: 500,
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
                                    setFieldValue("content", value)
                                  }
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
                                  Blog Subtext
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="blog_subtext"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter blog subtext"
                                  autoComplete="off"
                                  value={values.blog_subtext}
                                />
                                {errors.blog_subtext && touched.blog_subtext ? (
                                  <span className="errorMsg">
                                    {errors.blog_subtext}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <hr className="blue" />
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>SEO Information</label>
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Meta Keywords
                                  <span className="impField">*</span>
                                </label>
                                <TagsInput
                                  value={values.keywords}
                                  onChange={(tags) => {
                                    setFieldValue("keywords", tags);
                                  }}
                                  onChangeInput={(tag) => {
                                    const validTag = tag
                                      .replace(/([^\w-\s]+)|(^\s+)/g, "")
                                      .replace(/\s+/g, "-");

                                    setFieldValue("keywords", validTag);
                                  }}
                                  inputProps={{
                                    className: "react-tagsinput-input custom",
                                    placeholder: "Type keyword hit Enter",
                                  }}
                                  onlyUnique
                                  addOnPaste
                                />

                                {errors.keywords && touched.keywords ? (
                                  <span className="errorMsg">
                                    {errors.keywords}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Meta Description
                                  <span className="impField">*</span>
                                </label>
                                <div className="side-by-side">
                                  <Field
                                    name="meta_description"
                                    type="text"
                                    className={`form-control`}
                                    placeholder="Enter meta description"
                                    autoComplete="off"
                                    value={values.meta_description}
                                  />
                                  <Button
                                    className="btn btn-info btn-sm"
                                    onClick={() => {
                                      setFieldValue(
                                        "meta_description",
                                        values.blog_subtext
                                      );
                                    }}
                                  >
                                    Copy Description
                                  </Button>
                                </div>
                                {errors.meta_description &&
                                touched.meta_description ? (
                                  <span className="errorMsg">
                                    {errors.meta_description}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Meta Title
                                  <span className="impField">*</span>
                                </label>
                                <div className="side-by-side">
                                  <Field
                                    name="meta_title"
                                    type="text"
                                    className={`form-control`}
                                    placeholder="Enter meta title"
                                    autoComplete="off"
                                    value={values.meta_title}
                                  />
                                  <Button
                                    className="btn btn-info btn-sm"
                                    onClick={() => {
                                      setFieldValue("meta_title", values.title);
                                    }}
                                  >
                                    Copy Title
                                  </Button>
                                </div>
                                {errors.meta_title && touched.meta_title ? (
                                  <span className="errorMsg">
                                    {errors.meta_title}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Permalink
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="permalink"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Permalink"
                                  autoComplete="off"
                                  value={values.permalink}
                                />
                                {errors.permalink && touched.permalink ? (
                                  <span className="errorMsg">
                                    {errors.permalink}
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
                          {this.state.banner_id > 0
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
export default AddBlog;
