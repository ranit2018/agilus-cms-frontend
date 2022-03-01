import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";
const initialValues = {
    type: '',
    name: '',
    designation: '',
    description: '',
    file: '',
    status: ''
};
const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const setType = (refObj) => (cell) => {
    if (cell === 1) {
        return "Board Of Directors";
    } else if (cell === 2) {
        return "Audit Commitee";
    } else if (cell === 3) {
        return "Nomination/Remuneration/Compensation Commitee";
    } else if (cell === 4) {
        return "Corporate Social Responsibility Comitee";
    }
};


const custStatus = (refObj) => (cell) => {
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



class MembersType extends Component {
    constructor(props) {
        super(props)

        this.state = {
            membersTypeList: [],
            membersTypeDetails: {},
            memberTypeId: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ]
        }
    }

    getMembersTypeList = (page = 1) => {
        API.get(
            `/api/investor/type_name/`
        )
            .then((res) => {
                this.setState({
                    membersTypeList: res.data.data,
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

    // memberSearch = (e) => {
    //     e.preventDefault();

    //     const type = document.getElementById("type").value;
    //     const name = document.getElementById("name").value;
    //     const designation = document.getElementById("designation").value;
    //     const status = document.getElementById("status").value;

    //     if (type === "" && name === "" && status === "" && designation === "") {
    //         return false;
    //     }

    //     API.get(`/api/investor/members?page=1&type=${encodeURIComponent(type)}&designation=${encodeURIComponent(designation)}&status=${encodeURIComponent(status)}&name=${encodeURIComponent(name)}`)
    //         .then((res) => {
    //             this.setState({
    //                 membersTypeList: res.data.data,
    //                 totalCount: res.data.count,
    //                 isLoading: false,
    //                 type: type,
    //                 name: name,
    //                 status: status,
    //                 designation: designation,
    //                 activePage: 1,
    //                 remove_search: true
    //             });
    //         })
    //         .catch((err) => {
    //             this.setState({
    //                 isLoading: false
    //             });
    //             showErrorMessage(err, this.props);
    //         });
    // };

    // clearSearch = () => {

    //     document.getElementById("type").value = "";
    //     document.getElementById("name").value = "";
    //     document.getElementById("designation").value = "";
    //     document.getElementById("status").value = "";

    //     this.setState(
    //         {
    //             type: "",
    //             name: "",
    //             designation: "",
    //             status: "",
    //             remove_search: false,
    //         },
    //         () => {
    //             this.setState({ activePage: 1 });
    //             this.getMembersTypeList();

    //         }
    //     );
    // };


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
                this.deleteMember(id);
            }
        });
    };

    deleteMember = (id) => {
        API.delete(`/api/investor/type_name/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getMembersTypeList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                } else {
                    swal({
                        closeOnClickOutside: false,
                        title: "Sorry",
                        text: err.data.errors.type,
                        icon: "error",
                        dangerMode: true,
                    })
                }
            });
    };

    getMembersTypeDetails(id) {
        API.get(`/api/investor/type_name/${Number(id)}`)
            .then((res) => {
                this.setState({
                    showModal: true,
                    membersTypeDetails: res.data.data[0],
                    memberTypeId: id,

                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    handleSubmitEvent = async (values, actions) => {
        let url = '';
        let method = '';
        const postData = {
            name: values.name,
            status: values.status
        };
        if (this.state.memberTypeId > 0) {
            url = `/api/investor/type_name/${this.state.memberTypeId}`;
            method = 'PUT';
        } else {
            url = `/api/investor/type_name/`;
            method = 'POST';
        }
        API({
            method: method,
            url: url,
            data: postData,
        }).then((res) => {
            this.modalCloseHandler();
            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                icon: "success",
            }).then(() => {
                this.getMembersTypeList(this.state.activePage);
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
        this.getMembersTypeList();
    }

    chageStatus = (cell, status) => {
        API.put(`/api/investor/type/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record updated successfully.",
                    icon: "success",
                }).then(() => {
                    this.getMembersTypeList(this.state.activePage);
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
        this.setState({ membersTypeDetails: {}, memberTypeId: "", showModal: false })
    };

    modalShowHandler = (event, id) => {
        event.preventDefault();
        if (id) {
            this.getMembersTypeDetails(id)
        } else {
            this.setState({ membersTypeDetails: {}, memberTypeId: "", showModal: true });
        }
    }


    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getMembersTypeList(pageNumber > 0 ? pageNumber : 1);
    };








    render() {

        const { membersTypeDetails } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            name: membersTypeDetails.name ? htmlDecode(membersTypeDetails.name) : '',
            status: membersTypeDetails.status || +membersTypeDetails.status === 0
                ? membersTypeDetails.status.toString()
                : ""
        });

        const validateStopFlag = Yup.object().shape({
            name: Yup.string().required("Please enter the name"),
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
                                    Manage Members Type
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
                                        <i className="fas fa-plus m-r-5" /> Add Member Type
                                    </button>
                                </div>

                                <div className="">

                                </div>
                                {/* <form className="form">

                                    <div className="">
                                        <select
                                            name="type"
                                            id="type"
                                            className="form-control"
                                        >
                                            <option value="">Select Type</option>
                                            {this.state.selectType.map((val) => {
                                                return (
                                                    <option key={val.value} value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="name"
                                            id="name"
                                            placeholder="Filter by Name"
                                        />
                                    </div>
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="designation"
                                            id="designation"
                                            placeholder="Filter by Designation"
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
                                            onClick={(e) => this.memberSearch(e)}
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

                                <BootstrapTable data={this.state.membersTypeList}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="name"
                                    >
                                        Type Name
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
                                                    totalItemsCount={Number(this.state.totalCount)}
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
                                                            {this.state.memberTypeId > 0 ? 'Edit Member Type' : 'Add Member Type'}
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Name
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="name"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter The Name"
                                                                            autoComplete="off"
                                                                            value={values.name}
                                                                        />
                                                                        {errors.name && touched.name ? (
                                                                            <span className="errorMsg">
                                                                                {errors.name}
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
                                                            {this.state.memberTypeId > 0
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
export default MembersType
