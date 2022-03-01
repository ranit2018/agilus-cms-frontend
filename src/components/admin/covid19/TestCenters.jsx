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
import Axios from 'axios'
import Switch from "react-switch";
import CreatableSelect from 'react-select/creatable';


const initialValues = {
    state: '',
    city: '',
    address: '',
    phone_no: '',
    status: '',
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
class TestCenters extends Component {
    constructor(props) {
        super(props)

        this.state = {
            centerList: [],
            centerDetails: {},
            centerId: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            stateList: [],
            cityList: [],
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
            state: "",
            city: "",
            address: "",
            phone_no: "",
            status: ""
        }
    }

    getCenterList = (page = 1) => {

        const state = this.state.state;
        const city = this.state.city;
        const address = this.state.address;
        const phone_no = this.state.phone_no;
        const status = this.state.status;

        API.get(
            `/api/covid/test_centers?page=${page}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&address=${encodeURIComponent(address)}&phone_no=${encodeURIComponent(phone_no)}&status=${encodeURIComponent(status)}`
        )
            .then((res) => {
                this.getStateList();
                this.setState({
                    centerList: res.data.data,
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

    testCenterSearch = (e) => {
        e.preventDefault();

        const state = document.getElementById("state").value;
        const city = document.getElementById("city").value;
        const address = document.getElementById("address").value;
        const phone_no = document.getElementById("phone_no").value;
        const status = document.getElementById("status").value;

        if (state === "" && city === "" && address === "" && phone_no === "" && status === "") {
            return false;
        }

        API.get(`/api/covid/test_centers?page=1&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&address=${encodeURIComponent(address)}&phone_no=${encodeURIComponent(phone_no)}&status=${encodeURIComponent(status)}`)
            .then((res) => {
                this.setState({
                    centerList: res.data.data,
                    totalCount: Number(res.data.count),
                    state: state,
                    city: city,
                    address: address,
                    phone_no: phone_no,
                    status: status,
                    remove_search: true,
                    isLoading: false,

                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false
                });
                showErrorMessage(err, this.props);
            });
    };

    clearSearch = () => {
        document.getElementById("state").value = "";
        document.getElementById("city").value = "";
        document.getElementById("address").value = "";
        document.getElementById("phone_no").value = "";
        document.getElementById("status").value = "";

        this.setState(
            {
                state: "",
                city: "",
                address: "",
                phone_no: "",
                status: "",
                remove_search: false,
            },
            () => {
                this.setState({ activePage: 1 });
                this.getCenterList();

            }
        );
    };


    getStateList = () => {
        Axios({
            url: `${process.env.REACT_APP_API_SRL}/feed/state-list`,
            method: 'GET',
            headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJQT1JUQUwiLCJzaWduYXR1cmUiOiJTUkwifQ.uVFMvwBhWRgigx9_Q7o9g6H_-Dvv3zbIwvrxlWcku-8` }
        }
        )
            .then((res) => {
                this.setState({
                    stateList: res.data.data,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    }

    getCityList = (id) => {
        Axios({
            url: `${process.env.REACT_APP_API_SRL}/feed/city-list`,
            method: 'POST',
            data: { state_id: id },
            headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJQT1JUQUwiLCJzaWduYXR1cmUiOiJTUkwifQ.uVFMvwBhWRgigx9_Q7o9g6H_-Dvv3zbIwvrxlWcku-8` }
        }
        )
            .then((res) => {
                this.setState({
                    cityList: res.data.data,
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
                this.deleteCenter(id);
            }
        });
    };

    deleteCenter = (id) => {
        API.delete(`/api/covid/test_centers/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCenterList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    getCenterdetails(id) {
        API.get(`/api/covid/test_centers/${id}`)
            .then((res) => {
                let stateValue;
                let stateLabel;
                let cityValue;
                let cityLabel;
                for (let i in this.state.stateList) {
                    if (this.state.stateList[i].label === res.data.data[0].state) {
                        stateValue = this.state.stateList[i].value;
                        stateLabel = this.state.stateList[i].label;

                    }
                }
                Axios({
                    url: `${process.env.REACT_APP_API_SRL}/feed/city-list`,
                    method: 'POST',
                    data: { state_id: stateValue },
                    headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJQT1JUQUwiLCJzaWduYXR1cmUiOiJTUkwifQ.uVFMvwBhWRgigx9_Q7o9g6H_-Dvv3zbIwvrxlWcku-8` }
                }
                )
                    .then((list) => {
                        for (let i in list.data.data) {
                            if (res.data.data[0].city === list.data.data[i].label) {
                                cityValue = list.data.data[i].value;
                                cityLabel = list.data.data[i].label;
                            }
                        }
                        this.setState({
                            cityList: list.data.data,
                            state: { label: stateLabel, value: stateValue },
                            city: { label: cityLabel, value: cityValue },
                            showModal: true,
                            centerDetails: res.data.data[0],
                            centerId: id,
                        });
                    })
                    .catch((err) => {
                        this.setState({
                            isLoading: false,
                        });
                        showErrorMessage(err, this.props);
                    });

            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    handleSubmitEvent = (values, actions) => {
        let url = '';
        let method = '';
        if (this.state.centerId > 0) {
            url = `/api/covid/test_centers/${this.state.centerId}`;
            method = 'PUT';
        } else {
            url = `/api/covid/test_centers`;
            method = 'POST';
        }
        API({
            method: method,
            url: url,
            data: {
                state: values.state,
                city: values.city,
                address: values.address,
                phone_no: String(values.phone_no),
                status: values.status
            },
        }).then((res) => {
            this.setState({ showModal: false, cityList: [], city: '', state: '' });
            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                icon: "success",
            }).then(() => {
                this.getCenterList(this.state.activePage);
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
        this.getCenterList();
    }

    modalCloseHandler = () => {
        this.setState({ centerDetails: {}, centerId: "", showModal: false, cityList: [], city: '', state: '' })
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        if (id) {
            this.getCenterdetails(id)
        } else {
            this.setState({ centerDetails: {}, centerId: "", showModal: true });
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getCenterList(pageNumber > 0 ? pageNumber : 1);
    };

    chageStatus = (cell, status) => {
        API.put(`/api/covid/test_centers/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record updated successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCenterList(this.state.activePage);
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

        const { centerDetails } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            state: centerDetails.state ? centerDetails.state : '',
            city: centerDetails.city ? centerDetails.city : '',
            address: centerDetails.address ? centerDetails.address : '',
            phone_no: centerDetails.phone_no ? centerDetails.phone_no : '',
            status: centerDetails.status || +centerDetails.status === 0
                ? centerDetails.status.toString()
                : ""
        });

        const validateStopFlag = Yup.object().shape({
            state: Yup.string().required("Please select the state"),
            city: Yup.string().required("Please select the city"),
            address: Yup.string().required("Please enter the address"),
            phone_no: Yup.string().required("Please enter the phone number"),
            status: Yup.string().trim()
                .required("Please select status")
                .matches(/^[0|1]$/, "Invalid status selected")
        });


        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Test Center
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
                                        <i className="fas fa-plus m-r-5" /> Add Test Center
                    </button>
                                </div>

                                <div className="">
                                </div>
                                <form className="form">
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="state"
                                            id="state"
                                            placeholder="Filter by State"
                                        />
                                    </div>
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="city"
                                            id="city"
                                            placeholder="Filter by City"
                                        />
                                    </div>

                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="address"
                                            id="address"
                                            placeholder="Filter by Address"
                                        />
                                    </div>

                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="phone_no"
                                            id="phone_no"
                                            placeholder="Filter by Phone Number"
                                        />
                                    </div>

                                    <div className="">
                                        <select
                                            name="status"
                                            id="status"
                                            className="form-control"
                                        >
                                            <option value="">Select Status</option>
                                            {this.state.selectStatus.map((val) => {
                                                return (
                                                    <option key={val.value} value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="">
                                        <input
                                            type="submit"
                                            value="Search"
                                            className="btn btn-warning btn-sm"
                                            onClick={(e) => this.testCenterSearch(e)}
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
                                </form>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">

                                <BootstrapTable data={this.state.centerList}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="state"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        State
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="city"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        City
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="address"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Address
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="phone_no"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Phone Number
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
                                                            {this.state.centerId > 0 ? 'Edit Test Center' : 'Add Test Center'}
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            State
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        {/* <Field
                                                                            name="state"
                                                                            component="select"
                                                                            className={`selectArowGray form-control`}
                                                                            autoComplete="off"
                                                                            value={values.state}
                                                                            onChange={(e) => {
                                                                                setFieldValue('state', e.target.value);
                                                                                this.getCityList(e.target.value);
                                                                            }}
                                                                        >
                                                                            <option key="-1" value="">
                                                                                Select State
                                        </option>
                                                                            {this.state.stateList.map(
                                                                                (val, i) => (
                                                                                    <option key={i} value={val.value}>
                                                                                        {val.label}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </Field> */}

                                                                        <Select
                                                                            name="state"
                                                                            options={this.state.stateList}
                                                                            className="basic-multi-select"
                                                                            classNamePrefix="select"
                                                                            onChange={(evt) => {
                                                                                if (evt === null) {
                                                                                    setFieldValue("state", '');
                                                                                } else {
                                                                                    this.getCityList(evt.value);
                                                                                    setFieldValue(
                                                                                        "state", evt.label)
                                                                                }
                                                                            }}
                                                                            placeholder="Enter State Name"
                                                                            onBlur={() => setFieldTouched("state")}
                                                                            defaultValue={this.state.state}
                                                                        />
                                                                        {errors.state && touched.state ? (
                                                                            <span className="errorMsg">
                                                                                {errors.state}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            City
                                        <span className="impField">*</span>
                                                                        </label>

                                                                        <Select
                                                                            name="city"
                                                                            options={this.state.cityList}
                                                                            className="basic-multi-select"
                                                                            classNamePrefix="select"
                                                                            onChange={(evt) => {
                                                                                if (evt === null) {
                                                                                    setFieldValue("city", '');
                                                                                } else {
                                                                                    setFieldValue(
                                                                                        "city", evt.label)
                                                                                }
                                                                            }}
                                                                            placeholder="Enter City Name"
                                                                            onBlur={() => setFieldTouched("city")}
                                                                            defaultValue={this.state.city}
                                                                        />

                                                                        {errors.city && touched.city ? (
                                                                            <span className="errorMsg">
                                                                                {errors.city}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Address
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="address"
                                                                            as="textarea"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Address"
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
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Phone Number
                                        <span className="impField">*</span>
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
                                                            disabled={isValid ? (isSubmitting ? true : false) : true}
                                                            >
                                                            {this.state.centerId > 0
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
export default TestCenters