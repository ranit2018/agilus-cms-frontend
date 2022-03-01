import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Select from "react-select";

import API from "../../../shared/admin-axios";
import SRL_API from "../../../shared/srl-axios";
import Layout from "../layout/Layout";
import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
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
  cityType: "",
  product: "",
  packageType: "",
};

class ProductDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product_data: [],
      city_state_list: [],
      isLoading: false,
      showModal: false,
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      search_city_name: "",
      selectCityType: [
        { value: "1", label: "Select All Cities" },
        { value: "2", label: "Select Particular Cities" },
      ],
      selectPackageType: [
        { value: "1", label: "Our Top Selling Tests/Packages" },
        { value: "2", label: "Popular Preventive Health Check-Up Packages" },
      ],
      cityType: "",
      product: "",
      suggestions: [],
      value: "",
      selectedValue: "",
    };
  }

  componentDidMount() {
    this.getCityStateList();
    this.getProductList();
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
          product_data: res.data.data,
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
    this.setState({ showModal: false });
  };

  modalShowHandler = (event) => {
    event.preventDefault();
    this.setState({ showModal: true });
  };

  handleSubmitEvent = (values, actions) => {
    let method = "";
    let post_data = [];
    let post_data_product = {
      product_name: "sample product",
      product_code: "123",
    };
    method = "POST";
    let url = `api/lead_landing/product`;

    if (values.cityType === "2") {
      values.cities.forEach((city) => {
        post_data.push({
          city_name: city.city_name,
          city_id: city.value,
        });
      });
      let payload = {
        cities: post_data,
        product: post_data_product,
        type: values.packageType,
      };
      API({
        method: method,
        url: url,
        data: payload,
      })
        .then((res) => {
          this.setState({ showModal: false });
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
          this.setState({ closeModal: true, showModalLoader: false });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    } else {
      const { city_state_list } = this.state;
      for (const city in city_state_list) {
        if (Object.hasOwnProperty.call(city_state_list, city)) {
          const element = city_state_list[city];
          post_data.push({
            city_name: element.city_name,
            city_id: element.value,
          });
        }
      }
      let payload = {
        cities: post_data,
        product: post_data_product,
        type: values.packageType,
      };
      API({
        method: method,
        url: url,
        data: payload,
      })
        .then((res) => {
          this.setState({ showModal: false });
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
          product_data: res.data.data,
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
  productType = (refObj) => (cell) => {
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
  // FOR AUTOSUGGEST CODE
  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length >= 3) {
      console.log("value>>", value);
      // const payload = {
      //     city_id:location.value,
      //     search_name:value
      // }
      // getHomeSearchAutoSuggestData(payload).then(res=>{
      // // console.log(res)
      // const suggestion_list = res.data;
      // setSuggestions(suggestion_list.length>0?suggestion_list:[])
      // }).catch(error=>{
      //     console.log(error)
      //     setSuggestions([]);
      // })
    } else {
      //    setSuggestions([]);
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

  onSuggestionSelected = (event, { suggestion, method }) => {
    if (method === "click" || method === "enter") {
      // this.setState({selectedValue: })
    }
  };

  render() {
    const { product_data, city_state_list, totalCount, activePage } =
      this.state;

    let validateStopFlag = Yup.object().shape({
      cityType: Yup.string()
        .trim()
        .required("Please select City Type")
        .matches(/^[1|2]$/, "Invalid city type selected"),
      packageType: Yup.string()
        .trim()
        .required("Please select Package Type")
        .matches(/^[1|2]$/, "Invalid package type selected"),
      cities: Yup.array()
        .of(Yup.object())
        .when("cityType", {
          is: "2",
          then: Yup.array().of(Yup.object()).required("Please select city"),
        }),
      product: Yup.string().test(
        "product",
        "Please select product",
        () => this.state.value !== ""
      ),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Products
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
                      <i className="fas fa-plus m-r-5" /> Add Product
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
                        <i className="fas fa-minus m-r-5" /> Remove All Products
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        disabled
                      >
                        <i className="fas fa-minus m-r-5" /> Remove All Products
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
                <BootstrapTable data={product_data}>
                  <TableHeaderColumn isKey dataField="product_code">
                    Product Code
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="product_name"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Product Name
                  </TableHeaderColumn>

                  <TableHeaderColumn dataField="city_name">
                    City
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={this.productType(this)}
                  >
                    Package Type
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
                            <Modal.Title>Add Product</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Search Product
                                      <span className="impField">*</span>
                                    </label>
                                    {/*  <Field
                                                                    name="product"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Search For Product"
                                                                    autoComplete="off"
                                                                    value={values.product}
                                                                /> */}

                                    <Autosuggest
                                      suggestions={this.state.suggestions}
                                      onSuggestionsFetchRequested={
                                        this.onSuggestionsFetchRequested
                                      }
                                      onSuggestionsClearRequested={
                                        this.onSuggestionsClearRequested
                                      }
                                      getSuggestionValue={
                                        this.getSuggestionValue
                                      }
                                      renderSuggestion={this.renderSuggestion}
                                      focusInputOnSuggestionClick={false}
                                      inputProps={{
                                        placeholder:
                                          "Search for a test, health package",
                                        value: this.state.value
                                          ? this.state.value.toUpperCase()
                                          : "",
                                        onChange: this.onChangeAutoSuggest,
                                        onKeyDown: this.handleSearch,
                                      }}
                                      onSuggestionSelected={
                                        this.onSuggestionSelected
                                      }
                                      className={`form-control`}
                                    />
                                    {errors.product && touched.product ? (
                                      <span className="errorMsg">
                                        {errors.product}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>

                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Package Type
                                      <span className="impField">*</span>
                                    </label>

                                    <Field
                                      name="packageType"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.packageType}
                                    >
                                      <option key="-1" value="">
                                        Select Type
                                      </option>
                                      {this.state.selectPackageType.map(
                                        (packageType, i) => (
                                          <option
                                            key={i}
                                            value={packageType.value}
                                          >
                                            {packageType.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.packageType &&
                                    touched.packageType ? (
                                      <span className="errorMsg">
                                        {errors.packageType}
                                      </span>
                                    ) : null}
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
                                      value={values.cityType}
                                    >
                                      <option key="-1" value="">
                                        Select Type
                                      </option>
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
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {values.cityType == "2" ? (
                              <div className="form-group">
                                <label>
                                  Cities
                                  <span className="impField">*</span>
                                </label>
                                <Select
                                  name="cities"
                                  maxMenuHeight={200}
                                  isMulti
                                  isClearable={true}
                                  isSearchable={true}
                                  placeholder="Select City"
                                  options={city_state_list}
                                  value={values.cities}
                                  onChange={(evt) =>
                                    setFieldValue("cities", evt)
                                  }
                                />
                                {errors.cities && touched.cities ? (
                                  <p className="errorMsg">{errors.cities}</p>
                                ) : null}
                                {errors.city_name ? (
                                  <p className="errorMsg">{errors.city_name}</p>
                                ) : null}
                                {errors.city_id ? (
                                  <p className="errorMsg">{errors.city_id}</p>
                                ) : null}
                              </div>
                            ) : null}
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
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default ProductDetails;
