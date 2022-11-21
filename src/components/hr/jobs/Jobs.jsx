/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import { Row, Col, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Formik, Field, Form } from 'formik';
import API from '../../../shared/hrAxios';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../shared/handle_error';
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from '../../../shared/helper';
import Pagination from 'react-js-pagination';
import Layout from '../layout/Layout';
import dateFormat from 'dateformat';
import Switch from 'react-switch';

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
        tooltip={'Click to Edit'}
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        // clicked={(e) => refObj.editJob(e, cell)}
        href="#"
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={'Click to change status'}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.chageStatus(row.job_id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell, row.job_id)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};
const setJobImage = (refObj) => (cell, row) => {
  return (
    <div
      style={{
        width: '100px',
        height: '100px',
        overflow: 'hidden',
      }}
    >
      <img
        src={cell}
        alt="Jobs"
        width="100%"
        onClick={(e) => refObj.imageModalShowHandler(row.feature_image)}
      ></img>
    </div>
  );
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != '') {
    var mydate = new Date(cell);
    return dateFormat(mydate, 'dd-mm-yyyy');
  } else {
    return '---';
  }
};

const initialValues = {
  job_id: '',
  feature_image: '',
  job_title: '',
  job_role: '',
  job_location: '',
  job_category: '',
  job_description: '',
  desired_skill_set: '',
  category_name: '',
  date_posted: '',
  status: '',
};

class Jobs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jobs: [],
      jobDetails: {},
      categoryList: [],
      jobId: 0,
      isLoading: false,
      showModal: false,
      showModalLoader: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectedCategoryList: [],
      selectStatus: [
        { value: '0', label: 'Inactive' },
        { value: '1', label: 'Active' },
      ],
      thumbNailModal: false,
      job_title: '',
      job_role: '',
      feature_image: '',
      job_location: '',
      job_category: '',
      job_description: '',
      desired_skill_set: '',
      date_posted: '',
      status: '',
      job_role_arr: [],
      job_location_arr: [],
      job_category_arr: [],
      job_skill_arr: [],
      search_job_title: '',
      search_job_role: '',
      search_job_location: '',
      search_category_name: '',
      search_job_skill: '',
    };
  }
  componentDidMount() {
    this.getJobsList();
    this.getRoleArr();
    this.getlocationArr();
    this.getcategoryArr();
    this.getskillArr();
    this.setState({
      validationMessage: generateResolutionText('jobs'),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  getJobsList = (page = 1) => {
    const search_job_title = document.getElementById('search_job_title').value;
    const search_job_role = document.getElementById('search_job_role').value;
    const search_category_name = document.getElementById(
      'search_category_name'
    ).value;
    const search_job_skill = document.getElementById('search_job_skill').value;
    const search_job_location = document.getElementById(
      'search_job_location'
    ).value;
    const search_status = document.getElementById('search_status').value;

    API.get(
      `/api/job_portal/job?page=${page}&job_title=${encodeURIComponent(
        search_job_title
      )}&job_role=${encodeURIComponent(
        search_job_role
      )}&job_category=${encodeURIComponent(
        search_category_name
      )}&job_desired_skill_set=${encodeURIComponent(
        search_job_skill
      )}&job_location=${encodeURIComponent(
        search_job_location
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          jobs: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          showModalLoader: true,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  getRoleArr = () => {
    API.get(`api/job_portal/job/role?page=1`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].job_role,
          });
        }
        this.setState({
          job_role_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  getlocationArr = () => {
    API.get(`api/job_portal/job/location?page=1`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].job_location,
          });
        }
        this.setState({
          job_location_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  getcategoryArr = () => {
    API.get(`api/job_portal/job/category?page=1`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].category_name,
          });
        }
        this.setState({
          job_category_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  getskillArr = () => {
    API.get(`api/job_portal/job/skill?page=1`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].job_skill,
          });
        }
        this.setState({
          job_skill_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  getjobDetailsbyId = (id) => {
    API.get(`api/job_portal/job/${id}`)
      .then((res) => {
        this.setState({
          jobDetails: res.data.data[0],
          jobId: res.data.data[0].job_id,
          isLoading: false,
          showModal: true,
          showModalLoader: true,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  jobSearch = (e) => {
    e.preventDefault();

    const search_job_title = document.getElementById('search_job_title').value;
    const search_job_role = document.getElementById('search_job_role').value;
    const search_category_name = document.getElementById(
      'search_category_name'
    ).value;
    const search_job_skill = document.getElementById('search_job_skill').value;
    const search_job_location = document.getElementById(
      'search_job_location'
    ).value;
    const search_status = document.getElementById('search_status').value;
    if (
      search_job_title === '' &&
      search_job_role === '' &&
      search_category_name === '' &&
      search_job_skill === '' &&
      search_job_location === '' &&
      search_status === ''
    ) {
      return false;
    }

    API.get(
      `/api/job_portal/job?page=1&job_title=${encodeURIComponent(
        search_job_title
      )}&job_role=${encodeURIComponent(
        search_job_role
      )}&job_category=${encodeURIComponent(
        search_category_name
      )}&job_desired_skill_set=${encodeURIComponent(
        search_job_skill
      )}&job_location=${encodeURIComponent(
        search_job_location
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          jobs: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          search_job_title: search_job_title,
          search_job_role: search_job_role,
          search_category_name: search_category_name,
          search_job_location: search_job_location,
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
    document.getElementById('search_job_title').value = '';
    document.getElementById('search_job_role').value = '';
    document.getElementById('search_category_name').value = '';
    document.getElementById('search_job_skill').value = '';
    document.getElementById('search_job_location').value = '';
    document.getElementById('search_status').value = '';

    this.setState(
      {
        search_job_title: '',
        search_job_role: '',
        search_job_location: '',
        search_category_name: '',
        search_job_skill: '',
        search_status: '',

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getJobsList();
      }
    );
  };

  confirmDelete = (event, cell, id) => {
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
        this.deleteJobs(id);
      }
    });
  };

  deleteJobs = (id) => {
    API.post(`/api/job_portal/job/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record deleted successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/job_portal/job/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: 'Success',
          text: 'Record updated successfully.',
          icon: 'success',
        }).then(() => {
          this.getJobsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: '' });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getJobsList(pageNumber > 0 ? pageNumber : 1);
  };

  //for edit/add part
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      job_title: '',
      job_role: '',
      job_location: '',
      job_description: '',
      desired_skill_set: '',
      category_name: '',
      job_category: '',
      job_skill: '',
      status: '',
      job_id: 0,
    });
  };

  //for edit/add part
  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getjobDetailsbyId(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  handleSubmitEventAdd = (values, actions) => {
    let formData = new FormData();

    // formData.append('job_id',this.state.jobDetails.job_id)
    formData.append('job_title', values.job_title);
    formData.append('job_role', values.job_role);
    formData.append('job_location', values.job_location);
    formData.append('job_category', values.category_name);
    formData.append('job_description', values.job_description);
    formData.append('desired_skill_set', values.job_skill);
    formData.append('status', String(values.status));

    let url = `api/job_portal/job`;
    let method = 'POST';
    if (this.state.feature_image.size > FILE_SIZE) {
      actions.setErrors({ feature_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.feature_image).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution('jobs');
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({
            feature_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
          });
          actions.setSubmitting(false);
        } else {
          formData.append('feature_image', this.state.feature_image);

          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, feature_image: '' });
              swal({
                closeOnClickOutside: false,
                title: 'Success',
                text: 'Added Successfully',
                icon: 'success',
              }).then(() => {
                this.getJobsList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                feature_image: '',
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
    let formData = new FormData();

    formData.append('job_title', values.job_title);
    formData.append('job_role', values.job_role);
    formData.append('job_location', values.job_location);
    formData.append('job_category', values.category_name);
    formData.append('job_description', values.job_description);
    formData.append('desired_skill_set', values.job_skill);
    formData.append('status', String(values.status));

    let url = `/api/job_portal/job/${this.state.jobId}`;
    let method = 'PUT';

    if (this.state.feature_image) {
      if (this.state.feature_image.size > FILE_SIZE) {
        actions.setErrors({
          feature_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
        });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.feature_image).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution('jobs');

          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({
              feature_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
            });
            actions.setSubmitting(false);
          } else {
            formData.append('feature_image', this.state.feature_image);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false });
                swal({
                  closeOnClickOutside: false,
                  title: 'Success',
                  text: 'Updated Successfully',
                  icon: 'success',
                }).then(() => {
                  this.getJobsList();
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
            title: 'Success',
            text: 'Updated Successfully',
            icon: 'success',
          }).then(() => {
            this.getJobsList();
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

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched('feature_image');
    setFieldValue('feature_image', event.target.value);

    const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        feature_image: '',
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
        feature_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        feature_image:
          'Only files with the following extensions are allowed: png jpg jpeg',
      }); //Not working- So Added validation in "yup"
      this.setState({
        feature_image: '',
        isValidFile: false,
      });
    }
  };

  render() {
    const { jobDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      job_id: jobDetails.job_id ? jobDetails.job_id : '',
      feature_image: '',
      job_title: jobDetails.job_title ? jobDetails.job_title : '',
      job_role:
        jobDetails.role_id || jobDetails.role_id === 0
          ? jobDetails.role_id.toString()
          : '',
      job_location:
        jobDetails.location_id || jobDetails.location_id === 0
          ? jobDetails.location_id.toString()
          : '',
      job_description: jobDetails.job_description
        ? jobDetails.job_description
        : '',
      category_name:
        jobDetails.category_id || jobDetails.category_id === 0
          ? jobDetails.category_id.toString()
          : '',
      job_skill:
        jobDetails.skill_id || jobDetails.skill_id === 0
          ? jobDetails.skill_id.toString()
          : '',
      date_posted: jobDetails.date_posted ? jobDetails.date_posted : '',
      status:
        jobDetails.status || jobDetails.status === 0
          ? jobDetails.status.toString()
          : '',
    });

    const validateStopFlagUpdate = Yup.object().shape({
      feature_image: Yup.string()
        .notRequired()
        .test(
          'jobimage',
          'Only files with the following extensions are allowed: png jpg jpeg',
          (feature_image) => {
            if (feature_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      job_title: Yup.string().required('Please enter job title'),
      job_role: Yup.string().required('Please select job role'),
      job_location: Yup.string().required('Please select job location'),
      category_name: Yup.string().required('Please select job category'),
      job_description: Yup.string().required('Please enter job description'),
      job_skill: Yup.string().required('Please select job skill'),
      status: Yup.number().required('Please select status'),
      employment_type: Yup.string().required('Please enter employment type'),
      department: Yup.string().required('Please enter department'),
      travel_needed: Yup.string().required('Please enter travel_needed'),
      region: Yup.string().required('Please enter region'),
      experience: Yup.string().required('Please enter experience'),
      company_information: Yup.string().required(
        'Please enter company_information'
      ),
    });

    const validateStopFlag = Yup.object().shape({
      feature_image: Yup.mixed()
        .required('Please select image')
        .test(
          'jobimage',
          'Only files with the following extensions are allowed: png jpg jpeg',
          () => this.state.isValidFile
        ),
      job_title: Yup.string().required('Please enter job title'),
      job_role: Yup.string().required('Please select job role'),
      job_location: Yup.string().required('Please select job location'),
      category_name: Yup.string().required('Please select job category'),
      job_description: Yup.string().required('Please enter job description'),
      job_skill: Yup.string().required('Please enter job skill '),
      status: Yup.number().required('Please select status'),
      employment_type: Yup.string().required('Please enter employment type'),
      department: Yup.string().required('Please enter department'),
      travel_needed: Yup.string().required('Please enter travel_needed'),
      region: Yup.string().required('Please enter region'),
      experience: Yup.string().required('Please enter experience'),
      company_information: Yup.string().required(
        'Please enter company_information'
      ),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12  m-b-15">
                <h1>
                  Manage Jobs
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12">
                <form className="leadForm">
                  <div className="">
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={(e) => this.modalShowHandler(e, '')}
                    >
                      <i className="fas fa-plus m-r-5" /> Add Jobs
                    </button>
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      name="job_title"
                      id="search_job_title"
                      placeholder="Filter by Job Title"
                    />
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="status"
                      id="search_job_role"
                    >
                      <option value=""> Select Job Role </option>
                      {this.state.job_role_arr.map((val, i) => {
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
                      className="form-control"
                      name="status"
                      id="search_job_location"
                    >
                      <option value="">Select Job Location</option>
                      {this.state.job_location_arr.map((val, i) => {
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
                      className="form-control"
                      name="status"
                      id="search_category_name"
                    >
                      <option value="">Select Job Category</option>
                      {this.state.job_category_arr.map((val, i) => {
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
                      className="form-control"
                      name="status"
                      id="search_job_skill"
                    >
                      <option value=""> Select Job Skill </option>
                      {this.state.job_skill_arr.map((val, i) => {
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
                      className="form-control"
                      name="status"
                      id="search_status"
                    >
                      <option value="">Select Job Status</option>
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
                      onClick={(e) => this.jobSearch(e)}
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
                  <div className="clearfix"></div>
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.jobs}>
                  <TableHeaderColumn
                    isKey
                    dataField="job_title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="feature_image"
                    dataFormat={setJobImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="category_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Category
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="job_description"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Description
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="job_role"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Role
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="job_location"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Location
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="job_skill"
                    dataFormat={__htmlDecode(this)}
                  >
                    Job Skill
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                  >
                    Post Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="job_id"
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

                {/* ======= Image Modal ======== */}

                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Job Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.url} alt="job"></img>
                      </div>
                    </center>
                  </Modal.Body>
                </Modal>

                {/* ======= Add/Edit Jobs Modal ======== */}

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.jobId > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.jobId > 0
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
                              {this.state.jobId == 0 ? 'Add' : 'Edit'} Jobs
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Unique Job ID
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="unique_job_id"
                                      id="unique_job_id"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Job ID"
                                      autoComplete="off"
                                      value={values.unique_job_id}
                                    />
                                    {errors.unique_job_id &&
                                    touched.unique_job_id ? (
                                      <span className="errorMsg">
                                        {errors.unique_job_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Employment Type
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="employment_type"
                                      id="employment_type"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.employment_type}
                                    >
                                      <option key="-1" value="">
                                        Select Job Role
                                      </option>
                                      <option
                                        key=""
                                        value="permanent_full_time"
                                      >
                                        Permanent-Full Time
                                      </option>
                                      <option
                                        key=""
                                        value="contractual_full_time"
                                      >
                                        Contractual-Full Time
                                      </option>
                                      <option
                                        key=""
                                        value="contractual_part_time"
                                      >
                                        Contractual-Part Time
                                      </option>
                                    </Field>
                                    {errors.employment_type &&
                                    touched.employment_type ? (
                                      <span className="errorMsg">
                                        {errors.employment_type}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Title
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_title"
                                      id="job_title"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Job Title"
                                      autoComplete="off"
                                      value={values.job_title}
                                    />
                                    {errors.job_title && touched.job_title ? (
                                      <span className="errorMsg">
                                        {errors.job_title}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Department
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="department"
                                      id="department"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.department}
                                    >
                                      <option key="-1" value="">
                                        Select Department
                                      </option>
                                      <option key="" value="ent">
                                        ENT
                                      </option>
                                      <option key="" value="orthopedic">
                                        Orthopedic
                                      </option>
                                      <option key="" value="neurologist">
                                        Neurologist
                                      </option>
                                    </Field>
                                    {errors.department && touched.department ? (
                                      <span className="errorMsg">
                                        {errors.department}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Roles
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_role"
                                      id="job_role"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.job_role}
                                    >
                                      <option key="-1" value="">
                                        Select Job Role
                                      </option>
                                      {this.state.job_role_arr.map((val, i) => (
                                        <option key={i} value={val.value}>
                                          {val.label}
                                        </option>
                                      ))}
                                    </Field>
                                    {errors.job_role && touched.job_role ? (
                                      <span className="errorMsg">
                                        {errors.job_role}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Category
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="category_name"
                                      id="category_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.category_name}
                                    >
                                      <option key="-1" value="">
                                        Select Job Category
                                      </option>
                                      {this.state.job_category_arr.map(
                                        (val, i) => (
                                          <option
                                            key={val.id}
                                            value={val.value}
                                          >
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.category_name &&
                                    touched.category_name ? (
                                      <span className="errorMsg">
                                        {errors.category_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Skill
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_skill"
                                      id="job_skill"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.job_skill}
                                    >
                                      <option key="-1" value="">
                                        Select Job Skill
                                      </option>
                                      {this.state.job_skill_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.job_skill && touched.job_skill ? (
                                      <span className="errorMsg">
                                        {errors.job_skill}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Location
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_location"
                                      id="job_location"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.job_location}
                                    >
                                      <option key="-1" value="">
                                        Select Job Location
                                      </option>
                                      {this.state.job_location_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.job_location &&
                                    touched.job_location ? (
                                      <span className="errorMsg">
                                        {errors.job_location}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Travel Needed
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="travel_needed"
                                      id="travel_needed"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.travel_needed}
                                    >
                                      <option key="-1" value="">
                                        Select Travel Needed
                                      </option>
                                      <option key="" value="extensive">
                                        Extensive
                                      </option>
                                      <option key="" value="minimal">
                                        Minimal
                                      </option>
                                      <option key="" value="no_travel">
                                        No Travel
                                      </option>
                                    </Field>
                                    {errors.travel_needed &&
                                    touched.travel_needed ? (
                                      <span className="errorMsg">
                                        {errors.travel_needed}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Region
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="region"
                                      id="region"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.region}
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
                                    </Field>
                                    {errors.region && touched.region ? (
                                      <span className="errorMsg">
                                        {errors.region}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Experience
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="experience"
                                      id="experience"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.experience}
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
                                    </Field>
                                    {errors.experience && touched.experience ? (
                                      <span className="errorMsg">
                                        {errors.experience}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Company Information
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="company_information"
                                      id="company_information"
                                      component="textarea"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.company_information}
                                    >
                                      We are the veritable pioneer of medical
                                      diagnostics in India. Established in 1995,
                                      imbued with the vision of providing
                                      accurate diagnostics solutions, with
                                      ethical standards and care as its core
                                      values. Spreading from Srinagar to
                                      Kanyakumari, and from Imphal to Rajkot, we
                                      have presence across the length and
                                      breadth of India. Currently, we have more
                                      than 7000 collection points, 400+
                                      state-of-the- art laboratories, including
                                      10+Reference Labs and around 18 radiology
                                      centres. With simple to high- end tests,
                                      we serve 12 million customers and are
                                      trusted by 1 million doctors
                                    </Field>
                                    {errors.company_information &&
                                    touched.company_information ? (
                                      <span className="errorMsg">
                                        {errors.company_information}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={6}>
                                  <div className="form-group">
                                    <label>
                                      Job Description
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_description"
                                      id="job_description"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter job description"
                                      autoComplete="off"
                                      value={values.job_description}
                                    />
                                    {errors.job_description &&
                                    touched.job_description ? (
                                      <span className="errorMsg">
                                        {errors.job_description}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                                <Col xs={12} sm={12} md={6}>
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

                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      <span className="impField">*</span>
                                      <br />{' '}
                                      <i>{this.state.fileValidationMessage}</i>
                                      <br />{' '}
                                      <i>{this.state.validationMessage} </i>
                                    </label>
                                    <Field
                                      name="feature_image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="feature_image"
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
                                    {errors.feature_image &&
                                    touched.feature_image ? (
                                      <span className="errorMsg">
                                        {errors.feature_image}
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
                              {this.state.jobId > 0
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

export default Jobs;
