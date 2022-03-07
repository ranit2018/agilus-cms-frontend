import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
// import { Link } from "react-router-dom";
import { Formik, Field, Form } from 'formik';
import API from '../../../../shared/admin-axios';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../../shared/handle_error';
import whitelogo from '../../../../assets/images/drreddylogo_white.png';
import Layout from '../../layout/Layout';

const initialValues = {
  job_skill: '',
  status: '',
};

class AddJobSkill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      selectStatus: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
      ],
    };
  }

  handleSubmitEvent = (values, actions) => {
    let post_data = {
      job_skill: values.job_skill,
      status: values.status,
    };
    
    let url = `api/job_portal/job/skill`;
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
          this.props.history.push('/hr/master-jobs/job-skills');
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

  render() {
    // const { selectedValue } = this.state;

    const validateStopFlag = Yup.object().shape({
      job_skill: Yup.string().required('Please enter job skill'),
      status: Yup.string()
        .trim()
        .required('Please select status')
        .matches(/^[0|1]$/, 'Invalid status selected'),
    });
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Job Skill
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
                  initialValues={initialValues}
                  validationSchema={validateStopFlag}
                  onSubmit={this.handleSubmitEvent}
                >
                  {({ values, errors, touched, isValid, isSubmitting }) => {
                    return (
                      <Form>
                        {this.state.showModalLoader === true ? (
                          <div className="loading_reddy_outer">
                            <div className="loading_reddy">
                              <img src={whitelogo} alt="loader" />
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Job Role
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="job_skill"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter job skill"
                                  value={values.job_skill}
                                />
                                {errors.job_skill && touched.job_skill ? (
                                  <span className="errorMsg">
                                    {errors.job_skill}
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
                        <button
                          className={`btn btn-success btn-sm ${
                            isValid ? 'btn-custom-green' : 'btn-disable'
                          } m-r-10`}
                          type="submit"
                          disabled={
                            isValid ? (isSubmitting ? true : false) : true
                          }
                        >
                          {this.state.banner_id > 0
                            ? isSubmitting
                              ? 'Updating...'
                              : 'Update'
                            : isSubmitting
                            ? 'Submitting...'
                            : 'Submit'}
                        </button>
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
export default AddJobSkill;
