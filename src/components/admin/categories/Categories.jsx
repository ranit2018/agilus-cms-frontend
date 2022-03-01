import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Button, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
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
    name: "",
    medium_id: [1],
    status: ""
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

const actionFormatter = (refObj) => (cell, row) => {
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
};

class Categories extends Component {

    constructor(props) {
        super(props)

        this.state = {
            categories: [],
            categoryDetails: {},
            mediumList: [],
            category_id: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
            category_name: "",
            medium_name: "",
            status: "",
        }
    }


    componentDidMount = () => {
        this.getCategoryList();
        this.getMediumList();
    }

    getCategoryList = (page = 1) => {
        let category_name = this.state.category_name;
        let medium_name = this.state.medium_name;
        let status = this.state.status;
        API.get(
            `/api/category?page=${page}&category_name=${encodeURIComponent(category_name)}&medium_name=${encodeURIComponent(medium_name)}&status=${encodeURIComponent(status)}`
        )
            .then((res) => {
                this.setState({
                    categories: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    }

    getMediumList = () => {
        API.get(
            `/api/category/medium`
        )
            .then((res) => {
                this.setState({
                    mediumList: res.data.data,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    }

    handleSubmitEvent = (values, actions) => {
        let method = '';
        let url = '/api/category';
        if (this.state.category_id > 0) {
            method = 'PUT';
            url = `/api/category/${this.state.category_id}`;
        } else {
            method = 'POST';
            url = `/api/category/`
        }
        API({
            method: method,
            url: url,
            data: values
        }).then((res) => {
            // this.setState({ showModal: false });
            this.modalCloseHandler();

            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: method === 'PUT' ? "Record updated successfully." : "Record added successfully.",
                icon: "success",
            }).then(() => {
                this.getCategoryList(this.state.activePage);
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

                this.deleteCategory(id);
            }
        });
    };

    deleteCategory = (id) => {
        API.delete(`/api/category/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getCategoryList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    getCategorydetails(id) {
        var selDetailsMedium = [];
        //var selMedium = [];
        API.get(`/api/category/${id}`)
            .then((res) => {
                for (let index = 0; index < res.data.data.category_mapping_details.length; index++) {
                    const element = res.data.data.category_mapping_details[index];
                    selDetailsMedium.push({
                        value: element["id"],
                        label: element["medium_name"],
                    });
                    //selMedium.push(element["id"]);
                }
                this.setState({
                    selectedMediumList: selDetailsMedium,
                    //selectedMedium: selMedium,
                    categoryDetails: res.data.data.category_details,
                    category_id: id,
                    showModal: true,

                });
                initialValues.medium_id = [1];
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }


    categorySearch = (e) => {
        e.preventDefault();

        const category_name = document.getElementById("category_name").value;
        // const medium_name = document.getElementById("medium_name").value;
        const medium_name = 1;
        const status = document.getElementById("status").value;

        if (category_name === "" && medium_name === "" && status === "") {
            return false;
        }

        API.get(`/api/category?page=1&category_name=${encodeURIComponent(category_name)}&medium_name=${encodeURIComponent(medium_name)}&status=${encodeURIComponent(status)}`)
            .then((res) => {
                this.setState({
                    categories: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false,
                    category_name: category_name,
                    medium_name: medium_name,
                    status: status,
                    activePage: 1,
                    remove_search: true
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

        document.getElementById("category_name").value = "";
        // document.getElementById("medium_name").value = "";
        document.getElementById("status").value = "";

        this.setState(
            {
                category_name: "",
                medium_name: "",
                status: "",
                remove_search: false,
            },
            () => {
                this.setState({ activePage: 1 });
                this.getCategoryList();

            }
        );
    };

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getCategoryList(pageNumber > 0 ? pageNumber : 1);
    };

    modalCloseHandler = () => {
        this.setState({ categoryDetails: {}, category_id: 0, selectedMediumList: [], showModal: false })
    };

    modalShowHandler = (event, id) => {
        if (id) {
            event.preventDefault();
            this.getCategorydetails(id);
        } else {
            this.setState({ showModal: true, category_id: 0, categoryDetails: {} });
        }
    };

    chageStatus = (cell, status) => {
        API.put(`/api/category/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getCategoryList(this.state.activePage);
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
        const { categoryDetails } = this.state;
        const newInitialValues = Object.assign(initialValues, {
            name: categoryDetails.name ? htmlDecode(categoryDetails.name) : '',
            //medium_id: this.state.mediumList.name ? this.state.mediumList.name : "",
            permalink: categoryDetails.permalink ? htmlDecode(categoryDetails.permalink) : "",
            status: categoryDetails.status || + categoryDetails.status === 0
                ? categoryDetails.status.toString() : ''

        });

        const validateStopFlag = Yup.object().shape({
            name: Yup.string().required("Please enter the name"),
            // medium_id: Yup.array()
            //     .ensure()
            //     .min(1,  "Please add at least one post type name")
            //     .of(Yup.string().ensure().required("medium name cannot be empty")),
            permalink: Yup.string().required("Please enter the permalink").matches(/^[a-zA-Z0-9\-\s]*$/, "Only '-' is allowed in permalink"),
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
                                    Manage Blog Categories
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
                                        <i className="fas fa-plus m-r-5" /> Add Category
                        </button>
                                </div>
                                <form className="form">
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="category_name"
                                            id="category_name"
                                            placeholder="Filter by Category Name"
                                        />
                                    </div>

                                    {/* <div className="">
                                        <select
                                            name="medium_name"
                                            id="medium_name"
                                            className="form-control"
                                        >
                                            <option value="">Select Post Type</option>
                                            {this.state.mediumList.map((val) => {
                                                return (
                                                    <option value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                    </div> */}

                                    <div className="">
                                        <select
                                            name="status"
                                            id="status"
                                            className="form-control"
                                        >
                                            <option value="">Select Category Status</option>
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
                                            onClick={(e) => this.categorySearch(e)}
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

                                <BootstrapTable data={this.state.categories}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="name"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Category Name
                        </TableHeaderColumn>
                                    {/* <TableHeaderColumn
                                        dataField="medium_name"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Type
                        </TableHeaderColumn> */}
                                    <TableHeaderColumn
                                        dataField="permalink"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Permalink
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
                                                            {this.state.category_id > 0 ? 'Edit Category' : 'Add Category'}
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
                                                                            placeholder="Enter name"
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
                                                            {/* <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Post Type
                                        <span className="impField">*</span>
                                                                        </label>
                                                                        <Select
                                                                            isMulti
                                                                            name="medium_id[]"
                                                                            options={this.state.mediumList}
                                                                            className="basic-multi-select"
                                                                            classNamePrefix="select"
                                                                            onChange={(evt) => {
                                                                                if (evt === null) {
                                                                                    setFieldValue("medium_id", []);
                                                                                } else {
                                                                                    setFieldValue(
                                                                                        "medium_id",
                                                                                        [].slice.call(evt).map((val) => val.value)
                                                                                    );
                                                                                }
                                                                            }}
                                                                            placeholder="Choose Post Type"
                                                                            onBlur={() => setFieldTouched("medium_id")}
                                                                            defaultValue={
                                                                                this.state.selectedMediumList
                                                                            }
                                                                        />
                                                                        {errors.medium_id && touched.medium_id ? (
                                                                            <span className="errorMsg">{errors.medium_id}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row> */}
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Permalink
                                                                      <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="permalink"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Permalink"
                                                                            autoComplete="off"
                                                                            value={values.permalink}
                                                                        />
                                                                        {errors.permalink && touched.permalink ? (
                                                                            <span className="errorMsg">
                                                                                {errors.permalink}
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
                                                            {this.state.category_id > 0
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

export default Categories
