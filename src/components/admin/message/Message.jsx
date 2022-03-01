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
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import Select from "react-select";
import ReactHtmlParser from "react-html-parser";
import Layout from "../layout/Layout";
import Switch from "react-switch";

const initialValues = {
    content: '',
    link: ''
};
const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const setContent = (refObj) => (cell, row) => {
    console.log(ReactHtmlParser(htmlDecode(row.message_content)));
    return ReactHtmlParser(htmlDecode(row.message_content));
};


const removeTags = (refObj) => (cell, row) => {
    if ((cell === null) || (cell === ''))
        return false;
    else
        cell = String(cell);

    // Regular expression to identify HTML tags in  
    // the input string. Replacing the identified  
    // HTML tag with a null string. 
    return cell.replace(/(<([^>]+)>)/ig, '');
}

const custStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Active";
    } else if (cell === 0) {
        return "Inactive";
    }
};

const setLink = (refOBj) => (cell, row) => {
    return (

        <a href={cell} target="_blank">
            {cell}
        </a>

    );
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
        </div>
    );
};
class Message extends Component {
    constructor(props) {
        super(props)

        this.state = {
            messages: [],
            messageDetails: {},
            message_id: 0,
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

    getMessageList = (page = 1) => {


        API.get(
            `/api/feed/messages?page=${page}`
        )
            .then((res) => {
                this.setState({
                    messages: res.data.data,
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

    getMessageDetails(id) {
        API.get(`/api/feed/messages/${id}`)
            .then((res) => {
                this.setState({
                    showModal: true,
                    messageDetails: res.data.data[0],
                    message_id: id,

                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    chageStatus = (cell, status) => {
        API.put(`/api/feed/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getMessageList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
      }

    handleSubmitEvent = (values, actions) => {
        API({
            method: 'PUT',
            url: `/api/feed/messages/${this.state.message_id}`,
            data: { content: values.content, link: values.link, link_text: values.link_text, status:'1' }
        }).then((res) => {
            this.setState({ showModal: false });
            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Record updated successfully.",
                icon: "success",
            }).then(() => {
                this.setState({ activePage: 1 });
                this.getMessageList(this.state.activePage);
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
        this.getMessageList();
    }

    modalCloseHandler = () => {
        this.setState({ showModal: false, message_id: 0, messageDetails: {} });
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        this.getMessageDetails(id);
    };


    render() {

        const { messageDetails } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            content: messageDetails.message_content ? htmlDecode(messageDetails.message_content) : "",
            link: messageDetails.link ? htmlDecode(messageDetails.link) : "",
            link_text: messageDetails.link_text ? htmlDecode(messageDetails.link_text) : ""
        });

        const validateStopFlag = Yup.object().shape({
            content: Yup.string().required("Please enter the content"),
            link: Yup
            .string()
            .label('Link')
            .test('link', 'Plese enter the link', function(value) {
               if (this.parent.link_text) {
                   if (value) {
                       return true;
                   } else {
                       return false;
                   }
               } else {
                   return true;
               }
            }),
            link_text: Yup
            .string()
            .label('Link Text')
            .test('link-text', 'Plese enter the link text', function(value) {
               if (this.parent.link) {
                   if (value) {
                       return true;
                   } else {
                       return false;
                   }
               } else {
                   return true;
               }
            })
        });


        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Messages
                <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">

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

                                <BootstrapTable data={this.state.messages}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="message_type"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Message Type
                </TableHeaderColumn>
                <TableHeaderColumn
                                        dataField="link"
                                        dataFormat={setLink(this)}
                                    >
                                        Link
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="link_text"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Link Text
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="message_content"
                                        dataFormat={removeTags(this)}
                                    >
                                        Message Content
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
                                                            {this.state.message_id > 0 ? 'Edit Message' : 'Add Message'}
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">
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
                                                                            Link
                                                                    </label>
                                                                        <Field
                                                                            name="link"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Link"
                                                                            autoComplete="off"
                                                                            value={values.link}
                                                                        />
                                                                        {errors.link && touched.link ? (
                                                                            <span className="errorMsg">
                                                                                {errors.link}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Link Text
                                                                    </label>
                                                                        <Field
                                                                            name="link_text"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Link Text"
                                                                            autoComplete="off"
                                                                            value={values.link_text}
                                                                        />
                                                                        {errors.link_text && touched.link_text ? (
                                                                            <span className="errorMsg">
                                                                                {errors.link_text}
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
                                                            {this.state.message_id > 0
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
export default Message