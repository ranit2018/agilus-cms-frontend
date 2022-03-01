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
import { htmlDecode } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
const initialValues = {
   link: ''
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
                clicked={(e) => refObj.modalShowHandler(e,cell)}
                id="tooltip-1"
            >
                <i className="far fa-edit" />
            </LinkWithTooltip>
        </div>
    );
};
class SocialLink extends Component {
    constructor(props) {
        super(props)

        this.state = {
            socialLinks: [],
            socialLinkDetails: {},
            socialLink_id: 0,
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

    getSocialLinkList = (page = 1) => {


        API.get(
            `/api/feed/social_link?page=${page}`
        )
            .then((res) => {
                this.setState({
                    socialLinks: res.data.data,
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

    getSocialLinkdetails(id) {
        API.get(`/api/feed/social_links/${id}`)
          .then((res) => {
            this.setState({
              showModal: true,
              socialLinkDetails: res.data.data[0],
              socialLink_id: id,
    
            });
          })
          .catch((err) => {
            showErrorMessage(err, this.props);
          });
      }

      handleSubmitEvent = (values, actions) => {
        API({
          method: 'PUT',
          url: `/api/feed/social_links/${this.state.socialLink_id}`,
          data: {link:values.link}
        }).then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.setState({ activePage: 1 });
            this.getSocialLinkList(this.state.activePage);
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
        this.getSocialLinkList();
    }

    modalCloseHandler = () => {
        this.setState({ showModal: false, socialLink_id: 0, socialLinkDetails: {} });
      };
    
      modalShowHandler = (event, id) => {
          event.preventDefault();
          this.getSocialLinkdetails(id);
      };


    render() {

        const { socialLinkDetails } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            link: socialLinkDetails.link ? socialLinkDetails.link : ""
        });
    
        const validateStopFlag = Yup.object().shape({
          link: Yup.string().required("Please enter the link")
        });


        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Social Links
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

                                <BootstrapTable data={this.state.socialLinks}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="media"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Media
                </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="link"
                                        dataFormat={setsocialLink(this)}
                                    >
                                        Link
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
                                                        Edit Social Link
                                                    </Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <div className="contBox">
                                                        <Row>
                                                            <Col xs={12} sm={12} md={12}>
                                                                <div className="form-group">
                                                                    <label>
                                                                        Link
                                                              <span className="impField">*</span>
                                                                    </label>
                                                                    <Field
                                                                        name="link"
                                                                        type="text"
                                                                        className={`form-control`}
                                                                        placeholder="Enter title"
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
                                                    </div>
                                                </Modal.Body>
                                                <Modal.Footer>
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
export default SocialLink