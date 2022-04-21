/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable eqeqeq */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Select from "react-select";
import Switch from "react-switch";

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

const custStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const custCity = (refObj) => (cell, row) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell.length === 0 || cell == undefined) {
    return "All Cities";
  } else if (cell.length > 0) {
    return "Particular cities";
  }
};

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
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        href="#"
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.chageStatus(row.id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
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

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const initialValues = {
  // cities: {
  //   city_name: "MUMBAI",
  //   label: "Mumbai (Maharashtra)",
  //   state_id: 15,
  //   value: 304,
  // },
  cities: "",
  product: "",
  type: 1,
  city_type: "1",
  status: "",
};

class Test extends Component {
  newCityName = {};
  constructor(props) {
    super(props);
    this.state = {
      product_list: [],
      product_Details: [],
      city_state_list: [],
      isLoading: false,
      showModal: false,
      activePage: 1,
      totalCount: 0,
      product_id: 0,
      itemPerPage: 10,
      search_city_name: "",
      search_product_code: "",
      search_product_name: "",
      search_status: "",

      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      selectCity_type: [
        { value: "1", label: "All Cities" },
        { value: "2", label: "Particular City" },
      ],
      selecttype: [
        { value: "1", label: "Tests" },
        { value: "2", label: "Packages" },
      ],
      city_type: "1",
      type: "1",
      product: "",
      suggestions: [],
      value: "",
      city_value: "",
      selectedProduct: "",
      selectedCity: [
        {
          city_name: "MUMBAI",
          label: "Mumbai (Maharashtra)",
          state_id: 15,
          value: 304,
        },
      ],

      cities: "",
      file: "",
      status: "",
      validProduct: true,
      banner_url: "",

      isValidFile: false,
    };
  }

  componentDidMount() {
    this.getCityStateList();
    // this.getProductCodeList();
    this.getProductList();
    this.setState({
      validationMessage: generateResolutionText("test-details"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
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
    let { search_product_code, search_product_name, search_status } =
      this.state;
    API.get(
      `/api/department/test?product_name=${encodeURIComponent(
        search_product_name
      )}&product_code=${encodeURIComponent(
        search_product_code
      )}&status=${search_status}&page=${page}`
    )
      .then((res) => {
        this.setState({
          activePage: page,
          product_list: res.data.data,
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

  getProductdetailsbyId(id) {
    API.get(`/api/department/test/${id}`)
      .then((res) => {
        const prd_data = {
          NAME: res.data.data[0].product_name,
          PRDCT_CODE: res.data.data[0].product_code,
          ID: res.data.data[0].product_id,
        };

        this.setState({
          product_Details: res.data.data,
          product_id: id,

          value: res.data.data[0].product_name,
          city_type: res.data.data[0].city_type,
          type: res.data.data[0].type,
          selectedProduct: prd_data,
          selectedCity: res.data.data[0].cities,
          status: res.data.data[0].status,

          showModal: true,
        });
      })
      .catch((err) => {
        console.log("error", err);
        showErrorMessage(err, this.props);
      });
  }
  //for edit
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      file: "",
      value: "",
      selectedProduct: "",
      selectedCity: {
        city_name: "MUMBAI",
        label: "Mumbai (Maharashtra)",
        state_id: 15,
        value: 304,
      },
      city_value: "",
      city_type: "1",
      type: 1,
      product_id: 0,
      product_Details: [],

      cities: "",
      // city_type: "",
      status: "",
      // type: "",
    });
  };

  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getProductdetailsbyId(id);
    } else {
      event.preventDefault();
      this.setState({ showModal: true });
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
    API.post(`/api/department/test/${id}`)
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

    const search_product_code = document.getElementById(
      "search_product_code"
    ).value;
    const search_product_name = document.getElementById(
      "search_product_name"
    ).value;
    const search_status = document.getElementById("search_status").value;

    if (
      search_product_code == "" &&
      search_product_name == "" &&
      search_status == ""
    ) {
      return false;
    }
    ///api/department/test
    API.get(
      `/api/department/test?product_name=${encodeURIComponent(
        search_product_name
      )}&product_code=${encodeURIComponent(
        search_product_code
      )}&status=${search_status}&page=1`
    )
      .then((res) => {
        this.setState({
          product_list: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_product_code: search_product_code,
          search_product_name: search_product_name,
          search_status: search_status,
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
    document.getElementById("search_product_code").value = "";
    document.getElementById("search_product_name").value = "";
    document.getElementById("search_status").value = "";

    this.setState(
      {
        search_product_code: "",
        search_product_name: "",
        search_status: "",
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
      return "Test";
    } else if (cell === 2) {
      return "Package";
    }
  };

  chageStatus = (cell, status) => {
    API.put(`/api/department/test/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
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

  handleSubmitEventAdd = (values, actions) => {
    // console.log("values", values);
    const { selectedCity, selectedProduct } = this.state;
    let method = "";
    let post_data = [];
    let post_data_product = {
      product_name: selectedProduct.NAME,
      product_code: selectedProduct.PRDCT_CODE,
      product_id: selectedProduct.ID,
    };

    if (values.city_type === "2") {
      for (let i = 0; i < selectedCity.length; i++) {
        post_data.push({
          city_name: selectedCity[i].city_name,
          city_id: selectedCity[i].value,
          label: selectedCity[i].label,
        });
      }
    }

    let formData = new FormData();

    method = "POST";
    let url = `/api/department/test`;

    formData.append("type", values.type);
    formData.append("cities", JSON.stringify(post_data));
    formData.append("product", JSON.stringify(post_data_product));
    formData.append("status", String(values.status));

    if (this.state.file !== "") {
      if (this.state.file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("test-details");
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
              .catch((response) => {
                if (response.data.status === 3) {
                  showErrorMessage(response, this.props);
                } else {
                  actions.setErrors(response.data.err.errors);
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

  handleSubmitEventUpdate = (values, actions) => {
    // console.log("values", values);

    const { selectedCity, value, selectedProduct } = this.state;

    let post_data_product;
    if (value === values.product) {
      post_data_product = {
        product_name: selectedProduct.NAME,
        product_code: selectedProduct.PRDCT_CODE,
        product_id: selectedProduct.ID,
      };
    }

    let method = "";
    let post_data = [];
    // let post_data = selectedCity;

    if (values.city_type === "2") {
      for (let i = 0; i < selectedCity.length; i++) {
        post_data.push({
          city_name: selectedCity[i].city_name,
          city_id: selectedCity[i].value,
          label: selectedCity[i].label,
        });
      }
    }

    let formData = new FormData();

    method = "PUT";
    let url = `/api/department/test/${this.state.product_id}`;

    formData.append("type", values.type);
    formData.append("cities", JSON.stringify(post_data));
    formData.append("product", JSON.stringify(post_data_product));
    formData.append("status", String(values.status));

    if (this.state.file) {
      if (this.state.file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("test-details");
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
                this.setState({ showModal: false });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Record updated successfully.",
                  icon: "success",
                }).then(() => {
                  this.getProductList();
                });
              })
              .catch((err) => {
                console.log("err", err);
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
            text: "Record Updated Successfully",
            icon: "success",
          }).then(() => {
            this.getProductList();
          });
        })
        .catch((err) => {
          console.log("error", err);
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

      if (this.state.city_type && this.state.city_type === "2") {
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

  renderSuggestion = (suggestion) => <span>{suggestion.label} </span>;

  onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
    if (method === "click" || method === "enter") {
      let payload = {
        search_name: suggestion.value.toUpperCase(),
      };

      if (this.state.city_type && this.state.city_type === "2") {
        payload.city_id = this.state.selectedCity.value;
      }

      SRL_API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];
            if (this.state.type === "2" && searchDetails.PROFILE_FLAG == "T") {
              this.setState({ validProduct: false });
            } else {
              this.setState({ validProduct: true });
            }
            this.setState({ selectedProduct: searchDetails }, () => {
              setFieldTouched("product");
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ selectedProduct: "" }, () => {
            setFieldTouched("product");
          });
        });
    }
  };

  handleAutoSuggestClick = () => {
    this.setState({ selectedProduct: "", value: "" });
  };

  //image
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
    this.setState({ thumbNailModal: true, banner_url: url });
  };

  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, banner_url: "" });
  };

  setProductImage = (refObj) => (cell, row) => {
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
      return "No image";
      // return null;
    }
  };

  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + "..." : str;
  };

  render() {
    const {
      // product_Details,
      product_id,
      city_state_list,
      totalCount,
      activePage,
      selectedCity,
      selectedProduct,
      value,
    } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      city_type: this.state.city_type ? this.state.city_type : "",
      file: "",
      type: this.state.type ? this.state.type : "",
      product: value ? value : "",
      cities: selectedCity ? selectedCity : "",
      status:
        this.state.status || this.state.status === 0
          ? this.state.status.toString()
          : "",
    });

    let validateStopFlag = Yup.object().shape({
      city_type: Yup.string()
        .trim()
        .required("Please select City Type")
        .matches(/^[1|2]$/, "Invalid city type selected"),
      type: Yup.string()
        .trim()
        .required("Please select Product Type")
        .matches(/^[1|2]$/, "Invalid Product type selected"),
      product: Yup.mixed()
        .test("product", "Please select product", () => {
          return selectedProduct && Object.keys(selectedProduct).length > 0;
        })
        .test(
          "pro",
          "Only packages are allowed for selected product type",
          () => this.state.validProduct
        ),

      cities: Yup.mixed().when("city_type", {
        is: (city_type) => city_type === "2" && !selectedCity,
        then: Yup.object().required("Please select city"),
      }),
      file: Yup.mixed().optional(),
      status: Yup.number().required("Please select status"),
    });

    let validateStopFlagUpdate = Yup.object().shape({
      city_type: Yup.string()
        .trim()
        .required("Please select City Type")
        .matches(/^[1|2]$/, "Invalid city type selected"),
      type: Yup.string()
        .trim()
        .required("Please select Product Type")
        .matches(/^[1|2]$/, "Invalid Product type selected"),
      product: Yup.mixed().required("Please select City Type"),
      file: Yup.string()
        .notRequired()
        .test(
          "product_image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (file) => {
            if (file) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      cities: Yup.mixed().when("city_type", {
        is: (city_type) =>
          city_type === "2" && Object.keys(selectedCity).length === 0,
        then: Yup.object().required("Please select city"),
      }),

      status: Yup.number().required("Please select status"),
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
                </div>

                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      id="search_product_name"
                      placeholder="Filter by Product Name"
                    />
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      id="search_product_code"
                      placeholder="Filter by Product Code"
                    />
                  </div>

                  <div className="">
                    <select
                      className="form-control"
                      name="status"
                      id="search_status"
                    >
                      <option value="">Select Status</option>
                      {this.state.selectStatus.map((val) => {
                        return (
                          <option key={val.value} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
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
                <BootstrapTable data={this.state.product_list}>
                  <TableHeaderColumn
                    isKey
                    dataField="product_image"
                    dataFormat={this.setProductImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="product_code">
                    Product Code
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="product_name"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Product Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={this.productType(this)}
                  >
                    Product Type
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="cities"
                    tdStyle={{ wordBreak: "break-word" }}
                    dataFormat={custCity(this)}
                  >
                    City Type
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
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

                {/* ======= Add Modal ======== */}
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.product_id > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.product_id > 0
                        ? this.handleSubmitEventUpdate
                        : this.handleSubmitEventAdd
                    }
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
                            <Modal.Title>
                              {this.state.product_id > 0
                                ? "Edit Product"
                                : "Add Product"}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Product Type
                                      <span className="impField">*</span>
                                    </label>

                                    <Field
                                      name="type"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.type}
                                      disabled={ this.state.product_id > 0
                                              ? true
                                              : false}
                                    >
                                      <option key="-1" value="">
                                        Select Product Type
                                      </option>
                                      {this.state.selecttype.map(
                                        (element, i) => (
                                          <option key={i} value={element.value}>
                                            {element.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.type && touched.type ? (
                                      <p className="errorMsg">{errors.type}</p>
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
                                      name="city_type"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.city_type}
                                      disabled={this.state.product_id > 0
                                              ? true
                                              : false}

                                      onChange={(evt) => {
                                        if (evt) {
                                          const { value } = evt.target;
                                          this.setState({
                                            city_type: value,
                                          });
                                          setFieldValue("city_type", value);
                                        } else {
                                          this.setState({
                                            city_type: "1",
                                          });
                                          setFieldValue("city_type", "1");
                                        }
                                      }}
                                    >
                                      <option key="-1" value="">
                                        Select City Type
                                      </option>
                                      {this.state.selectCity_type.map(
                                        (city_type, i) => (
                                          <option
                                            key={i}
                                            value={city_type.value}
                                          >
                                            {city_type.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.city_type && touched.city_type ? (
                                      <span className="errorMsg">
                                        {errors.city_type}
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
                                {values.city_type == "2" ? (
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        City
                                        <span className="impField">*</span>
                                      </label>
                                      <Select
                                        isMulti={true}
                                        name="cities"
                                        maxMenuHeight={200}
                                        isClearable={false}
                                        isSearchable={true}
                                        placeholder="Select City"
                                        options={city_state_list}
                                        value={this.state.selectedCity}
                                        disabled={this.state.product_id > 0
                                              ? true
                                              : false}

                                        onChange={(evt) => {
                                          this.setState({
                                            selectedCity: evt,
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
                                    Search Product
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
                                          this.setState({
                                            selectedProduct: "",
                                          });
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
                                          placeholder: "Enter Product Code",
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
                                            this.state.product_id > 0
                                              ? true
                                              : false,
                                          // disabled:
                                          //   this.state.selectedProduct != "",
                                        }}
                                        onSuggestionSelected={(event, req) => {
                                          this.onSuggestionSelected(
                                            event,
                                            req,
                                            setFieldTouched
                                          );
                                        }}
                                      />
                                      {this.state.selectedProduct !== "" ? (
                                        <button
                                          disabled={
                                            this.state.product_id > 0
                                              ? true
                                              : false
                                          }
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
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      <br />
                                      <i>{this.state.fileValidationMessage}</i>
                                      <br />
                                      <i>{this.state.validationMessage}</i>
                                    </label>
                                    <Field
                                      name="file"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Select Image"
                                      autoComplete="off"
                                      value={values.file}
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.file && touched.file ? (
                                      <span className="errorMsg">
                                        {errors.file}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>

                                <br></br>
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
                                      {this.state.selectStatus.map(
                                        (status, i) => (
                                          <option key={i} value={status.value}>
                                            {status.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.status && touched.status ? (
                                      <span className="errorMsg">
                                        {errors.status}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              {errors.message ? (
                                <Row>
                                  <Col xs={12} sm={12} md={12}>
                                    <span className="errorMsg">
                                      {errors.message}
                                    </span>
                                  </Col>
                                </Row>
                              ) : (
                                ""
                              )}
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
                              {this.state.product_id > 0
                                ? isSubmitting
                                  ? "Updating..."
                                  : "Update"
                                : isSubmitting
                                ? "Submitting..."
                                : "Submit"}
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
                  <Modal.Header closeButton>Product Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.banner_url}
                          alt="Product Image"
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
