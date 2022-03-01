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
        tooltip="Click to preview"
        href="#"
        clicked={(e) => refObj.previewModalShowHandler(e, row)}
        id="tooltip-1"
      >
        <i className="fas fa-eye" />
      </LinkWithTooltip>
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
      <img src={cell} alt="Testimonials Image" width="100%" onClick={(e) => refObj.imageModalShowHandler(cell)}></img>
    </div>

    // </LinkWithTooltip>
  );
};


const initialValues = {
  featured_image: "",
  title: "",
  content: "",
  status: ""
};

class Testimonials extends Component {
  constructor(props) {
    super(props);
    this.state = {
      helpTour: [],
      helpTourId: 0,
      helpTourDetails: {},
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
      previewModal: false,
      previewDetails: ""
    };
  }

  componentDidMount() {
    this.gethelpTourList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.gethelpTourList(pageNumber > 0 ? pageNumber : 1);
  };

  gethelpTourList = (page = 1) => {
    API.get(
      `/api/app/help_tour?page=${page}`
    )
      .then((res) => {
        this.setState({
          helpTourList: res.data.data,
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






  getHelpTourDetails(id) {
    API.get(`/api/app/help_tour/${id}`)
      .then((res) => {
        this.setState({
          helpTourDetails: res.data.data[0],
          helpTourId: id,
          showModal: true
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({ showModal: false });
    this.setState({ helpTourId: 0, helpTourDetails: {}, featured_image: "", validationMessage: "" })
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    this.setState({
      // validationMessage: generateResolutionText('know-who-are'),
      fileValidationMessage: FILE_VALIDATION_MASSAGE
    })
    console.log(id);
    if (id) {
      this.getHelpTourDetails(id);
    } else {
      this.setState({ showModal: true, helpTourId: 0, helpTourDetails: {}, featured_image: "" });
    }
  };



  handleSubmitEvent = (values, actions) => {
    var formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("status", values.status);
    if (this.state.featured_image) {
      if (this.state.featured_image.size > FILE_SIZE) {
        actions.setErrors({ featured_image: "The file exceeds maximum size." });
        actions.setSubmitting(false);
      } else {
        formData.append('featured_image', this.state.featured_image)
        if (this.state.helpTourId > 0) {
          API.put(`/api/app/help_tour/${this.state.helpTourId}`, formData)
            .then(res => {
              this.modalCloseHandler();
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Updated Successfully",
                icon: "success"
              }).then(() => {
                this.gethelpTourList(this.state.activePage);
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

        } else {
          API.post(`/api/app/help_tour/`, formData)
            .then(res => {
              this.modalCloseHandler();
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success"
              }).then(() => {
                this.gethelpTourList(this.state.activePage);
              });
            })
            .catch(err => {
              this.setState({ closeModal: true, showModalLoader: false });
              if (err.data.status === 3) {
                showErrorMessage(err, this.props);
              } else {
                actions.setErrors(err.data.errors)
              }
            });
        }
      }
    }
    if (this.state.helpTourId > 0) {
      API.put(`/api/app/help_tour/${this.state.helpTourId}`, formData)
        .then(res => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Updated Successfully",
            icon: "success"
          }).then(() => {
            this.gethelpTourList(this.state.activePage);
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
    }
  }

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
        this.deleteHelpTour(id);
      }
    });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/app/help_tour/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.gethelpTourList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  }

  deleteHelpTour = (id) => {
    API.delete(`/api/app/help_tour/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.gethelpTourList(this.state.activePage);
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
    setFieldTouched("featured_image");
    setFieldValue("featured_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        featured_image: "",
        isValidFile: true,
      });
      return;
    }
    if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
      //Supported
      this.setState({
        featured_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({ featured_image: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
      this.setState({
        featured_image: "",
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
  previewModalShowHandler = (e, details) => {
    console.log(details);
    e.preventDefault();
    this.setState({
      previewModal: true, previewDetails: {
        image: details.help_tour_image,
        title: details.title,
        content: details.content
      }
    });
  }
  previewModalCloseHandler = (e) => {
    this.setState({ previewModal: false, previewDetails: "" });
  }


  render() {
    const { helpTourDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      featured_image: "",
      title: helpTourDetails.title ? htmlDecode(helpTourDetails.title) : '',
      content: helpTourDetails.content ? htmlDecode(helpTourDetails.content) : '',
      status: helpTourDetails.status || +helpTourDetails.status === 0
        ? helpTourDetails.status.toString()
        : ""
    });

    let validateStopFlag = {};

    if (this.state.helpTourId > 0) {

      validateStopFlag = Yup.object().shape({
        title: Yup.string().required("Please enter the title"),
        content: Yup.string().required('Enter some content').matches(/^[a-zA-Z0-9@()_,.+-?: -'"]*$/, 'Special characters are not allowed'),
        featured_image: Yup.string().notRequired().test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (image) => {
            if (image) {
              return this.state.isValidFile
            } else {
              return true
            }
          }
        ),
        status: Yup.string().trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected")
      });

    } else {
      validateStopFlag = Yup.object().shape({
        title: Yup.string().required("Please enter the title"),
        content: Yup.string().required('Enter some content').matches(/^[a-zA-Z0-9@()_,.+-?: -'"]*$/, 'Special characters are not allowed'),
        featured_image: Yup.string().required('Please select the image').test(
          "featured_image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
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
                  Manage Help Tour
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
                    <i className="fas fa-plus m-r-5" /> Add Help Tour
                    </button>
                </div>
                {/* <form className="form">
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
                          <option value={val.value}>{val.label}</option>
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
                </form> */}
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">

                <BootstrapTable data={this.state.helpTourList}>
                  <TableHeaderColumn
                    isKey
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
                    </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={__htmlDecode(this)}
                  >
                    Content
                    </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="help_tour_image"
                    dataFormat={setBannerImage(this)}
                  >
                    Image
                    </TableHeaderColumn>

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
                              {this.state.helpTourId > 0 ? 'Edit Help Tour' : 'Add Help Tour'}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
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
                                      placeholder="Enter title"
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
                                        <span className="impField">*</span>
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
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {
                                        this.state.helpTourId == 0 ?
                                          <span className="impField">*</span>
                                          : null
                                      }
                                      <br /> <i> {this.state.fileValidationMessage}
                                      </i>
                                      {/* <br /> <i>{this.state.validationMessage}

                                      </i> */}

                                    </label>
                                    <Field
                                      name="featured_image"
                                      type="file"
                                      className={`form-control`}
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
                                    {errors.featured_image && touched.featured_image ? (
                                      <span className="errorMsg">{errors.featured_image}</span>
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
                              {this.state.helpTourId > 0
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
                  onHide={(e) => this.imageModalCloseHandler(e)}
                  backdrop='static'
                >
                  <Modal.Header closeButton>Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <img src={this.state.url} alt="Image" width="500" height="300"></img>
                    </center>
                  </Modal.Body>
                </Modal>
                <Modal
                  show={this.state.previewModal}
                  onHide={() => this.previewModalCloseHandler()}
                  backdrop='static'
                >
                  <Modal.Header closeButton>Preview</Modal.Header>
                  <Modal.Body>
                    <div class="popup-mobile-view">
                      <div>
                        <h2>
                          {this.state.previewDetails.title}
                        </h2>
                        <img src={this.state.previewDetails.image} alt="Image"></img>
                        <p>
                          {this.state.previewDetails.content}
                        </p>
                      </div>
                    </div>
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
