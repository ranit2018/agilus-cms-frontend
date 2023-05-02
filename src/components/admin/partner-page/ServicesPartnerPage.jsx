import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";
import ReactHtmlParser from "react-html-parser";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  getResolution,
  ICON_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../shared/helper";
import Autosuggest from "react-autosuggest";

import SRL_API from "../../../shared/srl-axios";

const initialValues = {
  status: "",
  file: "",
  labId: "",
  content: "",
  heading: "",
};
const __htmlDecode = (refObj) => (cell) => {
  return ReactHtmlParser(htmlDecode(cell));
};

const custStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

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

const setsocialLink = (refOBj) => (cell, row) => {
  return (
    <a href={row.link} target="_blank">
      {row.link}
    </a>
  );
};

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      {/* <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.changeStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.changeStatus(row.id, row.status)}
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
class ServicesPartnerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ServicesList: [],
      serviceDetail: {},
      serviceEditType: 0,
      isLoading: false,
      showModal: false,
      thumbNailModal: false,
      search_by_status: "",
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      suggestions: [],
      labIdValue: "",
      selectedLabIdValue: "",

      // new
      city_state_list: [],
      add_city: "",
    };
  }

  getServicesList = (page = 1) => {
    API.get(`/api/center/service?page=${page}`)
      .then((res) => {
        this.setState({
          ServicesList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          serviceEditType: 0,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
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
        this.deleteAmenity(id);
      }
    });
  };

  deleteAmenity = (id) => {
    API.post(`api/center/service/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getServicesList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getServiceDetails(id) {
    API.get(`/api/center/service/${id}`)
      .then((res) => {
        this.setState({
          showModal: true,
          serviceDetail: res.data.data[0],
          serviceEditType: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.add_city !== prevState.add_city) {
      this.clearAutoSuggest();
    }
  }

  clearAutoSuggest() {
    this.setState({ labs: "", labIdValue: "" });
  }
  changeStatus = (cell, status) => {
    API.put(`/api/center/service/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getServicesList(this.state.activePage);
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
    let formData = new FormData();
    formData.append("heading", values.heading);
    formData.append("content", values.content);
    formData.append("status", values.status);
    formData.append("lab_name", this.state.labs.LCTN_NM);
    formData.append("lab_id", String(this.state.labs.LAB_ID));
    formData.append("lab_url_key", this.state.labs.URL_KEY);
    formData.append("city", this.state.add_city);
    let url = `api/center/service/`;
    let method = "POST";

    if (this.state.file.size > FILE_SIZE) {
      actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.file).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("partner-services");
        if (height != offerDimension.height || width != offerDimension.width) {
          //    actions.setErrors({ file: "The file is not of desired height and width" });
          actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
          actions.setSubmitting(false);
        } else {
          formData.append("service_image", this.state.file);
          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, file: "", suggestions: [] });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.getServicesList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                file: "",
                suggestions: [],
              });
              if (err.data.errors.status === 5) {
                actions.setSubmitting(false);
                actions.setErrors(err.data.errors);
              } else if (err.data.status === 3) {
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

  handleSubmitEventUpdate = (values, actions) => {
    let formData = new FormData();
    formData.append("status", values.status);
    formData.append("heading", values.heading);
    formData.append("content", values.content);
    let url = `/api/center/service/${this.state.serviceEditType}`;
    let method = "PUT";

    if (this.state.file) {
      if (this.state.file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("partner-services");
          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
            actions.setSubmitting(false);
          } else {
            formData.append("service_image", this.state.file);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false, suggestions: [] });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Updated Successfully",
                  icon: "success",
                }).then(() => {
                  this.getServicesList();
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
          this.setState({ showModal: false, suggestions: [] });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Updated Successfully",
            icon: "success",
          }).then(() => {
            this.getServicesList();
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
  componentDidMount() {
    this.getCityStateList();
    this.getServicesList();
    this.setState({
      validationMessage: generateResolutionText("partner-services", "icon"),
      fileValidationMessage: ICON_VALIDATION_MASSAGE,
    });
  }

  modalCloseHandler = () => {
    this.setState({
      serviceDetail: {},
      serviceEditType: 0,

      suggestion: [],
      labs: "",
      labIdValue: "",
      selectedLabIdValue: "",
      showModal: false,
    });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    if (id) {
      this.getServiceDetails(id);
    } else {
      this.setState({
        serviceDetail: {},
        serviceEditType: 0,
        showModal: true,
        suggestion: [],
      });
    }
  };

  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, banner_url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, banner_url: "" });
  };
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getServicesList(pageNumber > 0 ? pageNumber : 1);
  };
  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
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

  setServiceImage = (refObj) => (cell, row) => {
    if (row.offer_image !== null) {
      return (
        <img
          src={row.service_image}
          alt="Service Icon"
          height="100"
          onClick={(e) => refObj.imageModalShowHandler(row.service_image)}
        ></img>
      );
    } else {
      return null;
    }
  };

  ServicesSearch = (e) => {
    e.preventDefault();

    const search_by_status = document.getElementById("status").value;
    const search_lab_code = document.getElementById("search_lab_code").value;
    const search_by_heading =
      document.getElementById("search_by_heading").value;

    if (
      search_by_status === "" &&
      search_by_heading == "" &&
      search_lab_code == ""
    ) {
      return false;
    }
    API.get(
      `/api/center/service?page=1&status=${search_by_status}&heading=${encodeURIComponent(
        search_by_heading
      )}&lab_name=${search_lab_code}`
    )
      .then((res) => {
        this.setState({
          ServicesList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_by_status: search_by_status,
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
    document.getElementById("status").value = "";
    document.getElementById("search_by_heading").value = "";
    document.getElementById("search_lab_code").value = "";
    this.setState(
      {
        search_by_status: "",
        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getServicesList();
      }
    );
  };

  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length > 2) {
      let payload = {
        city_name: this.state.add_city,
        search_name: value,
      };

      SRL_API.post(`/feed/get-lab-by-name`, payload)
        .then((res) => {
          const suggestion_list = res.data.data.data.LAB_LIST;
          console.log("suggestion_list:", suggestion_list);
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

  getSuggestionValue = (suggestion) => suggestion.LCTN_NM;

  renderSuggestion = (suggestion) => <span>{suggestion.LCTN_NM}</span>;

  onChangeAutoSuggest = (event, { newValue }) => {
    this.setState({ labIdValue: newValue });
  };

  handleSearchLab = (event) => {
    if (event.key === "Enter") {
      event.target.blur();
      // history.push(`/health-packages/search/${stringToSlug(location.city_name)}/${encodeURIComponent(value)}`);
    }
  };

  onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
    if (method === "click" || method === "enter") {
      this.setState({ labs: suggestion });
    }
  };

  render() {
    const { serviceDetail, selectedLabIdValue } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      status:
        serviceDetail.status || +serviceDetail.status === 0
          ? serviceDetail.status.toString()
          : "",
      heading: serviceDetail.heading ? serviceDetail.heading : "",
      content: serviceDetail.content ? serviceDetail.content : "",
      cities: this.state.serviceDetail.city,
      labs: this.state.serviceDetail.lab_name,
    });

    const validateStopFlag = Yup.object().shape({
      file: Yup.string()
        .required("Please select the Image")
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      // labId: Yup.string()
      //   .test("labId", "Please select a Lab Id", () => {
      //     return selectedLabIdValue && selectedLabIdValue !== "";
      //   }),
      // .test(
      //   "pro",
      //   "Only packages are allowed for selected product type",
      //   () => this.state.validProduct
      // ),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
      heading: Yup.string()
        .trim()
        .required("Please enter the heading")
        .matches(
          /^[a-zA-Z0-9-,\s]*[@#^&()_+\-\[\]{};':"\\|.\/?]*[a-zA-Z0-9]*$/,
          "Special Character are not Allowed."
        ),
      content: Yup.string()
        .trim()
        .required("Please enter the content")
        .matches(
          /^[a-zA-Z0-9-,\s]*[@#^&()_+\-\[\]{};':"\\|.\/?]*[a-zA-Z0-9]*$/,
          "Special Character are not Allowed."
        ),
      add_city: this.state.add_city
        ? ""
        : Yup.array().required("Please Select City"),
      labIdValue: this.state.labIdValue
        ? ""
        : Yup.string().required("Please Provide Lab Name"),
    });

    const validateStopFlagUpdate = Yup.object().shape({
      file: Yup.string()
        .notRequired()
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (file) => {
            if (file) {
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
      heading: Yup.string()
        .required("Please enter the heading")
        .matches(
          /^[a-zA-Z0-9-,\s]*[@#^&()_+\-\[\]{};':"\\|.\/?]*[a-zA-Z0-9]*$/,
          "Special Character are not Allowed."
        ),
      content: Yup.string()
        .required("Please enter the content")
        .matches(
          /^[a-zA-Z0-9-,\s]*[@#^&()_+\-\[\]{};':"\\|.\/?]*[a-zA-Z0-9]*$/,
          "Special Character are not Allowed."
        ),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Services
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.modalShowHandler(e, "")}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Services
                  </button>
                </div>

                <form className="form">
                  <div className="">
                    <select name="status" id="status" className="form-control">
                      <option value="">Select Service Status</option>
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
                      className="form-control"
                      id="search_by_heading"
                      placeholder="Filter by Service Heading"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      id="search_lab_code"
                      placeholder="Filter by Lab Name"
                    />
                  </div>
                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.ServicesSearch(e)}
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
                <BootstrapTable data={this.state.ServicesList} keyField="id">
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={this.setServiceImage(this)}
                  >
                    Icon
                  </TableHeaderColumn>
                  <TableHeaderColumn dataField="lab_name">
                    Lab Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="heading"
                    dataFormat={__htmlDecode(this)}
                  >
                    Heading
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={__htmlDecode(this)}
                  >
                    Content
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>

                {this.state.totalCount > 10 ? (
                  <Row>
                    <Col md={12}>
                      <div className="paginationOuter text-right">
                        <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={10}
                          totalItemsCount={this.state.totalCount}
                          itemClass="nav-item"
                          linkClass="nav-link"
                          activeClass="active"
                          onChange={this.handlePageChange}
                        />
                      </div>
                    </Col>
                  </Row>
                ) : null}

                {/* ======= Add Current Offers Modal ======== */}
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.serviceEditType > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.serviceEditType > 0
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
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {this.state.serviceEditType > 0
                                ? "Edit Service"
                                : "Add Service"}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>City</label>
                                    {this.state.serviceEditType > 0 ? (
                                      <Field
                                        name="cities"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter city"
                                        autoComplete="off"
                                        value={values.cities}
                                        disabled
                                      />
                                    ) : (
                                      <Select
                                        name="cities"
                                        maxMenuHeight={200}
                                        // isMulti
                                        isClearable={true}
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
                                          setFieldValue("heading", "");
                                          setFieldValue("content", "");
                                          setFieldValue("status", "");
                                          // setFieldValue("cities", evt.city_name);
                                        }}
                                      />
                                    )}

                                    {errors.add_city || touched.add_city ? (
                                      <p className="errorMsg">
                                        {errors.add_city}
                                      </p>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Search Lab
                                      <span className="impField">*</span>
                                    </label>
                                    <div className="position-relative">
                                      {this.state.serviceEditType > 0 ? (
                                        <Field
                                          name="labs"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter Lab"
                                          autoComplete="off"
                                          value={values.labs}
                                          disabled
                                        />
                                      ) : (
                                        <>
                                          <Autosuggest
                                            suggestions={this.state.suggestions}
                                            onSuggestionsFetchRequested={(
                                              req
                                            ) => {
                                              this.onSuggestionsFetchRequested(
                                                req
                                              );
                                              setFieldTouched("labId");
                                            }}
                                            onSuggestionsClearRequested={() => {
                                              this.onSuggestionsClearRequested();
                                              this.setState({
                                                selectedValue: "",
                                              });
                                            }}
                                            getSuggestionValue={
                                              this.getSuggestionValue
                                            }
                                            renderSuggestion={
                                              this.renderSuggestion
                                            }
                                            focusInputOnSuggestionClick={false}
                                            inputProps={{
                                              style: {
                                                width: "100%",
                                                // textTransform: "uppercase",
                                                display: "block",
                                                // width: "100%",
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

                                              value: this.state.labIdValue,
                                              onChange:
                                                this.onChangeAutoSuggest,
                                              onKeyDown: this.handleSearchLab,
                                              onBlur: () =>
                                                setFieldTouched("labId"),
                                              disabled:
                                                this.state.add_city == "",
                                            }}
                                            onSuggestionSelected={(
                                              event,
                                              req
                                            ) => {
                                              this.onSuggestionSelected(
                                                event,
                                                req,
                                                setFieldTouched
                                              );
                                              // setTimeout(() => {
                                              //   setFieldTouched("labId", true)
                                              // }, 230);
                                            }}
                                            container="form-control"
                                          />
                                          {this.state.selectedLabIdValue !==
                                          "" ? (
                                            <button
                                              className="crossBtn btn btn-danger pull-right"
                                              onClick={() =>
                                                this.handleAutoSuggestClick()
                                              }
                                            >
                                              X
                                            </button>
                                          ) : null}
                                        </>
                                      )}
                                    </div>

                                    {errors.doctor ? (
                                      <span className="errorMsg">
                                        {errors.doctor}
                                      </span>
                                    ) : errors.labIdValue ||
                                      touched.labIdValue ? (
                                      <span className="errorMsg">
                                        {errors.labIdValue}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Icon
                                      {this.state.serviceEditType > 0 ? null : (
                                        <span className="impField">*</span>
                                      )}
                                      <br />{" "}
                                      <i> {this.state.fileValidationMessage}</i>
                                      <br />{" "}
                                      <i>{this.state.validationMessage}</i>
                                    </label>
                                    <Field
                                      disabled={
                                        (this.state.labs == undefined ||
                                          this.state.labs == "") &&
                                        this.state.serviceEditType == 0
                                      }
                                      name="file"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Select Icon"
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
                                    {errors.file && touched.file ? (
                                      <span className="errorMsg">
                                        {errors.file}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Heading
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      disabled={
                                        (this.state.labs == undefined ||
                                          this.state.labs == "") &&
                                        this.state.serviceEditType == 0
                                      }
                                      name="heading"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Title"
                                      autoComplete="off"
                                      value={values.heading}
                                      onChange={(e) => {
                                        setFieldValue(
                                          "heading",
                                          e.target.value.trim() === ""
                                            ? e.target.value.trim()
                                            : e.target.value
                                        );
                                      }}
                                    />
                                    {errors.heading && touched.heading ? (
                                      <span className="errorMsg">
                                        {errors.heading}
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
                                    <Field
                                      disabled={
                                        (this.state.labs == undefined ||
                                          this.state.labs == "") &&
                                        this.state.serviceEditType == 0
                                      }
                                      name="content"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Content"
                                      autoComplete="off"
                                      value={values.content}
                                      onChange={(e) => {
                                        setFieldValue(
                                          "content",
                                          e.target.value.trim() === ""
                                            ? e.target.value.trim()
                                            : e.target.value
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
                                      Status
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      disabled={
                                        (this.state.labs == undefined ||
                                          this.state.labs == "") &&
                                        this.state.serviceEditType == 0
                                      }
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
                              {this.state.serviceEditType > 0
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
                  <Modal.Header closeButton>Service Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.banner_url}
                          alt="Service Image"
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
export default ServicesPartnerPage;
