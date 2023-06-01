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
import Switch from "react-switch";
import Layout from "../layout/Layout";


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

const setOfficeType = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Agilus Diagnostics Registered Office";
    } else if (cell === 2) {
        return "Agilus Diagnostics Corporate Office";
    } else if (cell === 3) {
        return "Footer Address";
    } else if (cell === 4) {
        return "Agilus Diagnostics Office";
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
    if (row.type === 1) {
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
    } else if (row.type === 3) {
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
    }
    else {
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


class OfficeAddresses extends Component {

    constructor(props) {
        super(props);
        this.state = {
            officeAddresses: [],
            isLoading: false,
            showModal: false,
            officeAddressDetails: [],
            officeAddressType: 2,
            officeAddress_id: 0,
            selectStatus: [
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' }
            ],
            activePage: 1,
            totalCount: 0,
            itemPerPage: 10,
        };
    }

    componentDidMount() {
        this.getOfficeAddressesList();
    }

    getOfficeAddressesList = (page = 1) => {
        API.get(
            `/api/office?page=${page}`
        )
            .then((res) => {
                this.setState({
                    officeAddresses: res.data.data,
                    totalCount: Number(res.data.count),
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

    getOfficeAddressDetails(id) {
        API.get(`/api/office/${id}`)
            .then((res) => {
                this.setState({
                    officeAddressDetails: res.data.data[0],
                    officeAddressType: res.data.data[0].type,
                    officeAddress_id: id,
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
        let post_data = {
            email: values.email,
            phone_no: String(values.phone_no),
            location: values.location,
            address: values.address,
            status: String(values.status)
        };
        if (this.state.officeAddress_id > 0) {

            method = 'PUT';
            url = `/api/office/${this.state.officeAddress_id}`;
        } else {
            method = 'POST';
            url = `/api/office`

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
                this.getOfficeAddressesList(this.state.activePage);
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
                this.deleteOfficeAddress(id);
            }
        });
    };

    deleteOfficeAddress = (id) => {
        API.delete(`/api/office/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getOfficeAddressesList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    modalCloseHandler = () => {
        this.setState({ showModal: false, officeAddress_id: 0, officeAddressType: 0, officeAddressDetails: {} });
    };

    modalShowHandler = (event, id) => {
        if (id) {
            event.preventDefault();
            this.getOfficeAddressDetails(id);


        } else {
            this.setState({ showModal: true, officeAddress_id: 0, officeAddressType: 2, officeAddressDetails: {} });
        }
    };

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getOfficeAddressesList(pageNumber > 0 ? pageNumber : 1);
    };

    chageStatus = (cell, status) => {
        API.put(`/api/office/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getOfficeAddressesList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
      }


    render() {

        const { officeAddressDetails } = this.state;

        const newInitialValues = {

            email: officeAddressDetails.email ? officeAddressDetails.email : '',
            phone_no: officeAddressDetails.number ? officeAddressDetails.number : '',
            address: officeAddressDetails.address ? officeAddressDetails.address : '',
            location: officeAddressDetails.office_location ? officeAddressDetails.office_location : '',
            status: officeAddressDetails.status || + officeAddressDetails.status === 0
                ? officeAddressDetails.status.toString()
                : ""

        };

        const validateStopFlag = Yup.object().shape({
            email: Yup.string().email().required("Please enter the email"),
            phone_no: Yup.string().required("Please enter the phone number"),
            location: Yup.string().required('Please enter the location'),
            address: Yup.string().required("Please enter the address"),
            status: Yup.string().trim()
                .required("Please select status")
                .matches(/^[0|1]$/, "Invalid status selected")
        });;



        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Office Addresses
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
                                        <i className="fas fa-plus m-r-5" /> Add Corporate Office Address
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

                                <BootstrapTable data={this.state.officeAddresses}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="type"
                                        dataFormat={setOfficeType(this)}
                                    >
                                        Type
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="email"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Email Address
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="number"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Phone Number
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="office_location"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Office Location
                            </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="address"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Office Address
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
                                                            {this.state.officeAddress_id > 0
                                                                ? this.state.officeAddressType == 1 ? "Edit Registered Office Address" : this.state.officeAddressType == 3 ? "Edit Footer Office Address" : "Edit Corporate Office Address"
                                                                : "Add Corporate Office Address"
                                                            }

                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">

                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Email Address
                                        </label>
                                                                        <Field
                                                                            name="email"
                                                                            type="email"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Email Address"
                                                                            autoComplete="off"
                                                                            value={values.email}
                                                                        />
                                                                        {errors.email && touched.email ? (
                                                                            <span className="errorMsg">
                                                                                {errors.email}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Number
                                        </label>
                                                                        <Field
                                                                            name="phone_no"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Phone Number"
                                                                            autoComplete="off"
                                                                            value={values.phone_no}
                                                                        />
                                                                        {errors.phone_no && touched.phone_no ? (
                                                                            <span className="errorMsg">
                                                                                {errors.phone_no}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Office Location
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
                                                                            Office Address
                                        </label>
                                                                        <Field
                                                                            name="address"
                                                                            as="textarea"
                                                                            placeholder="Enter The Address"
                                                                            className={`form-control`}
                                                                            autoComplete="off"
                                                                            value={values.address}
                                                                        />
                                                                        {errors.address && touched.address ? (
                                                                            <span className="errorMsg">
                                                                                {errors.address}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            {this.state.officeAddressType == 2 ?
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
                                                                : null
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
                                                            {this.state.officeAddress_id > 0
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
export default OfficeAddresses