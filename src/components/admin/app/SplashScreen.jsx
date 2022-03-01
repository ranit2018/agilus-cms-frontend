import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Button, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import { text } from 'body-parser';


class EBookUpload extends Component {
    constructor(props) {
        super(props)

        this.state = {
            screen: [],
            detailsId: 0,
            isLoading: false,
            showModal: false,
            screenDetails: '',
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
        }
        this.inputFile = React.createRef();
    }

    getSplashScreen = (page = 1) => {


        API.get(
            `/api/app/splash_screen/`
        )
            .then((res) => {
                this.setState({
                    screen: res.data.data[0],
                    isLoading: false,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });

    }

    handleFileUpload = e => {
        const { files } = e.target;
        console.log(files);
    };


    componentDidMount() {
        this.getSplashScreen();
    }

    fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);
        setFieldTouched("featured_image");
        setFieldValue("featured_image", event.target.value);

        const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
        if (!event.target.files[0]) {
            //Supported
            this.setState({
                featured_image: "",
                isValidFile: true,
            });
            return;
        }
        if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
            //Supported
            this.setState({
                featured_image: event.target.files[0],
                isValidFile: true,
            });
        } else {
            //Unsupported
            setErrors({ featured_image: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
            this.setState({
                featured_image: "",
                isValidFile: false,
            });
        }
    };

    modalCloseHandler = () => {
        this.setState({ showModal: false });
    };

    getSplashScreenDEtails = (id) => {
        API.get(`/api/app/splash_screen/${id}`)
            .then((res) => {
                this.setState({
                    screenDetails: res.data.data[0],
                    showModal: true
                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    modalShowHandler = (event) => {
        event.preventDefault();
        this.getSplashScreenDEtails(this.state.screen.id);
    };

    handleSubmitEvent = async (values, actions) => {
        var formData = new FormData();
        formData.append("text", values.text);
        if (this.state.featured_image) {
            const dimension = await getHeightWidth(this.state.featured_image)
            const { height, width } = dimension;
            const logoDimension = getResolution("application-logo");
            if (this.state.featured_image > FILE_SIZE) {
                actions.setErrors({ featured_image: "The file exceeds maximum size." })
                actions.setSubmitting(false);
            } else {
                if (height != logoDimension.height || width != logoDimension.width) {
                    actions.setErrors({ featured_image: "The file exceeds maximum height and width validation." });
                    actions.setSubmitting(false);
                } else {
                    formData.append("featured_image", this.state.featured_image);
                    API.put(`/api/app/splash_screen/${this.state.screen.id}`, formData)
                        .then(res => {
                            this.setState({ showModal: false, featured_image: "" })
                            swal({
                                closeOnClickOutside: false,
                                title: "Success",
                                text: "Updated Successfully",
                                icon: "success"
                            }).then(() => {
                                this.getSplashScreen();
                            });
                        })
                        .catch(err => {
                            this.setState({ closeModal: true, showModalLoader: false });
                            if (err.data.status === 3) {
                                showErrorMessage(err, this.props);
                            } else {
                                actions.setErrors(err.data.errors);
                                actions.setSubmitting(false);
                            }
                        });
                }
            }
        } else {
            API.put(`/api/app/splash_screen/${this.state.screen.id}`, formData)
                .then(res => {
                    this.setState({ showModal: false, featured_image: "" })
                    swal({
                        closeOnClickOutside: false,
                        title: "Success",
                        text: "Updated Successfully",
                        icon: "success"
                    }).then(() => {
                        this.getSplashScreen();
                    });
                })
                .catch(err => {
                    this.setState({ closeModal: true, showModalLoader: false });
                    if (err.data.status === 3) {
                        showErrorMessage(err, this.props);
                    } else {
                        actions.setErrors(err.data.errors);
                        actions.setSubmitting(false);
                    }
                });
        }


    }

    render() {
        const { screenDetails } = this.state;

        const newInitialValues = {
            featured_image: "",
            text: screenDetails.text ? htmlDecode(screenDetails.text) : ""
        };

        const validateStopFlag = Yup.object().shape({
            featured_image: Yup.string().notRequired().test(
                "image",
                "Only files with the following extensions are allowed: png jpg jpeg",
                (image) => {
                    if (image) {
                        return this.state.isValidFile
                    } else {
                        return true
                    }
                }
            ),
            text: Yup.string().optional().max(100)
        });

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Splash Screen
                <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">
                                    <input
                                        type="file"
                                        ref={this.inputFile}
                                        style={{ display: 'none' }}
                                        onChange={this.fileChangedHandler}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={this.modalShowHandler}
                                    >
                                        <i className="far fa-edit" /> Edit Splash Screen

                                  </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body-mobile">
                                <div>
                                    <img src={this.state.screen.splash_screen_image} />
                                    <p>{this.state.screen.text}</p>
                                </div>
                            </div>
                        </div>
                    </section >
                    <Modal
                        show={this.state.showModal}
                        onHide={() => this.modalCloseHandler()}
                        backdrop="static"
                    >
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
                                setErrors
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
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                Edit Spalash Screen
                              </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <div className="contBox">
                                                <Row>
                                                    <Col xs={12} sm={12} md={12}>
                                                        <div className="form-group">
                                                            <label>
                                                                Upload Image
                                                                <br /> <i> (Image type should be .png,.jpeg,.jpg,.svg and maximum file size is 2 mb) </i>
                                                                <br /> <i> (The image resolution should be within 300px and height 240px) </i>

                                                            </label>
                                                            <Field
                                                                name="featured_image"
                                                                type="file"
                                                                className={`form-control`}
                                                                autoComplete="off"
                                                                onChange={(e) => {
                                                                    this.fileChangedHandler(
                                                                        e,
                                                                        setFieldTouched,
                                                                        setFieldValue,
                                                                        setErrors
                                                                    );
                                                                }}
                                                            />
                                                            {errors.featured_image && touched.featured_image ? (
                                                                <span className="errorMsg">{errors.featured_image}</span>
                                                            ) : null}
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs={12} sm={12} md={12}>
                                                        <div className="form-group">
                                                            <label>
                                                                Text
                                    </label>
                                                            <Field
                                                                name="text"
                                                                type="text"
                                                                className={`form-control`}
                                                                placeholder="Enter Banner Text"
                                                                autoComplete="off"
                                                                value={values.text}
                                                            />
                                                            {errors.text && touched.text ? (
                                                                <span className="errorMsg">{errors.text}</span>
                                                            ) : null}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <button
                                                className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                                    } m-r-10`}
                                                type="submit"
                                                disabled={isValid ? (isSubmitting ? true : false) : true}
                                                >
                                                {this.state.screen.id > 0
                                                    ? isSubmitting
                                                        ? "Updating..."
                                                        : "Update"
                                                    : isSubmitting
                                                        ? "Submitting..."
                                                        : "Submit"}
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
                </div >
            </Layout >
        )
    }
}
export default EBookUpload

