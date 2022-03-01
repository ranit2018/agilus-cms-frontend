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
import Switch from "react-switch";


const initialValues = {
    number: "",
    location: "",
    status: "",
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

const setPhoneNumberType = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Customer Care Number";
    } else if (cell === 2) {
        return "Home Collection Number";
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

const actionFormatter = (refObj) => (cell, row) => {
    if (cell === 1) {
        return (
            <div className="actionStyle">
                <LinkWithTooltip
                    tooltip="Click to edit"
                    href="#"
                    clicked={(e) => refObj.modalShowHandler(e, cell)}
                    id="tooltip-1"
                >
                    <i className="far fa-edit" />
                </LinkWithTooltip>
            </div>
        );
    } else {
        return (
            <div className="actionStyle">
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
    }
};


class Numbers extends Component {

    constructor(props) {
        super(props);
        this.state = {
            numbers: [],
            isLoading: false,
            showModal: false,
            numberDetails: [],
            numberType: 0,
            number_id: 0,
            selectStatus: [
                { value: '1', label: 'Active' },
                { value: '0', label: 'In-Active' }
            ],
            activePage: 1,
            totalCount: 0,
            itemPerPage: 10,
        };
    }

    componentDidMount() {
        this.getNumbersList();
    }

    getNumbersList = (page = 1) => {
        API.get(
            `/api/number/corporate_phone_no?page=${page}`
        )
            .then((res) => {
                this.setState({
                    numbers: res.data.data,
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

    getNumberetails(id) {
        API.get(`/api/number/home_collection_no/${id}`)
            .then((res) => {
                this.setState({
                    numberDetails: res.data.data[0],
                    numberType: res.data.data[0].type,
                    number_id: id,
                    showModal: true,

                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }



    handleSubmitEvent = (values, actions) => {
        let method = '';
        let url = '';
        let post_data = {};
        if (this.state.number_id > 0) {

            if (this.state.numberType == 1) {
                post_data = {
                    number: values.number
                }
                method = 'PUT';
                url = `/api/number/update_customer_care_no/${this.state.number_id}`;
            } else {
                post_data = {
                    number: String(values.number),
                    location: values.location,
                    status: String(values.status)
                }
                method = 'PUT';
                url = `/api/number/update_home_collection_no/${this.state.number_id}`;
            }
        } else {
            post_data = {
                number: String(values.number),
                location: values.location,
                status: values.status
            }
            method = 'POST';
            url = `/api/number/add_home_collection_no`

        }
        API({
            method: method,
            url: url,
            data: post_data
        }).then((res) => {
            this.setState({ showModal: false });
            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                icon: "success",
            }).then(() => {
                this.getNumbersList(this.state.activePage);
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
                this.deleteNumber(id);
            }
        });
    };

    deleteNumber = (id) => {
        API.delete(`/api/number/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getNumbersList(this.state.activePage);
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
        API.put(`/api/number/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getNumbersList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
      }

    modalCloseHandler = () => {
        this.setState({ showModal: false, number_id: 0, numberType: 0, numberDetails: {} });
    };

    modalShowHandler = (event, id) => {
        if (id) {
            event.preventDefault();
            this.getNumberetails(id);


        } else {
            this.setState({ showModal: true, number_id: 0, numberType: 0, numberDetails: {} });
        }
    };

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getNumbersList(pageNumber > 0 ? pageNumber : 1);
    };


    render() {

        const { numberDetails } = this.state;

        let newInitialValues = {};

        let validateStopFlag = {};

        if (this.state.numberType == 1) {
            newInitialValues = Object.assign(initialValues, {
                number: numberDetails.phone_no ? numberDetails.phone_no : '',
            });

            validateStopFlag = Yup.object().shape({
                number: Yup.string().required("Please enter the phone number"),
            });
        } else {
            newInitialValues = Object.assign(initialValues, {
                number: numberDetails.phone_no ? numberDetails.phone_no : '',
                location: numberDetails.location ? numberDetails.location : '',
                status: numberDetails.status || + numberDetails.status === 0
                    ? numberDetails.status.toString()
                    : ""
            });

            validateStopFlag = Yup.object().shape({
                number: Yup.string().required("Please enter the phone number"),
                location: Yup.string().required('Please enter the location'),
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
                                    Manage Numbers
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
                                        <i className="fas fa-plus m-r-5" /> Add Home Collection Number
                        </button>
                                </div>
                                {/* <form className="form">
                      <div className="">
                        <input
                          className="form-control"
                          name="offer_title"
                          id="offer_title"
                          placeholder="Filter by Offer Title"
                        />
                      </div>
    
                      <div className="">
                        <input
                          className="form-control"
                          type='date'
                          name="end_date"
                          id="end_date"
                          placeholder="Filter by Offer Title"
                        />
                      </div>
    
                      <div className="">
                        <select
                          name="status"
                          id="status"
                          className="form-control"
                        >
                          <option value="">Select Offer Status</option>
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
                          onClick={(e) => this.offerSearch(e)}
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

                                <BootstrapTable data={this.state.numbers}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="type"
                                        dataFormat={setPhoneNumberType(this)}
                                    >
                                        Type
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="number"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Phone Number
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="location"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Location
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
                                                            {this.state.number_id > 0
                                                                ? this.state.numberType == 1 ? "Edit Customer Care Number" : "Edit Home Collection Number"
                                                                : "Add Home Collection Number"
                                                            }
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">

                                                            {this.state.numberType != 1 ?
                                                                (
                                                                    <>
                                                                        <Row>
                                                                            <Col xs={12} sm={12} md={12}>
                                                                                <div className="form-group">
                                                                                    <label>
                                                                                        Number
                                        </label>
                                                                                    <Field
                                                                                        name="number"
                                                                                        type="text"
                                                                                        className={`form-control`}
                                                                                        placeholder="Enter Phone Number"
                                                                                        autoComplete="off"
                                                                                        value={values.number}
                                                                                    />
                                                                                    {errors.number && touched.number ? (
                                                                                        <span className="errorMsg">
                                                                                            {errors.number}
                                                                                        </span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col xs={12} sm={12} md={12}>
                                                                                <div className="form-group">
                                                                                    <label>
                                                                                        Location
                                        </label>
                                                                                    <Field
                                                                                        name="location"
                                                                                        type="text"
                                                                                        placeholder="Enter The Location"
                                                                                        className={`form-control`}
                                                                                        autoComplete="off"
                                                                                        value={values.location}
                                                                                    />
                                                                                    {errors.location && touched.location ? (
                                                                                        <span className="errorMsg">
                                                                                            {errors.location}
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
                                                                    </>
                                                                )
                                                                : <Row>
                                                                    <Col xs={12} sm={12} md={12}>
                                                                        <div className="form-group">
                                                                            <label>
                                                                                Number
                                        </label>
                                                                            <Field
                                                                                name="number"
                                                                                type="text"
                                                                                className={`form-control`}
                                                                                placeholder="Enter Phone Number"
                                                                                autoComplete="off"
                                                                                value={values.number}
                                                                            />
                                                                            {errors.number && touched.number ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.number}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            }
                                                        </div>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <button
                                                            className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                                                } m-r-10`}
                                                            type="submit"
                                                            disabled={isValid ? (isSubmitting ? true : false) : true}
                                                            >
                                                            {this.state.number_id > 0
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
                    </section>
                </div>
            </Layout >
        )
    }
}
export default Numbers