import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { getAdminName } from "../../../shared/helper";
import { Row, Col, Button, Modal } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";

// connect to store
import { connect } from "react-redux";
import { adminLogout } from "../../../store/actions/auth";

import logoImage from "../../../assets/images/cipla_logo_white.png";
// import logoImageMini from '../../../assets/images/drreddylogosmall_white.png';
import userImage from "../../../assets/images/user2-160x160.jpg";
import SRLLogo from "../../../assets/images/SRL-Logo.png";
import SRLLogoNew from "../../../assets/images/logoJpg.933b09051.png";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";

const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  newpassword: "",
  confirm_Password: "",
};

class Header extends Component {
  constructor() {
    super();
    this.state = {
      openProfile: false,
      openNotification: false,
      toggleMenu: false,
      userDetails: "",
      showModal: false,
    };
  }

  displayProfile = () => {
    this.setState({
      openProfile: !this.state.openProfile,
      openNotification: false,
    });
  };

  displayNotification = () => {
    this.setState({
      openProfile: false,
      openNotification: !this.state.openNotification,
    });
  };

  setContainerRef = (node) => {
    this.containerRef = node;
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
    // for web page
    document.body.classList.add("sidebar-open");
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (this.containerRef && !this.containerRef.contains(event.target)) {
      this.setState({
        openProfile: false,
        openNotification: false,
      });
    }
  };

  handleModal = (event) => {
    API.get("adm/").then((res) => {
      this.setState({
        userDetails: res.data.admin_details[0],
        isLoading: false,
        showModal: true,
      });
    });
  };

  closeModal = (event) => {
    this.setState({
      showModal: false,
    });
  };

  handleToggleMenu = () => {
    if (document.body.classList.contains("sidebar-open")) {
      document.body.classList.remove("sidebar-open");
      document.body.classList.add("sidebar-collapse");
    } else if (document.body.classList.contains("sidebar-collapse")) {
      document.body.classList.add("sidebar-open");
      document.body.classList.remove("sidebar-collapse");
    }
  };

  logout = () => {
    this.props.dispatch(adminLogout());
    this.props.history.push("/");
  };
  handleSubmitEvent = (values, actions) => {
    const post_data = {
      first_name: values.first_name,
      last_name: values.last_name,
      // email: values.email,
    };
    if (values.newpassword) {
      post_data.password = values.newpassword;
    }
    API.put(`/adm/update_me`, post_data)
      .then((res) => {
        this.closeModal();
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Profile updated successfully.",
          icon: "success",
        });
      })
      .catch((err) => {
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
    if (this.props.isLoggedIn === false) return null;

    // display name
    const displayAdminName = getAdminName(localStorage.admin_token);
    const { userDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      newpassword: "",
      confirm_Password: "",
    });
    const validateStopFlag = Yup.object().shape({
      first_name: Yup.string()
        .min(1, "First name must be at least 1 characters")
        .max(30, "First name must be at most 30 characters")
        .required("Please enter the first name"),
      last_name: Yup.string()
        .min(1, "Last name must be at least 1 characters")
        .max(30, "Last name must be at most 30 characters")
        .required("Please enter the last name"),
      // email: Yup.string()
      //   .trim()
      //   .required("Please enter the email")
      //   .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/, "Enter valid email"),
      newpassword: Yup.string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
          "Password must be alphanumeric"
        ),
      confirm_Password: Yup.string()
        .label("Confirm password")
        .test("passwords-match", "Passwords is not match", function (value) {
          return this.parent.newpassword === value;
        }),
    });
    return (
      <header className="main-header">
        <Link to="/admin" className="logo">
          {/* <!-- mini logo for sidebar mini 50x50 pixels --> */}
          <span className="logo-mini"><img src={SRLLogoNew} width="50" alt="SRL" /></span>
          {/*<!-- logo for regular state and mobile devices -->*/}
          <span className="logo-lg">
          <img src={SRLLogoNew} width="100" alt="SRL" />
          </span>
        </Link>
        <nav className="navbar navbar-static-top">
          <span
            className="sidebar-toggle sidebar-toggle-dektop"
            onClick={this.handleToggleMenu}
            data-toggle="offcanvas"
            role="button"
          >
            <i className="fas fa-bars"></i>
          </span>

          <span
            className="sidebar-toggle sidebar-toggle-mobile"
            onClick={this.handleToggleMenu}
            data-toggle="offcanvas"
            role="button"
          >
            <i className="fas fa-bars"></i>
          </span>

          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <li
                ref={this.setContainerRef}
                className={
                  this.state.openProfile === true
                    ? "dropdown user user-menu open"
                    : "dropdown user user-menu"
                }
                onClick={this.displayProfile}
              >
                <span className="dropdown-toggle" data-toggle="dropdown">
                  <div className="adminImgSmall">
                  <img src={SRLLogo} alt="User Img" />
                  </div>
                  <span className="hidden-xs user-name">
                    SRL Diagnostics
                  </span>
                  <i className="fa fa-angle-down"></i>
                  <div className="clearFix"></div>
                </span>

                <ul className="dropdown-menu">
                  <li className="user-header">
                    <div className="adminImg">
                    <img
                      src={SRLLogo}
                      alt="User Img"
                    />
                    </div>
                   
                    <p>
                      {" "}
                      SRL Diagnostics CMS Admin{" "}
                    </p>
                  </li>
                  <li className="user-footer">
                    <div className="pull-left">
                      {/* <button
                        type="button"
                        className="btn btn-default btn-flat"
                        onClick={(e) => this.handleModal(e)}
                      >
                        <i /> Profile
                      </button> */}
                    </div>
                    <div className="pull-right">
                      <button
                        className="btn btn-default btn-flat"
                        onClick={this.logout}
                      >
                        Sign out
                      </button>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
        <Modal
          show={this.state.showModal}
          backdrop="static"
          onHide={this.closeModal}
        >
          <Formik
            initialValues={newInitialValues}
            validationSchema={validateStopFlag}
            onSubmit={this.handleSubmitEvent}
          >
            {({ values, errors, touched, isValid, isSubmitting }) => {
              return (
                <Form>
                  <Modal.Header closeButton>
                    <Modal.Title> Profile</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="contBox">
                      <Row>
                        <Col xs={12} sm={12} md={12}>
                          <div className="form-group">
                            <label>
                              First Name<span className="impField">*</span>
                            </label>
                            <Field
                              name="first_name"
                              type="text"
                              className={`form-control`}
                              placeholder="Enter first name"
                              autoComplete="off"
                              value={values.first_name}
                            />
                            {errors.first_name && touched.first_name ? (
                              <span className="errorMsg">
                                {errors.first_name}
                              </span>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={12} md={12}>
                          <div className="form-group">
                            <label>
                              Last Name<span className="impField">*</span>
                            </label>
                            <Field
                              name="last_name"
                              type="text"
                              className={`form-control`}
                              placeholder="Enter last name"
                              autoComplete="off"
                              value={values.last_name}
                            />
                            {errors.first_name && touched.last_name ? (
                              <span className="errorMsg">
                                {errors.last_name}
                              </span>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={12} md={12}>
                          <div className="form-group">
                            <label>
                              Email<span className="impField">*</span>
                            </label>
                            <Field
                              name="email"
                              type="text"
                              className={`form-control`}
                              placeholder="Enter the email"
                              autoComplete="off"
                              disabled
                              value={values.email}
                            />
                            {errors.email && touched.email ? (
                              <span className="errorMsg">{errors.email}</span>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={12} md={12}>
                          <div className="form-group">
                            <label>New Password</label>
                            <Field
                              name="newpassword"
                              type="text"
                              className={`form-control`}
                              placeholder="New password"
                              autoComplete="off"
                              value={values.newpassword}
                            />
                            {errors.newpassword && touched.newpassword ? (
                              <span className="errorMsg">
                                {errors.newpassword}
                              </span>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={12} md={12}>
                          <div className="form-group">
                            <label>Confirm Password</label>

                            <Field
                              name="confirm_Password"
                              type="text"
                              className={`form-control`}
                              placeholder="Confirm Password"
                              autoComplete="off"
                              value={values.confirm_Password}
                            />
                            {errors.confirm_Password &&
                              touched.confirm_Password ? (
                              <span className="errorMsg">
                                {errors.confirm_Password}
                              </span>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      {errors.message ? (
                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <span className="errorMsg">{errors.message}</span>
                          </Col>
                        </Row>
                      ) : (
                        ""
                      )}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                        } mr-2`}
                      type="submit"
                      disabled={isValid ? false : true}
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      className="btn btn-danger btn-sm"
                      onClick={this.closeModal}
                    >
                      {" "}
                      Cancel{" "}
                    </Button>
                  </Modal.Footer>
                </Form>
              );
            }}
          </Formik>
        </Modal>
      </header>
    );
  }
}


export default Header;
