import React, { Component } from 'react';
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import Pagination from "react-js-pagination";
import swal from "sweetalert";
import * as Yup from "yup";
import { Formik, Field, Form } from "formik";
import Layout from "../layout/Layout";
const initialValues = {
  banner_name: "",
  status: "",
};

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={["hover", "hover"]}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}

const actionFormatter = (refObj) => (cell) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="Click to Edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
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

const custStatus = () => (cell) => {
  return cell === 1 ? "Active" : "Inactive";
};

const setBannerType = () => (cell) => {
  if (cell === 1) {
    return "Home";
  } else if (cell === 2) {
    return "About Us";
  } 
};
export default class Banner  extends Component {
  render() {
     if (this.state.isLoading === true) {
      return (
        <>
          <div className="loderOuter">
            <div className="loading_reddy_outer">
              <div className="loading_reddy">
              </div>
            </div>
          </div>
        </>
      );
      }
      else {
        
      }
  }
}

import React, { Component } from "react";
//import { Grid } from 'react-bootstrap';
import API from "../../../shared/admin-axios";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

import { connect } from "react-redux";
//import { updateBannerImage } from "../../../store/actions/banner";
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";

import Axios from "axios";

import { Link, Redirect } from "react-router-dom";
import { showErrorMessage } from "../../../shared/handle_error";
import {getUser, htmlDecode } from "../../../shared/helper";
/import whitelogo from "../../../assets/images/themis_loader.png";



const setBannerImage = (refObj) => (cell, row) => {
  return (
    <LinkWithTooltip
      // tooltip={`${url}${row.banner_image}`}
      tooltip={"View Image"}
      id="tooltip-1"
      clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
    >
      <img src={row.banner_image} alt="Banner Image" width="60" height="60"></img>
    </LinkWithTooltip>
  );
};

const setBannerUrl = (refObj) => (cell, row) => {
  return (
    <LinkWithTooltip
      tooltip={"Goto URL"}
      id="tooltip-1"
      clicked={(e) => window.open(`${row.banner_url}`, "_blank")}
    >
      {row.banner_url}
    </LinkWithTooltip>
  );
};

class Banner extends Component {
  state = {
    isLoading: true,
    itemPerPage: 10,
    get_access_data: false,
    activePage: 1,
    banner: [],
    banner_image: "",
    isValidImage: true,
    showImageModal: false,
    modal_banner_image: "",
    bannerId: 0,
    bannerDetails: [],
    selectStatus: [
      { id: "0", name: "Inactive" },
      { id: "1", name: "Active" },
    ],
    selectType: [
      { id: "1", name: "Home" },
      { id: "2", name: "About Us" }
    ],
    showModalLoader: false,
    new_banner_image: "",
  };

  componentDidMount() {
    // const userType = getUserType(localStorage.admin_token);
    // if (userType == 1) {
    //   this.setState({
    //     get_access_data: true,
    //   });
    //   this.getBannerList();
    // } else {
    //   this.props.history.push("/admin/dashboard");
    // }
  }

  getBannerList(page = 1) {
    API.get(`/feed/banner_list?page=${page}`)
      .then((res) => {
        this.setState({
          banner: res.data.data,
          count: res.data.count_banner,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }
  handleSubmitEvent = (values, actions) => {
    // const post_data = {
    //   banner_name: values.banner_name,
    //   banner_url: values.banner_url,
    //   status: values.status,
    // };

    //Keep the form data sequence same as feedValidate schema.
    var formData = new FormData();
    formData.append("banner_name", values.banner_name);
    formData.append("banner_url", values.banner_url);
    formData.append("status", values.status);
    formData.append("banner_type", values.banner_type);
    if (this.state.banner_image) formData.append("banner_image", this.state.banner_image);

    if (this.state.bannerId > 0) {
      this.setState({ showModalLoader: true });
      const id = this.state.bannerId;
      API.put(`/feed/update_banner/${id}`, formData)
        .then((res) => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ showModalLoader: false });
            this.getBannerList(this.state.activePage);
          });
        })
        .catch((err) => {
          this.setState({ showModalLoader: false });
          if (err.response.data.status === 3) {
            this.setState({
              showModal: false,
            });
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.response.data.errors);
            actions.setSubmitting(false);
          }
        });
    } else {
      API.post(`/feed/add_banner`, formData)
        .then((res) => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record added successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ showModalLoader: false });
            this.setState({ activePage: 1 });
            this.getBannerList(this.state.activePage);
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

    //Reset banner image state on submit
    this.setState({ banner_image: "" });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getBannerList(pageNumber > 0 ? pageNumber : 1);
  };

  modalShowHandler = (event, id) => {
    this.setState({ banner_image: "" }); //reset image state when editing banner
    if (id) {
      event.preventDefault();
      API.get(`/feed/banner_details/${id}`)
        .then((res) => {
          this.setState({
            bannerDetails: res.data.data,
            bannerId: id,
            showModal: true,
          });
        })
        .catch((err) => {
          showErrorMessage(err, this.props);
        });
    } else {
      this.setState({
        banner_image: "",
        bannerDetails: [],
        bannerId: 0,
        showModal: true,
      });
    }
  };

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      bannerId: 0,
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
        this.deleteDosage(id);
      }
    });
  };

  deleteDosage = (id) => {
    if (id) {
      API.delete(`/feed/delete_banner/${id}`)
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record deleted successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ activePage: 1 });
            this.getBannerList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
    }
  };

  imageModalShowHandler = (url) => {
    this.setState({
      modal_banner_image: url,
      showImageModal: true,
    });
  };

  imageModalCloseHandler = () => {
    this.setState({
      modal_banner_image: "",
      showImageModal: false,
    });
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("banner_image");
    setFieldValue("banner_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/gif", "image/png"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        banner_image: "",
        isValidImage: true,
      });
      return;
    }
    if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
      //Supported
      this.setState({
        banner_image: event.target.files[0],
        isValidImage: true,
      });
    } else {
      //Unsupported
      setErrors({ banner_name: "Unsupported Format" }); //Not working- So Added validation in "yup"
      this.setState({
        banner_image: "",
        isValidImage: false,
      });
    }
  };

  render() {
    const { bannerDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      banner_name: bannerDetails.banner_name ? htmlDecode(bannerDetails.banner_name) : "",
      banner_url: bannerDetails.banner_url ? htmlDecode(bannerDetails.banner_url) : "",
      status:
        bannerDetails.status || +bannerDetails.status === 0
          ? bannerDetails.status.toString()
          : "",
      banner_type:
        bannerDetails.banner_type || +bannerDetails.banner_type === 0
          ? bannerDetails.banner_type.toString()
          : "",
      banner_image: "",
    });

    let validateStopFlag = null;
    if (this.state.bannerId > 0) {
      //For update
      validateStopFlag = Yup.object().shape({
        banner_name: Yup.string()
          .min(2, "Banner name must be at least 2 characters")
          .max(200, "Banner name must be at most 200 characters")
          .required("Please enter banner name"),
        banner_image: Yup.mixed()
          .notRequired()
          .test(
            "bannerimage",
            "Only files with the following extensions are allowed: png jpg gif jpeg",
            () => this.state.isValidImage
          ),
        banner_url: Yup.string().url("Please enter valid url").required("Please enter url"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        banner_type: Yup.string()
          .trim()
          .required("Please select type")
          .matches(/^[1|2|3]$/, "Invalid type selected"),
      });
    } else {
      // For add
      validateStopFlag = Yup.object().shape({
        banner_name: Yup.string()
          .min(2, "Banner name must be at least 2 characters")
          .max(200, "Banner name must be at most 200 characters")
          .required("Please enter banner name"),
        banner_image: Yup.mixed()
          .required("Please choose a file")
          .test(
            "bannerimage",
            "Only files with the following extensions are allowed: png jpg gif jpeg",
            () => this.state.isValidImage
          ),
        banner_url: Yup.string().url("Please enter valid url").required("Please enter url"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        banner_type: Yup.string()
          .trim()
          .required("Please select type")
          .matches(/^[1|2|3]$/, "Invalid type selected"),
      });
    }

    if (this.state.isLoading === true) {
      return (
        <>
          <div className="loderOuter">
            <div className="loading_reddy_outer">
              <div className="loading_reddy">
                <img src={whitelogo} alt="logo" />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <Layout {...this.props}>
          <div className="content-wrapper">
            <section className="content-header">
              <div className="row">
                <div className="col-lg-9 col-sm-6 col-xs-12">
                  <h1>
                    Banners
                    <small />
                  </h1>
                </div>
                <div className="col-lg-12 col-sm-12 col-xs-12 topSearchSection">
                  <div className="">
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={(e) => this.modalShowHandler(e, "")}
                    >
                      <i className="fas fa-plus m-r-5" /> Add Banner
                    </button>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
            </section>
            <section className="content">
              <div className="box">
                <div className="box-body">
                  <BootstrapTable data={this.state.banner}>
                    <TableHeaderColumn
                      isKey
                      dataField="banner_name"
                      dataFormat={__htmlDecode(this)}
                    >
                      Title
                    </TableHeaderColumn>

                    <TableHeaderColumn
                      dataField="banner_type"
                      dataFormat={setBannerType(this)}
                    >
                      Type
                    </TableHeaderColumn>

                    <TableHeaderColumn
                      dataField="banner_url"
                      dataFormat={setBannerUrl(this)}
                    >
                      URL
                    </TableHeaderColumn>

                    <TableHeaderColumn
                      dataField="banner_image"
                      dataFormat={setBannerImage(this)}
                    >
                      Image
                    </TableHeaderColumn>

                    <TableHeaderColumn dataField="status" dataFormat={custStatus(this)}>
                      Status
                    </TableHeaderColumn>

                    <TableHeaderColumn
                      dataField="banner_id"
                      dataFormat={actionFormatter(this)}
                    >
                      Action
                    </TableHeaderColumn>
                  </BootstrapTable>

                  {this.state.count > this.state.itemPerPage ? (
                    <Row>
                      <Col md={12}>
                        <div className="paginationOuter text-right">
                          <Pagination
                            activePage={this.state.activePage}
                            itemsCountPerPage={this.state.itemPerPage}
                            totalItemsCount={this.state.count}
                            itemClass="nav-item"
                            linkClass="nav-link"
                            activeClass="active"
                            onChange={this.handlePageChange}
                          />
                        </div>
                      </Col>
                    </Row>
                  ) : null}
                  <Modal
                    show={this.state.showModal}
                    onHide={() => this.modalCloseHandler()}
                    backdrop="static"
                  >
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
                        setErrors,
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
                            <Modal.Header closeButton>
                              <Modal.Title>
                                {this.state.bannerId > 0 ? "Edit" : "Add"} Banner
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <div className="contBox">
                                <Row>
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        Banner Title
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="banner_name"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter Banner name"
                                        autoComplete="off"
                                        value={values.banner_name}
                                      />
                                      {errors.banner_name && touched.banner_name ? (
                                        <span className="errorMsg">
                                          {errors.banner_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        Banner Type
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="banner_type"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.banner_type}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.selectType.map((banner_type, i) => (
                                          <option key={i} value={banner_type.id}>
                                            {banner_type.name}
                                          </option>
                                        ))}
                                      </Field>
                                      {errors.banner_type && touched.banner_type ? (
                                        <span className="errorMsg">
                                          {errors.banner_type}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        Banner Image
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="banner_image"
                                        type="file"
                                        className={`form-control`}
                                        placeholder="Banner Image"
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
                                      {errors.banner_image && touched.banner_image ? (
                                        <span className="errorMsg">
                                          {errors.banner_image}
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
                                          Select Status
                                        </option>
                                        {this.state.selectStatus.map((status, i) => (
                                          <option key={i} value={status.id}>
                                            {status.name}
                                          </option>
                                        ))}
                                      </Field>
                                      {errors.status && touched.status ? (
                                        <span className="errorMsg">{errors.status}</span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>

                                {errors.message ? (
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <span className="errorMsg">{errors.message}</span>
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
                                } mr-2`}
                                type="submit"
                                disabled={isValid ? false : false}
                              >
                                {this.state.regionflagId > 0
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
                      
                      {/* Banner Image Modal */}
                  <Modal
                    show={this.state.showImageModal}
                    onHide={() => this.imageModalCloseHandler()}
                    backdrop="static"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Banner Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div style={{ textAlign: "center" }}>
                        <Row>
                          <Col>
                            <img
                              src={this.state.modal_banner_image}
                              alt="Banner Image"
                              width="300"
                              height="300"
                            ></img>
                          </Col>
                        </Row>
                      </div>
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
}

// const mapStateToProps = (state) => {
//   return {
//     //token: state.auth.token,
//     banner_image: state.banner_image,
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   // return {
//   //   updateBannerImage: (data, onSuccess, setErrors) =>
//   //     dispatch(updateBannerImage(data, onSuccess, setErrors)),
//   // };
// };

export default Banner;

