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
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../shared/helper";
import Autosuggest from "react-autosuggest";
const initialValues = {
  status:"",
  offer_image:"",
  labId:"",
  heading:"",
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
class CenterImagePartnerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      CurrentOffersList: [],
      offerDetail: {},
      offerEditType: 0,
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
      suggestions:[],
      labIdValue:"",
      selectedLabIdValue:"",
    };
  }

  getCurrentOffersList = (page = 1) => {
    API.get(
      `/api/center/offers?page=${page}`
    )
      .then((res) => {
        this.setState({
          CurrentOffersList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          offerEditType: 0,
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
        this.deleteCurrentOffer(id);
      }
    });
  };

  deleteCurrentOffer = (id) => {
    API.post(`api/center/offers/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getCurrentOffersList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getCurrentOffersDetails(id) {
    API.get(`/api/center/offers/${id}`)
      .then((res) => {
        this.setState({
          showModal: true,
          offerDetail: res.data.data[0],
          offerEditType: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  changeStatus = (cell, status) => {
    API.put(`/api/center/offers/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getCurrentOffersList(this.state.activePage);
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
    // formData.append("title", values.title);
    // formData.append("content", values.content);
    formData.append("status", values.status);
    let url = `api/center/offers/`;
    let method = "POST";

    if (this.state.file.size > FILE_SIZE) {
      actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.file).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("center-current-offers");
        if (height != offerDimension.height || width != offerDimension.width) {
          //    actions.setErrors({ file: "The file is not of desired height and width" });
          actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
          actions.setSubmitting(false);
        } else {
          formData.append("center_offers", this.state.file);
          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, file: "",suggestions:[] });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.getCurrentOffersList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                file: "",
                suggestions:[]
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
  };

  handleSubmitEventUpdate = (values, actions) => {
    let formData = new FormData();
    formData.append("status", values.status);
    let url = `/api/center/offers/${this.state.offerEditType}`;
    let method = "PUT";

    if (this.state.file) {
      if (this.state.file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("center-current-offers");
          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
            actions.setSubmitting(false);
          } else {
            formData.append("center_offers", this.state.file);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false,suggestions:[] });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Updated Successfully",
                  icon: "success",
                }).then(() => {
                  this.getCurrentOffersList();
                });
              })
              .catch((err) => {
                this.setState({ closeModal: true, showModalLoader: false,suggestions:[] });
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
          this.setState({ showModal: false,suggestions:[] });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Updated Successfully",
            icon: "success",
          }).then(() => {
            this.getCurrentOffersList();
          });
        })
        .catch((err) => {
          this.setState({ closeModal: true, showModalLoader: false,suggestions:[] });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };
  componentDidMount() {
    this.getCurrentOffersList();
    this.setState({
      validationMessage: generateResolutionText("center-current-offers"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  modalCloseHandler = () => {
    this.setState({ offerDetail: {}, offerEditType: 0, showModal: false,suggestion:[] });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    if (id) {
      this.getCurrentOffersDetails(id);
    } else {
      this.setState({ offerDetail: {}, offerEditType: 0, showModal: true,suggestion:[] });
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
    this.getCurrentOffersList(pageNumber > 0 ? pageNumber : 1);
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

  setCurrentOfferImage = (refObj) => (cell, row) => {
    if (row.offer_image !== null) {
      return (
        <img
          src={row.offer_image}
          alt="Current Offers Image"
          height="100"
          onClick={(e) => refObj.imageModalShowHandler(row.offer_image)}
        ></img>
      );
    } else {
      return null;
    }
  };

  CurrentOffersSearch = (e) => {
    e.preventDefault();

    const search_by_status = document.getElementById("status").value;
    const search_lab_code = document.getElementById(
      "search_lab_code"
    ).value;

    if (search_by_status === "" && search_lab_code === "") {
      return false;
    }
    API.get(
      `/api/center/offers?page=1&status=${search_by_status}&lab_id=${encodeURIComponent(search_lab_code)}`
    )
      .then((res) => {
        this.setState({
          CurrentOffersList: res.data.data,
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
    this.setState(
      {
        search_by_status: "",
        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getCurrentOffersList();
      }
    );
  };

  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length >= 3) {
      let payload = {
        //  city_id:location.value,
        search_name: value.toUpperCase(),
      };

      API.post(`/feed/code-search-autocomplete`, payload)
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

  getSuggestionValue = (suggestion) => suggestion.label;

  renderSuggestion = (suggestion) => <span>{suggestion.label}</span>;

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
      let payload = {
        search_name: suggestion.value.toUpperCase(),
      };
      API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];
            this.setState({ selectedLabIdValue: searchDetails }, () => {
              setFieldTouched("labId");
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ selectedLabIdValue: "" }, () => {
            setFieldTouched("labId");
          });
        });
    }
  };

  render() {
    const { offerDetail,selectedLabIdValue } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      status:
        offerDetail.status || +offerDetail.status === 0
          ? offerDetail.status.toString()
          : "",
    });

    const validateStopFlag = Yup.object().shape({
      file: Yup.string()
        .required("Please select the Image")
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      labId: Yup.string()
        .test("labId", "Please select a Lab Id", () => {
          return selectedLabIdValue && selectedLabIdValue !== "";
        }),
        // .test(
        //   "pro",
        //   "Only packages are allowed for selected product type",
        //   () => this.state.validProduct
        // ),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
      title: Yup.string().required("Please enter the title"),
    });

    // const validateStopFlagUpdate = Yup.object().shape({
    //   file: Yup.string()
    //     .notRequired()
    //     .test(
    //       "image",
    //       "Only files with the following extensions are allowed: png jpg jpeg",
    //       (file) => {
    //         if (file) {
    //           return this.state.isValidFile;
    //         } else {
    //           return true;
    //         }
    //       }
    //     ),
    //   status: Yup.string()
    //     .trim()
    //     .required("Please select status")
    //     .matches(/^[0|1]$/, "Invalid status selected"),
    // });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Center Images
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
                    <i className="fas fa-plus m-r-5" /> Add Center Image
                  </button>
                </div>

                <form className="form">
                  <div className="">
                        <select
                            name="status"
                            id="status"
                            className="form-control"
                        >
                            <option value="">Select Offer Status</option>
                            {this.state.selectStatus.map((val) => {
                                return (
                                    <option key={val.value} value={val.value}>{val.label}</option>
                                );
                            })}
                        </select>
                  </div>
                  <input
                      className="form-control"
                      id="search_lab_code"
                      placeholder="Filter by Lab Id"
                    />

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.CurrentOffersSearch(e)}
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
                <BootstrapTable data={this.state.CurrentOffersList} keyField="id">
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={this.setCurrentOfferImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="labId"
                  >
                    Lab Id
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
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
                    validationSchema={validateStopFlag}
                    onSubmit={
                      this.state.offerEditType > 0
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
                              {this.state.offerEditType > 0
                                ? "Edit Center Images"
                                : "Add Center Images"}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              {/* <Row>
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
                                    </label>
                                    <Field
                                      name="content"
                                      as="textarea"
                                      className={`form-control`}
                                      placeholder="Enter Content"
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
                              </Row> */}

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
                                      setFieldTouched("labId");
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

                                      value: this.state.labIdValue,
                                      onChange: this.onChangeAutoSuggest,
                                      onKeyDown: this.handleSearchLab,
                                      onBlur: () => setFieldTouched("labId"),
                                      disabled: this.state.selectedLabIdValue != "",
                                    }}
                                    onSuggestionSelected={(event, req) => {
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
                                  {this.state.selectedLabIdValue !== "" ? (
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
                                {errors.labId && touched.labId ? (
                                  <span className="errorMsg">
                                    {errors.labId}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {this.state.offerEditType > 0 ? null : (
                                        <span className="impField">*</span>
                                      )}
                                      <br />{" "}
                                      <i> {this.state.fileValidationMessage}</i>
                                      <br />{" "}
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
                              {this.state.offerEditType > 0
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
                  <Modal.Header closeButton>
                    Current Offers Image
                  </Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.banner_url}
                          alt="Banner Image"
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
export default CenterImagePartnerPage;
