import React, { Component } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { Button, FormGroup, ControlLabel } from "react-bootstrap";
import Layout from "../layout/Layout";
import { Link, Redirect } from "react-router-dom";

// redux store
import { connect } from "react-redux";
import { adminLogin } from "../../../store/actions/auth";
import { isAdminCheck } from "../../../shared/helper";

const validateLogin = Yup.object().shape({
  username: Yup.string().trim().required("Please enter your username"),
  password: Yup.string().trim()
    .required("Please enter your password")
    .min(8, "Password must be at least 8 characters long"),
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      username: "",
      password: "",
    };

    var element = document.getElementsByTagName("body");
    element[0].classList.add("bg_color_adm");
  }

  handleSubmitEvent = (values, { setErrors }) => {
    this.setState({ isLoading: true });
    this.props.submitLogin(
      values,
      () => {
        var element = document.getElementsByTagName("body");
        element[0].classList.remove("bg_color_adm");
        // check to confirm isadmin
        if(isAdminCheck("token")){
          this.props.history.push("/admin/dashboard");
        }else{
          this.props.history.push("/hr/dashboard");
        }
      },
      setErrors
    );
  };

  render() {
    const initialValues = {
      username: "",
      password: "",
    }

    let token = localStorage.getItem("admin_token");
    if (token) {
      if(isAdminCheck(token)){
        return <Redirect to="/admin/dashboard" />;
      }else{
        return <Redirect to="/hr/dashboard" />;
      }
    }

    return (
      <Layout {...this.props}>
        <div className="login-box">
          <Formik
            initialValues={initialValues}
            validationSchema={validateLogin}
            onSubmit={this.handleSubmitEvent}
          >
            {({ values, errors, touched, isValid, isSubmitting }) => {
              return (
                <Form>
                  <div className="login-logo">
                    <Link to="/" className="logo">
                      <span className="logo-mini">
                        <img src="../img/logoJpg.933b0905.png" alt="SRL Diagnostics" />
                      </span>
                    </Link>
                  </div>
                  <div className="login-box-body">
                    <p className="login-box-msg">Login to Your Account</p>
                    <div className="form-group has-feedback">
                      <FormGroup controlId="username">
                        <ControlLabel>Username</ControlLabel>
                        <Field
                          name="username"
                          type="text"
                          className={`form-control`}
                          placeholder="Enter username"
                          autoComplete="off"
                        />
                        {errors?.username && touched?.username ? (
                          <span className="errorMsg">{errors?.username}</span>
                        ) : null}
                      </FormGroup>
                    </div>
                    <div className="form-group has-feedback">
                      <FormGroup controlId="password">
                        <ControlLabel>Password</ControlLabel>
                        <Field
                          name="password"
                          type="password"
                          className={`form-control`}
                          placeholder="Enter password"
                          autoComplete="off"
                        />
                        {errors?.password && touched?.password ? (
                          <span className="errorMsg">{errors?.password}</span>
                        ) : null}
                      </FormGroup>
                    </div>
                    <div className="row">
                      <div className="col-xs-8"></div>
                      <div className="col-xs-4">
                        <Button
                          className={`btn btn-primary btn-block btn-flat`}
                          type="submit"
                          disabled={isValid ? false : true}
                        >
                          Login
                        </Button>
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    submitLogin: (data, onSuccess, setErrors) =>
      dispatch(adminLogin(data, onSuccess, setErrors)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
