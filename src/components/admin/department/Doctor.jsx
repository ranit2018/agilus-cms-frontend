/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
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
import {
  htmlDecode,
  getHeightWidth,
  getHeightWidthFromURL,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../shared/helper";
// import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import SRL from "../../../assets/images/SRL.png";

import exclamationImage from "../../../assets/images/exclamation-icon-black.svg";
import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
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
  return cell.replace(".png", " ");
};

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
    <img
      src={row.doctor_image}
      alt="Doctor"
      height="100"
      onClick={(e) => refObj.imageModalShowHandler(row.doctor_image)}
    ></img>
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
  id: "",
  doctor_name: "",
  education: "",
  expertise: "",
  designation: "",
  doctor_image: "",
  date_posted: "",
  status: "",
};

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorDetails: [],
      isLoading: false,
      showModal: false,
      doctor_id: 0,
      doctor_name: "",
      education: "",
      expertise: "",
      designation: "",
      doctor_image: "",
      date_posted: "",
      status: "",

      alldata: [],
      doctorSearch: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      message: "",
    };
  }

  componentDidMount() {
    this.getDoctorList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
  };

  getDoctorList = (page = 1) => {
    var doctor_name = document.getElementById("doctor_name").value;
    var designation = document.getElementById("designation").value;
    var expertise = document.getElementById("expertise").value;
    let education = document.getElementById("education").value;
    let status = document.getElementById("status").value;

    API.get(
      `/api/department/doctor?page=${page}&doctor_name=${encodeURIComponent(
        doctor_name
      )}&education=${encodeURIComponent(
        education
      )}&designation=${encodeURIComponent(
        designation
      )}&expertise=${encodeURIComponent(expertise)}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          doctorDetails: res.data.data,
          totalCount: Number(res.data.count),

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

  doctorSearch = (e) => {
    e.preventDefault();
    var doctor_name = document.getElementById("doctor_name").value;
    var designation = document.getElementById("designation").value;
    var expertise = document.getElementById("expertise").value;
    let education = document.getElementById("education").value;
    let status = document.getElementById("status").value;

    if (
      doctor_name === "" &&
      designation === "" &&
      education === "" &&
      expertise === "" &&
      status === ""
    ) {
      return false;
    }

    API.get(
      `/api/department/doctor?page=1&doctor_name=${encodeURIComponent(
        doctor_name
      )}&education=${encodeURIComponent(
        education
      )}&designation=${encodeURIComponent(
        designation
      )}&expertise=${encodeURIComponent(expertise)}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          doctorDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,

          doctor_name: doctor_name,
          designation: designation,
          education: education,
          expertise: expertise,
          status: status,

          activePage: 1,
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
    document.getElementById("doctor_name").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("education").value = "";
    document.getElementById("expertise").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        designation: "",
        doctor_name: "",
        education: "",
        expertise: "",
        status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDoctorList();
      }
    );
  };

  //change status
  chageStatus = (cell, status) => {
    API.put(`/api/department/doctor/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getDoctorList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  //delete
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
        this.deleteDoctor(id);
      }
    });
  };

  deleteDoctor = (id) => {
    API.post(`/api/department/doctor/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getDoctorList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  renderShowsTotal = (start, to, total) => {
    return (
      <span className="pageShow">
        Showing {start} to {to}, of {total} records
      </span>
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };
  //get data by id
  getIndividualDoctor(id) {
    API.get(`/api/department/doctor/${id}`)
      .then((res) => {
        this.setState({
          alldata: res.data.data[0],
          doctor_id: id,
          showModal: true,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  //for edit/add part
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      // id: "",
      alldata: "",
      doctor_name: "",
      education: "",
      expertise: "",
      designation: "",
      doctor_image: "",
      date_posted: "",
      status: "",
      doctorDetails: "",
      doctor_id: 0,
      // doctor_file: "",
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualDoctor(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("doctor_image");
    setFieldValue("doctor_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        doctor_image: "",
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
        doctor_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        doctor_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        doctor_image: "",
        isValidFile: false,
      });
    }
  };

  handleSubmitEventAdd = (values, actions) => {
    // let postdata = {
    //   // job_id: this.state.jobDetails.job_id ? this.state.jobDetails.job_id : '',
    //   doctor_name: values.doctor_name,
    //   education: values.education,
    //   expertise: values.expertise,
    //   designation: values.designation,
    //   doctor_image: values.doctor_image,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };
    // console.log("postdata", postdata);

    let formData = new FormData();

    // formData.append('job_id',this.state.jobDetails.job_id)
    formData.append("doctor_name", values.doctor_name);
    formData.append("education", values.education);
    formData.append("expertise", values.expertise);
    formData.append("designation", values.designation);
    // formData.append('date_posted', new Date().toLocaleString());
    formData.append("status", String(values.status));

    let url = `/api/department/doctor`;
    let method = "POST";
    if (this.state.doctor_image.size > FILE_SIZE) {
      actions.setErrors({ doctor_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.doctor_image).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("doctor");
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({
            doctor_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
          });
          actions.setSubmitting(false);
        } else {
          formData.append("doctor_image", this.state.doctor_image);

          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, doctor_image: "" });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.getDoctorList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                doctor_image: "",
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

  handleSubmitEventUpdate = async (values, actions) => {
    // let postdata = {
    //   // job_id: this.state.jobDetails.job_id ? this.state.jobDetails.job_id : '',
    //   doctor_name: values.doctor_name,
    //   education: values.education,
    //   expertise: values.expertise,
    //   designation: values.designation,
    //   doctor_image: values.doctor_image,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };
    // console.log("postdata edit", postdata);

    let formData = new FormData();

    // formData.append('job_id',this.state.jobDetails.job_id)
    formData.append("doctor_name", values.doctor_name);
    formData.append("education", values.education);
    formData.append("expertise", values.expertise);
    formData.append("designation", values.designation);
    // formData.append('date_posted', new Date().toLocaleString());
    formData.append("status", String(values.status));

    let url = `/api/department/doctor/${this.state.doctor_id}`;
    let method = "PUT";

    if (this.state.doctor_image) {
      if (this.state.doctor_image.size > FILE_SIZE) {
        actions.setErrors({
          doctor_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
        });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.doctor_image).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("doctor");

          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({
              doctor_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
            });
            actions.setSubmitting(false);
          } else {
            formData.append("doctor_image", this.state.doctor_image);
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
                  text: "Updated Successfully",
                  icon: "success",
                }).then(() => {
                  this.getDoctorList();
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
        });
      }
    } else {
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
            text: "Updated Successfully",
            icon: "success",
          }).then(() => {
            this.getDoctorList();
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

  //image modal
  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, doctor_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, doctor_image: "" });
  };

  render() {
    const { alldata } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      doctor_image: "",
      doctor_name: alldata.doctor_name ? alldata.doctor_name : "",
      education: alldata.education ? alldata.education : "",
      expertise: alldata.expertise ? alldata.expertise : "",
      designation: alldata.designation ? alldata.designation : "",
      // date_posted: doctorDetails.date_posted ? doctorDetails.date_posted : "",
      status:
        alldata.status || alldata.status === 0 ? alldata.status.toString() : "",
    });

    const validateStopFlagUpdate = Yup.object().shape({
      doctor_image: Yup.string()
        .notRequired()
        .test(
          "doctorimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (doctor_image) => {
            if (doctor_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      doctor_name: Yup.string().required("Please enter doctor name"),
      education: Yup.string().required("Please enter education"),
      expertise: Yup.string().required("Please enter expetise"),
      designation: Yup.string().required("Please enter designation"),
      status: Yup.number().required("Please select status"),
    });

    const validateStopFlag = Yup.object().shape({
      doctor_image: Yup.mixed()
        .required("Please select image")
        .test(
          "doctorimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      doctor_name: Yup.string().required("Please enter doctor name"),
      education: Yup.string().required("Please enter education"),
      expertise: Yup.string().required("Please enter expetise"),
      designation: Yup.string().required("Please enter designation"),
      status: Yup.number().required("Please select status"),
    });

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
                      name="doctor_name"
                      id="doctor_name"
                      placeholder="Filter by Doctor Name"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="education"
                      id="education"
                      placeholder="Filter by Education"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="expertise"
                      id="expertise"
                      placeholder="Filter by Expertise"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="designation"
                      id="designation"
                      placeholder="Filter by Designation"
                    />
                  </div>

                  <div className="">
                    <select name="status" id="status" className="form-control">
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
                <BootstrapTable
                  wrapperClasses="table-responsive"
                  data={this.state.doctorDetails}
                >
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
                    dataField="doctor_image"
                    dataFormat={setDoctorImage(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="education"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Education
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="expertise"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Expertise
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="designation"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Designation
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="date_posted"
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
                {/* ======= Add/ Edit  Modal ======== */}
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.doctor_id > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.doctor_id > 0
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
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {this.state.doctor_id == 0 ? "Add" : "Edit"}{" "}
                              Doctor Details
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Doctor Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="doctor_name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Doctor Name"
                                      autoComplete="off"
                                      value={values.doctor_name}
                                    />
                                    {errors.doctor_name &&
                                    touched.doctor_name ? (
                                      <span className="errorMsg">
                                        {errors.doctor_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Education
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="education"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Education"
                                      autoComplete="off"
                                      value={values.education}
                                    />
                                    {errors.education && touched.education ? (
                                      <span className="errorMsg">
                                        {errors.education}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Expertise
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="expertise"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Expertise"
                                      autoComplete="off"
                                      value={values.expertise}
                                    />
                                    {errors.expertise && touched.expertise ? (
                                      <span className="errorMsg">
                                        {errors.expertise}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Designation
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="designation"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Designation"
                                      autoComplete="off"
                                      value={values.designation}
                                    />
                                    {errors.designation &&
                                    touched.designation ? (
                                      <span className="errorMsg">
                                        {errors.designation}
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
                                      {this.state.doctor_id == 0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                      <br />{" "}
                                      <i>{this.state.fileValidationMessage}</i>
                                      {this.state.message != "" ? (
                                        <>
                                          <br /> <i>{this.state.message}</i>
                                        </>
                                      ) : null}
                                    </label>
                                    <Field
                                      name="doctor_image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Doctor Image"
                                      autoComplete="off"
                                      id=""
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.doctor_image &&
                                    touched.doctor_image ? (
                                      <span className="errorMsg">
                                        {errors.doctor_image}
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
                              {this.state.doctor_id > 0
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

                {/* =====Image modal===== */}
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Doctor Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.doctor_image}
                          alt="Doctor Image"
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
export default Doctor;
