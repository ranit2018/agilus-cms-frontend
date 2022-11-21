/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import { Formik, Field, Form } from 'formik';
import API from '../../../shared/hrAxios';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../shared/handle_error';
import Pagination from 'react-js-pagination';
import Layout from '../layout/Layout';
import dateFormat from 'dateformat';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';
import moment from 'moment';

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={['hover']}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}

const custStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return 'Request A Callback';
  } else if (cell === 0) {
    return 'Inactive';
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != '') {
    var mydate = new Date(cell);
    return dateFormat(mydate, 'dd-mm-yyyy');
  } else {
    return '---';
  }
};

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
        tooltip="Click to Resend email"
        href="#"
        clicked={(e) => refObj.confirmMail(e, cell, row.id)}
        id="tooltip-1"
      >
        <i className="fa fa-envelope" />
      </LinkWithTooltip>
    </div>
  );
  // }
};

const initialValues = {
  name: '',
  email: '',
  phone_no: '',
  city: '',
  job_title: '',
  application_status: '',
  department: '',
};
class AppliedJobs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appliedjobForms: [],
      appliedJobDetails: [],
      checkedRows: [],
      isLoading: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      id: '',
      name: '',
      email: '',
      phone_no: '',
      city: '',
      job_title: '',
      application_status_id: '',
      application_status: '',
      from: '',
      to: '',
      showModal: false,
      showModalUpdate: false,
      selectedDay: '',
      application_status_arr: [],
      department: '',
    };
    console.log('this.state.activePage', this.state.activePage);
  }

  getPatientList = (page = 1) => {
    console.log('this.state.activePage', this.state.activePage);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const job_title = document.getElementById('job_title').value;
    const application_status =
      document.getElementById('application_status').value;
    const department = document.getElementById('department').value;

    let from = this.state.from;
    let to = this.state.to;

    if (this.state.from !== '' && this.state.to !== '') {
      from = new Date(from);
      to = new Date(to);
      from = dateFormat(from, 'yyyy-mm-dd');
      to = dateFormat(to, 'yyyy-mm-dd');
    }

    API.get(
      `/api/job_portal/job/user/apply?page=${page}&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&job_title=${encodeURIComponent(
        job_title
      )}&date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(
        to
      )}&application_status=${encodeURIComponent(application_status)}`
    )
      .then((res) => {
        this.setState({
          appliedjobForms: res.data.data,
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

  getApplicationStatusArr = () => {
    API.get(`api/job_portal/job/application_status`)
      .then((res) => {
        let dataArr = [];
        for (var i = 0; i < res.data.data.length; i++) {
          dataArr.push({
            value: res.data.data[i].id,
            label: res.data.data[i].application_status,
          });
        }

        this.setState({
          application_status_arr: dataArr,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  handleDayClick = (day, { selected }) => {
    this.setState({
      selectedDay: selected ? undefined : day,
    });
  };

  applicationSearch = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const job_title = document.getElementById('job_title').value;
    const application_status =
      document.getElementById('application_status').value;

    let from = this.state.from;
    let to = this.state.to;
    if (
      name === '' &&
      email === '' &&
      application_status === '' &&
      job_title === '' &&
      this.state.from === '' &&
      this.state.to === ''
    ) {
      return false;
    }

    if (this.state.from !== '' && this.state.to !== '') {
      from = new Date(from);
      to = new Date(to);
      from = dateFormat(from, 'yyyy-mm-dd');
      to = dateFormat(to, 'yyyy-mm-dd');
    }
    // this.setState({ remove_search: true });
    if ((from !== '' && to === '') || (from === '' && to !== '')) {
      swal({
        title: 'Alert!',
        text: 'Please select both dates',
        icon: 'warning',
      });
    } else if (from > to) {
      swal({
        title: 'Alert!',
        text: 'Please select proper date range',
        icon: 'warning',
      });
    } else {
      API.get(
        `/api/job_portal/job/user/apply?page=1&name=${encodeURIComponent(
          name
        )}&email=${encodeURIComponent(email)}&job_title=${encodeURIComponent(
          job_title
        )}&date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(
          to
        )}&application_status=${encodeURIComponent(application_status)}`
      )
        .then((res) => {
          this.setState({
            appliedjobForms: res.data.data,
            totalCount: Number(res.data.count),
            isLoading: false,
            name: name,
            email: email,
            job_title: job_title,
            application_status: application_status,
            activePage: 1,
            remove_search: true,
          });
        })
        .catch((err) => {
          console.log('res search err', err);

          this.setState({
            isLoading: false,
          });
          showErrorMessage(err, this.props);
        });
    }
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  clearSearch = () => {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('job_title').value = '';
    document.getElementById('application_status').value = '';
    document.getElementById('department').value = '';

    let pageNumber = 1;
    this.setState(
      {
        name: '',
        email: '',
        job_title: '',
        application_status: '',
        from: '',
        to: '',
        department: '',

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getPatientList();
      }
    );
  };

  getappliedJobDetailsbyId = (id) => {
    API.get(`api/job_portal/job/user/apply/${id}`)
      .then((res) => {
        this.setState({
          appliedJobDetails: res.data.data[0],
          showModal: true,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  componentDidMount() {
    this.getPatientList(this.state.activePage);
    this.getApplicationStatusArr();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getPatientList(pageNumber > 0 ? pageNumber : 1);
  };

  showFromMonth = () => {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), 'months') < 2) {
      this.to.getDayPicker().showMonth(from);
    }
  };

  handleFromChange = (from) => {
    // Change the from date and focus the "to" input field
    this.setState({
      from: from,
    });
  };

  handleToChange = (to) => {
    this.setState({ to: to }, this.showFromMonth);
  };

  //resend email part
  confirmMail = (event, row, id) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: 'Are you sure?',
      text: 'This will send mail to the applicant!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willResend) => {
      if (willResend) {
        this.resendEmail(id);
      }
    });
  };

  resendEmail = (id) => {
    API.put(`api/job_portal/job/user/apply/resendEmail/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Mail sent successfully.',
          icon: 'success',
        }).then(() => {
          this.getPatientList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  //for edit part
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      name: '',
      email: '',
      phone_no: '',
      city: '',
      job_title: '',
      application_status: '',
      department: '',
    });
  };

  //for edit part
  modalShowHandler = (event, id) => {
    console.log('id show modal', id);
    if (id) {
      event.preventDefault();
      this.getappliedJobDetailsbyId(id);
    } else {
      this.setState({ showModal: false });
    }
  };

  //for edit part
  handleEditSubmit = (values, actions) => {
    let postdata = {
      application_status: String(values.application_status),
      department: String(values.department),
    };

    let method = 'PUT';
    let url = `/api/job_portal/job/user/apply/change_application_status/${this.state.appliedJobDetails.id}`;

    API({
      method: method,
      url: url,
      data: postdata,
    })
      .then((res) => {
        this.setState({ showModal: false });
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record updated successfully.',
          icon: 'success',
        }).then(() => {
          this.props.history.push('/hr/appliedjobs');
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

  render() {
    const { from, to } = this.state;
    const { appliedJobDetails } = this.state;
    const modifiers = { start: from, end: to };

    const newInitialValues = Object.assign(initialValues, {
      name: appliedJobDetails.name,
      email: appliedJobDetails.email,
      phone_no: appliedJobDetails.phone_no,
      job_title: appliedJobDetails.job_title,
      date_applied: moment(appliedJobDetails.date_applied).format('DD-MM-YYYY'),
      application_status: appliedJobDetails.application_status_id,
      department: appliedJobDetails.department,

      //you have to pass id for dropdown values
    });

    const validateStopFlagUpdate = Yup.object().shape({
      application_status: Yup.number().required(
        'Please select application status'
      ),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12 m-b-15">
                <h1>
                  Manage Applied Jobs
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12">
                <form>
                  <div className="leadForm">
                    <div>
                      <input
                        className="form-control"
                        name="name"
                        id="name"
                        placeholder="Filter by Name"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Filter by Email"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="job_title"
                        id="job_title"
                        placeholder="Filter by Job Title"
                      />
                    </div>
                    <div className="">
                      <select
                        name="application_status"
                        id="application_status"
                        className="form-control"
                      >
                        <option value="">Select Application Status</option>
                        {this.state.application_status_arr.map((val, i) => {
                          return (
                            <option key={i} value={val.value}>
                              {val.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="">
                      <select
                        name="department"
                        id="department"
                        className="form-control"
                      >
                        <option value="">Select Department</option>
                        <option key="" value="ent">
                          ENT
                        </option>
                        <option key="" value="orthopedic">
                          Orthopedic
                        </option>
                        <option key="" value="neurologist">
                          Neurologist
                        </option>
                      </select>
                    </div>
                    <div className="">
                      <select
                        name="department"
                        id="department"
                        className="form-control"
                      >
                        <option key="-1" value="">
                          Select experience
                        </option>
                        <option key="" value="0-2">
                          0-2
                        </option>
                        <option key="" value="2-4">
                          2-4
                        </option>
                        <option key="" value="4-7">
                          4-7
                        </option>
                        <option key="" value="7-10">
                          7-10
                        </option>
                        <option key="" value="10+">
                          10+
                        </option>
                      </select>
                    </div>
                    <div className="">
                      <select
                        name="department"
                        id="department"
                        className="form-control"
                      >
                        <option key="-1" value="">
                          Select region
                        </option>
                        <option key="" value="north">
                          North
                        </option>
                        <option key="" value="south">
                          South
                        </option>
                        <option key="" value="east">
                          East
                        </option>
                        <option key="" value="west">
                          West
                        </option>
                        <option key="" value="central">
                          Central
                        </option>
                      </select>
                    </div>
                    <div className="">
                      <select
                        name="department"
                        id="department"
                        className="form-control"
                      >
                        <option key="-1" value="">
                          Select Salary Bracket
                        </option>
                        <option key="" value="3lpa">
                          3.00 LPA
                        </option>
                        <option key="" value="4lpa">
                          4.00 LPA
                        </option>
                        <option key="" value="5lpa">
                          5.00 LAP
                        </option>
                        <option key="" value="7lpa">
                          7.00 LPA
                        </option>
                        <option key="" value="10lpa">
                          10.00 LPA
                        </option>
                      </select>
                    </div>
                    <div>
                      <DayPickerInput
                        value={from}
                        placeholder="Date From"
                        format="LL"
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                          selectedDays: [from, { from, to }],
                          disabledDays: { after: to },
                          toMonth: to,
                          modifiers,
                          numberOfMonths: 1,
                          disabledDays: {
                            before: new Date(2021, 5, 1),
                          },
                          onDayClick: () => this.to.getInput().focus(),
                        }}
                        onDayChange={this.handleFromChange}
                      />{' '}
                    </div>
                    <div>
                      <DayPickerInput
                        ref={(el) => (this.to = el)}
                        value={to}
                        placeholder="Date To"
                        format="LL"
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                          selectedDays: [from, { from, to }],
                          disabledDays: { before: from },
                          modifiers,
                          month: from,
                          fromMonth: from,
                          numberOfMonths: 1,
                        }}
                        onDayChange={this.handleToChange}
                      />
                    </div>
                    <div>
                      <div>
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.applicationSearch(e)}
                        />
                        {this.state.remove_search ? (
                          <a
                            onClick={() => this.clearSearch()}
                            className="btn btn-danger btn-sm"
                          >
                            {' '}
                            Remove{' '}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.appliedjobForms}>
                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    // dataFormat={htmlDecode(this)}
                  >
                    Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="email"
                    // dataFormat={htmlDecode(this)}
                  >
                    Email
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="phone_no"
                    // dataFormat={htmlDecode(this)}
                  >
                    Phone Number
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="job_title"
                    // dataFormat={htmlDecode(this)}
                  >
                    Job Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="application_status"
                    // dataFormat={htmlDecode(this)}
                  >
                    Application Status
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_applied"
                    dataFormat={setDate(this)}
                  >
                    Post Date
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

                {/* ======= Edit  Modal ======== */}

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={validateStopFlagUpdate}
                    onSubmit={this.handleEditSubmit}
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
                              {' '}
                              Change Application Status{' '}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="name"
                                      type="text"
                                      className={`form-control`}
                                      value={values.name || ''}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Email
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="email"
                                      type="text"
                                      className={`form-control`}
                                      value={values.email || ''}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Phone Number
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="phone_no"
                                      type="text"
                                      className={`form-control`}
                                      value={values.phone_no || ''}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Title
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_title"
                                      type="text"
                                      className={`form-control`}
                                      value={values.job_title || ''}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Applied Date
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="date_applied"
                                      type="text"
                                      className={`form-control`}
                                      value={values.date_applied || ''}
                                      disabled
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Application Status
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="application_status"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.application_status}
                                    >
                                      <option key="-1" value="">
                                        Select
                                      </option>
                                      {this.state.application_status_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.application_status &&
                                    touched.application_status ? (
                                      <span className="errorMsg">
                                        {errors.application_status}
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
                                isValid ? 'btn-custom-green' : 'btn-disable'
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {this.state.appliedJobDetails.id > 0
                                ? isSubmitting
                                  ? 'Updating...'
                                  : 'Update'
                                : isSubmitting
                                ? 'Submitting...'
                                : 'Submit'}
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
export default AppliedJobs;
