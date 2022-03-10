import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import { Row, Col, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import API from '../../../../shared/admin-axios';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../../shared/handle_error';
import Pagination from 'react-js-pagination';
import { htmlDecode } from '../../../../shared/helper';
import Switch from 'react-switch';
import Layout from '../../layout/Layout';

import { Formik, Field, Form } from 'formik'; // for edit part
import * as Yup from 'yup'; // for edit part
import whitelogo from '../../../../assets/images/drreddylogo_white.png';

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
  job_skill: '',
  status: '',
};

class JobSkills extends Component {
  constructor(props) {
    super(props);

    this.state = {
      NewJobSkillDetails: {},
      jobSkillList: [],
      jobSkillDetails: {},
      jobSkillId: 0,
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
      search_job_skill: '',
    };
  }

  getJobSkillList = (page = 1) => {
    let { search_job_skill } = this.state;
   
    API.get(
      `api/job_portal/job/skill?page=${page}&job_skill=${encodeURIComponent(
        search_job_skill
      )}`
    )
      .then((res) => {
        this.setState({
          jobSkillList: res.data.data,
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
    API.post(`api/job_portal/job/skill/${row.id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record deleted successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobSkillList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getjobSkillDetails(id) {
    API.get(`api/job_portal/job/skill/${id}`)
      .then((res) => {
        this.setState({
          showModalUpdate: true,
          jobSkillDetails: res.data.data[0],
          jobSkillId: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  changeStatus = (cell, status, row) => {
    API.put(`api/job_portal/job/skill/change_status/${row.id}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record updated successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobSkillList(this.state.activePage);
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
    this.getJobSkillList();
  }

  //for edit part
  modalCloseHandler = () => {
    this.setState({ showModal: false, job_skill: '', status: '' });
  };

  //for edit part
  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getjobSkillDetails(id);
      this.setState({ showModal: true });
    } else {
      this.setState({ showModal: false });
    }
  };

  handleEditSubmit = (values, actions) => {
    let postdata = {
      job_skill: values.job_skill,
      status: String(values.status), /////////
    };
    
    let method = '';
    let url = 'api/job_portal/job/skill/';

    method = 'PUT';
    url = `api/job_portal/job/skill/${this.state.jobSkillDetails.id}`;

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
          this.props.history.push('/hr/master-jobs/job-skills');
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

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getJobSkillList(pageNumber > 0 ? pageNumber : 1);
  };

  JobRoleSearch = (e) => {
    e.preventDefault();
    const search_job_skill = document.getElementById('search_job_skill').value;

    if (search_job_skill === '') {
      return false;
    }

    API.get(
      `api/job_portal/job/skill?page=1&job_skill=${encodeURIComponent(
        search_job_skill
      )}`
    )
      .then((res) => {
        this.setState({
          jobSkillList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_job_skill: search_job_skill,

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
    document.getElementById('search_job_skill').value = '';

    this.setState(
      {
        search_job_skill: '',

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getJobSkillList();
      }
    );
  };

  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + '...' : str;
  };

  render() {
    const newInitialValues = Object.assign(initialValues, {
      job_skill: this.state.jobSkillDetails.job_skill,
      status: this.state.jobSkillDetails.status,
    });

    const validateStopFlag = Yup.object().shape({
      job_skill: Yup.string().required('Please enter job role'),
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
                  Manage Job Skills
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) =>
                      this.props.history.push({
                        pathname: '/hr/master-jobs/add-job-skills',
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Job Skill
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      id="search_job_skill"
                      placeholder="Filter by Skills"
                    />
                  </div>

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.JobRoleSearch(e)}
                    />
                    {this.state.remove_search ? (
                      <a
                        onClick={() => this.clearSearch()}
                        className="btn btn-danger btn-sm"
                        href="# "
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
                <BootstrapTable data={this.state.jobSkillList}>
                  <TableHeaderColumn
                    isKey
                    dataField="job_skill"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Skill
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

                {/* ======= Edit Job Role Modal ======== */}

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={validateStopFlag}
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
                          {/* {this.state.showModalUpdate === true ? (
                            <div className="loading_reddy_outer">
                              <div className="loading_reddy">
                                <img src={whitelogo} alt="loader" />
                              </div>
                            </div>
                          ) : (
                            ''
                          )} */}
                          <Modal.Header closeButton>
                            <Modal.Title>Edit Job Skill</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Skill
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_skill"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter job role"
                                      value={values.job_skill || ''}
                                    />
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
                              {this.state.jobSkillDetails.id > 0
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
export default JobSkills;
