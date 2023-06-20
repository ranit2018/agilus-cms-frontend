import React, { Component } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { Button, FormGroup, ControlLabel } from "react-bootstrap";
import Layout from "../layout/Layout";
import { Link, Redirect } from "react-router-dom";

// redux store
import { connect } from "react-redux";
import { adminLogin } from "../../../store/actions/auth";
import SRLLogoNew from "../../../assets/images/Agilus_White.png";

// import crypto from "crypto-browserify";
// import { Buffer } from "buffer/";
// import { Transform } from "stream-browserify";
// import axios from "../../../shared/axios";

// global.Buffer = Buffer;
// global.Transform = Transform;
// window.Transform = Transform;

const validateLogin = Yup.object().shape({
  username: Yup.string().trim().required("Please enter your username"),
  password: Yup.string()
    .trim()
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
    console.log("i am in");
    this.setState({ isLoading: true });
    this.props.submitLogin(
      values,
      () => {
        var element = document.getElementsByTagName("body");
        element[0].classList.remove("bg_color_adm");
        this.props.history.push("/dashboard");
      },
      setErrors
    );
  };

  // componentDidMount() {
  //   this.GET_KEY();
  // }

  // GET_KEY = () => {
  //   // Creating Client

  //   const client = crypto.createDiffieHellman(256);
  //   const clientPublicKey = client.generateKeys().toString("base64");

  //   // Get Server Public key
  //   axios
  //     .get(`/api/cms/profile`, {
  //       clientPublicKey: clientPublicKey,
  //     })
  //     .then((response) => {
  //       const serverPublicKey = Buffer.from(response.data, "base64");
  //       const sharedSecret = client.computeSecret(serverPublicKey, "base64");

  //       axios
  //         .post(`/api/cms/homeinfo`, {
  //           sharedSecret: sharedSecret,
  //         })
  //         .then((response) => {
  //           var iv = Buffer.from(response.data.iv, "hex");

  //           const decipher = crypto.createDecipheriv(
  //             "aes-256-cbc",
  //             sharedSecret,
  //             iv
  //           );

  //           let decrypted = decipher.update(
  //             response.data.encrypted,
  //             "hex",
  //             "utf8"
  //           );
  //           decrypted += decipher.final("utf8");

  //           localStorage.setItem(
  //             "agilus_cms_decrypted_KEY",
  //             JSON.stringify(decrypted.replaceAll('"', ""))
  //           );
  //         });
  //     });
  // };

  render() {
    const initialValues = {
      username: "",
      password: "",
    };

    let token = localStorage.getItem("admin_token");
    if (token) {
      return <Redirect to="/dashboard" />;
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
                        <img
                          src={SRLLogoNew}
                          alt="Agilus Diagnostics"
                          width={200}
                        />
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
      // console.log('data:', data)
      dispatch(adminLogin(data, onSuccess, setErrors)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
