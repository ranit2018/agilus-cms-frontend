import React, { Component } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { Button, FormGroup } from "react-bootstrap";

import { Row, Col } from "react-bootstrap";

import API from "../../../shared/admin-axios";
import swal from "sweetalert";

import Layout from "../layout/Layout";
// import whitelogo from '../../../assets/images/drreddylogo_white.png';
import { htmlDecode } from '../../../shared/helper';
import whitelogo from '../../../assets/images/logo-white.svg';


const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  
  new_password: ""
};


class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminDetails: [],
      isLoading: true,
      showModalLoader: false
    };
  }

  componentDidMount() {
    this.getAdmin();
  }

  getAdmin() {
    API.get("adm/")
      .then(res => {
        console.log("ADmin details",res.data);
        this.setState({
          adminDetails: res.data.admin_details[0],
          isLoading: false
        });
        // console.log("00000000000",res.data.adminDetails)
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSubmitEvent = (values, actions) => {
    if (values.new_password) {
      const post_data = {
        first_name: values.first_name,
        last_name: values.last_name,
        
        email: values.email,
        password: values.new_password,
        group_id: this.state.adminDetails.group_id
      };
      this.setState({ showModalLoader: true });
      API.put(`/api/adm/update`, post_data)
        .then(res => {
          this.setState({ showModalLoader: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success"
          }).then(() => {
            actions.setSubmitting(false);
            this.getAdmin();
            values.new_password = '';
            values.confirm_password = '';
          });
        })
        .catch(err => {
          this.setState({ showModalLoader: false });
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        });

    } else {
      const post_data = {
        first_name: values.first_name,
        last_name: values.last_name,
        
        email: values.email,
        group_id: this.state.adminDetails.group_id
      };
      this.setState({ showModalLoader: true });
      API.put(`/api/adm/update`, post_data)
        .then(res => {
          this.setState({ showModalLoader: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success"
          }).then(() => {
            //window.location.reload();
            actions.setSubmitting(false);
            this.getAdmin();
          });
        })
        .catch(err => {
          this.setState({ showModalLoader: false });
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        });
    }


  };

  render() {
    const { adminDetails } = this.state;
    // console.log("*********",adminDetails);
    const newInitialValues = Object.assign(initialValues, {
      first_name: adminDetails.first_name ? htmlDecode(adminDetails.first_name) : "",
      last_name: adminDetails.last_name ? htmlDecode(adminDetails.last_name) : "",
      email: adminDetails.email ? htmlDecode(adminDetails.email) : "",
     
    });

    const validateLogin = Yup.object().shape({
      first_name: Yup.string().trim()
        .required("Please enter first name")
        .matches(/^[A-Za-z0-9\s]*$/, "Invalid first name format! Only alphanumeric and spaces are allowed")
        .max(30, "First name can be maximum 30 characters long"),
      last_name: Yup.string().trim()
        .required("Please enter last name")
        .min(1, "Last name can be minimum 1 characters long")
        .matches(/^[A-Za-z0-9\s]*$/, "Invalid lirst name format! Only alphanumeric and spaces are allowed")
        .max(30, "Last name can be maximum 30 characters long"),
      email: Yup.string().trim()
        .required("Please enter email")
        .email("Invalid email")
        .max(80, "Email can be maximum 80 characters long"),
      
      new_password: Yup.lazy(value =>
        !value
          ? Yup.string()
          : Yup.string()
            .min(4, "Password can be minimum 4 characters long")
            .max(12, "Password can be maximum 12 characters long")
            .optional()
      ),
      confirm_password: Yup.string().test(
        "match",
        "Confirm password do not match",
        function (confirm_password) {
          return confirm_password === this.parent.new_password;
        }
      )
    });

    if (this.state.isLoading) {
      return (
        <>
          <div className="loderOuter">
            <div className="loading_reddy_outer">
              <div className="loading_reddy" >
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
              <h1>
                Profile
                </h1>
            </section>
            <section className="content admin-profile">
              <div className="box box-default">
                <div className="box-body">
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={validateLogin}
                    //onSubmit={this.handleSubmitEvent}
                  >
                    {({ values, errors, touched, isValid, isSubmitting }) => {
                      return (
                        <Form>
                          {this.state.showModalLoader === true ? (
                            <div className="loading_reddy_outer">
                              <div className="loading_reddy" >
                                {/* <img src={whitelogo} alt="loader" /> */}
                              </div>
                            </div>
                          ) : ("")}
                          <Row>
                            <Col xs={12} sm={4} md={4}>
                              <FormGroup controlId="first_name" large="medium">
                                <label>
                                  First Name<span className="impField">*</span>
                                </label>
                                <Field
                                  name="first_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter first name"
                                  autoComplete="off"
                                />
                                {errors.first_name && touched.first_name ? (
                                  <span className="errorMsg">{errors.first_name}</span>
                                ) : null}
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={4} md={4}>
                              <FormGroup controlId="last_name" large="medium">
                                <label>
                                  Last Name<span className="impField">*</span>
                                </label>
                                <Field
                                  name="last_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter last name"
                                  autoComplete="off"
                                />
                                {errors.last_name && touched.last_name ? (
                                  <span className="errorMsg">{errors.last_name}</span>
                                ) : null}
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={4} md={4}>
                              <FormGroup controlId="email" large="medium">
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
                                  <span className="errorMsg">{errors.email}</span>
                                ) : null}
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row>
                      
                            <Col xs={12} sm={4} md={4}>
                              <FormGroup controlId="new_password" large="medium">
                                <label>New Password</label>
                                <Field
                                  name="new_password"
                                  type="password"
                                  className={`form-control`}
                                  placeholder="Enter new password"
                                  autoComplete="off"
                                />
                                {errors.new_password && touched.new_password ? (
                                  <span className="errorMsg">{errors.new_password}</span>
                                ) : null}
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={4} md={4}>
                              <FormGroup controlId="confirm_password" large="medium">
                                <label>Confirm Password</label>
                                <Field
                                  name="confirm_password"
                                  type="password"
                                  className={`form-control`}
                                  placeholder="Enter confirm password"
                                  autoComplete="off"
                                />
                                {errors.confirm_password && touched.confirm_password ? (
                                  <span className="errorMsg">{errors.confirm_password}</span>
                                ) : null}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Button
                            className={`btn btn-success btn-sm`}
                            type="submit"
                            disabled={isValid ? false : true}
                          >
                            {isSubmitting ? "Updating..." : "Update"}
                          </Button>
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
}

export default Profile;
