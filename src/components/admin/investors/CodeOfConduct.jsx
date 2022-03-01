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
import { htmlDecode,  getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE, FILE_VALIDATION_MASSAGE_SVG } from "../../../shared/helper";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";
const initialValues = {
    title: '',
    content: '',
    file: '',
    status: ''
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

const setBlogImage = (refObj) => (cell, row) => {

    return (
        <div style={{
            display: 'flex', width: '75px', height: '75px', background: '#01AEBB',
            justifyContent: 'center', alignItems: 'center', borderRadius: '10px'
        }}>
            {/* <img src={cell} alt="Profile Picture" width="60" height="60" onClick={(e) => refObj.imageModalShowHandler(row.new_image_name)}></img> */}

            <img src={cell} alt="Profile Picture" width="60" height="60"></img>


        </div>
    );
};

class CodeOfConduct extends Component {
    constructor(props) {
        super(props)

        this.state = {
            conductList: [],
            conductDetils: {},
            conductId: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
            thumbNailModal: false
        }
    }

    getCodeOfConduct = (page = 1) => {


        API.get(
            `/api/investor/code_of_conduct?page=${page}`
        )
            .then((res) => {
                this.setState({
                    conductList: res.data.data,
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
                this.deleteConduct(id);
            }
        });
    };

    deleteConduct = (id) => {
        API.delete(`/api/investor/code_of_conduct/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCodeOfConduct(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    getConductDetils(id) {
        API.get(`/api/investor/code_of_conduct/${Number(id)}`)
            .then((res) => {
                this.setState({
                    showModal: true,
                    conductDetils: res.data.data[0],
                    conductId: id,

                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    chageStatus = (cell, status) => {
        API.put(`/api/investor/code_of_conduct/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record updated successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCodeOfConduct(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    }

    handleSubmitEvent = async (values, actions) => {
        let url = '';
        let method = '';
        const formData = new FormData();
        let err_count = 0;
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('status', values.status);
        if (this.state.file) {
            if (this.state.file.size > FILE_SIZE) {
                actions.setErrors({ file: "The file exceeds maximum size." });
                actions.setSubmitting(false);
                err_count++;
            } else {
                const dimension = await getHeightWidth(this.state.file)
                const { height, width } = dimension;
                const codeofConductDimension = getResolution("code_of_conduct");
                console.log("height", height);
                console.log("width", width);
                if (height != codeofConductDimension.height || width != codeofConductDimension.width) {
                    actions.setErrors({ file: "The file exceeds maximum height and width validation." });
                    actions.setSubmitting(false)
                    err_count++;
                } else {
                    formData.append("file", this.state.file);
                }
            }
        }
        if (this.state.conductId > 0) {
            url = `/api/investor/code_of_conduct/${this.state.conductId}`;
            method = 'PUT';
        } else {
            url = `/api/investor/code_of_conduct/`;
            method = 'POST';
        }
        if (err_count == 0) {
            API({
                method: method,
                url: url,
                data: formData,
            }).then((res) => {
                this.setState({ showModal: false });
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCodeOfConduct(this.state.activePage);
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
        }
    }
    componentDidMount() {
        this.getCodeOfConduct();
    }


    fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);
        setFieldTouched("file");
        setFieldValue("file", event.target.value);

        const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/svg+xml"];
        if (!event.target.files[0]) {
            //Supported
            this.setState({
                file: "",
                isValidFile: true,
            });
            return;
        }
        if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
            //Supported
            this.setState({
                file: event.target.files[0],
                isValidFile: true,
            });
        } else {
            //Unsupported
            setErrors({ file: "Only files with the following extensions are allowed: png jpg jpeg svg" }); //Not working- So Added validation in "yup"
            this.setState({
                file: "",
                isValidFile: false,
            });
        }
    };


    imageModalShowHandler = (url) => {
        this.setState({ thumbNailModal: true, url: url });
    }
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, url: "" });
    }

    modalCloseHandler = () => {
        this.setState({ conductDetils: {}, conductId: "", showModal: false })
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        this.setState({
            validationMessage: generateResolutionText('code_of_conduct'),
            fileValidationMessage: FILE_VALIDATION_MASSAGE_SVG
        })
        if (id) {
            this.getConductDetils(id)
        } else {
            this.setState({ conductDetils: {}, conductId: "", showModal: true });
        }
    }




    render() {

        const { conductDetils } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            title: conductDetils.title ? htmlDecode(conductDetils.title) : '',
            content: conductDetils.content ? htmlDecode(conductDetils.content) : '',
            file: '',
            status: conductDetils.status || +conductDetils.status === 0
                ? conductDetils.status.toString()
                : ""
        });

        let validateStopFlag = {};

        if (this.state.conductId > 0) {
            validateStopFlag = Yup.object().shape({
                title: Yup.string().required("Please enter the title"),
                content: Yup.string().required("Please enter the content"),
                file: Yup.string().notRequired().test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg svg",
                    (file) => {
                        if (file) {
                            return this.state.isValidFile
                        } else {
                            return true
                        }
                    }),
                status: Yup.string().trim()
                    .required("Please select status")
                    .matches(/^[0|1]$/, "Invalid status selected")
            });
        } else {
            validateStopFlag = Yup.object().shape({
                title: Yup.string().required("Please enter the title"),
                content: Yup.string().required("Please enter the content"),
                file: Yup.string().required("Please select the file").test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg svg",
                    () =>
                        this.state.isValidFile
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
                                    Manage Code of Conduct
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
                                        <i className="fas fa-plus m-r-5" /> Add Code of Conduct
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

                                <BootstrapTable data={this.state.conductList}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="title"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Title
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="content"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Content
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="new_image_name"
                                        dataFormat={setBlogImage(this)}
                                    >
                                        Image
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
                                                    totalItemsCount={this.state.banner_count}
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
                                                            {this.state.conductId > 0 ? 'Edit Code of Conduct' : 'Add Code of Conduct'}
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
                                                                            placeholder="Enter The Title"
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
                                                                            Choose Image
                                                                        {this.state.conductId == 0 ?
                                                                                <span className="impField">*</span>
                                                                                : null
                                                                            }
                                                                            <br /> <i> {this.state.fileValidationMessage}
                                                                            </i>
                                                                            <br /> <i>{this.state.validationMessage}

                                                                            </i>
                                                                        </label>
                                                                        <Field
                                                                            name="file"
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
                                                                        {errors.file && touched.file ? (
                                                                            <span className="errorMsg">
                                                                                {errors.file}
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
                                                                                (val, i) => (
                                                                                    <option key={i} value={val.value}>
                                                                                        {val.label}
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
                                                            disabled={isValid ? false : true}
                                                        >
                                                            {this.state.conductId > 0
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
                                <Modal
                                    show={this.state.thumbNailModal}
                                    onHide={() => this.imageModalCloseHandler()}
                                    backdrop='static'
                                >
                                    <Modal.Header closeButton>Image</Modal.Header>
                                    <Modal.Body>
                                        <center>
                                            <img src={this.state.url} alt="Image" width="500" height="300"></img>
                                        </center>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}
export default CodeOfConduct