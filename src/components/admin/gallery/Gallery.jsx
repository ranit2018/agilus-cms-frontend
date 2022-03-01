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
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE, FILE_VALIDATION_MASSAGE_SVG } from "../../../shared/helper";
import Select from "react-select";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Layout from "../layout/Layout";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
/*For Tooltip*/

const actionFormatter = (refObj) => (cell, row) => {
    return (
        <div className="actionStyle">
            <LinkWithTooltip
                tooltip="Copy image url"
                href="#"
                clicked={(e) => refObj.copy(e)}
                id="tooltip-1"
            >
                <CopyToClipboard text={row.new_image_name}>

                    <i className="fa fa-clone" />
                </CopyToClipboard>
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

const setImage = (refObj) => (cell, row) => {

    return (
        // <LinkWithTooltip
        //   tooltip={"View Image"}
        //   id="tooltip-1"
        //   clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
        // >
        <img src={cell} alt="Image" height="100" onClick={(e) => refObj.imageModalShowHandler(cell)}></img>
        // </LinkWithTooltip>
    );
};

class Gallery extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            imgList: [],
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
        this.inputFile = React.createRef();
    }

    getImage = (page = 1) => {


        API.get(
            `/api/events/event_gallery/?page=${page}`
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

    fileChangedHandler = (event, file, setFieldTouched, setFieldValue, setErrors) => {
        const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        console.log(event.target.files);
        if (event.target.files.length > 1) {
            let err_count = 0;
            let msg = '';
            for (let i = 0; i < event.target.files.length; i++) {
                console.log(!SUPPORTED_FORMATS.includes(event.target.files[i].type));
                if (!SUPPORTED_FORMATS.includes(event.target.files[i].type)) {
                    msg = "Only files with the following extensions are allowed: png jpg jpeg";
                    err_count++;
                } else {
                    if (event.target.files[i].size > FILE_SIZE) {
                        msg = "The file exceeds maximum size.";
                        err_count++;
                    }
                }
            }
            if (err_count == 0) {
                var formData = new FormData();
                for (let i in event.target.files) {
                    formData.append("featured_image", event.target.files[i]);
                }
                API({
                    method: 'POST',
                    url: `api/events/event_gallery/`,
                    data: formData
                }).then((res) => {
                    swal({
                        closeOnClickOutside: false,
                        title: "Success",
                        text: "Images uploaded successfully.",
                        icon: "success",
                    }).then(() => {
                        this.getImage(this.state.activePage);
                    });
                }).catch((err) => {
                    this.setState({ showModalLoader: false });
                    if (err.data.status === 3) {
                        this.setState({
                            showModal: false,
                        });
                        showErrorMessage(err, this.props);
                    }
                });

            } else {
                swal({
                    closeOnClickOutside: false,
                    title: "Error",
                    text: msg,
                    icon: "error"
                }).then(() => {
                });
            }

        } else {
            console.log(event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type));

            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                if (event.target.files[0].size > FILE_SIZE) {
                    swal({
                        closeOnClickOutside: false,
                        title: "Error",
                        text: "The file exceeds maximum size.",
                        icon: "error"
                    }).then(() => {
                    });
                } else {
                    var formData = new FormData();
                    formData.append("featured_image", event.target.files[0]);
                    API({
                        method: 'POST',
                        url: `api/events/event_gallery/`,
                        data: formData
                    }).then((res) => {
                        swal({
                            closeOnClickOutside: false,
                            title: "Success",
                            text: "Image uploaded successfully.",
                            icon: "success",
                        }).then(() => {
                            this.getImage(this.state.activePage);
                        });
                    }).catch((err) => {
                        this.setState({ showModalLoader: false });
                        if (err.data.status === 3) {
                            this.setState({
                                showModal: false,
                            });
                            showErrorMessage(err, this.props);
                        }
                    });
                }
            } else {
                swal({
                    closeOnClickOutside: false,
                    title: "Error",
                    text: "Only files with the following extensions are allowed: png jpg jpeg",
                    icon: "error"
                }).then(() => {
                });
            }

        }

    };

    handleFileUpload = e => {
        const { files } = e.target;
        console.log(files);
    };

    imageModalShowHandler = (url) => {
        this.setState({ thumbNailModal: true, url: url });
    }
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, url: "" });
    }

    copy = (e) => {
        e.preventDefault();
        toast.info("Image Copied!", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });
    }


    componentDidMount() {
        this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE_SVG })
        this.getImage();
    }


    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getImage(pageNumber > 0 ? pageNumber : 1);
    };

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
                this.deleteImage(id);
            }
        });
    };

    deleteImage = (id) => {
        API.delete(`/api/events/event_gallery/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getImage(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };



    render() {
        return (
            <Layout {...this.props}>
                <ToastContainer />
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Gallery
                <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">
                                    <input
                                        type="file"
                                        multiple
                                        ref={this.inputFile}
                                        style={{ display: 'none' }}
                                        onChange={this.fileChangedHandler}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={() => this.inputFile.current.click()}
                                    >
                                        <i className="fas fa-plus m-r-5" /> Upload Image
                                  </button>
                                    <br /> <i>{this.state.fileValidationMessage}</i>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">
                                <BootstrapTable data={this.state.list}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="new_image_name"
                                        dataFormat={setImage(this)}
                                    >
                                        Image
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
                            </div>
                        </div>
                    </section >
                </div >
                <Modal
                    show={this.state.thumbNailModal}
                    onHide={() => this.imageModalCloseHandler()}
                    backdrop='static'
                >
                    <Modal.Header closeButton>Image</Modal.Header>
                    <Modal.Body>
                        <center>
                            <div className="imgUi">
                                <img src={this.state.url} alt="Image"></img>
                            </div>
                        </center>
                    </Modal.Body>
                </Modal>
            </Layout >
        )
    }
}
export default Gallery