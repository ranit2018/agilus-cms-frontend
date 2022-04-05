import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Modal,
  Tooltip,
  OverlayTrigger,
  Collapse,
} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../shared/helper";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";
import { Scheduler } from "../scheduler/Scheduler";

const schedulerValues = {
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  all_day_check: 0,
  repeat: 0,
};

const initialValues = {
  title_name: "",
  status: "",
  updated_name: "",
  isSchedule: 0,
  schedulerData: {
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    all_day_check: 0,
    repeat: 0,
  },
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
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
      {/* <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip> */}
    </div>
  );
};

const handleScheduleData = (refObj) => (cell, row) => {
  return <p>{row.is_schedule ? "true" : "false"}</p>;
};

class ManageHeading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      headingsList: [],
      headingDetails: {},
      heading_name: "",
      heading_id: 0,

      categories: [],
      categoryDetails: {},
      mediumList: [],
      isLoading: false,
      showModal: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],

      medium_name: "",
      status: "",
      isHeaderSchedule: 0,
    };
  }

  componentDidMount = () => {
    // this.getCategoryList();
    // this.getMediumList();
    this.getHeadingsList();
  };

  getHeadingsList = (page = 1) => {
    API.get(`/api/home/get_heading_text?page=${page}`)
      .then((res) => {
        this.setState({
          headingsList: res.data.data,
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

  handleSubmitEvent = (values, actions) => {
    const updatedValue = {
      ...values,
      schedulerData: {
        ...values.schedulerData,
        repeat: +values.schedulerData.repeat,
      },
    };
    let method = "";
    let url = "";
    if (this.state.heading_id > 0) {
      method = "PUT";
      url = `/api/home/heading_text/${this.state.heading_id}`;
    } else {
      method = "POST";
      url = `/api/category/`;
    }
    console.log(updatedValue);
    API({
      method: method,
      url: url,
      data: updatedValue,
    })
      .then((res) => {
        // this.setState({ showModal: false });
        this.modalCloseHandler();
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text:
            method === "PUT"
              ? "Record updated successfully."
              : "Record added successfully.",
          icon: "success",
        }).then(() => {
          // this.getCategoryList(this.state.activePage);
          this.getHeadingsList(this.state.activePage);
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
        this.deleteHeading(id);
      }
    });
  };

  deleteHeading = (id) => {
    API.post(`/api/home/heading_text/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          // this.getCategoryList(this.state.activePage);
          this.getHeadingsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        } else if (err.data.status === 2) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getHeadingDetails(id) {
    API.get(`/api/home/get_heading_text/${id}`)
      .then((res) => {
        this.setState({
          headingDetails: res.data.data[0],
          heading_id: id,
          showModal: true,
          isHeaderSchedule: res.data.data[0].is_schedule ?? 0,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  // headingSearch = (e) => {
  //     e.preventDefault();

  //     const heading_name = document.getElementById("heading_name").value;
  //     // const medium_name = document.getElementById("medium_name").value;
  //     // const medium_name = 1;
  //     // const status = document.getElementById("status").value;

  //     // if (heading_name === "" && medium_name === "" && status === "") {
  //     //     return false;
  //     // }
  //     if (heading_name === ""){
  //         return false;
  //     }

  //     API.get(`/api/home/get_heading_text?page=1&title_name=${heading_name}`)
  //         .then((res) => {
  //             this.setState({
  //                 headingsList: res.data.data,
  //                 totalCount: res.data.count,
  //                 isLoading: false,
  //                 heading_name: heading_name,
  //                 // medium_name: medium_name,
  //                 // status: status,
  //                 activePage: 1,
  //                 remove_search: true
  //             });
  //         })
  //         .catch((err) => {
  //             this.setState({
  //                 isLoading: false
  //             });
  //             showErrorMessage(err, this.props);
  //         });
  // };

  // clearSearch = () => {

  //     document.getElementById("heading_name").value = "";
  //     // document.getElementById("medium_name").value = "";
  //     // document.getElementById("status").value = "";

  //     this.setState(
  //         {
  //             heading_name: "",
  //             // medium_name: "",
  //             // status: "",
  //             remove_search: false,
  //         },
  //         () => {
  //             this.setState({ activePage: 1 });
  //             this.getHeadingsList();

  //         }
  //     );
  // };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getHeadingsList(pageNumber > 0 ? pageNumber : 1);
  };

  modalCloseHandler = () => {
    this.setState({
      headingDetails: {},
      heading_id: 0,
      selectedMediumList: [],
      showModal: false,
    });
  };

  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getHeadingDetails(id);
    } else {
      this.setState({ showModal: true, heading_id: 0, headingDetails: {} });
    }
  };

  render() {
    const { headingDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      title_name: headingDetails.title_name
        ? htmlDecode(headingDetails.title_name)
        : "",
      status:
        headingDetails.status || +headingDetails.status === 0
          ? headingDetails.status.toString()
          : "",
      updated_name: headingDetails.updated_title ?? "",
      isSchedule: headingDetails.is_schedule ?? 0,
      schedulerData: {
        start_date: headingDetails.start_date ?? "",
        end_date: headingDetails.end_date ?? "",
        start_time: headingDetails.start_time ?? "",
        end_time: headingDetails.end_time ?? "",
        all_day_check: headingDetails.all_day_check ?? 0,
        repeat: headingDetails.repeat ?? 0,
      },
    });

    const validateStopFlag = Yup.object().shape({
      title_name: Yup.string().required("Please enter the Title"),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
      isSchedule: Yup.number().integer().min(0).max(1),
      updated_name: Yup.string().when("isSchedule", (isSchedule, schema) => {
        return isSchedule === 1
          ? schema.required("Please enter the Title")
          : schema.default("");
      }),
      schedulerData: Yup.object(
        /* )
        .shape( */ {
          start_date: Yup.string().when("isSchedule", (isSchedule, schema) => {
            return isSchedule ? schema.required() : schema.optional();
          }),
          end_date: Yup.string().when("isSchedule", (isSchedule, schema) => {
            console.log(this.state.isHeaderSchedule, " 🔥");
            return isSchedule ? schema.required() : schema.optional();
          }),
          start_time: Yup.string().when(["all_day_check", "repeat"], {
            is: (all_day_check, repeat) => !all_day_check && repeat,
            then: Yup.string().required(),
            otherwise: Yup.string().optional(),
          }),
          end_time: Yup.string().when("start_time", (start_time, schema) => {
            return start_time ? schema.required() : schema;
          }),
          all_day_check: Yup.number().integer().min(0).max(1),
          repeat: Yup.number().integer().min(0).max(4),
        }
      ).when("isSchedule", (isSchedule, schema) => {
        return isSchedule ? schema.required() : schema;
      }),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Headings
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                {/* <div className="">
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={(e) => this.modalShowHandler(e, "")}
                                    >
                                        <i className="fas fa-plus m-r-5" /> Add Category
                        </button>
                                </div> */}
                <form className="form">
                  {/* <div className="">
                                        <input
                                            className="form-control"
                                            name="heading_name"
                                            id="heading_name"
                                            placeholder="Filter by Category Name"
                                        />
                                    </div> */}

                  {/* <div className="">
                                        <select
                                            name="medium_name"
                                            id="medium_name"
                                            className="form-control"
                                        >
                                            <option value="">Select Post Type</option>
                                            {this.state.mediumList.map((val) => {
                                                return (
                                                    <option value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                    </div> */}

                  {/* <div className="">
                                        <select
                                            name="status"
                                            id="status"
                                            className="form-control"
                                        >
                                            <option value="">Select Category Status</option>
                                            {this.state.selectStatus.map((val) => {
                                                return (
                                                    <option key={val.value} value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                        </div>*/}

                  {/* <div className="">
                                        <input
                                            type="submit"
                                            value="Search"
                                            className="btn btn-warning btn-sm"
                                            onClick={(e) => this.headingSearch(e)}
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
                                    <div className="clearfix"></div> */}
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.headingsList}>
                  <TableHeaderColumn
                    dataField="title_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Heading Title
                  </TableHeaderColumn>
                  <TableHeaderColumn isKey dataField="sl_no">
                    Serial Number
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                                        dataField="status"
                                        dataFormat={custStatus(this)}
                                    >
                                        Status
                        </TableHeaderColumn> */}
                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                  >
                    Action
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="is_schedule"
                    dataFormat={handleScheduleData(this)}
                  >
                    Scheduled
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
                      setErrors,
                      setValues,
                    }) => {
                      console.log(errors);
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
                              {this.state.heading_id > 0
                                ? "Edit Heading"
                                : "Add Heading"}
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
                                      name="title_name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter name"
                                      autoComplete="off"
                                      value={values.title_name}
                                    />
                                    {errors.title_name && touched.title_name ? (
                                      <span className="errorMsg">
                                        {errors.title_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <Scheduler
                                    value={values.schedulerData}
                                    scheduler={values.isSchedule}
                                    error={errors.schedulerData}
                                    onSchedulerDataChange={({
                                      isSchedule,
                                      ...data
                                    }) => {
                                      this.setState({
                                        isHeaderSchedule: isSchedule,
                                      });
                                      if (isSchedule) {
                                        setValues({
                                          ...values,
                                          isSchedule,
                                          schedulerData: data,
                                        });
                                      } else {
                                        setValues({
                                          ...values,
                                          isSchedule,
                                          schedulerData: schedulerValues,
                                        });
                                      }
                                    }}
                                  />
                                </Col>
                              </Row>
                              <Collapse in={values.isSchedule}>
                                <Row>
                                  <Col xs={12} sm={12} md={12}>
                                    <div className="form-group">
                                      <label>
                                        New title
                                        <span className="impField">*</span>
                                      </label>
                                      <Field
                                        name="updated_name"
                                        type="text"
                                        className={`form-control`}
                                        placeholder="Enter new name"
                                        autoComplete="off"
                                        value={values.updated_name}
                                      />
                                      {errors.updated_name &&
                                      touched.updated_name ? (
                                        <span className="errorMsg">
                                          {errors.updated_name}
                                        </span>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Row>
                              </Collapse>
                              {/* <Row>
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
                                                            </Row> */}
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
                              {this.state.heading_id > 0
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

export default ManageHeading;
