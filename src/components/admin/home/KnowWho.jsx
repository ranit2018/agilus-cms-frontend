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
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE_SVG, FILE_SIZE } from "../../../shared/helper";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";
const initialValues = {
    title: '',
    content: '',
    featured_text_1: '',
    featured_units_1: '',
    featured_text_2: '',
    featured_units_2: '',
    featured_image_1: '',
    featured_image_2: ''
};
const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const custStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Active";
    } else if (cell === 0) {
        return "Inactive";
    }
};


function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
    return (
        <OverlayTrigger
            overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
            placement="left"
            delayShow={300}
            delayHide={150}
            trigger={["hover"]}
        >
            <Link to={href} onClick={clicked}>
                {children}
            </Link>
        </OverlayTrigger>
    );
}


const setsocialLink = (refOBj) => (cell, row) => {
    return (

        <a href={row.link} target="_blank">
            {row.link}
        </a>

    );
};

const setImage = (refObj) => (cell, row) => {

    return (
        <img src={cell} alt="Offer Image" width="60" height="60"></img>
    );
};

const actionFormatter = (refObj) => (cell, row) => {
    return (
        <div className="actionStyle">
            {/* <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip> */}
            <LinkWithTooltip
                tooltip="Click to edit"
                href="#"
                clicked={(e) => refObj.modalShowHandler(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-edit" />
            </LinkWithTooltip>
            <LinkWithTooltip
                tooltip={"Click to change status"}
                // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
                href="#"
                id="tooltip-1"
            >
                <Switch
                    checked={row.status == 1 ? true : false}
                    uncheckedIcon={false}
                    onChange={() => refObj.chageStatus(row.id, row.status)}
                    height={20}
                    width={45}
                />
            </LinkWithTooltip>
            <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip>

        </div>
    );
};
class KnowWho extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            details: {},
            detailsId: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
        }
    }

    getList = (page = 1) => {


        API.get(
            `/api/home/know_who_we_are?page=${page}`
        )
            .then((res) => {
                this.setState({
                    list: res.data.data,
                    totalCount: res.data.count,
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

    confirmDelete = (event, id) => {
        event.preventDefault();
        swal({
            closeOnClickOutside: false,
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.deleteDetails(id);
            }
        });
    };

    deleteDetails = (id) => {
        API.delete(`/api/home/know_who_we_are/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getList(this.state.activePage);
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
        API.put(`/api/home/know_who_we_are/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
      }

    getDetails(id) {
        API.get(`/api/home/know_who_we_are/${id}`)
            .then((res) => {
                this.setState({
                    showModal: true,
                    details: res.data.data[0],
                    detailsId: id,

                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    handleSubmitEvent = async (values, actions) => {
        let url = '';
        let method = '';
        var formData = new FormData();
        var err_count = 0;

        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("featured_text_1", values.featured_text_1);
        formData.append("featured_units_1", values.featured_units_1);
        formData.append("featured_text_2", values.featured_text_2);
        formData.append("featured_units_2", values.featured_units_2);
        formData.append("status", values.status);

        if (this.state.detailsId > 0) {
            formData.append("is_featured_image_1", values.is_featured_image_1);
            formData.append("is_featured_image_2", values.is_featured_image_2);
        }
        if (this.state.featured_image_1) {
            if (this.state.featured_image_1.size > FILE_SIZE) {
                actions.setErrors({ featured_image_1: "The file exceeds maximum size." });
                actions.setSubmitting(false);
                err_count++;
            } else {
                let dimension = await getHeightWidth(this.state.featured_image_1)
                // .then(dimension => {
                const { height, width } = dimension;
                const knowWhoDimension = getResolution("know-who-are");
                console.log("height", height);
                console.log("width", width);
                if (height != knowWhoDimension.height || width != knowWhoDimension.width) {
                    actions.setErrors({ featured_image_1: "The file exceeds maximum height and width validation." });
                    actions.setSubmitting(false)
                    err_count++;
                } else {
                    formData.append("featured_image", this.state.featured_image_1);
                }
                //});
            }
        }
        console.log(err_count);
        if (this.state.featured_image_2) {
            if (this.state.featured_image_2.size > FILE_SIZE) {
                actions.setErrors({ featured_image_2: "The file exceeds maximum size." });
                actions.setSubmitting(false);
                err_count++;
            } else {
                let dimension = await getHeightWidth(this.state.featured_image_2);
                //.then(dimension => {
                const { height, width } = dimension;
                const knowWhoDimension = getResolution("know-who-are");
                console.log("height", height);
                console.log("width", width);
                if (height != knowWhoDimension.height || width != knowWhoDimension.width) {
                    actions.setErrors({ featured_image_2: "The file exceeds maximum height and width validation." });
                    actions.setSubmitting(false)
                    err_count++;
                } else {
                    formData.append("featured_image", this.state.featured_image_2);
                }
                //});
            }
        }
        console.log(err_count);
        if (this.state.detailsId > 0) {
            url = `/api/home/know_who_we_are/${this.state.detailsId}`;
            method = 'PUT';
        } else {
            url = `/api/home/know_who_we_are`;
            method = 'POST';
        }
        console.log("rrr ", err_count);
        if (err_count === 0) {
            API({
                method: method,
                url: url,
                data: formData
            }).then((res) => {
                this.modalCloseHandler();
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                    icon: "success",
                }).then(() => {
                    this.setState({ activePage: 1 });
                    this.getList(this.state.activePage);
                })
            }).catch((err) => {
                this.setState({ showModalLoader: false });
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
        } else {
            actions.setSubmitting(false);
        }
    }
    componentDidMount() {
        this.getList();
    }

    modalCloseHandler = () => {
        this.setState({ details: {}, detailsId: "", showModal: false, featured_image_1: "", featured_image_2: "", validationMessage: "", fileValidationMessage: "" })
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        this.setState({
            validationMessage: generateResolutionText('know-who-are'),
            fileValidationMessage: FILE_VALIDATION_MASSAGE_SVG
        })
        if (id) {
            this.getDetails(id)
        } else {
            this.setState({ details: {}, detailsId: "", showModal: true });
        }
    }

    handleContent = (value, setFieldValue) => {
        setFieldValue("content", value);
    };

    fileChangedHandler = (event, file, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);
        if (file === 'featured_image_1') {

            setFieldTouched("featured_image_1");
            setFieldValue("featured_image_1", event.target.value);

            const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/svg+xml"];
            if (!event.target.files[0]) {
                //Supported
                this.setState({
                    featured_image_1: "",
                    isValidFile1: true,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_1", false);
                }
                return;
            }
            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                //Supported
                this.setState({
                    featured_image_1: event.target.files[0],
                    isValidFile1: true,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_1", true);
                }
            } else {
                //Unsupported
                setErrors({ featured_image_1: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
                this.setState({
                    featured_image_1: "",
                    isValidFile1: false,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_1", false);
                }

            }

        } else if (file === 'featured_image_2') {

            setFieldTouched("featured_image_2");
            setFieldValue("featured_image_2", event.target.value);

            const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/svg+xml"];
            if (!event.target.files[0]) {
                //Supported
                this.setState({
                    featured_image_2: "",
                    isValidFile2: true,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_2", false);
                }
                return;
            }
            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                //Supported
                this.setState({
                    featured_image_2: event.target.files[0],
                    isValidFile2: true,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_2", true);
                }
            } else {
                //Unsupported
                setErrors({ featured_image_2: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
                this.setState({
                    featured_image_2: "",
                    isValidFile2: false,
                });
                if (this.state.detailsId > 0) {
                    setFieldValue("is_featured_image_2", false);
                }
            }
        }

    };




    render() {

        const { details } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            title: details.title ? htmlDecode(details.title) : '',
            content: details.content ? htmlDecode(details.content) : '',
            featured_text_1: details.featured_text_1 ? htmlDecode(details.featured_text_1) : '',
            featured_units_1: details.featured_units_1 ? details.featured_units_1 : '',
            featured_text_2: details.featured_text_2 ? htmlDecode(details.featured_text_2) : '',
            featured_units_2: details.featured_units_2 ? details.featured_units_2 : '',
            status: details.status || +details.status === 0
                ? details.status.toString()
                : "",
            featured_image_1: '',
            featured_image_2: '',
            is_featured_image_1: false,
            is_featured_image_2: false
        });

        let validateStopFlag = {};

        if (this.state.detailsId > 0) {
            validateStopFlag = Yup.object().shape({
                title: Yup.string().required("Please enter the title"),
                content: Yup.string().required("Please enter the content"),
                featured_text_1: Yup.string().required("Please enter featured text"),
                featured_units_1: Yup.string().required("Please enter featured units"),
                featured_text_2: Yup.string().required("Please enter featured text"),
                featured_units_2: Yup.string().required("Please enter featured units"),
                featured_image_1: Yup.string().notRequired().test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    (file) => {
                        if (file) {
                            return this.state.isValidFile1
                        } else {
                            return true
                        }
                    }
                ),
                featured_image_2: Yup.string().notRequired().test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    (file) => {
                        if (file) {
                            return this.state.isValidFile2
                        } else {
                            return true
                        }
                    }
                ),
                is_featured_image_1: Yup.string().optional(),
                is_featured_image_2: Yup.string().optional(),
                status: Yup.string().trim()
                    .required("Please select status")
                    .matches(/^[0|1]$/, "Invalid status selected")

            });
        } else {
            validateStopFlag = Yup.object().shape({
                title: Yup.string().required("Please enter the title"),
                content: Yup.string().required("Please enter the content"),
                featured_text_1: Yup.string().required("Please enter featured text"),
                featured_units_1: Yup.string().required("Please enter featured units"),
                featured_text_2: Yup.string().required("Please enter featured text"),
                featured_units_2: Yup.string().required("Please enter featured units"),
                featured_image_1: Yup.string().required("Please select the image").test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    () => this.state.isValidFile1
                ),
                featured_image_2: Yup.string().required("Please select the image").test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    () => this.state.isValidFile2
                ),
                status: Yup.string().trim()
                    .required("Please select status")
                    .matches(/^[0|1]$/, "Invalid status selected")

            });
        }




        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Know Who We Are
                <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={(e) => this.modalShowHandler(e, "")}
                                    >
                                        <i className="fas fa-plus m-r-5" /> Add Know Who We Are
                    </button>
                                </div>

                                {/* <div className="">
                                <button
                                    type="button"
                                    className="btn btn-info btn-sm"
                                    onClick={(e) => this.props.history.push('/add-blog')}
                                >
                                    <i className="fas fa-plus m-r-5" /> Add Blog
                </button>
                            </div> */}
                                {/* <form className="form">
                                <div className="">
                                    <input
                                        className="form-control"
                                        name="blog_title"
                                        id="blog_title"
                                        placeholder="Filter by Blog Title"
                                    />
                                </div>

                                <div className="">
                                    <select
                                        name="status"
                                        id="status"
                                        className="form-control"
                                    >
                                        <option value="">Select Blog Status</option>
                                        {this.state.selectStatus.map((val) => {
                                            return (
                                                <option value={val.value}>{val.label}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="">
                                    <input
                                        type="submit"
                                        value="Search"
                                        className="btn btn-warning btn-sm"
                                        onClick={(e) => this.blogSearch(e)}
                                    />
                                    {this.state.remove_search ? (
                                        <a
                                            onClick={() => this.clearSearch()}
                                            className="btn btn-danger btn-sm"
                                        >
                                            {" "}
                                        Remove{" "}
                                        </a>
                                    ) : null}
                                </div>
                                <div className="clearfix"></div>
                            </form> */}
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">

                                <BootstrapTable data={this.state.list}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="title"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Title
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="new_image_name_1"
                                        dataFormat={setImage(this)}
                                    >
                                        Featured Icon 1
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="new_image_name_2"
                                        dataFormat={setImage(this)}
                                    >
                                        Featured Icon 2
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="status"
                                        dataFormat={custStatus(this)}
                                    >
                                        Status
                </TableHeaderColumn>


                                    <TableHeaderColumn
                                        dataField="id"
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

                                {/* ======= Add Banner Modal ======== */}
                                <Modal
                                    show={this.state.showModal}
                                    onHide={() => this.modalCloseHandler()}
                                // backdrop="static"
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
                                                            {this.state.detailsId > 0 ? 'Edit Know Who We Are' : 'Add Know Who We Are'}
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Title
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="title"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Title"
                                                                            autoComplete="off"
                                                                            value={values.title}
                                                                        />
                                                                        {errors.title && touched.title ? (
                                                                            <span className="errorMsg">
                                                                                {errors.title}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Content
                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="content"
                                                                            as="textarea"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Content"
                                                                            autoComplete="off"
                                                                            value={values.content}
                                                                        />
                                                                        {errors.content && touched.content ? (
                                                                            <span className="errorMsg">
                                                                                {errors.content}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Featured Text 1
                                        <span className="impField">*</span>

                                                                        </label>
                                                                        <Field
                                                                            name="featured_text_1"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Featured Text 1"
                                                                            autoComplete="off"
                                                                            value={values.featured_text_1}
                                                                        />
                                                                        {errors.featured_text_1 && touched.featured_text_1 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_text_1}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Featured Unit 1
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="featured_units_1"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter  Featured Unit 1"
                                                                            autoComplete="off"
                                                                            value={values.featured_units_1}
                                                                        />
                                                                        {errors.featured_units_1 && touched.featured_units_1 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_units_1}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Featured Text 2
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="featured_text_2"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Featured Text 2"
                                                                            autoComplete="off"
                                                                            value={values.featured_text_2}
                                                                        />
                                                                        {errors.featured_text_2 && touched.featured_text_2 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_text_2}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Featured Unit 2
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="featured_units_2"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter  Featured Unit 2"
                                                                            autoComplete="off"
                                                                            value={values.featured_units_2}
                                                                        />
                                                                        {errors.featured_units_2 && touched.featured_units_2 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_units_2}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Choose Featured Icon 1
                                                                            {this.state.detailsId == 0 ?
                                                                                <span className="impField">*</span>
                                                                                : null
                                                                            }
                                                                            <br /> <i> {this.state.fileValidationMessage}
                                                                            </i>
                                                                            <br /> <i>{this.state.validationMessage}

                                                                            </i>

                                                                        </label>
                                                                        <Field
                                                                            name="featured_image_1"
                                                                            type="file"
                                                                            className={`form-control`}
                                                                            placeholder="Featured Image 1"
                                                                            autoComplete="off"
                                                                            onChange={(e) => {
                                                                                this.fileChangedHandler(
                                                                                    e,
                                                                                    'featured_image_1',
                                                                                    setFieldTouched,
                                                                                    setFieldValue,
                                                                                    setErrors
                                                                                );
                                                                            }}
                                                                        />
                                                                        {errors.featured_image_1 && touched.featured_image_1 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_image_1}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Choose Featured Icon 2
                                                                            {this.state.detailsId == 0 ?
                                                                                <span className="impField">*</span>
                                                                                : null
                                                                            }
                                                                            <br /> <i> {this.state.fileValidationMessage}
                                                                            </i>
                                                                            <br /> <i>{this.state.validationMessage}

                                                                            </i>
                                                                        </label>
                                                                        <Field
                                                                            name="featured_image_2"
                                                                            type="file"
                                                                            className={`form-control`}
                                                                            placeholder="Featured Image 2"
                                                                            autoComplete="off"
                                                                            onChange={(e) => {
                                                                                this.fileChangedHandler(
                                                                                    e,
                                                                                    'featured_image_2',
                                                                                    setFieldTouched,
                                                                                    setFieldValue,
                                                                                    setErrors
                                                                                );
                                                                            }}
                                                                        />
                                                                        {errors.featured_image_2 && touched.featured_image_2 ? (
                                                                            <span className="errorMsg">
                                                                                {errors.featured_image_2}
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
                                                                            {this.state.selectStatus.map(
                                                                                (status, i) => (
                                                                                    <option key={i} value={status.value}>
                                                                                        {status.label}
                                                                                    </option>
                                                                                )
                                                                            )}
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
                                                            className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                                                } m-r-10`}
                                                            type="submit"
                                                            disabled={isValid ? (isSubmitting ? true : false) : true}
                                                            >
                                                            {this.state.detailsId > 0
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
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}
export default KnowWho