import React, { Component } from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { Formik, Field, Form } from 'formik';
import { Editor } from '@tinymce/tinymce-react';
import API from '../../../shared/hrAxios';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../shared/handle_error';
import Select from 'react-select';
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from '../../../shared/helper';
import Layout from '../layout/Layout';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'; // If using WebPack and style-loader.

const stringFormat = (str) => {
  str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, ' ');
  str = str.split(' ');
  const strArr = [];
  console.log(str);

  for (let i in str) {
    if (str[i] !== '') {
      strArr.push(str[i]);
    }
  }
  const formatedString = strArr.join('-');
  return formatedString.toLowerCase();
};

class EditJob extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: '0', label: 'Inactive' },
        { value: '1', label: 'Active' },
      ],
      employment_arr: [],
      department_arr: [],
      travel_needed_arr: [],
      job_location_arr: [],
      experince_arr: [],
    };
  }

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched('featured_image');
    setFieldValue('featured_image', event.target.value);

    const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        featured_image: '',
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
        featured_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        featured_image:
          'Only files with the following extensions are allowed: png jpg jpeg',
      }); //Not working- So Added validation in "yup"
      this.setState({
        featured_image: '',
        isValidFile: false,
      });
    }
  };

  getJobEmployment = () => {
    API.get(`api/job_portal/job/employment`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].employment_name,
          });
        }
        this.setState({
          employment_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  getDepartmentArr = () => {
    API.get(`api/job_portal/job/department?page=1`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].job_department,
          });
        }
        this.setState({
          department_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  getTravelNeeded = () => {
    API.get(`api/job_portal/travel_needed`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].value,
          });
        }
        this.setState({
          travel_needed_arr: options,
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
  getExperinceData = () => {
    API.get(`api/job_portal/experience`)
      .then((res) => {
        let options = [];
        for (var i = 0; i < res.data.data.length; i++) {
          options.push({
            value: res.data.data[i].id,
            label: res.data.data[i].value,
          });
        }
        this.setState({
          experince_arr: options,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };
  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText('blog'),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
    this.getJobEmployment();
    this.getDepartmentArr();
    this.getTravelNeeded();
    this.getlocationArr();
    this.getExperinceData();
  }

  //   handleSubmitEventUpdate = async (values, actions) => {
  //     let postdata = {
  //       job_id: values.job_id,
  //       job_employment: values.job_employment,
  //       job_department: values.job_department,
  //       job_location: values.job_location,
  //       travel_needed: values.travel_type,
  //       region: values.region,
  //       experience: values.experience,
  //       company_information: values.company_information,
  //       status: String(values.status),
  //       job_description: values.job_description,
  //     };

  //     let url = `/api/job_portal/job/${this.state.jobId}`;
  //     let method = 'PUT';

  //     API({
  //       method: method,
  //       url: url,
  //       data: postdata,
  //     })
  //       .then((res) => {
  //         this.setState({ showModal: false });
  //         swal({
  //           closeOnClickOutside: false,
  //           title: 'Success',
  //           text: 'Updated Successfully',
  //           icon: 'success',
  //         }).then(() => {
  //           this.getJobsList();
  //         });
  //       })
  //       .catch((err) => {
  //         this.setState({ closeModal: true, showModalLoader: false });
  //         if (err.data.status === 3) {
  //           showErrorMessage(err, this.props);
  //         } else {
  //           actions.setErrors(err.data.errors);
  //           actions.setSubmitting(false);
  //         }
  //       });
  //   };

  render() {
    const { jobDetails } = this.props.location.state;
    console.log('jobDetails:', jobDetails.job_id);
    this.handleSubmitEventUpdate = async (values, actions) => {
      let postdata = {
        job_id: values.job_id,
        job_employment: String(values.job_employment),
        job_department: String(values.job_department),
        job_location: String(values.job_location),
        travel_needed: String(values.travel_type),
        region: String(values.region),
        experience: String(values.experience),
        company_information: values.company_information,
        status: String(values.status),
        job_description: values.job_description,
        job_designation: values.job_designation,
      };

      let url = `/api/job_portal/job/${jobDetails.id}`;
      let method = 'PUT';

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
            text: 'Updated Successfully',
            icon: 'success',
          }).then(() => {
            this.props.history.push('/hr/jobs');
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
    const newInitialValues = {
      job_id: htmlDecode(jobDetails.job_id),
      job_employment: jobDetails.employment_id,
      job_department: jobDetails.department_id,

      job_location: htmlDecode(jobDetails.job_location),
      travel_type: jobDetails.travel_type_id,
      region: jobDetails.region_id,
      experience: jobDetails.experience_id,
      company_information: htmlDecode(jobDetails.company_information),
      job_description: htmlDecode(jobDetails.job_description),
      status: jobDetails.status,
      job_designation: htmlDecode(jobDetails.job_designation),
    };
    const validateStopFlag = Yup.object().shape({
      job_employment: Yup.string().required('Please enter employment type'),
      job_department: Yup.string().required('Please enter department'),
      job_location: Yup.string().required('Please select job location'),
      travel_type: Yup.string().required('Please enter travel_needed'),
      region: Yup.string().required('Please enter region'),
      experience: Yup.string().required('Please enter experience'),
      company_information: Yup.string().required(
        'Please enter company_information'
      ),
      job_description: Yup.string().required('Please enter job description'),

      status: Yup.number().required('Please select status'),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Job
              <small />
            </h1>
            <input
              type="button"
              value="Go Back"
              className="btn btn-warning btn-sm"
              onClick={() => {
                window.history.go(-1);
                return false;
              }}
              style={{ right: '9px', position: 'absolute', top: '13px' }}
            />
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <Formik
                  initialValues={newInitialValues}
                  validationSchema={validateStopFlag}
                  onSubmit={this.handleSubmitEventUpdate}
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
                        <Modal.Body>
                          <div className="contBox">
                            <Row>
                              <Col xs={12} sm={12} md={6}>
                                <div className="form-group">
                                  <label>
                                    Unique Job ID
                                    <span className="impField">*</span>
                                  </label>
                                  <Field
                                    name="job_id"
                                    id="job_id"
                                    type="text"
                                    className={`form-control`}
                                    placeholder="Enter Job ID"
                                    autoComplete="off"
                                    value={values.job_id}
                                  />
                                  {errors.job_id && touched.job_id ? (
                                    <span className="errorMsg">
                                      {errors.job_id}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                              <Col xs={12} sm={12} md={6}>
                                <div className="form-group">
                                  <label>
                                    Job Designation
                                    <span className="impField">*</span>
                                  </label>
                                  <Field
                                    name="job_designation"
                                    id="job_designation"
                                    type="text"
                                    className={`form-control`}
                                    placeholder="Enter Job Designation"
                                    autoComplete="off"
                                    value={values.job_designation}
                                  />
                                  {errors.job_designation &&
                                  touched.job_designation ? (
                                    <span className="errorMsg">
                                      {errors.job_designation}
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
                                    name="job_employment"
                                    id="job_employment"
                                    component="select"
                                    className={`selectArowGray form-control`}
                                    autoComplete="off"
                                    value={values.job_employment}
                                  >
                                    <option key="-1" value="">
                                      Select Job Role
                                    </option>
                                    {this.state.employment_arr.map((val, i) => (
                                      <option key={i} value={val.value}>
                                        {val.label}
                                      </option>
                                    ))}
                                  </Field>
                                  {errors.job_employment &&
                                  touched.job_employment ? (
                                    <span className="errorMsg">
                                      {errors.job_employment}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>

                              <Col xs={12} sm={12} md={6}>
                                <div className="form-group">
                                  <label>
                                    Department
                                    <span className="impField">*</span>
                                  </label>
                                  <Field
                                    name="job_department"
                                    id="job_department"
                                    component="select"
                                    className={`selectArowGray form-control`}
                                    autoComplete="off"
                                    value={values.job_department}
                                  >
                                    <option key="-1" value="">
                                      Select Department
                                    </option>
                                    {this.state.department_arr.map((val, i) => (
                                      <option key={i} value={val.value}>
                                        {val.label}
                                      </option>
                                    ))}
                                  </Field>
                                  {errors.job_department &&
                                  touched.job_department ? (
                                    <span className="errorMsg">
                                      {errors.job_department}
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
                                    type="text"
                                    className={`form-control`}
                                    autoComplete="off"
                                    value={values.job_location}
                                  ></Field>
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
                                    name="travel_type"
                                    id="travel_type"
                                    component="select"
                                    className={`selectArowGray form-control`}
                                    autoComplete="off"
                                    value={values.travel_type}
                                  >
                                    <option key="-1" value="">
                                      Select Travel Needed
                                    </option>
                                    {this.state.travel_needed_arr.map(
                                      (val, i) => (
                                        <option key={i} value={val.value}>
                                          {val.label}
                                        </option>
                                      )
                                    )}
                                  </Field>
                                  {errors.travel_type && touched.travel_type ? (
                                    <span className="errorMsg">
                                      {errors.travel_type}
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
                                    {this.state.job_location_arr.map(
                                      (val, i) => (
                                        <option key={i} value={val.value}>
                                          {val.label}
                                        </option>
                                      )
                                    )}
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
                                    {this.state.experince_arr.map((val, i) => (
                                      <option key={i} value={val.value}>
                                        {val.label}
                                      </option>
                                    ))}
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

                                  <Editor
                                    initialValue={values.company_information}
                                    init={{
                                      height: 350,
                                      menubar: false,
                                      plugins: [
                                        'advlist autolink lists link image charmap print preview anchor',
                                        'searchreplace visualblocks code fullscreen',
                                        'insertdatetime media table paste code help wordcount',
                                      ],
                                      toolbar:
                                        'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ',
                                      content_style:
                                        'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                      file_browser_callback_types: 'image',
                                      file_picker_callback: function (
                                        callback,
                                        value,
                                        meta
                                      ) {
                                        if (meta.filetype == 'image') {
                                          var input =
                                            document.getElementById('my-file');
                                          input.click();
                                          input.onchange = function () {
                                            var file = input.files[0];
                                            var reader = new FileReader();
                                            reader.onload = function (e) {
                                              console.log(
                                                'name',
                                                e.target.result
                                              );
                                              callback(e.target.result, {
                                                alt: file.name,
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          };
                                        }
                                      },
                                      paste_data_images: true,
                                    }}
                                    onEditorChange={(value) =>
                                      setFieldValue(
                                        'company_information',
                                        value
                                      )
                                    }
                                  />

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
                              <Col md={12}>
                                <div className="form-group">
                                  <label>
                                    Job Description
                                    <span className="impField">*</span>
                                  </label>
                                  {/* <Field
                                    name="job_description"
                                    id="job_description"
                                    type="textarea"
                                    rows="10"
                                    className={`form-control`}
                                    placeholder="Enter job description"
                                    autoComplete="off"
                                    value={values.job_description}
                                  /> */}
                                  <Editor
                                    value={values.job_description}
                                    init={{
                                      height: 350,
                                      menubar: false,
                                      plugins: [
                                        'advlist autolink lists link image charmap print preview anchor',
                                        'searchreplace visualblocks code fullscreen',
                                        'insertdatetime media table paste code help wordcount',
                                      ],
                                      toolbar:
                                        'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ',
                                      content_style:
                                        'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                      file_browser_callback_types: 'image',
                                      file_picker_callback: function (
                                        callback,
                                        value,
                                        meta
                                      ) {
                                        if (meta.filetype == 'image') {
                                          var input =
                                            document.getElementById('my-file');
                                          input.click();
                                          input.onchange = function () {
                                            var file = input.files[0];
                                            var reader = new FileReader();
                                            reader.onload = function (e) {
                                              console.log(
                                                'name',
                                                e.target.result
                                              );
                                              callback(e.target.result, {
                                                alt: file.name,
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          };
                                        }
                                      },
                                      paste_data_images: true,
                                    }}
                                    onEditorChange={(value) =>
                                      setFieldValue('job_description', value)
                                    }
                                  />
                                  {errors.job_description &&
                                  touched.job_description ? (
                                    <span className="errorMsg">
                                      {errors.job_description}
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
                            // disabled={
                            //   isValid ? (isSubmitting ? true : false) : true
                            // }
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
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default EditJob;
