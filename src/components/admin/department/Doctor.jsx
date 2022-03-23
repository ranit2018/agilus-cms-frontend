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
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE, FILE_VALIDATION_SIZE_ERROR_MASSAGE, FILE_VALIDATION_TYPE_ERROR_MASSAGE } from "../../../shared/helper";
// import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

// import SRL from '../../../assets/images/SRL.png'

// import exclamationImage from '../../../assets/images/exclamation-icon-black.svg';
import Pagination from "react-js-pagination";
// import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import { values } from "methods";

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
        tooltip={'Click to Edit'}
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
          onChange={(e) => refObj.chageStatus(cell, row.status)}
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

const setName = (refObj) => (cell) => {
  return cell.replace('.png', " ")
}

const doctorStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const setDoctorImage = (refObj) => (cell, row) => {

  return (
    // <LinkWithTooltip
    //   tooltip={"View Image"}
    //   id="tooltip-1"
    //   clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
    // >
    <img src={row.banner_image} alt="Banner Image" height="100" onClick={(e) => refObj.imageModalShowHandler(row.banner_image)}></img>
    // </LinkWithTooltip>
  );
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};



const initialValues = {
  doctor_name: '',
  doctor_education: '',
  doctor_expertise: '',
  doctor_designation: '',
  doctor_url: '',
  status: ""
};

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorDetails: [],
      isLoading: false,
      showModal: false,
      doctor_id: 0,
      doctor_name: '',
      doctor_education: '',
      doctor_expertise: '',
      doctor_designation: '',
      doctor_url: '',
      doctor_status: '',
      
    //   doctorSearch: [],
      status_doctor: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' }
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      message: '',
    };
  }

  componentDidMount() {
    // this.getDoctorList();
    
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
  };

  getDoctorList = (page = 1) => {
    // let doctor_name = this.state.doctor_name;
    // let doctor_designation = this.state.doctor_designation;
    
    // API.get(
    //   `/api/banner?page=${page}&page_name=${encodeURIComponent(page_name)}&status=${encodeURIComponent(banner_status)}&banner_name=${encodeURIComponent(banner_name)}`
    // ).then((res) => {
    //   this.setState({
    //     doctor: res.data.data,
    //     totalCount: res.data.count,
    //     isLoading: false,

    //     // doctor_name: doctor_name,
    //     // doctor_designation: doctor_designation,

    //   });
    // })
    //   .catch((err) => {
    //     this.setState({
    //       isLoading: false,
    //     });
    //     showErrorMessage(err, this.props);
    //   });
  }



  doctorSearch = (e) => {
    // e.preventDefault();

    // var doctor_name = document.getElementById("doctor_name").value;
    // var doctor_designation = document.getElementById("doctor_designation").value;

    // if (banner_name === "" && doctor_designation === "") {
    //   return false;
    // }

    // API.get(`/api/banner?page=1&status=${encodeURIComponent(banner_status)}&banner_name=${encodeURIComponent(banner_name)}`)
    //   .then((res) => {
    //     this.setState({
    //       doctor: res.data.data,
    //       totalcount: res.data.count,
    //       isLoading: false,
    //       doctor_name: doctor_name,
    //       doctor_designation: doctor_designation,
    //       activePage: 1,
    //       remove_search: true
    //     });
    //   })
    //   .catch((err) => {
    //     this.setState({
    //       isLoading: false
    //     });
    //     showErrorMessage(err, this.props);
    //   });
  };

  getIndividualDoctor(id) {
    // API.get(`/api/banner/${id}`)
    //   .then((res) => {
    //     this.setState({
    //       docotrDetails: res.data.data[0],
    //       docotor_id: id,
    //       showModal: true
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  }

  modalCloseHandler = () => {
    this.setState({ showModal: false, doctorDetails: "", doctor_id: 0, doctor_file: "", message: "", fileValidationMessage: "" });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE })
    if (id) {
      event.preventDefault();
      this.getIndividualDoctor(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  handleBannerEdit = (id) => {
    // swal({
    //   closeOnClickOutside: false,
    //   title: "Are you sure?",
    //   text: "Click to edit the banner",
    //   icon: "warning",
    //   buttons: true,
    //   dangerMode: true,
    // }).then((willEdit) => {
    //   if (willEdit) {
    //     this.getIndividualDoctor(id);
    //   }
    // })
  }

  handleSubmitEvent = async (values, actions) => {

  }

  confirmDelete = (event, id) => {
    // event.preventDefault();
    // swal({
    //   closeOnClickOutside: false,
    //   title: "Are you sure?",
    //   text: "Once deleted, you will not be able to recover this!",
    //   icon: "warning",
    //   buttons: true,
    //   dangerMode: true,
    // }).then((willDelete) => {
    //   if (willDelete) {
    //     this.deleteDoctor(id);
    //   }
    // });
  };

  deleteDoctor = (id) => {
    // API.delete(`/api/banner/${id}`)
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record deleted successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getDoctorList(this.state.activePage);
    //     });
    //   })
    //   .catch((err) => {
    //     if (err.data.status === 3) {
    //       this.setState({ closeModal: true });
    //       showErrorMessage(err, this.props);
    //     }
    //   });
  };

  renderShowsTotal = (start, to, total) => {
    return (
      <span className="pageShow">
        Showing {start} to {to}, of {total} records
      </span>
    );
  };

  clearSearch = () => {

    document.getElementById("doctor_designation").value = "";
    document.getElementById("doctor_name").value = "";

    this.setState(
      {
        doctor_designation: "",
        doctor_name: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDoctorList();

      }
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, doctor_url: url });
  }
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, doctor_url: "" });
  }
 
  render() {
    // const { doctorDetails } = this.state;

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Doctors
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
                    <i className="fas fa-plus m-r-5" /> Add Doctor
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="banner_name"
                      id="banner_name"
                      placeholder="Filter by Doctor Name"
                    />
                  </div>

                  {/* <div className="">
                    <select
                      name="banner_status"
                      id="banner_status"
                      className="form-control"
                    >
                    doctor_name: '',
      doctor_education: '',
      doctor_expertise: '',
      doctor_designation: '',
                      <option value="">Select Doctor Status</option>
                      {this.state.status.map((val) => {
                        return (
                          <option key={val.value} value={val.value}>{val.label}</option>
                        );
                      })}
                    </select>
                  </div> */}

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.doctorSearch(e)}
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

                <BootstrapTable wrapperClasses="table-responsive" data={this.state.banner}>
                  <TableHeaderColumn
                    isKey
                    dataField="doctor_name"
                    dataFormat={setName(this)}
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Doctor Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="image"
                    dataFormat={setDoctorImage(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>
                  
                  <TableHeaderColumn
                    dataField="doctor_education"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Education
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="doctor_expertise"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Expertise
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="doctor_designation"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Designation
                  </TableHeaderColumn>
                  
                  <TableHeaderColumn
                    dataField="date_added"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Post Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={doctorStatus(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Status
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>

                {this.state.banner_count > 10 ? (
                  <Row>
                    <Col md={12}>
                      <div className="paginationOuter text-right">
                        <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={10}
                          totalItemsCount={Number(this.state.banner_count)}
                          itemClass="nav-item"
                          linkClass="nav-link"
                          activeClass="active"
                          onChange={this.handlePageChange}
                        />
                      </div>
                    </Col>
                  </Row>
                ) : null}

                {/* ======= Add Banner Modal ========
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
                              {this.state.banner_id == 0 ? "Add" : "Edit"} Banner
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Page Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="page_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      onChange={(e) => {
                                        setFieldValue("page_name", e.target.value)
                                        if (e.target.value == 1) {
                                          this.setState({
                                            message: generateResolutionText("home-banner-images")
                                          });
                                        }
                                        else if (e.target.value == 10) {
                                          this.setState({
                                            message: generateResolutionText("landening-banner-images")
                                          });
                                        } else {
                                          this.setState({
                                            message: generateResolutionText("others-banner-images")
                                          })
                                        }
                                      }}
                                      value={values.page_name}
                                    >
                                      <option value="">Select</option>
                                      {this.state.page_name_arr.map((val) => {
                                        return (
                                          <option value={val.value}>{val.label}</option>
                                        );
                                      })}
                                    </Field>
                                    {errors.page_name && touched.page_name ? (
                                      <span className="errorMsg">
                                        {errors.page_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Screen Name
                                    </label>
                                    <Field
                                      name="screen_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.screen_name}
                                    >
                                      <option key="-1" value="">
                                        Select
                                      </option>
                                      {this.state.screens.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.screen_name && touched.screen_name ? (
                                      <span className="errorMsg">
                                        {errors.screen_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Banner Text
                                    </label>
                                    <Field
                                      name="banner_text"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Banner Text"
                                      autoComplete="off"
                                      value={values.banner_text}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Banner Subtext
                                    </label>
                                    <Field
                                      name="banner_subtext"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Banner Subtext"
                                      autoComplete="off"
                                      value={values.banner_subtext}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Button Text
                                    </label>
                                    <Field
                                      name="button_text"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Button Text"
                                      autoComplete="off"
                                      value={values.button_text}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Button Url
                                    </label>
                                    <Field
                                      name="button_url"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Button Url"
                                      autoComplete="off"
                                      value={values.button_url}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {
                                        this.state.banner_id == 0 ?
                                          <span className="impField">*</span>
                                          : null
                                      }
                                      <br /> <i>{this.state.fileValidationMessage}</i>
                                      {
                                        this.state.message != '' ?
                                          <>
                                            <br /> <i>{this.state.message}</i>
                                          </>
                                          : null
                                      }
                                    </label>
                                    <Field
                                      name="banner_file"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Banner File"
                                      autoComplete="off"
                                      id=''
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.banner_file && touched.banner_file ? (
                                      <span className="errorMsg">{errors.banner_file}</span>
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
                                      {this.state.status_doctor.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
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
                              {this.state.banner_id > 0
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
                </Modal> */}
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop='static'
                >
                  <Modal.Header closeButton>Doctor Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.doctor_url} alt="Doctor Image"></img>
                      </div>
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
export default Doctor;
