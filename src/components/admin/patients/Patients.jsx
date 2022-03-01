import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import swal from "sweetalert";
import Layout from "../layout/Layout";
import whitelogo from "../../../assets/images/logo-white.svg";
import { showErrorMessage } from "../../../shared/handle_error";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../shared/helper";

var maxDate = "";

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

const setPatient = (refOBj) => (cell, row) => {
  return (
    <LinkWithTooltip
      tooltip="View Patient Details"
      href={`/admin/patients/details/${row.id}`}
      id="tooltip-1"
    >
      {row.patient_ref}
    </LinkWithTooltip>
  );
};

const actionFormatter = (refObj) => (cell) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="Click to view Patient's ePAF"
        href={`/admin/patients/epaf/${cell}`}
        id="tooltip-1"
      >
      <i className="fas fa-tasks" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to view history"
        href={`/admin/history/patient/${cell}`}
        id="tooltip-1"
      >
      <i className="far fa-clock" />
      </LinkWithTooltip>
      {/* <LinkWithTooltip
        tooltip="Click to Edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      {refObj.state.access.delete === true ? (
        <LinkWithTooltip
          tooltip="Click to Delete"
          href="#"
          clicked={(e) => refObj.confirmDelete(e, cell)}
          id="tooltip-1"
        >
          <i className="far fa-trash-alt" />
        </LinkWithTooltip>
      ) : null} */}
    </div>
  );
};

const initialValues = {
  initial_name: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  risk_category: "",
  patient_type: "",
  care_type: "",
  email: "",
  physician_id: "",
  dob: "",
  password: "",
  conf_password: "",
};

// const patientStatus = (refObj) => (cell) => {
//   return cell === 1 ? "Active" : "Inactive";
// };

const setPhysician = (refOBj) => (cell, row) => {
  return (
    <LinkWithTooltip
      tooltip="View Prescriber Details"
      href={`/admin/prescriber/details/${row.physician_id}`}
      id="tooltip-1"
    >
      {row.physician_name}
    </LinkWithTooltip>
  );
};

// const __htmlDecode = (refObj) => (cell) => {
//   return htmlDecode(cell);
// };

//!Set this to backend directly.
// const setEmail = (refOBj) => (cell) => {
//   if (cell && cell != "") {
//     let split_mail = cell.split("@");
//     let first_half = split_mail[0];
//     let new_mail = "";
//     for (let i in first_half) {
//       if (i > 0 && i < first_half.length - 1) {
//         new_mail += "*";
//       } else {
//         new_mail += first_half[i];
//       }
//     }
//     return new_mail + "@" + split_mail[1];
//   } else {
//     return "---";
//   }
// };

class Patients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      patients: [],
      initial: [],
      patientDetails: [],
      physicianList: [],
      riskCategoryList: [],
      patientTypeList: [],
      careTypeList: [],
      patientflagId: 0,
      DOB: "",
      selectStatus: [
        { id: "0", name: "Inactive" },
        { id: "1", name: "Active" },
      ],
      showModal: false,
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      showModalLoader: false,
      search_name: "",
      search_email: "",
      search_desig: "",
      search_status: "",
      search_physician: "",
      remove_search: false,
      count: "0",
    };
  }

  componentDidMount() {
      this.getPatientList();
      this.getInitialList();
      this.getRiskCategoryList();
      this.getPatientTypeList();
      this.getCareTypeList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getPatientList(pageNumber > 0 ? pageNumber : 1);
  };

  getPatientList(page = 1) {
    API.get(
      `patients/?page=${page}&patient_ref=${this.state.search_name}&physician_name=${this.state.search_physician}`
    )
      .then((res) => {
        this.setState({
          patients: res.data.data,
          count: res.data.count,
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
  getInitialList() {
    API.get("/management/all_active_initial_type_list")
      .then((res) => {
        this.setState({
          initial: res.data.data,
          // isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }
  getRiskCategoryList() {
    API.get("/management/all_active_risk_category_list")
      .then((res) => {
        this.setState({
          riskCategoryList: res.data.data,
          // isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }
  getPatientTypeList() {
    API.get("/management/all_active_patient_type_list")
      .then((res) => {
        this.setState({
          patientTypeList: res.data.data,
          // isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }
  getCareTypeList() {
    API.get("/management/all_active_care_type_list")
      .then((res) => {
        this.setState({
          careTypeList: res.data.data,
          // isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }

  getPhysicianList() {
    API.get("physician/all")
      .then((res) => {
        this.setState({
          physicianList: res.data.data,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({ patientflagId: 0 });
    this.setState({ showModal: false });
  };

  closeMyCustomerPopup = () => {
    this.setState({ showMyCustomerPopup: false });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    this.getPhysicianList();
    if (id) {
      API.get(`patients/${id}`)
        .then((res) => {
          this.setState({
            patientflagId: id,
            patientDetails: res.data.data[0], //?response from server is an array
            isLoading: false,
            showModal: true,
          });
        })
        .catch((err) => {
          showErrorMessage(err, this.props);
        });
    } else {
      this.setState({
        patientDetails: [],
        selectedDropdown: "",
        selectedRegionList: "",
        selectedRegion: "",
        showModal: true,
        show_lang: false,
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    const post_data = {
      initial_name: values.initial_name,
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      risk_category: values.risk_category,
      patient_type: values.patient_type,
      care_type: values.care_type,
      email: values.email,
      physician_id: values.physician_id,
      dob: values.dob,
      status: values.status,
    };

    //?For updating the data
    if (this.state.patientflagId) {
      // if (values.password !== "" && values.password !== values.conf_password) {
      //   actions.setErrors({ conf_password: "Confirm password do not match" });
      //   actions.setSubmitting(false);
      // } else {
      this.setState({ showModalLoader: true });
      // if (values.password !== "") {
      //   post_data.password = values.password;
      // }
      const id = this.state.patientflagId;
      API.put(`patients/${id}`, post_data)
        .then((res) => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ showModalLoader: false });
            this.getPatientList(this.state.activePage);
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
      //}
    } else {
      //?For Adding new data
      // if (values.password !== values.conf_password) {
      //   actions.setErrors({ conf_password: "Confirm password do not match" });
      //   actions.setSubmitting(false);
      // } else {
      this.setState({ showModalLoader: true });
      //post_data.password = values.password;
      API.post("patients", post_data)
        .then((res) => {
          this.modalCloseHandler();
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record added successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ activePage: 1, showModalLoader: false });
            this.getPatientList(this.state.activePage);
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
      // }
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
        this.deletePatient(id);
      }
    });
  };

  deletePatient = (id) => {
    if (id) {
      API.delete(`patients/${id}`)
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record deleted successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ activePage: 1 });
            this.getPatientList(this.state.activePage);
          });
        })
        .catch((err) => {
          //!From server send proper error message with status code.
          if (err.data?.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
    }
  };

  renderShowsTotal = (start, to, total) => {
    return (
      <span className="pageShow">
        Showing {start} to {to}, of {total} records
      </span>
    );
  };

  patientSearch = (e) => {
    e.preventDefault();
    // var patientname = document.getElementById("patientname").value;
    // var email = document.getElementById("email").value;
    var patient_ref = document.getElementById("patient_ref").value.trim();
    // var physician_name = document.getElementById("physician_name_search").value.split(" ")[0];
    var physician_name = document.getElementById("physician_name_search").value.trim();

    // var status = document.getElementById("status").value;

    if (patient_ref === "" && physician_name === "") {
      return false;
    }

    API.get(
      `patients?page=1&patient_ref=${encodeURIComponent(
        patient_ref
      )}&physician_name=${encodeURIComponent(physician_name)}`
    )
      .then((res) => {
        this.setState({
          patients: res.data.data,
          count: res.data.count,
          isLoading: false,
          search_name: patient_ref,
          // search_email: email,
          search_physician: physician_name,
          // search_status: status,
          remove_search: true,
          activePage: 1,
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
    document.getElementById("patient_ref").value = "";
    document.getElementById("physician_name_search").value = "";
    // document.getElementById("email").value = "";
    // document.getElementById("status").value = "";

    this.setState(
      {
        search_name: "",
        // search_email: "",
        search_physician: "",
        // search_status: "",
        remove_search: false,
      },
      () => {
        this.getPatientList();
        this.setState({ activePage: 1 });
      }
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  render() {
    const { patientDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      initial_name: patientDetails.initial_name
        ? patientDetails.initial_name
        : "",
      first_name: patientDetails.first_name
        ? htmlDecode(patientDetails.first_name)
        : "",
      middle_name: patientDetails.middle_name
        ? htmlDecode(patientDetails.middle_name)
        : "",
      last_name: patientDetails.last_name
        ? htmlDecode(patientDetails.last_name)
        : "",
      risk_category: patientDetails.risk_category
        ? patientDetails.risk_category
        : "",
      patient_type: patientDetails.patient_type
        ? patientDetails.patient_type
        : "",
      care_type: patientDetails.care_type ? patientDetails.care_type : "",
      email: patientDetails.email ? htmlDecode(patientDetails.email) : "",
      dob: patientDetails.dob
        ? dateFormat(patientDetails.dob, "yyyy-mm-dd")
        : "",
      physician_id: patientDetails.physician_id
        ? patientDetails.physician_id.toString()
        : "",
      status:
        patientDetails.status || +patientDetails.status === 0
          ? patientDetails.status.toString()
          : "",
      password: "",
    });
    //validation
    let validateStopFlag = null;
    if (this.state.patientflagId > 0) {
      //patient update validation
      validateStopFlag = Yup.object().shape({
        initial_name: Yup.string().trim().required("Please select Initial"),
        first_name: Yup.string()
          .trim()
          .required("Please enter first name")
          .min(1, "First name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z( )?]+$/,
            "Invalid first name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "First name can be maximum 30 characters long"),
        middle_name: Yup.string()
          .trim()
          .required("Please enter middle name")
          .min(1, "Middle name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z( )?]+$/,
            "Invalid middle name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "Middle name can be maximum 30 characters long"),
        last_name: Yup.string()
          .trim()
          .required("Please enter last name")
          .min(1, "Last name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z( )?]+$/,
            "Invalid last name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "Last name can be maximum 30 characters long"),
        risk_category: Yup.string()
          .trim()
          .required("Please select Risk Category"),
        patient_type: Yup.string()
          .trim()
          .required("Please select Patient Type"),
        care_type: Yup.string().trim().required("Please select Care Type"),
        email: Yup.string()
          .trim()
          .required("Please enter email")
          .email("Invalid email")
          .max(80, "Email can be maximum 80 characters long"),
        dob: Yup.string().trim().required("Please select Date of Birth"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        physician_id: Yup.string()
          .trim()
          .required("Please enter physician id")
          .min(1, "Physician_id can be minimum 1 characters long")
          .matches(
            /^[A-Za-z0-9]+$/,
            "Invalid Physician_id format! Only alphanumeric are allowed"
          ),
        // password: Yup.string()
        //   .trim()
        //   .notRequired()
        //   .test(
        //     "password",
        //     "Password can be minimum 4 characters and maximum 12 characters long",
        //     function (value) {
        //       if (value !== "") {
        //         const schema = Yup.string().min(4).max(12);
        //         return schema.isValidSync(value);
        //       }
        //       return true;
        //     }
        //   ),
      });
    } else {
      //patient add validation
      validateStopFlag = Yup.object().shape({
        initial_name: Yup.string().trim().required("Please select Initial"),
        first_name: Yup.string()
          .trim()
          .required("Please enter first name")
          .min(1, "First name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z0-9\s]*$/,
            "Invalid first name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "First name can be maximum 30 characters long"),
        middle_name: Yup.string()
          .trim()
          .required("Please enter middle name")
          .min(1, "Middle name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z( )?]+$/,
            "Invalid middle name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "Middle name can be maximum 30 characters long"),
        last_name: Yup.string()
          .trim()
          .required("Please enter last name")
          .min(1, "Last name can be minimum 1 characters long")
          .matches(
            /^[A-Za-z0-9\s]*$/,
            "Invalid last name format! Only alphanumeric and spaces are allowed"
          )
          .max(30, "Last name can be maximum 30 characters long"),
        risk_category: Yup.string()
          .trim()
          .required("Please select Risk Category"),
        patient_type: Yup.string()
          .trim()
          .required("Please select Patient Type"),
        care_type: Yup.string().trim().required("Please select Care Type"),
        email: Yup.string()
          .trim()
          .required("Please enter email")
          .email("Invalid email")
          .max(80, "Email can be maximum 80 characters long"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        dob: Yup.string().trim().required("Please select Date of Birth"),
        physician_id: Yup.string()
          .trim()
          .required("Please enter physician id")
          .min(1, "Physician_id can be minimum 1 characters long")
          .matches(
            /^[A-Za-z0-9]+$/,
            "Invalid Physician_id format! Only alphanumeric are allowed"
          ),
        //!Add this when we need to enter password
        // password: Yup.string()
        //   .required("Please enter password")
        //   .min(4, "Password can be minimum 4 characters long")
        //   .max(12, "Password can be maximum 12 characters long"),
        // conf_password: Yup.string().required("Please confirm password"),
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
                <div className="col-lg-12 col-sm-12 col-xs-12">
                  <h1>
                    All Patients
                    <small />
                  </h1>
                </div>
                {this.state.count > 0 ?
                 <input
                 type="button"
                 value="History"
                 className="btn btn-info btn-sm"
                 onClick={(e) =>
                  //pp = patient wrt patient
                  this.props.history.push({
                    pathname: "/admin/history/patient",
                  })
                }
                 style={{ right: "9px", position: "absolute", top: "13px" }}
               />
                 : null }
                <div className="col-lg-12 col-sm-12 col-xs-12 topSearchSection">
                  {/* {this.state.access.add === true ? (
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.modalShowHandler(e, "")}
                      >
                        <i className="fas fa-plus m-r-5" /> Add Patient
                      </button>
                    </div>
                  ) : null} */}

                  <form className="form">
                    {/* <div className="">
                      <input
                        className="form-control"
                        name="patientname"
                        id="patientname"
                        placeholder="Filter by name"
                      />
                    </div>

                    <div className="">
                      <input
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Filter by email"
                      />
                    </div> */}
                    <div className="">
                      <input
                        className="form-control"
                        name="patient_ref"
                        id="patient_ref"
                        placeholder="Filter by Patient ID"
                      />
                    </div>
                    <div className="">
                      <input
                        className="form-control"
                        name="physician_name_search"
                        id="physician_name_search"
                        placeholder="Filter by Prescriber name"
                      />
                    </div>
                    {/* <div className="">
                      <select
                        name="status"
                        id="status"
                        className="form-control"
                      >
                        <option value="">Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div> */}

                    <div className="">
                      <input
                        type="submit"
                        value="Search"
                        className="btn btn-warning btn-sm"
                        onClick={(e) => this.patientSearch(e)}
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
                  <div className="nav-tabs-custom">
                    <ul className="nav nav-tabs">
                      {/* <li className="pull-right">
                        {this.state.count > 0 ? (
                          <button
                            className="btn btn-sm"
                            onClick={(e) =>
                              //pp = patient wrt patient
                              this.props.history.push({
                                pathname: "/admin/history/patient",
                              })
                            }
                          >
                            History
                          </button>
                        ) : null}
                      </li> */}
                    </ul>
                  </div>

                  {/* //Table */}
                  <BootstrapTable data={this.state.patients}>
                    {/* <TableHeaderColumn
                      isKey
                      dataField="first_name"
                      dataFormat={__htmlDecode(this)}
                    >
                      First Name
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="last_name" dataFormat={__htmlDecode(this)}>
                      Last Name
                    </TableHeaderColumn> */}
                    <TableHeaderColumn
                      isKey
                      dataField="patient_ref"
                      dataFormat={setPatient(this)}
                    >
                      Patient ID
                    </TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="email" dataFormat={setEmail(this)}>
                      Email
                    </TableHeaderColumn> */}
                    {/* <TableHeaderColumn
                      dataField="status"
                      dataFormat={patientStatus(this)}
                    >
                      Status
                    </TableHeaderColumn> */}
                    <TableHeaderColumn
                      dataField="physician_name"
                      dataFormat={setPhysician(this)}
                    >
                      Prescriber Name
                    </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={actionFormatter(this)}
                      >
                        Action
                      </TableHeaderColumn>
                  </BootstrapTable>

                  {this.state.count > 10 ? (
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

                  {/* ======= Add/Edit Patient modal ======== */}
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
                                {this.state.patientflagId > 0 ? "Edit" : "Add"}{" "}
                                Patient
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <div className="contBox">
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Initial
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="initial_name"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.initial_name}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.initial.map((ini, i) => (
                                          <option key={i} value={ini.id}>
                                            {ini.name}
                                          </option>
                                        ))}
                                      </Field>
                                      {errors.initial_name &&
                                      touched.initial_name ? (
                                        <span className="errorMsg">
                                          {errors.initial_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        First Name
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="first_name"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter first name"
                                        autoComplete="off"
                                      />
                                      {errors.first_name &&
                                      touched.first_name ? (
                                        <span className="errorMsg">
                                          {errors.first_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Middle Name
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="middle_name"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter middle name"
                                        autoComplete="off"
                                      />
                                      {errors.middle_name &&
                                      touched.middle_name ? (
                                        <span className="errorMsg">
                                          {errors.middle_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Last Name
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="last_name"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter last name"
                                        autoComplete="off"
                                      />
                                      {errors.last_name && touched.last_name ? (
                                        <span className="errorMsg">
                                          {errors.last_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Risk Category
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="risk_category"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.risk_category}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.riskCategoryList.map(
                                          (risk, i) => (
                                            <option key={i} value={risk.id}>
                                              {risk.name}
                                            </option>
                                          )
                                        )}
                                      </Field>
                                      {errors.risk_category &&
                                      touched.risk_category ? (
                                        <span className="errorMsg">
                                          {errors.risk_category}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Patient Type
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="patient_type"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.patient_type}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.patientTypeList.map(
                                          (patient, i) => (
                                            <option key={i} value={patient.id}>
                                              {patient.name}
                                            </option>
                                          )
                                        )}
                                      </Field>
                                      {errors.patient_type &&
                                      touched.patient_type ? (
                                        <span className="errorMsg">
                                          {errors.patient_type}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Email<span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="email"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter email"
                                        autoComplete="off"
                                      />
                                      {errors.email && touched.email ? (
                                        <span className="errorMsg">
                                          {errors.email}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Date of Birth
                                        <span className="impField">*</span>
                                      </label>
                                      <DatePicker
                                        className="form-control"
                                        selected={this.state.DOB}
                                        name="dob"
                                        showMonthDropdown
                                        showYearDropdown
                                        maxDate={maxDate}
                                        dropdownMode="select"
                                        value={values.dob}
                                        onChange={(e) => {
                                          if (e === null) {
                                            setFieldValue("dob", "");
                                          } else {
                                            setFieldValue(
                                              "dob",
                                              dateFormat(e, "yyyy-mm-dd")
                                            );
                                          }
                                          this.setState({ DOB: e });
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        autoComplete="off"
                                        placeholderText="Date of Birth"
                                      />
                                      {errors.dob && touched.dob ? (
                                        <span className="errorMsg">
                                          {errors.dob}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Physician
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="physician_id"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.physician_id}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.physicianList.map(
                                          (physician, i) => (
                                            <option
                                              key={i}
                                              value={physician.id}
                                            >
                                              {physician.name}
                                            </option>
                                          )
                                        )}
                                      </Field>
                                      {errors.physician_id &&
                                      touched.physician_id ? (
                                        <span className="errorMsg">
                                          {errors.physician_id}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Care Type
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="care_type"
                                        component="select"
                                        className={`selectArowGray form-control`}
                                        autoComplete="off"
                                        value={values.care_type}
                                      >
                                        <option key="-1" value="">
                                          Select
                                        </option>
                                        {this.state.careTypeList.map(
                                          (care, i) => (
                                            <option key={i} value={care.id}>
                                              {care.name}
                                            </option>
                                          )
                                        )}
                                      </Field>
                                      {errors.care_type && touched.care_type ? (
                                        <span className="errorMsg">
                                          {errors.care_type}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12} sm={6} md={6}>
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
                                            <option key={i} value={status.id}>
                                              {status.name}
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
                                {/* <Row>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Password
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="password"
                                        type="password"
                                        className={`form-control`}
                                        autoComplete="off"
                                      />
                                      {errors.password && touched.password ? (
                                        <span className="errorMsg">{errors.password}</span>
                                      ) : null}
                                    </div>
                                  </Col>
                                  <Col xs={12} sm={6} md={6}>
                                    <div className="form-group">
                                      <label>
                                        Confirm Password
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="conf_password"
                                        type="password"
                                        className={`form-control`}
                                        autoComplete="off"
                                      />
                                      {errors.conf_password && touched.conf_password ? (
                                        <span className="errorMsg">
                                          {errors.conf_password}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row> */}

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
                                disabled={isValid ? (isSubmitting ?  true : false) : true}
                              >
                                {this.state.patientflagId > 0
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
                </div>
              </div>
            </section>
          </div>
        </Layout>
      );
    }
  }
}

export default Patients;
