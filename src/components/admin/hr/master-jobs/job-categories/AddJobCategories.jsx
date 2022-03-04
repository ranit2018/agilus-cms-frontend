import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
// import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import API from "../../../../../shared/admin-axios"
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../../shared/handle_error";
import whitelogo from "../../../../../assets/images/drreddylogo_white.png";
import Layout from "../../../layout/Layout";

const initialValues = {
  category_name: "",
  status: "",
};

class AddJobCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      
    };
  }

  handleSubmitEvent = (values, actions) => {
    // const { value } = this.state;
    
    let post_data = {
      category_name : values.category_name,
      status: values.status,  
    }

    console.log('post_data',post_data)

    let url = `api/job_portal/job/category`;
    let method = "POST";
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
            text: "Record added successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/master-jobs/jobcategories");
          });
        })
        .catch((err) => {
          // this.setState({
          //   value: "",
          //   selectedValue: "",
          // });
          if (err.data.status === 3) {
            // this.setState({
            //   value: "",
            //   selectedValue: "",
            // });
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }

  render() {
    const { selectedValue } = this.state;
    // const newInitialValues = Object.assign(initialValues, {
    //   category_name: "",
    //   status: "",
    // });

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
              Add Category
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
                  initialValues={initialValues}
                  validationSchema={validateStopFlag}
                  onSubmit={this.handleSubmitEvent}
                >
                  {({
                    values,
                    errors,
                    touched,
                    isValid,
                    isSubmitting,
                    // handleChange,
                    // setFieldTouched,
                    // setFieldValue,
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
                                    {console.log(errors.category_name)}
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
                          {this.state.banner_id > 0
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
export default AddJobCategories;
