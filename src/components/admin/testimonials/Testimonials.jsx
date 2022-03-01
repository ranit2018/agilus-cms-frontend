import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Select from "react-select";

import Layout from "../layout/Layout";
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import SRL from '../../../assets/images/SRL.png'

import exclamationImage from '../../../assets/images/exclamation-icon-black.svg';
import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import { Editor } from '@tinymce/tinymce-react';

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
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell)}
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

const bannerStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const setBannerImage = (refObj) => (cell, row) => {

  return (
    // <LinkWithTooltip
    //   tooltip={"View Image"}
    //   id="tooltip-1"
    //   clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
    // >
    <div style={{
      width: "100px",
      height: "100px",
      overflow: "hidden"
    }}>
      <img src={cell} alt="Testimonials Image" width="100%" onClick={(e) => refObj.imageModalShowHandler(row.testimonial_image)}></img>
    </div>

    // </LinkWithTooltip>
  );
};


const initialValues = {
  image: "",
  name: "",
  location: "",
  feedback: ""
};

class Testimonials extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testimonials: [],
      testimonialDetails: {},
      isLoading: false,
      showModal: false,
      page_name: '',
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" }
      ],
      thumbNailModal: false,
      client_name: "",
      client_location: "",
      status: ""


    };
  }

  componentDidMount() {
    this.getTestimonialsList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getTestimonialsList(pageNumber > 0 ? pageNumber : 1);
  };

  getTestimonialsList = (page = 1) => {
    let client_name = this.state.client_name;
    let client_location = this.state.client_location;
    let status = this.state.status;

    API.get(
      `/api/testimonials?page=${page}&client_name=${encodeURIComponent(client_name)}&client_location=${encodeURIComponent(client_location)}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          testimonials: res.data.data,
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
  }

  // getPageArr = () => {
  //   API.get(`/api/feed/pages`)
  //     .then((res) => {
  //       this.setState({
  //         page_name_arr: res.data.data
  //       });
  //     })
  //     .catch((err) => {
  //       showErrorMessage(err, this.props);
  //     });
  // }

  testimonialSearch = (e) => {
    e.preventDefault();

    const client_name = document.getElementById("client_name").value;
    const client_location = document.getElementById("client_location").value;
    const status = document.getElementById("status").value;

    if (client_name === "" && client_location === "" && status === "") {
      return false;
    }

    API.get(`/api/testimonials?page=1&client_name=${encodeURIComponent(client_name)}&client_location=${encodeURIComponent(client_location)}&status=${encodeURIComponent(status)}`)
      .then((res) => {
        this.setState({
          testimonials: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          client_name: client_name,
          client_location: client_location,
          activePage: 1,
          status: status,
          remove_search: true
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false
        });
        showErrorMessage(err, this.props);
      });
  };

  clearSearch = () => {

    document.getElementById("client_name").value = "";
    document.getElementById("client_location").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        client_name: "",
        client_location: "",
        status: "",
        remove_search: true,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getTestimonialsList();

      }
    );
  };

  getIndividualTestimonials(id) {
    API.get(`/api/testimonials/${id}`)
      .then((res) => {
        this.setState({
          testimonialDetails: res.data.data[0]
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({ banner_id: 0 });
    this.setState({ showModal: false });
    this.setState({ testimonial_id: 0, testimonialDetails: {}, image: "", validationMessage: "" })
  };

  modalShowHandler = (event, id) => {
    this.setState({
      validationMessage: generateResolutionText('testimonial-images'),
      fileValidationMessage: FILE_VALIDATION_MASSAGE
    })
    if (id) {
      event.preventDefault();
      this.setState({ testimonial_id: id });
      this.getIndividualTestimonials(id);
      this.setState({ showModal: true });
    } else {
      this.setState({ showModal: true, testimonial_id: 0, testimonialDetails: {}, image: "" });
    }
  };



  handleSubmitEvent = (values, actions) => {
    let url = '';
    let method = '';
    const post_data = {
      name: values.name,
      location: values.location,
      feedback: values.feedback,
      status: values.status
    }
    if (this.state.testimonial_id > 0) {
      url = `/api/testimonials/${this.state.testimonial_id}`;
      method = 'PUT';
    } else {
      url = `/api/testimonials`;
      method = 'POST';
    }
    API({
      url: url,
      method: method,
      data: post_data
    }).then(res => {
        this.setState({ showModal: false, image: "" })
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: method === 'PUT' ? "Updated Successfully" : "Added Successfully" ,
          icon: "success"
        }).then(() => {
          this.getTestimonialsList();
        });
      })
      .catch(err => {
        this.setState({ closeModal: true, showModalLoader: false });
        if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });

    // var formData = new FormData();
    // formData.append("name", values.name);
    // formData.append("location", values.location);
    // formData.append("feedback", values.feedback);
    // formData.append("status", values.status);
    // if (this.state.image) {
    //   if (this.state.image.size > FILE_SIZE) {
    //     actions.setErrors({ image: "The file exceeds maximum size." });
    //     actions.setSubmitting(false);
    //   } else {
    //     getHeightWidth(this.state.image).then(dimension => {
    //       const { height, width } = dimension;
    //       const testimonialsDimension = getResolution("testimonial-images");
    //       console.log("height", height);
    //       console.log("width", width);
    //       console.log("fff ", testimonialsDimension.height,  testimonialsDimension.width);
    //       if (height != testimonialsDimension.height || width != testimonialsDimension.width) {
    //         actions.setErrors({ image: "The file exceeds maximum height and width validation." });
    //         actions.setSubmitting(false);
    //       } else {
    //         formData.append("image", this.state.image);
    //         if (this.state.testimonial_id > 0) {

    //           API.put(`/api/testimonials/${this.state.testimonial_id}`, formData)
    //             .then(res => {
    //               this.setState({ showModal: false, image: "" })
    //               swal({
    //                 closeOnClickOutside: false,
    //                 title: "Success",
    //                 text: "Updated Successfully",
    //                 icon: "success"
    //               }).then(() => {
    //                 this.getTestimonialsList(this.state.activePage);
    //               });
    //             })
    //             .catch(err => {
    //               this.setState({ closeModal: true, showModalLoader: false });
    //               if (err.data.status === 3) {
    //                 showErrorMessage(err, this.props);
    //               } else {
    //                 actions.setErrors(err.data.errors);
    //                 actions.setSubmitting(false);
    //               }
    //             });

    //         } else {
    //           API.post(`/api/testimonials`, formData)
    //             .then(res => {
    //               this.setState({ showModal: false, image: "" })
    //               swal({
    //                 closeOnClickOutside: false,
    //                 title: "Success",
    //                 text: "Added Successfully",
    //                 icon: "success"
    //               }).then(() => {
    //                 this.getTestimonialsList(this.state.activePage);
    //               });
    //             })
    //             .catch(err => {
    //               this.setState({ closeModal: true, showModalLoader: false });
    //               if (err.data.status === 3) {
    //                 showErrorMessage(err, this.props);
    //               } else {
    //                 actions.setErrors(err.data.errors)
    //               }
    //             });
    //         }
    //       }
    //     })
    //   }
    // } else {

    //   if (this.state.testimonial_id > 0) {

    //     API.put(`/api/testimonials/${this.state.testimonial_id}`, formData)
    //       .then(res => {
    //         this.setState({ showModal: false, image: "" })
    //         swal({
    //           closeOnClickOutside: false,
    //           title: "Success",
    //           text: "Updated Successfully",
    //           icon: "success"
    //         }).then(() => {
    //           this.getTestimonialsList();
    //         });
    //       })
    //       .catch(err => {
    //         this.setState({ closeModal: true, showModalLoader: false });
    //         if (err.data.status === 3) {
    //           showErrorMessage(err, this.props);
    //         } else {
    //           actions.setErrors(err.data.errors);
    //           actions.setSubmitting(false);
    //         }
    //       });

    //   } else {
    //     API.post(`/api/testimonials`, formData)
    //       .then(res => {
    //         this.setState({ showModal: false, image: "" })
    //         swal({
    //           closeOnClickOutside: false,
    //           title: "Success",
    //           text: "Added Successfully",
    //           icon: "success"
    //         }).then(() => {
    //           this.getTestimonialsList(this.state.activePage);
    //         });
    //       })
    //       .catch(err => {
    //         this.setState({ closeModal: true, showModalLoader: false });
    //         if (err.data.status === 3) {
    //           showErrorMessage(err, this.props);
    //         } else {
    //           actions.setErrors(err.data.errors)
    //         }
    //       });
    //   }
    // }



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
        this.deleteTestimonials(id);
      }
    });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/testimonials/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getTestimonialsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  }

  deleteTestimonials = (id) => {
    API.delete(`/api/testimonials/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getTestimonialsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };







  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("image");
    setFieldValue("image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        image: "",
        isValidFile: true,
      });
      return;
    }
    if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
      //Supported
      this.setState({
        image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({ image: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
      this.setState({
        image: "",
        isValidFile: false,
      });
    }
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  }
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  }

  render() {
    const { testimonialDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      image: "",
      name: testimonialDetails.name ? htmlDecode(testimonialDetails.name) : '',
      location: testimonialDetails.location ? htmlDecode(testimonialDetails.location) : '',
      feedback: testimonialDetails.feedback ? htmlDecode(testimonialDetails.feedback) : '',
      status: testimonialDetails.status || +testimonialDetails.status === 0
        ? testimonialDetails.status.toString()
        : ""
    });

    let validateStopFlag = {};

    if (this.state.testimonial_id > 0) {

      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter the name"),
        location: Yup.string().required('Please enter the location'),
        feedback: Yup.string().required('Enter some feedback').matches(/^[a-zA-Z0-9@()_,.+-?: -'"]*$/, 'Special characters are not allowed'),
        // image: Yup.string().notRequired().test(
        //   "image",
        //   "Only files with the following extensions are allowed: png jpg jpeg",
        //   (image) => {
        //     if (image) {
        //       return this.state.isValidFile
        //     } else {
        //       return true
        //     }
        //   }
        // ),
        status: Yup.string().trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected")
      });

    } else {
      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter the name"),
        location: Yup.string().required('Please enter the location'),
        feedback: Yup.string().required('Enter some feedback').matches(/^[a-zA-Z0-9@()_,.+-?: -'"]*$/, 'Special characters are not allowed'),
        // image: Yup.string().required('Please select the image').test(
        //   "image",
        //   "Only files with the following extensions are allowed: png jpg jpeg",
        //   () => this.state.isValidFile
        // ),
        status: Yup.string().trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected")
      });
    }

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Testimonial
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
                    <i className="fas fa-plus m-r-5" /> Add Testimonial
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="client_name"
                      id="client_name"
                      placeholder="Filter by Client Name"
                    />
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      name="client_location"
                      id="client_location"
                      placeholder="Filter by Client Location"
                    />
                  </div>

                  <div className="">
                    <select
                      name="status"
                      id="status"
                      className="form-control"
                    >
                      <option value="">Select Testimonial Status</option>
                      {this.state.selectStatus.map((val) => {
                        return (
                          <option key={val.value} value={val.value}>{val.label}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.testimonialSearch(e)}
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

                <BootstrapTable data={this.state.testimonials}>
                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Client Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="location"
                    dataFormat={__htmlDecode(this)}
                  >
                    Client Location
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="feedback"
                    dataFormat={__htmlDecode(this)}
                  >
                    Feedback
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="testimonial_image"
                    dataFormat={setBannerImage(this)}
                  >
                    Image
                  </TableHeaderColumn> */}

                  <TableHeaderColumn
                    dataField="date_added"
                    dataFormat={setDate(this)}
                  >
                    Post Date
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={bannerStatus(this)}
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

                {/* ======= Add Banner Modal ======== */}
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
                      setFieldValue,
                      setFieldTouched,
                      handleChange,
                      setErrors
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
                              {this.state.testimonial_id > 0 ? 'Edit Testimonials' : 'Add Testimonials'}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Client Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter name"
                                      autoComplete="off"
                                      value={values.name}
                                    />
                                    {errors.name && touched.name ? (
                                      <span className="errorMsg">
                                        {errors.name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Client Location
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="location"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Location"
                                      autoComplete="off"
                                      value={values.location}
                                    />
                                    {errors.location && touched.location ? (
                                      <span className="errorMsg">
                                        {errors.location}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Feedback
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="feedback"
                                      as="textarea"
                                      className={`form-control`}
                                      placeholder="Enter Feedback"
                                      autoComplete="off"
                                      value={values.feedback}
                                    />
                                    {errors.feedback && touched.feedback ? (
                                      <span className="errorMsg">
                                        {errors.feedback}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              {/* <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {
                                        this.state.testimonial_id == 0 ?
                                          <span className="impField">*</span>
                                          : null
                                      }
                                      <br /> <i> {this.state.fileValidationMessage}
                                      </i>
                                      <br /> <i>{this.state.validationMessage}

                                      </i>

                                    </label>
                                    <Field
                                      name="image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Banner File"
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
                                    {errors.image && touched.image ? (
                                      <span className="errorMsg">{errors.image}</span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row> */}
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
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <button
                              className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                } m-r-10`}
                              type="submit"
                              disabled={isValid ? (isSubmitting ? true : false) : true}
                            >
                              {this.state.testimonial_id > 0
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
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop='static'
                >
                  <Modal.Header closeButton>Testimonials Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <img src={this.state.url} alt="Testimonials Image" width="500" height="300"></img>
                    </center>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </section>
        </div>
      </Layout >
    );
  }
}
export default Testimonials;
