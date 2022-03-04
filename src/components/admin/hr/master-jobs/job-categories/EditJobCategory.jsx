import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../../../shared/admin-axios"
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../../shared/handle_error";
import whitelogo from "../../../../../assets/images/drreddylogo_white.png";
import Layout from "../../../layout/Layout";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.


const initialValues = {
    category_name: "",
    status: "",
  };

class EditJobCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category_name: "",
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      category_name_id: this.props.match.params.id,
    };
  }

  handleSubmitEvent = (values, actions) => {
    let post_data = {
      category_name: values.category_name,
      status: values.status,
    }
    let method = "";
    let url = "api/job_portal/job/category/";
    
    method = "PUT";
    url = `api/job_portal/job/category/${this.props.match.params.id}`;
    
      API({
        method: method,
        url: url,
        data: post_data,
      })
        .then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/master-jobs/jobcategories");
          });
        })
        .catch((err) => {
          // this.setState({ showModalLoader: false });
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

  render() {
    const { NewCategoryDetails } = this.props.location.state;
    // console.log('NewCategoryDetails',NewCategoryDetails)
    // console.log('NewCategoryDetails',Object.keys(NewCategoryDetails).length)

    const newInitialValues = Object.assign(initialValues, {
      category_name: NewCategoryDetails && Object.keys(NewCategoryDetails).length > 0 ? NewCategoryDetails.category_name : '',
      status: NewCategoryDetails && Object.keys(NewCategoryDetails).length > 0 ? NewCategoryDetails.status : '',
    });

    const validateStopFlag = Yup.object().shape({
      category_name: Yup.string().required("Please enter category"),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Blog
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
              style={{ right: "9px", position: "absolute", top: "13px" }}
            />
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
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
                  }) => {
                    return (
                      <Form>
                        <div className="contBox">
                        <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Category Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="category_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter job category"
                                  // onChange={handleChange}                                 
                                  // autoComplete="off"
                                  value={values.category_name}
                                />
                                {errors.category_name &&
                                touched.category_name ? (
                                  <span className="errorMsg">
                                    {errors.category_name}
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
                            isValid ? "btn-custom-green" : "btn-disable"
                          } m-r-10`}
                          type="submit"
                          disabled={
                            isValid ? (isSubmitting ? true : false) : true
                          }
                        >
                          {this.props.match.params.id > 0
                            ? isSubmitting
                              ? "Updating..."
                              : "Update"
                            : isSubmitting
                            ? "Submitting..."
                            : "Submit"}
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
export default EditJobCategory;
