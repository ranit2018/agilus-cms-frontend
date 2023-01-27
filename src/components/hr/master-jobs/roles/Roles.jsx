import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import { Row, Col, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import API from '../../../../shared/hrAxios';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../../shared/handle_error';
import Pagination from 'react-js-pagination';
import { htmlDecode } from '../../../../shared/helper';
import Switch from 'react-switch';
import Layout from '../../layout/Layout';

import { Formik, Field, Form } from 'formik'; // for edit part
import * as Yup from 'yup'; // for edit part

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const custStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return 'Active';
  } else if (cell === 0) {
    return 'Inactive';
  }
};

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
        tooltip={'Click to change status'}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.changeStatus(row.id, row.status, row)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

const initialValues = {
  job_role: '',
  status: '',
};

class Roles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      NewRoleDetails: {},
      roleList: [],
      roleDetails: {},
      roleId: 0,
      isLoading: false,
      showModal: false,
      showModalUpdate: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: '0', label: 'Inactive' },
        { value: '1', label: 'Active' },
      ],
      value: '',
      selectedValue: '',
      suggestions: [],
      search_job_role: '',
      search_status: '',
    };
  }

  getJobRoleList = (page = 1) => {
    let { search_job_role, search_status } = this.state;
    API.get(
      `api/job_portal/job/department?page=${page}&job_role=${encodeURIComponent(
        search_job_role
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          roleList: res.data.data,
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

  confirmDelete = (event, id, row) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.deleteJobRole(id, row);
      }
    });
  };

  deleteJobRole = (id, row) => {
    API.post(`api/job_portal/job/department/${row.id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record deleted successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobRoleList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getjobRoleDetails(id) {
    API.get(`api/job_portal/job/department/${id}`)
      .then((res) => {
        this.setState({
          showModalUpdate: true,
          roleDetails: res.data.data[0],
          roleId: id,
          showModal: true,
          showModalLoader: true,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  changeStatus = (cell, status, row) => {
    API.put(`api/job_portal/job/department/change_status/${row.id}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record updated successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobRoleList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  componentDidMount() {
    this.getJobRoleList();
  }

  //for edit part
  modalCloseHandler = () => {
    this.setState({ showModal: false, job_role: '', status: '' });
  };

  //for edit part
  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getjobRoleDetails(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  handleSubmitEventUpdate = (values, actions) => {
    let postdata = {
      job_role: values.job_role,
      status: String(values.status),
    };

    let method = 'PUT';
    let url = `api/job_portal/job/department/${this.state.roleDetails.id}`;

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
          this.props.history.push('/hr/master-jobs/job-roles');
        });
      })
      .catch((err) => {
        this.setState({ showModalLoader: false });
        if (err.data.status === 3) {
          // this.setState({
          //   showModal: false,
          // });
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  //add
  handleSubmitEventAdd = (values, actions) => {
    let post_data = {
      job_role: values.job_role,
      status: String(values.status),
    };

    let url = `api/job_portal/job/department`;
    let method = 'POST';
    API({
      method: method,
      url: url,
      data: post_data,
    })
      .then((res) => {
        this.setState({ showModal: false });
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record added successfully.',
          icon: 'success',
        }).then(() => {
          this.props.history.push('/hr/master-jobs/job-roles');
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getJobRoleList(pageNumber > 0 ? pageNumber : 1);
  };

  JobRoleSearch = (e) => {
    e.preventDefault();
    const search_job_role = document.getElementById('search_job_role').value;
    const search_status = document.getElementById('search_status').value;

    if ((search_job_role === '') & (search_status === '')) {
      return false;
    }

    API.get(
      `api/job_portal/job/department?page=1&job_role=${encodeURIComponent(
        search_job_role
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          roleList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_job_role: search_job_role,
          search_status: search_status,

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
    document.getElementById('search_job_role').value = '';
    document.getElementById('search_status').value = '';

    this.setState(
      {
        search_job_role: '',
        search_status: '',

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getJobRoleList();
      }
    );
  };

  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + '...' : str;
  };

  render() {
    const newInitialValues = Object.assign(initialValues, {
      job_role: this.state.roleDetails.job_role,
      status: this.state.roleDetails.status,
    });

    const validateStopFlagUpdate = Yup.object().shape({
      job_role: Yup.string().required('Please enter job role'),
      status: Yup.string()
        .trim()
        .required('Please select status')
        .matches(/^[0|1]$/, 'Invalid status selected'),
    });

    const validateStopFlag = Yup.object().shape({
      job_role: Yup.string().required('Please enter job role'),
      status: Yup.string()
        .trim()
        .required('Please select status')
        .matches(/^[0|1]$/, 'Invalid status selected'),
    });
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Job Roles
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.modalShowHandler(e, '')}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Job Role
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      id="search_job_role"
                      placeholder="Filter by Job Role"
                    />
                  </div>
                  <div className="">
                    <select
                      name="search_status"
                      id="search_status"
                      className="form-control"
                    >
                      <option value="">Select Status</option>
                      {this.state.selectStatus.map((val, i) => {
                        return (
                          <option key={i} value={val.value}>
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
                      onClick={(e) => this.JobRoleSearch(e)}
                    />
                    {this.state.remove_search ? (
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      <a
                        onClick={() => this.clearSearch()}
                        className="btn btn-danger btn-sm"
                      >
                        {' '}
                        Remove{' '}
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
                <BootstrapTable data={this.state.roleList}>
                  <TableHeaderColumn
                    isKey
                    dataField="job_department"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Departmet
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
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

                {/* ======= Edit/Add Job Role Modal ======== */}

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.roleId > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.roleId > 0
                        ? this.handleSubmitEventUpdate
                        : this.handleSubmitEventAdd
                    }
                    // validationSchema={validateStopFlag}
                    // onSubmit={this.handleEditSubmit}
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
                              {this.state.roleId == 0 ? 'Add' : 'Edit'} Job Role
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Role
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_role"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter job role"
                                      value={values.job_role || ''}
                                    />
                                    {errors.job_role && touched.job_role ? (
                                      <span className="errorMsg">
                                        {errors.job_role}
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
                                isValid ? 'btn-custom-green' : 'btn-disable'
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {this.state.roleDetails.id > 0
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
export default Roles;
