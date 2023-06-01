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

const actionFormatter = (refObj) => (cell, row) => {
        return (
            <div className="actionStyle">
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


const setTitle = (refObj) => (cell, row) => {
    if (cell == 1) {
        return row.original_video_name;
    } else if (cell == 2) {
        return row.youtube_url;
    }

};

class SampleJourneny extends Component {
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
            `/api/home/sample_journey?page=${page}`
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
        API.delete(`/api/home/sample_journey/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.setState({ activePage: 1 });
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

    getDetails(id) {
        API.get(`/api/home/sample_journey/${id}`)
            .then((res) => {
                this.setState({
                    details: res.data.data[0],
                    detailsId: id,
                    showModal: true

                });
                this.chageInputType('link', id);
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    videoUpload = async (values, actions) => {
        let url = '';
        let method = '';
        var formData = new FormData();
        formData.append("status", values.status);
        var err_count = 0;
        if (this.state.image) {
            if (this.state.image.size > FILE_SIZE) {
                actions.setErrors({ image: "The file exceeds maximum size." });
                actions.setSubmitting(false);
                err_count++;
            } else {
                const dimension = await getHeightWidth(this.state.image)
                const { height, width } = dimension;
                const thambnailDimension = getResolution("thambnail");
                console.log("height", height);
                console.log("width", width);
                console.log(thambnailDimension, height != thambnailDimension.height || width != thambnailDimension.width);
                if (height != thambnailDimension.height || width != thambnailDimension.width) {
                    actions.setErrors({ image: "The file exceeds maximum height and width validation." });
                    actions.setSubmitting(false)
                    err_count++;
                } else {
                    formData.append("file", this.state.image);
                }
            }

        }
        if (this.state.video) {
            if (this.state.video.size > 8388608) {
                actions.setErrors({ file: "The file exceeds maximum size." });
                actions.setSubmitting(false);
                err_count++;
            } else {
                formData.append("file", this.state.video);
            }
        }

        if (this.state.detailsId > 0) {
            url = `/api/home/sample_journey/upload_video/${this.state.detailsId}`;
            method = 'PUT';
        } else {
            url = `/api/home/sample_journey/upload_video`;
            method = 'POST';
        }
        if (err_count == 0) {
            API({
                method: method,
                url: url,
                data: formData
            }).then((res) => {
                this.setState({ showModal: false });
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
        }
    }

    linkUpload = (values, actions) => {
        let url = '';
        let method = '';


        if (this.state.detailsId > 0) {
            url = `/api/home/update_link/${this.state.detailsId}`;
            method = 'PUT';
        } else {
            url = `/api/home/sample_journey/add_link`;
            method = 'POST';
        }
        API({
            method: method,
            url: url,
            data: { youtube_url: values.youtube_url, status: values.status }
        }).then((res) => {
            this.setState({ showModal: false });
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
    }
    componentDidMount() {
        this.getList();
    }

    modalCloseHandler = () => {
        this.setState({ details: {}, detailsId: "", showModal: false, form: '' })
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        this.setState({
            validationMessage: generateResolutionText('thambnail'),
            fileValidationMessage: FILE_VALIDATION_MASSAGE
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

    chageStatus = (cell, status) => {
        API.put(`/api/home/sample_journey/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
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

    fileChangedHandler = (event, file, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);

        if (file === 'image') {

            setFieldTouched("image");
            setFieldValue("image", event.target.value);

            const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
            if (!event.target.files[0]) {
                //Supported
                this.setState({
                    image: "",
                    isValidFile: true,
                });
                return;
            }
            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                //Supported
                this.setState({
                    image: event.target.files[0],
                    isValidFile: true,
                });
            } else {
                //Unsupported
                setErrors({ image: "Only files with the following extensions are allowed: png,jpeg,jpg" }); //Not working- So Added validation in "yup"
                this.setState({
                    image: "",
                    isValidFile: false,
                });

            }

        } else if (file === 'video') {

            setFieldTouched("");
            setFieldValue("video", event.target.value);
            console.log(event.target.files[0]);
            const SUPPORTED_FORMATS = ["video/mp4", "video/mkv", "video/mov"];
            if (!event.target.files[0]) {
                //Supported
                this.setState({
                    video: "",
                    isValidFile: true,
                });
                return;
            }
            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                //Supported
                this.setState({
                    video: event.target.files[0],
                    isValidVideo: true,
                });
            } else {
                //Unsupported
                setErrors({ video: "Only files with the following extensions are allowed: mp4,mov,mkv" }); //Not working- So Added validation in "yup"
                this.setState({
                    video: "",
                    isValidVideo: false,
                });

            }

        }


    }



    chageInputType = (type, id) => {

        let form = null;
        if (type === 'video') {


            const { details } = this.state;

            const newInitialValues = Object.assign(initialValues, {
                image: '',
                video: '',
                status: details.status || +details.status === 0
                    ? details.status.toString()
                    : "",
            });

            const validateStopFlag = Yup.object().shape({
                image: Yup.string().required("Plese slect the file").test(
                    "image",
                    "Only files with the following extensions are allowed: png,jpeg,jpg", () => this.state.isValidFile
                ),
                video: Yup.string().required("Plese Select the video").test(
                    "video",
                    "Only files with the following extensions are allowed: mp4,mov,mkv", () => this.state.isValidVideo
                ),
                status: Yup.string().trim()
                    .required("Please select status")
                    .matches(/^[0|1]$/, "Invalid status selected")
            });

            form = (
                <Formik
                    initialValues={newInitialValues}
                    validationSchema={validateStopFlag}
                    onSubmit={this.videoUpload}
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
                                <Row>
                                    <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                            <label>
                                                Choose Thumbnail File
                                                <span className="impField">*</span>
                                                <br /> <i> {this.state.fileValidationMessage}
                                                </i>
                                                <br /> <i>{this.state.validationMessage}

                                                </i>
                                            </label>
                                            <Field
                                                name="image"
                                                type="file"
                                                className={`form-control`}
                                                placeholder="Featured Image 1"
                                                autoComplete="off"
                                                onChange={(e) => {
                                                    this.fileChangedHandler(
                                                        e,
                                                        'image',
                                                        setFieldTouched,
                                                        setFieldValue,
                                                        setErrors
                                                    );
                                                }}
                                            />
                                            {console.log(errors.image)}
                                            {errors.image && touched.image ? (
                                                <span className="errorMsg">
                                                    {errors.image}
                                                </span>
                                            ) : null}
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                            <label>
                                                Choose Video File
                                           <span className="impField">*</span>
                                                <br /> <i>(Image type should be .mp4,.mkv,.mov and maximum file size is 8 mb.)</i>
                                            </label>
                                            <Field
                                                name="video"
                                                type="file"
                                                className={`form-control`}
                                                placeholder="Featured Image 1"
                                                autoComplete="off"
                                                onChange={(e) => {
                                                    this.fileChangedHandler(
                                                        e,
                                                        'video',
                                                        setFieldTouched,
                                                        setFieldValue,
                                                        setErrors
                                                    );
                                                }}
                                            />
                                            {errors.video && touched.video ? (
                                                <span className="errorMsg">
                                                    {errors.video}
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
                                <button
                                    className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                        } m-r-10`}
                                    type="submit"
                                    disabled={isValid ? (isSubmitting ? true : false) : true}
                                    >
                                    {this.state.socialLink_id > 0
                                        ? isSubmitting
                                            ? "Updating..."
                                            : "Update"
                                        : isSubmitting
                                            ? "Submitting..."
                                            : "Submit"}
                                </button>
                            </Form>
                        );

                    }
                    }
                </Formik>
            );



        } else if (type === 'link') {
            const { details } = this.state;

            const newInitialValues = Object.assign(initialValues, {
                youtube_url: details.youtube_url ? details.youtube_url : '',
                status: details.status || +details.status === 0
                    ? details.status.toString()
                    : "",
            });

            const validateStopFlag = Yup.object().shape({
                youtube_url: Yup.string("Enter valid url").required("Plese enter youtube url"),
                status: Yup.string().trim()
                    .required("Please select status")
                    .matches(/^[0|1]$/, "Invalid status selected")
            });

            form = (
                <Formik
                    initialValues={newInitialValues}
                    validationSchema={validateStopFlag}
                    onSubmit={this.linkUpload}
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
                                <Row>
                                    <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                            <label>
                                                Youtube URL
                                        <span className="impField">*</span>
                                            </label>
                                            <Field
                                                name="youtube_url"
                                                type="text"
                                                className={`form-control`}
                                                placeholder="Enter URL"
                                                autoComplete="off"
                                                value={values.youtube_url}
                                            />
                                            {errors.youtube_url && touched.youtube_url ? (
                                                <span className="errorMsg">
                                                    {errors.youtube_url}
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
                                <button
                                    className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                        } m-r-10`}
                                    type="submit"
                                    disabled={isValid ? (isSubmitting ? true : false) : true}
                                    >
                                    {this.state.socialLink_id > 0
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
            )
        }
        this.setState({ form: form })
    }




    render() {



        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Agilus Sample Journey
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
                                        <i className="fas fa-plus m-r-5" /> Add Agilus Sample Journey
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
                                        dataField="type"
                                        dataFormat={setTitle(this)}
                                    >
                                        Title
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
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            {this.state.detailsId > 0 ? 'Edit Sample Journey' : 'Add Sample Journey'}
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="contBox">
                                            {
                                                this.state.detailsId == 0 ?
                                                    <Formik
                                                        initialValues={{
                                                            type: ''
                                                        }}

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

                                                                    <Row>
                                                                        <Col xs={12} sm={12} md={12}>
                                                                            <div className="form-group custom">
                                                                                <Field type="radio" name="type" value='video'
                                                                                    onChange={(e) => {
                                                                                        this.chageInputType(e.target.value)
                                                                                        setFieldValue('type', e.target.value)
                                                                                    }

                                                                                    } />
                                                                                <label>
                                                                                    Upload Video
                                       {/* <span className="impField">*</span> */}
                                                                                </label>


                                                                            </div>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row>
                                                                        <Col xs={12} sm={12} md={12}>
                                                                            <div className="form-group custom">
                                                                                <Field type="radio" name="type" value='link'
                                                                                    onChange={(e) => {
                                                                                        this.chageInputType(e.target.value)
                                                                                        setFieldValue('type', e.target.value)
                                                                                    }

                                                                                    }
                                                                                />
                                                                                <label>
                                                                                    Add Youtube Link
                                       {/* <span className="impField">*</span> */}
                                                                                </label>


                                                                            </div>
                                                                        </Col>
                                                                    </Row>

                                                                </Form>
                                                            )
                                                        }}
                                                    </Formik>

                                                    : null


                                            }

                                            {this.state.form}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {this.state.button}
                                        <button
                                            onClick={(e) => this.modalCloseHandler()}
                                            className={`btn btn-danger btn-sm`}
                                            type="button"
                                        >
                                            Close
                          </button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}
export default SampleJourneny