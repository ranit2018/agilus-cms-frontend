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

class EditAboutus extends Component {
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
      labPrevdata: "",
      abousUsEditType: "",
    };
  }

  componentDidMount() {
    const NewAccordionDetails = this.props.location.state.AboutUsDetail
      ? this.props.location.state.AboutUsDetail
      : "";
    const abousUsEditType = this.props.location.state.abousUsEditType;

    this.setState({
      labPrevdata: NewAccordionDetails,
      abousUsEditType: abousUsEditType,
    });
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
    if (value.value.length > 3) {
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
      console.log(suggestion.URL_KEY);
      this.setState({ labs: suggestion });
    }
  };
  getSuggestionValue = (suggestions) => suggestions.LCTN_NM;

  renderSuggestion = (suggestions) => <span>{suggestions.LCTN_NM}</span>;

  handleSubmitEventUpdate = (values, actions) => {
    let formData = {
      status: "1",
      content: values.content,
    };
    let url = `/api/center/about/${this.state.abousUsEditType}`;
    let method = "PUT";
    API({
      method: method,
      url: url,
      data: formData,
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Updated Successfully",
          icon: "success",
        }).then(() => {
          this.props.history.push({
            pathname: "/partner-page/aboutus",
          });
        });
      })
      .catch((err) => {
        this.setState({
          closeModal: true,
          showModalLoader: false,
          suggestions: [],
        });
        if (err.data.status === 3) {
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
      cities: this.state.labPrevdata.city,
      content: this.state.labPrevdata.content,
      labs: this.state.labPrevdata.lab_name,
    });

    const validateStopFlag = Yup.object().shape({
      content: Yup.string().required("Please Add Content"),
    });

    return (
      <Layout {...this.props}>
        {console.log(this.state.labPrevdata)}
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit About Us
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
                  onSubmit={this.handleSubmitEventUpdate}
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
                                  Cities
                                  <span className="impField">*</span>
                                </label>
                                {/* <Select
                                  name="cities"
                                  maxMenuHeight={200}
                                  // isMulti
                                  isClearable={true}
                                  isSearchable={true}
                                  placeholder="Select City"
                                  options={this.state.city_state_list}
                                  defaultvalue={values.cities}
                                  onChange={(evt) => {
                                    setFieldValue("cities", evt);
                                    this.setState({
                                      add_city: evt.city_name,
                                    });
                                  }}
                                /> */}
                                <Field
                                  name="cities"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter city"
                                  autoComplete="off"
                                  value={values.cities}
                                  disabled
                                />
                                {errors.cities && touched.cities ? (
                                  <p className="errorMsg">{errors.cities}</p>
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
                              <Field
                                name="labs"
                                type="text"
                                className={`form-control`}
                                placeholder="Enter Lab"
                                autoComplete="off"
                                value={values.labs}
                                disabled
                              />
                              {/* <div className="position-relative">
                                <Autosuggest
                                  suggestions={this.state.suggestions}
                                  onSuggestionsFetchRequested={(req) => {
                                    this.handaleLabName(req);
                                    setFieldTouched("lab");
                                  }}
                                  onSuggestionsClearRequested={() => {
                                    this.onSuggestionsClearRequested();
                                    this.setState({
                                      selectedValue: "",
                                    });
                                  }}
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
                                      backgroundColor: "#fff",
                                      backgroundImage: "none",
                                      border: "1px solid #d2d6de",
                                    },
                                    placeholder: "Enter Lab Name",

                                    value: this.state.value,
                                    onChange: this.onChangeAutoSuggest,
                                    onKeyDown: this.handleSearch,
                                    onBlur: () => setFieldTouched("lab"),
                                    disabled: this.state.selectedValue != "",
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
                              </div> */}
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Content
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="content"
                                  as="textarea"
                                  className={`form-control`}
                                  placeholder="Enter Content"
                                  rows="10"
                                  autoComplete="off"
                                  value={values.content}
                                />

                                {errors.content && touched.content ? (
                                  <span className="errorMsg">
                                    {errors.content}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                        </div>
                        {/* <button
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
                        </button> */}
                        <button className="btn btn-success" type="submit">
                          Submit
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
export default EditAboutus;
