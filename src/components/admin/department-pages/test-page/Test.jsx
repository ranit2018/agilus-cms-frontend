/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Select from "react-select";

import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
} from "../../../../shared/helper";
import API from "../../../../shared/admin-axios";
import SRL_API from "../../../../shared/srl-axios";
import Layout from "../../layout/Layout";

import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../../shared/handle_error";
import Autosuggest from "react-autosuggest";

/*For Tooltip*/
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

/*For Tooltip*/
const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
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

const initialValues = {
 
  cities: "",
  test: "",
  testType: 1,
  cityType: "1",
};

class Test extends Component {
  newCityName = {};
  constructor(props) {
    super(props);
    this.state = {
      testDetails: [],
      city_state_list: [],
      isLoading: false,
      showModal: false,
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      search_city_name: "",
      selectCityType: [
        { value: "1", label: "Select All Cities" },
        { value: "2", label: "Select Particular City" },
      ],
      selecttestType: [
        { value: "1", label: "Our Top Selling Tests/Packages" },
        { value: "2", label: "Popular Preventive Health Check-Up Packages" },
      ],
      cityType: "1",
      testType: "1",
      product: "",
      suggestions: [],
      value: "",
      selectedValue: "",

      file: "",
      selectedCity: {
        city_name: "MUMBAI",
        label: "Mumbai (Maharashtra)",
        state_id: 15,
        value: 304,
      },
      validProduct: true,
    };
  }

  componentDidMount() {
    // this.getCityStateList();
    // this.getProductList();
    // this.setState({
    //   validationMessage: generateResolutionText("product-details"),
    //   fileValidationMessage: FILE_VALIDATION_MASSAGE,
    // });
  }

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

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getProductList(pageNumber > 0 ? pageNumber : 1);
  };

  getProductList = (page = 1) => {
    let { search_city_name } = this.state;
    API.get(
      `api/lead_landing/product?city=${encodeURIComponent(
        search_city_name
      )}&page=${page}`
    )

      .then((res) => {
        this.setState({
          activePage: page,
          testDetails: res.data.data,
          totalCount: res.data.count,
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

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      file: "",
      value: "",
      selectedValue: "",
      selectedCity: {
        city_name: "MUMBAI",
        label: "Mumbai (Maharashtra)",
        state_id: 15,
        value: 304,
      },
      cityType: "1",
      testType: 1,
    });
  };

  modalShowHandler = (event) => {
    event.preventDefault();
    this.setState({ showModal: true });
  };

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
        this.deleteProduct(id);
      }
    });
  };

  deleteProduct = (id) => {
    API.delete(`/api/lead_landing/product/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getProductList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  ProductSearch = (e) => {
    e.preventDefault();

    const search_city_name = document.getElementById("search_city_name").value;

    if (search_city_name === "") {
      return false;
    }
    API.get(
      `api/lead_landing/product?city=${encodeURIComponent(
        search_city_name
      )}&page=1`
    )
      .then((res) => {
        this.setState({
          testDetails: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_city_name: search_city_name,
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
    document.getElementById("search_city_name").value = "";
    this.setState(
      {
        search_city_name: "",
        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getProductList();
      }
    );
  };

  testTypeList = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
      return "Our Top Selling Tests/Packages";
    } else if (cell === 2) {
      return "Popular Preventive Health Check-Up Packages";
    }
  };

  confirmDeleteAllProducts = (event) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: "Are you sure?",
      text: "This will remove all the Products!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.deleteAllProducts();
      }
    });
  };

  deleteAllProducts = () => {
    API.post(`api/lead_landing/product/delete_all`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Removed successfully.",
          icon: "success",
        }).then(() => {
          this.getProductList();
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  handleSubmitEvent = (values, actions) => {
    const { city_state_list, selectedValue, selectedCity } = this.state;
    let method = "";
    let post_data = [];
    let post_data_product = {
      product_name: selectedValue.NAME,
      product_code: selectedValue.PRDCT_CODE,
      product_id: selectedValue.ID,
    };

    if (values.cityType === "1") {
      city_state_list.forEach((city) => {
        post_data.push({
          city_name: city.city_name,
          city_id: city.value,
        });
      });
    } else {
      post_data.push({
        city_name: selectedCity.city_name,
        city_id: selectedCity.value,
      });
    }

    let formData = new FormData();

    method = "POST";
    let url = `api/lead_landing/product`;

    formData.append("type", values.testType);
    formData.append("cities", JSON.stringify(post_data));
    formData.append("product", JSON.stringify(post_data_product));

    if (this.state.file !== "") {
      if (this.state.file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("product-details");
          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
            actions.setSubmitting(false);
          } else {
            formData.append("product_image", this.state.file);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.modalCloseHandler();
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Added Successfully",
                  icon: "success",
                }).then(() => {
                  this.getProductList();
                });
              })
              .catch((err) => {
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
    } else {
      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Added Successfully",
            icon: "success",
          }).then(() => {
            this.getProductList();
          });
        })
        .catch((err) => {
          actions.setSubmitting(false);
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            if (err.data && err.data.errors) {
              actions.setErrors(err.data.errors);
            }
          }
        });
    }
  };

  // FOR AUTOSUGGEST CODE
  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length >= 3) {
      let payload = {
        //  city_id:location.value,
        search_name: value.toUpperCase(),
      };

      if (this.state.cityType && this.state.cityType === "2") {
        payload.city_id = this.state.selectedCity.value;
      }

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

      if (this.state.cityType && this.state.cityType === "2") {
        payload.city_id = this.state.selectedCity.value;
      }

      SRL_API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];

            if (
              this.state.testType === "2" &&
              searchDetails.PROFILE_FLAG == "T"
            ) {
              this.setState({ validProduct: false });
            } else {
              this.setState({ validProduct: true });
            }
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

  handleAutoSuggestClick = () => {
    this.setState({ selectedValue: "", value: "" });
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("file");
    setFieldValue("file", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        file: "",
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
        file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        file: "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        file: "",
        isValidFile: false,
      });
    }
  };

  imageModalShowHandler = (url) => {
    //  console.log(url);
    this.setState({ thumbNailModal: true, test_url: url });
  };

  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, test_url: "" });
  };

  setTestImage = (refObj) => (cell, row) => {
    if (row.product_image !== null) {
      return (
        <img
          src={row.product_image}
          alt="Product Image"
          height="100"
          onClick={(e) => refObj.imageModalShowHandler(row.product_image)}
        ></img>
      );
    } else {
      return null;
    }
  };

  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + "..." : str;
  };

  render() {
    const {
      testDetails,
      city_state_list,
      totalCount,
      activePage,
      selectedCity,
      selectedValue,
    } = this.state;

    let validateStopFlag = Yup.object().shape({
      cityType: Yup.string()
        .trim()
        .required("Please select City Type")
        .matches(/^[1|2]$/, "Invalid city type selected"),
      testType: Yup.string()
        .trim()
        .required("Please select Test Type")
        .matches(/^[1|2]$/, "Invalid Product type selected"),
      // cities: Yup.array()
      //   .of(Yup.object())
      //   .when("cityType", {
      //     is: "2",
      //     then: Yup.array().of(Yup.object()).required("Please select city"),
      //   }),
      test: Yup.object()
        .test("product", "Please select test", () => {
          return selectedValue && Object.keys(selectedValue).length > 0;
        })
        .test(
          "pro",
          "Only packages are allowed for selected product type",
          () => this.state.validProduct
        ),

      cities: Yup.object().when("cityType", {
        is: (cityType) =>
          cityType === "2" && Object.keys(selectedCity).length === 0,
        then: Yup.object().required("Please select city"),
      }),
      file: Yup.string().when("testType", {
        is: "1",
        then: Yup.string()
          .required("Please select the image")
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            () => this.state.isValidFile
          ),
      }),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Test
                  <small />
                </h1>
              </div>
              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="row">
                  <div className="col-lg-4 col-sm-4 col-xs-4">
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={(e) => this.modalShowHandler(e, "")}
                    >
                      <i className="fas fa-plus m-r-5" /> Add Test
                    </button>
                  </div>
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  <div className="col-lg-3 col-sm-3 col-xs-3">
                    {totalCount > 0 ? (
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.confirmDeleteAllProducts(e)}
                      >
                        <i className="fas fa-minus m-r-5" /> Remove All Test
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        disabled
                      >
                        <i className="fas fa-minus m-r-5" /> Remove All Test
                      </button>
                    )}
                  </div>
                </div>

                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      id="search_city_name"
                      placeholder="Filter by City"
                    />
                  </div>
                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.ProductSearch(e)}
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
                <BootstrapTable data={testDetails}>
                  <TableHeaderColumn isKey dataField="test_code">
                    Test Code
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="test"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Test
                  </TableHeaderColumn>

                  <TableHeaderColumn dataField="city_name">
                    City
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="test_type"
                    dataFormat={this.testTypeList(this)}
                  >
                    Test Type
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="test_image"
                    dataFormat={this.setTestImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>
                {totalCount > 10 ? (
                  <Row>
                    <Col md={12}>
                      <div className="paginationOuter text-right">
                        <Pagination
                          activePage={activePage}
                          itemsCountPerPage={10}
                          totalItemsCount={totalCount}
                          itemClass="nav-item"
                          linkClass="nav-link"
                          activeClass="active"
                          onChange={this.handlePageChange}
                        />
                      </div>
                    </Col>
                  </Row>
                ) : null}

                {/* ======= Modal ======== */}
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
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
                      setErrors,
                      setFieldTouched,
                    }) => {
                      return (
                        <Form>
                          <Modal.Header closeButton>
                            <Modal.Title>Add Test</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Test Type
                                      <span className="impField">*</span>
                                    </label>

                                    <Field
                                      name="testType"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      //value={values.testType}
                                      value={this.state.testType}
                                      onChange={(evt) => {
                                        if (evt) {
                                          const { value } = evt.target;
                                          this.setState({
                                            testType: value,
                                            value: "",
                                            selectedValue: "",
                                            validProduct: true,
                                          });
                                          setFieldValue("test_type", value);
                                        } else {
                                          this.setState({
                                            testType: "1",
                                            value: "",
                                            selectedValue: "",
                                            validProduct: true,
                                          });
                                          setFieldValue("test_type", "1");
                                        }
                                      }}
                                    >
                                      {this.state.selecttestType.map(
                                        (element, i) => (
                                          <option key={i} value={element.value}>
                                            {element.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                  
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      City Type
                                      <span className="impField">*</span>
                                    </label>

                                    <Field
                                      name="cityType"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      // value={values.cityType}
                                      value={this.state.cityType}
                                      onChange={(evt) => {
                                        if (evt) {
                                          const { value } = evt.target;
                                          this.setState({
                                            cityType: value,
                                            value: "",
                                            selectedValue: "",
                                          });
                                          setFieldValue("cityType", value);
                                        } else {
                                          this.setState({
                                            cityType: "1",
                                            value: "",
                                            selectedValue: "",
                                          });
                                          setFieldValue("cityType", "1");
                                        }
                                      }}
                                    >
                                      {this.state.selectCityType.map(
                                        (cityType, i) => (
                                          <option
                                            key={i}
                                            value={cityType.value}
                                          >
                                            {cityType.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.cityType && touched.cityType ? (
                                      <span className="errorMsg">
                                        {errors.cityType}
                                      </span>
                                    ) : null}

                                    {errors.city ? (
                                      <p
                                        className="errorMsg"
                                        style={{ wordBreak: "break-word" }}
                                      >
                                        {errors.city}
                                      </p>
                                    ) : null}
                                  </div>
                                </Col>
                                {this.state.cityType == "2" ? (
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        City
                                        <span className="impField">*</span>
                                      </label>
                                      <Select
                                        name="cities"
                                        maxMenuHeight={200}
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={true}
                                        placeholder="Select City"
                                        options={city_state_list}
                                        // value={values.cities}
                                        value={this.state.selectedCity}
                                        onChange={(evt) => {
                                          this.setState({
                                            selectedCity: evt,
                                            value: "",
                                            selectedValue: "",
                                          });
                                          setFieldValue("cities", evt);
                                        }}
                                      />
                                      {errors.cities && touched.cities ? (
                                        <p className="errorMsg">
                                          {errors.cities}
                                        </p>
                                      ) : null}
                                    </div>
                                  </Col>
                                ) : null}
                                <Col xs={12} sm={12} md={12}>
                                  <label>
                                    Search Test
                                    <span className="impField">*</span>
                                  </label>
                                  <div className="form-group">
                                    <div className="position-relative">
                                      <Autosuggest
                                        suggestions={this.state.suggestions}
                                        onSuggestionsFetchRequested={(req) => {
                                          this.onSuggestionsFetchRequested(req);
                                          setFieldTouched("product");
                                        }}
                                        onSuggestionsClearRequested={() => {
                                          this.onSuggestionsClearRequested();
                                          this.setState({ selectedValue: "" });
                                        }}
                                        getSuggestionValue={
                                          this.getSuggestionValue
                                        }
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
                                          placeholder: "Enter Test Code",
                                          // value: this.state.value,
                                          value: this.Truncate(
                                            this.state.value,
                                            70
                                          ),
                                          onChange: this.onChangeAutoSuggest,
                                          onKeyDown: this.handleSearch,
                                          onBlur: () =>
                                            setFieldTouched("product"),
                                          disabled:
                                            this.state.selectedValue != "",
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
                                      />
                                      {this.state.selectedValue !== "" ? (
                                        <button
                                          onClick={() =>
                                            this.handleAutoSuggestClick()
                                          }
                                          className="crossBtn btn btn-danger pull-right"
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
                                {values.testType == "1" ? (
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        Upload Image
                                        <span className="impField">*</span>
                                        <br />
                                        <i>
                                          {this.state.fileValidationMessage}
                                        </i>
                                        <br />
                                        <i>{this.state.validationMessage}</i>
                                      </label>
                                      <Field
                                        name="file"
                                        type="file"
                                        className={`form-control`}
                                        placeholder="Select Image"
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
                                      {errors.file ? (
                                        <span className="errorMsg">
                                          {errors.file}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                ) : null}

                                <br></br>
                              </Row>
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <button
                              className={`btn btn-success btn-sm ${
                                isValid ? "btn-custom-green" : "btn-disable"
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                            <button
                              onClick={(e) => this.modalCloseHandler()}
                              className={`btn btn-danger btn-sm`}
                              type="button"
                            >
                              Close
                            </button>
                          </Modal.Footer>
                        </Form>
                      );
                    }}
                  </Formik>
                </Modal>
                {/* MODAL FOR IMAGE*/}
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Test Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.test_url}
                          alt="Test Image"
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
export default Test;
