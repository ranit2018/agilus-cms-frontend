import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import TinyMCE from "react-tinymce";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import { htmlDecode, DEFAULT_CITY } from "../../../shared/helper";
import Layout from "../layout/Layout";
import SRL_API from "../../../shared/srl-axios";
import Autosuggest from "react-autosuggest";
import ReactHtmlParser from "react-html-parser";
import { Input } from "reactstrap";
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
let add_more_counter = 1;
class AddAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      selectedValue: "",
      suggestions: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      selectType: [
        { value: "1", label: "Accordion" },
        { value: "2", label: "Description" },
      ],
      selProducts: null,
      SWIhtml: "",
      typeHtml: "",
      tinymceValue: "",
      typeState: [],
    };
  }

  componentDidMount() {
    let prev_state = [];
    prev_state.push({
      newTitle: "",
      newDescription: "",
      newContent: "",
      common_err: "",
      type: [],
    });

    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
  }

  hideError = () => {
    this.setState({ errMsg: "" });
  };
  removeError = (setErrors) => {
    setErrors({});
  };

  rmError = (index) => {
    let prev_state = this.state.selProducts;
    prev_state[index].common_err = "";
    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(prev_state);
    });
  };

  handleSWI = (event, index, key) => {
    let value = "";
    if (event.target.getContent) {
      value = event.target.getContent();
    } else {
      value = event.target.value;
    }

    //	console.log({value});

    let prev_state = this.state.selProducts;
    prev_state[index].common_err = "";

    if (key === "newTitle") {
      prev_state[index].newTitle = value;
    }

    if (key === "type") {
      prev_state[index].type = value;
    }
    if (key === "newDescription") {
      prev_state[index].newDescription = value;
    }
    if (key === "newContent") {
      prev_state[index].newContent = value;
    }

    // console.log('prev_state',prev_state);
    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(prev_state);
    });
  };

  getHtmlSIW = (theState) => {
    //console.log("theState", theState);
    this.setState({ typeHtml: "", SWIhtml: "" });
    let htmlData = [];
    let htmlTypeArry = [];

    for (let index = 0; index < theState.length; index++) {
      const element = theState[index];
      htmlData.push(
        <div
          className="sampleCheckSec addMoreSec"
          key={`sampleCheckSec${index}`}
        >
          <div
            className="messageserror"
            style={{
              display: element.common_err !== "" ? "block" : "none",
            }}
          >
            <Link to="#" className="close">
              {/*   <button width="17.69px"
                height="22px"
                onClick={(e) => this.rmError(index)}>X</button> */}
            </Link>
          </div>

          <Col xs={12} sm={12} md={12}>
            <div className="form-group">
              <label>
                Type
                <span className="impField">*</span>
              </label>
              <Input
                name="type"
                type="select"
                className={`selectArowGray form-control`}
                autoComplete="off"
                onChange={(e) => {
                  this.handleSWI(e, index, "type");
                }}
                value={element.type}
              >
                <option key="-1" value="">
                  Select
                </option>
                {this.state.selectType.map((val, i) => (
                  <option key={i} value={val.value}>
                    {val.label}
                  </option>
                ))}
              </Input>
            </div>
          </Col>

          {element.type === "1" ? (
            <Col xs={12} sm={12} md={12}>
              <div className="form-group">
                <label>
                  Title
                  <span className="impField">*</span>
                </label>
                <Field
                  name="newTitle"
                  type="text"
                  className={`form-control`}
                  placeholder="Enter Title"
                  autoComplete="off"
                  value={element.newTitle}
                  onChange={(e) => {
                    this.handleSWI(e, index, "newTitle");
                  }}
                />
              </div>
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
                  name="newContent"
                  value={htmlDecode(element.newContent)}
                  config={{
                    menubar: false,
                    branding: false,
                    selector: "textarea",
                    height: 150,
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
                    content_css: "//www.tinymce.com/css/codepen.min.css",
                    file_browser_callback_types: "image",
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype == "image") {
                        var input = document.getElementById("my-file");
                        input.click();
                        input.onchange = function () {
                          var file = input.files[0];
                          var reader = new FileReader();
                          reader.onload = function (e) {
                            // console.log("name", e.target.result);
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
                    this.handleSWI(e, index, "newContent");
                  }}
                />
              </div>

              {index == 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.addRow(e)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-plus" aria-hidden="true"></i> Add
                  </Link>
                </div>
              )}
              {index > 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.deleteRow(e, index)}
                    className="btn btnRemove btn-danger pull-right mb-3"
                  >
                    <i className="fa fa-minus" aria-hidden="true"></i> Remove
                  </Link>
                </div>
              )}
              <div className="clearfix" />
            </Col>
          ) : null}
          {element.type === "2" ? (
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
                  name="description"
                  config={{
                    menubar: false,
                    branding: false,
                    selector: "textarea",
                    height: 150,
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
                    content_css: "//www.tinymce.com/css/codepen.min.css",
                    file_browser_callback_types: "image",
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype == "image") {
                        var input = document.getElementById("my-file");
                        input.click();
                        input.onchange = function () {
                          var file = input.files[0];
                          var reader = new FileReader();
                          reader.onload = function (e) {
                            // console.log("name", e.target.result);
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
                    this.handleSWI(e, index, "newDescription");
                  }}
                />
              </div>
              {index == 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.addRow(e)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-plus" aria-hidden="true"></i> Add
                  </Link>
                </div>
              )}
              {index > 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.deleteRow(e, index)}
                    className="btn btnRemove btn-danger pull-right mb-3"
                  >
                    <i className="fa fa-minus" aria-hidden="true"></i> Remove
                  </Link>
                </div>
              )}
              <div className="clearfix" />
            </Col>
          ) : null}
          <div className="clearfix" />
        </div>
      );
    }

    this.setState({ SWIhtml: htmlData });
  };

  addRow = (e) => {
    e.preventDefault();
    add_more_counter = add_more_counter + 1;
    let prev_state = this.state.selProducts;
    prev_state.push({
      newTitle: "",
      newDescription: "",
      newContent: "",
      common_err: "",
      type: [],
    });
    // prev_state.push({
    //   content_details: [{ description: "" }],
    //   accordion_details: [
    //     {
    //       newContent: "",
    //       newTitle: "",
    //     },
    //   ],
    //   type: [],
    //   common_err: "",
    // });

    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
    this.setState({ counter: add_more_counter });
    //  this.setState({ typeState: [] });
  };

  deleteRow = (e, sel_index) => {
    e.preventDefault();
    add_more_counter = add_more_counter - 1;
    let prev_state = this.state.selProducts;
    let new_arr = [];
    for (let index = 0; index < prev_state.length; index++) {
      const element = prev_state[index];
      if (sel_index != index) {
        new_arr.push(prev_state[index]);
      }
    }

    this.setState({ selProducts: new_arr }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
    this.setState({ counter: add_more_counter });
  };

  // FOR AUTOSUGGEST CODE///////////////////////////////////////////////////////////
  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length >= 3) {
      let payload = {
        //  city_id:location.value,
        search_name: value.toUpperCase(),
      };

      SRL_API.post(`/feed/code-search-autocomplete`, payload)
        .then((res) => {
          const suggestion_list = res.data.data;
          this.setState({
            suggestions: suggestion_list.length > 0 ? suggestion_list : [],
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ suggestions: [] });
        });
    } else {
      this.setState({ suggestions: [] });
    }
  };

  onSuggestionsClearRequested = () => {};

  onChangeAutoSuggest = (event, { newValue }) => {
    this.setState({ value: newValue });
  };

  handleSearch = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
      // history.push(`/health-packages/search/${stringToSlug(location.city_name)}/${encodeURIComponent(value)}`);
    }
  };

  getSuggestionValue = (suggestion) => suggestion.label;

  renderSuggestion = (suggestion) => <span>{suggestion.label}</span>;

  onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
    if (method === "click" || method === "enter") {
      let payload = {
        search_name: suggestion.value.toUpperCase(),
      };
      SRL_API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];
            this.setState({ selectedValue: searchDetails }, () => {
              setFieldTouched("product");
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ selectedValue: "" }, () => {
            setFieldTouched("product");
          });
        });
    }
  };

  handleSubmitEvent = (values, actions) => {
    const { selectedValue } = this.state;
    let swiData = this.state.selProducts;
    let contentarray = [];

    let url = `api/lead_landing/accordion`;
    let method = "POST";

    let err = 0;
    for (let index = 0; index < swiData.length; index++) {
      const element = swiData[index];
      element.common_err = "";
      let err_arr = [];

      if (element.newTitle == "" && element.type === "1") {
        err_arr.push("Please enter title");
        err++;
      }

      if (element.newContent == "" && element.type === "1") {
        err_arr.push("Please enter content");
        err++;
      }

      if (element.newDescription == "" && element.type === "2") {
        err_arr.push("Please enter Description");
        err++;
      }
      if (err_arr.length > 0) {
        //err_arr.push(`${element.product_name}`);
        element.common_err = `<li>${err_arr.join("</li><li>")}`;
        swal({
          closeOnClickOutside: true,
          title: "Error",
          text: "Please fill all details",
          icon: "error",
        });
      }
    }

    if (err > 0) {
      this.setState({ selProducts: swiData }, () => {
        this.getHtmlSIW(swiData);
        scrollTo("top");
        actions.setSubmitting(false);
      });
    } else {
      for (var i = 0; i < swiData.length; i++) {
        contentarray.push({
          title: swiData[i].newTitle,
          content:
            swiData[i].type === "1"
              ? swiData[i].newContent
              : swiData[i].newDescription,
          type: swiData[i].type,
        });
      }

      let post_data_product = {
        product_name: selectedValue.NAME,
        product_code: selectedValue.PRDCT_CODE,
        product_type: selectedValue.PROFILE_FLAG,
        product_city: selectedValue.CITY_NM ? selectedValue.CITY_NM  : DEFAULT_CITY, 
        product_id: JSON.stringify(selectedValue.ID),
      };

      API({
        method: method,
        url: url,
        data: {
          //  type: values.type,
          accordion_details: contentarray,
          status: values.status,
          product: post_data_product,
        },
      })
        .then((res) => {
          this.setState({ showModal: false, value: "", selectedValue: "" });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record added successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/product-details/accordion");
          });
        })
        .catch((err) => {
          this.setState({
            // showModalLoader: false,
            // value: "",
            // selectedValue: "",
          });
          if (err.data.status === 3) {
            this.setState({
              showModal: false,
              value: "",
              selectedValue: "",
            });
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };
  handleAutoSuggestClick = () => {
    this.setState({ selectedValue: "", value: "" });
  };

  render() {
    const { selectedValue, selProducts, counter } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      product: "",
      status: "",
      description: "",
    });

    const validateStopFlag = Yup.object().shape({
      product: Yup.object().test(
        "product",
        "Please select product",
        () => selectedValue && Object.keys(selectedValue).length > 0
      ),
      // type: Yup.string()
      //   .trim()
      //   .required("Please select Type")
      //   .matches(/^[1|2]$/, "Invalid Type selected"),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),

      description: Yup.string().when("type", {
        is: "2",
        then: Yup.string().required("Please enter Description"),
      }),
    });
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Accordion
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
                                  Search Product
                                  <span className="impField">*</span>
                                </label>
                                <div className="position-relative">
                                  <Autosuggest
                                    suggestions={this.state.suggestions}
                                    onSuggestionsFetchRequested={(req) => {
                                      this.onSuggestionsFetchRequested(req);
                                      setFieldTouched("product");
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
                                        textTransform: "uppercase",
                                        display: "block",
                                        width: "100%",
                                        height: "34px",
                                        padding: "6px 12px",
                                        fontSize: "14px",
                                        lineHeight: "1.42857143",
                                        color: "#555555",
                                        backgroundColor: "#fff",
                                        backgroundImage: "none",
                                        border: "1px solid #d2d6de",
                                      },
                                      placeholder: "Enter Product Code",

                                      value: this.state.value,
                                      onChange: this.onChangeAutoSuggest,
                                      onKeyDown: this.handleSearch,
                                      onBlur: () => setFieldTouched("product"),
                                      disabled: this.state.selectedValue != "",
                                    }}
                                    onSuggestionSelected={(event, req) => {
                                      this.onSuggestionSelected(
                                        event,
                                        req,
                                        setFieldTouched
                                      );
                                      // setTimeout(() => {
                                      //   setFieldTouched("product", true)
                                      // }, 230);
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
                                {errors.product && touched.product ? (
                                  <span className="errorMsg">
                                    {errors.product}
                                  </span>
                                ) : null}
                              </div>
                            </Col>

                            {this.state.SWIhtml}
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
export default AddAccordion;
