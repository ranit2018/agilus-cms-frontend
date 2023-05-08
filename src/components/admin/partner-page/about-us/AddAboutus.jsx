import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import TinyMCE from "react-tinymce";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import whitelogo from "../../../../assets/images/drreddylogo_white.png";
import { htmlDecode, DEFAULT_CITY } from "../../../../shared/helper";
import Layout from "../../layout/Layout";
import SRL_API from "../../../../shared/srl-axios";
import Autosuggest from "react-autosuggest";
import ReactHtmlParser from "react-html-parser";
import { Input } from "reactstrap";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";

const initialValues = {
  product: "",
  status: "",
  type: "",
  description: "",
};

const scrollTo = (id) => {
  // For full window scroll bar
  let scrollDIV = document.getElementById(id);
  let scrollPosition = scrollDIV && scrollDIV.offsetTop;
  if (scrollPosition) {
    window.scrollTo({
      top: scrollPosition - 150,
      behavior: "smooth",
    });
  }
};

class AddAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      selectedValue: "",
      // suggestions: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],

      // new
      city_state_list: [],
      add_city: "",
      suggestions: [],
      labs: "",
      isLab: false,
      lab_url_key: "",
      lab_name: "",
      lab_id: "",
    };
  }

  componentDidMount() {
    this.getCityStateList();
    let prev_state = [];
    prev_state.push({
      newTitle: "",
      newDescription: "",
      newContent: "",
      common_err: "",
      type: [],
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.add_city !== prevState.add_city) {
      this.clearAutoSuggest();
    }
  }

  clearAutoSuggest() {
    this.setState({ labs: "", value: "" });
  }

  handleSearch = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  getCityStateList = () => {
    SRL_API.get(`/feed/get-city-state-list`)
      .then((res) => {
        this.setState({
          city_state_list: res.data.data,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  handleAutoSuggestClick = () => {
    this.setState({ selectedValue: "", value: "" });
  };
  handaleLabName = (value) => {
    if (value.value.length > 2) {
      SRL_API.post(`/feed/get-lab-by-name`, {
        city_name: this.state.add_city,
        search_name: value.value,
      })
        .then((res) => {
          this.setState({
            suggestions: res.data.data.data.LAB_LIST,
            isLab: true,
          });
        })
        .catch((err) => {
          showErrorMessage(err, this.props);
        });
    }
  };
  onSuggestionsClearRequested = () => {};
  onChangeAutoSuggest = (event, { newValue }) => {
    this.setState({ value: newValue });
  };
  onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
    if (method === "click" || method === "enter") {
      this.setState({ labs: suggestion });
    }
  };
  getSuggestionValue = (suggestions) => suggestions.LCTN_NM;

  renderSuggestion = (suggestions) => <span>{suggestions.LCTN_NM}</span>;

  handleSubmitEvent = (values, actions) => {
    // console.log(this.state.value);
    let formData = {
      status: "1",
      content: values.content,
      lab_name: this.state.labs.LCTN_NM,
      lab_id: String(this.state.labs.LAB_ID),
      lab_url_key: this.state.labs.URL_KEY,
      city: this.state.add_city,
    };
    let url = `api/center/about`;
    let method = "POST";
    API({
      method: method,
      url: url,
      data: formData,
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Added Successfully",
          icon: "success",
        }).then(() => {
          this.props.history.push({
            pathname: "/partner-page/aboutus",
          });
        });
      })
      .catch((err) => {
        if (err.data.errors.status === 5) {
          // swal({
          //   icon: "error",

          //   text: `${err.data.errors.doctor}`,
          //   footer: "",
          // });

          actions.setSubmitting(false);
          actions.setErrors(err.data.errors);
        } else if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  onChangeSelection = (e) => {
    console.log(e);
    this.setState({
      lab_name: e.target.value,
    });
  };

  render() {
    const newInitialValues = Object.assign(initialValues, {
      product: "",
      status: "",
      description: "",
    });
    console.log(">>>>>>>>>>", this.state.add_city);
    const validateStopFlag = Yup.object().shape({
      add_city: this.state.add_city
        ? null
        : Yup.array().required("Please Select City"),
      value: this.state.value
        ? ""
        : Yup.string().required("Please Provide Lab Name"),
      content: Yup.string()
        .required("Please Provide Content")
        .matches(
          /^[a-zA-Z0-9-,\s]*[@#^&()_+\-\[\]{};':"\\|.\/?]*[a-zA-Z0-9-,.&'\s]*$/,
          "Special characters are not allowed."
        ),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add About Us
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
                    setFieldTouched,
                    setFieldValue,
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
                                  City
                                  <span className="impField">*</span>
                                </label>
                                <Select
                                  name="cities"
                                  maxMenuHeight={200}
                                  // isMulti
                                  isClearable={false}
                                  isSearchable={true}
                                  placeholder="Select City"
                                  options={this.state.city_state_list}
                                  value={values.cities}
                                  onChange={(evt) => {
                                    this.setState({
                                      add_city: evt.city_name,
                                      suggestions: "",
                                      labs: "",
                                    });
                                    setFieldValue("content", "");

                                    // setFieldValue("cities", evt.city_name);
                                  }}
                                />
                                {this.state.add_city == "" ? (
                                  <p className="errorMsg">{errors.add_city}</p>
                                ) : null}
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <label>
                                Search Lab
                                <span className="impField">*</span>
                              </label>
                              <div className="position-relative">
                                <Autosuggest
                                  suggestions={this.state.suggestions}
                                  onSuggestionsFetchRequested={(req) => {
                                    this.handaleLabName(req);
                                    setFieldTouched("lab");
                                  }}
                                  // onSuggestionsClearRequested={() => {
                                  //   this.onSuggestionsClearRequested();
                                  //   this.setState({
                                  //     selectedValue: "",
                                  //   });
                                  // }}
                                  getSuggestionValue={this.getSuggestionValue}
                                  renderSuggestion={this.renderSuggestion}
                                  focusInputOnSuggestionClick={false}
                                  inputProps={{
                                    style: {
                                      width: "100%",
                                      display: "block",
                                      height: "34px",
                                      padding: "6px 12px",
                                      fontSize: "14px",
                                      lineHeight: "1.42857143",
                                      color: "#555555",
                                      // backgroundColor: "#fff",
                                      backgroundColor: `${
                                        this.state.add_city == ""
                                          ? "#eeeeee"
                                          : "#fff"
                                      }`,

                                      backgroundImage: "none",
                                      border: "1px solid #d2d6de",
                                    },
                                    placeholder: "Enter Lab Name",

                                    value: this.state.value,
                                    onChange: this.onChangeAutoSuggest,
                                    onKeyDown: this.handleSearch,
                                    onBlur: () => setFieldTouched("lab"),
                                    disabled: this.state.add_city == "",
                                  }}
                                  onSuggestionSelected={(event, req) => {
                                    this.onSuggestionSelected(
                                      event,
                                      req,
                                      setFieldTouched
                                    );
                                  }}
                                  container="form-control"
                                />
                                {this.state.selectedValue !== "" ? (
                                  <button
                                    className="crossBtn btn btn-danger pull-right"
                                    onClick={() =>
                                      this.handleAutoSuggestClick()
                                    }
                                  >
                                    X
                                  </button>
                                ) : null}
                              </div>
                              {errors.doctor ? (
                                <span className="errorMsg">
                                  {errors.doctor}
                                </span>
                              ) : errors.value || touched.value ? (
                                <span className="errorMsg">{errors.value}</span>
                              ) : null}
                              {/* {errors.value || touched.value ? (
                                <span className="errorMsg">{errors.value}</span>
                              ) : null} */}
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Content
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  disabled={
                                    this.state.labs == undefined ||
                                    this.state.labs == ""
                                  }
                                  name="content"
                                  as="textarea"
                                  className={`form-control`}
                                  placeholder="Enter Content"
                                  rows="10"
                                  autoComplete="off"
                                  value={values.content}
                                />
                                {/* <Editor
                                  value={values.content}
                                  init={{
                                    height: 500,
                                    menubar: false,
                                    resize: false,
                                    plugins: [
                                      "advlist autolink lists link image charmap print preview anchor",
                                      "searchreplace visualblocks code fullscreen",
                                      "insertdatetime media table paste code help wordcount",
                                    ],
                                    toolbar:
                                      "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent  ",
                                    content_style:
                                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                    // file_browser_callback_types: 'image',
                                    // file_picker_callback: function (callback, value, meta) {
                                    //     if (meta.filetype == 'image') {
                                    //         var input = document.getElementById('my-file');
                                    //         input.click();
                                    //         input.onchange = function () {
                                    //             var file = input.files[0];
                                    //             var reader = new FileReader();
                                    //             reader.onload = function (e) {
                                    //                 console.log('name', e.target.result);
                                    //                 callback(e.target.result, {
                                    //                     alt: file.name
                                    //                 });
                                    //             };
                                    //             reader.readAsDataURL(file);
                                    //         };
                                    //     }
                                    // },
                                    // paste_data_images: true
                                  }}
                                  onEditorChange={(value) =>
                                    setFieldValue("content", value)
                                  }
                                /> */}
                                {errors.content || touched.content ? (
                                  <span className="errorMsg">
                                    {errors.content}
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
                        {/* <button className="btn btn-success" type="submit">
                          Submit
                        </button> */}
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
export default AddAccordion;
