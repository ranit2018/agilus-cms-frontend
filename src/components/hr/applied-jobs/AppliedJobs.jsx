import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import {
    Row,
    Col,
    Modal,
    Tooltip,
    OverlayTrigger,
} from 'react-bootstrap';
import { Formik, Field, Form } from 'formik';
import API from "../../../shared/hr-axios"
import * as Yup from 'yup';
import swal from 'sweetalert';
import { showErrorMessage } from '../../../shared/handle_error';
import {
    htmlDecode,
    getHeightWidth,
    generateResolutionText,
    getResolution,
    FILE_VALIDATION_MASSAGE,
    FILE_SIZE,
    FILE_VALIDATION_SIZE_ERROR_MASSAGE,
    FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from '../../../shared/helper';
import Pagination from 'react-js-pagination';
import Layout from '../layout/Layout';
import dateFormat from 'dateformat';
import Switch from 'react-switch';

const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const custStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return 'Active';
    } else if (cell === 0) {
        return 'Inactive';
    }
};

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
    return (
        <OverlayTrigger
            overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
            placement="left"
            delayShow={300}
            delayHide={150}
            trigger={['hover']}
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
                tooltip={'Click to Edit'}
                clicked={(e) => refObj.modalShowHandler(e, cell)}
                // clicked={(e) => refObj.editJob(e, cell)}
                href="#"
                id="tooltip-1"
            >
                <i className="far fa-edit" />
            </LinkWithTooltip>
            <LinkWithTooltip
                tooltip={'Click to change status'}
                // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
                href="#"
                id="tooltip-1"
            >
                <Switch
                    checked={row.status == 1 ? true : false}
                    uncheckedIcon={false}
                    onChange={() => refObj.chageStatus(row.job_id, row.status)}
                    height={20}
                    width={45}
                />
            </LinkWithTooltip>
            <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell, row.job_id)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip>
        </div>
    );
};
const setJobImage = (refObj) => (cell, row) => {
    return (
        <div
            style={{
                width: '100px',
                height: '100px',
                overflow: 'hidden',
            }}
        >
            <img
                src={cell}
                alt="Appliedjobs"
                width="100%"
                onClick={(e) => refObj.imageModalShowHandler(row.feature_image)}
            ></img>
        </div>
    );
};

const setDate = (refOBj) => (cell) => {
    if (cell && cell != '') {
        var mydate = new Date(cell);
        return dateFormat(mydate, 'dd-mm-yyyy');
    } else {
        return '---';
    }
};

const initialValues = {
    id: '',
    name: '',
    email: '',
    phone_no: '',
    job_title: '',
    job_description: '',
    date_applied: '',
    application_status_id: '',
    application_status: '',
};

class AppliedJobs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appliedJobs: [],
            appliedJobDetails: {},
            // categoryList: [],
            appliedJobId: 0,
            isLoading: false,
            showModal: false,
            showModalLoader: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            // selectedCategoryList: [],
            selectStatus: [
                { value: '0', label: 'Inactive' },
                { value: '1', label: 'Active' },
            ],
            thumbNailModal: false,
            id: '',
            name: '',
            email: '',
            phone_no: '',
            job_title: '',
            job_description: '',
            date_applied: '',
            application_status_id: '',
            application_status: '',
            search_name: '',
            search_email: '',
            search_job_title: '',
            search_application_status: '',

        };
    }
    componentDidMount() {
        this.getAppliedJobsList();
    }

    getAppliedJobsList = (page = 1) => {

        API.get(`/api/job_portal/job/user/apply?page=${page}`)
            .then((res) => {
                console.log('res.data get list', res.data.data)
                this.setState({
                    appliedJobs: res.data.data,
                    totalCount: Number(res.data.count),
                    isLoading: false,
                    showModalLoader: true,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    };

    getappliedJobDetailsbyId = (id) => {
        API.get(`api/job_portal/job/${id}`)
            .then((res) => {
                this.setState({
                    appliedJobDetails: res.data.data[0],
                    appliedJobId: res.data.data[0].id,
                    isLoading: false,
                    showModal: true,
                    showModalLoader: true,
                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    };

    appliedJobSearch = (e) => {
        e.preventDefault();

        const search_name = document.getElementById('search_name').value;
        const search_email = document.getElementById('search_email').value;
        const search_job_title = document.getElementById('search_job_title').value;
        const search_application_status = document.getElementById('search_apllication_state').value;


        if (
            search_job_title === '' &&
            search_name === '' &&
            search_email === '' &&
            search_application_status === ''
        ) {
            return false;
        }

        API.get(
            `/api/job_portal/job?page=1&job_title=${encodeURIComponent(
                search_job_title
            )}&name=${encodeURIComponent(
                search_name
            )}&email=${encodeURIComponent(
                search_email
            )}&application_status=${encodeURIComponent(
                search_application_status
            )}`
        )
            .then((res) => {
                this.setState({
                    appliedJobs: res.data.data,
                    totalCount: Number(res.data.count),
                    isLoading: false,
                    search_job_title: search_job_title,
                    search_name: search_name,
                    search_email: search_email,
                    search_application_status: search_application_status,
                    activePage: 1,
                    remove_search: true,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    };

    clearSearch = () => {
        document.getElementById('search_job_title').value = '';
        document.getElementById('search_name').value = '';
        document.getElementById('search_email').value = '';
        document.getElementById('search_application_status').value = '';

        this.setState(
            {
                search_job_title: '',
                search_name: '',
                search_email: '',
                search_application_status: '',


                remove_search: false,
            },
            () => {
                this.setState({ activePage: 1 });
                this.getAppliedJobsList();
            }
        );
    };

    confirmDelete = (event, cell, id) => {
        event.preventDefault();
        swal({
            closeOnClickOutside: false,
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.deleteJobs(id);
            }
        });
    };

    deleteJobs = (id) => {
        API.post(`/api/job_portal/job/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: 'Success',
                    text: 'Record deleted successfully.',
                    icon: 'success',
                }).then(() => {
                    this.getAppliedJobsList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };


    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getAppliedJobsList(pageNumber > 0 ? pageNumber : 1);
    };

    //for edit/add part
    modalCloseHandler = () => {
        this.setState({
            showModal: false,
            id: '',
            name: '',
            email: '',
            phone_no: '',
            job_title: '',
            job_description: '',
            date_applied: '',
            application_status_id: '',
            application_status: '',
        });
    };

    //for edit/add part
    modalShowHandler = (event, id) => {
        if (id) {
            event.preventDefault();
            this.getappliedJobDetailsbyId(id);
        } else {
            this.setState({ showModal: true });
        }
    };

    handleSubmitEventUpdate = async (values, actions) => {

        let formData = new FormData();

        formData.append('job_title', values.job_title);
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('job_description', values.job_description);
        formData.append('application_status', String(values.application_status));

        let url = `/api/job_portal/job/${this.state.appliedJobId}`;
        let method = 'PUT';


        formData.append('feature_image', this.state.feature_image);
        API({
            method: method,
            url: url,
            data: formData,
        })
            .then((res) => {
                this.setState({ showModal: false });
                swal({
                    closeOnClickOutside: false,
                    title: 'Success',
                    text: 'Updated Successfully',
                    icon: 'success',
                }).then(() => {
                    this.getAppliedJobsList();
                });
            })
            .catch((err) => {
                this.setState({ closeModal: true, showModalLoader: false });
                if (err.data.status === 3) {
                    showErrorMessage(err, this.props);
                } else {
                    actions.setErrors(err.data.errors);
                    actions.setSubmitting(false);
                }
            });


    };



    render() {
        const { appliedJobDetails } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            id: appliedJobDetails.id ? appliedJobDetails.id : '',
            job_title: appliedJobDetails.job_title ? appliedJobDetails.job_title : '',
            name: appliedJobDetails.name ? appliedJobDetails.name : '',
            job_description: appliedJobDetails.job_description
                ? appliedJobDetails.job_description
                : '',
            applied_date: appliedJobDetails.applied_date ? appliedJobDetails.applied_date : '',
            application_status:
                appliedJobDetails.application_status || appliedJobDetails.application_status === 0
                    ? appliedJobDetails.application_status.toString()
                    : '',
        });

        // const validateStopFlagUpdate = Yup.object().shape({
        //     job_title: Yup.string().required('Please enter job title'),
        //     job_role: Yup.string().required('Please select job role'),
        //     job_location: Yup.string().required('Please select job location'),
        //     category_name: Yup.string().required('Please select category name'),
        //     job_description: Yup.string().required('Please enter job description'),
        //     job_skill: Yup.string().required('Please select job_skill'),
        //     status: Yup.number().required('Please select status'),
        // });


        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Applied Jobs
                                    <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">

                                    {/*========= search ===============*/}
                                </div>
                                <form className="form">
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="job_title"
                                            id="search_job_title"
                                            placeholder="Filter by Job Title"
                                        />
                                    </div>
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="name"
                                            id="search_name"
                                            placeholder="Filter by name"
                                        />
                                    </div>
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="email"
                                            id="search_email"
                                            placeholder="Filter by email"
                                        />
                                    </div>
                                   
                                   

                                    <div className="">
                                        <input
                                            type="submit"
                                            value="Search"
                                            className="btn btn-warning btn-sm"
                                            onClick={(e) => this.appliedJobSearch(e)}
                                        />
                                        {this.state.remove_search ? (
                                            <a
                                                onClick={() => this.clearSearch()}
                                                className="btn btn-danger btn-sm"
                                            >
                                                {' '}
                                                Remove{' '}
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
                                <BootstrapTable data={this.state.appliedJobs}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="job_title"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Title
                                    </TableHeaderColumn>
        
                                    <TableHeaderColumn
                                        dataField="name"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        name
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="job_description"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Job Description
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="email"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Email
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="phone_no"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Phone number
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="job_title"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Job Titile
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="date_applied"
                                        dataFormat={setDate(this)}
                                    >
                                        Post Date
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

                               

                                {/* ======= Edit Applied Jobs Modal ======== */}

                                {/* <Modal
                                    show={this.state.showModal}
                                    onHide={() => this.modalCloseHandler()}
                                    backdrop="static"
                                >
                                    <Formik
                                        initialValues={newInitialValues}
                                        // validationSchema={validateStopFlagUpdate}
                                        onSubmit={this.handleSubmitEventUpdate}
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
                                            setErrors,
                                        }) => {
                                            return (
                                                <Form>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>
                                                            Edit Applied Jobs
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className="contBox">
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Title
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="job_title"
                                                                            id="job_title"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter Job Title"
                                                                            autoComplete="off"
                                                                            value={values.job_title}
                                                                        />
                                                                        {errors.job_title && touched.job_title ? (
                                                                            <span className="errorMsg">
                                                                                {errors.job_title}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Roles
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="job_role"
                                                                            id="job_role"
                                                                            component="select"
                                                                            className={`selectArowGray form-control`}
                                                                            autoComplete="off"
                                                                            value={values.job_role}
                                                                        >
                                                                            <option key="-1" value="">
                                                                                Select Job Role
                                                                            </option>
                                                                            {this.state.job_role_arr.map((val, i) => (
                                                                                <option key={i} value={val.value}>
                                                                                    {val.label}
                                                                                </option>
                                                                            ))}
                                                                        </Field>
                                                                        {errors.job_role && touched.job_role ? (
                                                                            <span className="errorMsg">
                                                                                {errors.job_role}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Location
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="job_location"
                                                                            id="job_location"
                                                                            component="select"
                                                                            className={`selectArowGray form-control`}
                                                                            autoComplete="off"
                                                                            value={values.job_location}
                                                                        >
                                                                            <option key="-1" value="">
                                                                                Select Job Location
                                                                            </option>
                                                                            {this.state.job_location_arr.map(
                                                                                (val, i) => (
                                                                                    <option key={i} value={val.value}>
                                                                                        {val.label}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </Field>
                                                                        {errors.job_location &&
                                                                            touched.job_location ? (
                                                                            <span className="errorMsg">
                                                                                {errors.job_location}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Category
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="category_name"
                                                                            id="category_name"
                                                                            component="select"
                                                                            className={`selectArowGray form-control`}
                                                                            autoComplete="off"
                                                                            value={values.category_name}
                                                                        >
                                                                            <option key="-1" value="">
                                                                                Select Job Category
                                                                            </option>
                                                                            {this.state.job_category_arr.map(
                                                                                (val, i) => (
                                                                                    <option
                                                                                        key={val.id}
                                                                                        value={val.value}
                                                                                    >
                                                                                        {val.label}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </Field>
                                                                        {errors.category_name &&
                                                                            touched.category_name ? (
                                                                            <span className="errorMsg">
                                                                                {errors.category_name}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Skill
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="job_skill"
                                                                            id="job_skill"
                                                                            component="select"
                                                                            className={`selectArowGray form-control`}
                                                                            autoComplete="off"
                                                                            value={values.job_skill}
                                                                        >
                                                                            <option key="-1" value="">
                                                                                Select Job Skill
                                                                            </option>
                                                                            {this.state.job_skill_arr.map(
                                                                                (val, i) => (
                                                                                    <option key={i} value={val.value}>
                                                                                        {val.label}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </Field>
                                                                        {errors.job_skill && touched.job_skill ? (
                                                                            <span className="errorMsg">
                                                                                {errors.job_skill}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Job Description
                                                                            <span className="impField">*</span>
                                                                        </label>
                                                                        <Field
                                                                            name="job_description"
                                                                            id="job_description"
                                                                            type="text"
                                                                            className={`form-control`}
                                                                            placeholder="Enter job description"
                                                                            autoComplete="off"
                                                                            value={values.job_description}
                                                                        />
                                                                        {errors.job_description &&
                                                                            touched.job_description ? (
                                                                            <span className="errorMsg">
                                                                                {errors.job_description}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className="form-group">
                                                                        <label>
                                                                            Upload Image
                                                                            <span className="impField">*</span>
                                                                            <br />{' '}
                                                                            <i>{this.state.fileValidationMessage}</i>
                                                                            <br />{' '}
                                                                            <i>{this.state.validationMessage} </i>
                                                                        </label>
                                                                        <Field
                                                                            name="feature_image"
                                                                            type="file"
                                                                            className={`form-control`}
                                                                            placeholder="feature_image"
                                                                            autoComplete="off"
                                                                            id=""
                                                                            onChange={(e) => {
                                                                                this.fileChangedHandler(
                                                                                    e,
                                                                                    setFieldTouched,
                                                                                    setFieldValue,
                                                                                    setErrors
                                                                                );
                                                                            }}
                                                                        />
                                                                        {errors.feature_image &&
                                                                            touched.feature_image ? (
                                                                            <span className="errorMsg">
                                                                                {errors.feature_image}
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
                                                                            {this.state.selectStatus.map((val, i) => (
                                                                                <option key={i} value={val.value}>
                                                                                    {val.label}
                                                                                </option>
                                                                            ))}
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
                                                            className={`btn btn-success btn-sm ${isValid ? 'btn-custom-green' : 'btn-disable'
                                                                } m-r-10`}
                                                            type="submit"
                                                            disabled={
                                                                isValid ? (isSubmitting ? true : false) : true
                                                            }
                                                        >
                                                            {this.state.appliedJobId > 0
                                                                ? isSubmitting
                                                                    ? 'Updating...'
                                                                    : 'Update'
                                                                : isSubmitting
                                                                    ? 'Submitting...'
                                                                    : 'Submit'}
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
                                </Modal> */}
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        );
    }
}

export default AppliedJobs;
