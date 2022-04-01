/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import Layout from "../../layout/Layout";
import Pagination from "react-js-pagination";
import dateFormat from "dateformat";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
    return cell.replace(".png", " ");
};

const doctorStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Active";
    } else if (cell === 0) {
        return "Inactive";
    }
};

const setDoctorImage = (refObj) => (cell, row) => {
    return (
        <img
            src={row.doctor_image}
            alt="Doctor"
            height="100"
            onClick={(e) => refObj.imageModalShowHandler(row.doctor_image)}
        ></img>
    );
};

const setDate = (refOBj) => (cell) => {
    if (cell && cell != "") {
        var mydate = new Date(cell);
        return dateFormat(mydate, "dd-mm-yyyy");
    } else {
        return "---";
    }
};

class DepartmentDoctors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectStatus: [
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
            ],
            department_id: this.props.match.params.id,
            doctorList: [],

            suggestions: [],
            value: "",
            selectedValue: "",
            doctors_arr: [],

        };
    }

    // componentDidMount() {
    //     this.getDoctorList(this.state.activePage);
    // }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
    };

    // getDoctorList = (page = 1) => {

    //     API.get(
    //         `/api/department/doctor?page=${page}`
    //     )
    //         .then((res) => {
    //             this.setState({
    //                 doctorList: res.data.data,
    //                 totalCount: Number(res.data.count),

    //                 isLoading: false,
    //             });
    //         })
    //         .catch((err) => {
    //             this.setState({
    //                 isLoading: false,
    //             });
    //             showErrorMessage(err, this.props);
    //         });
    // };


    //image modal
    imageModalShowHandler = (url) => {
        this.setState({ thumbNailModal: true, doctor_image: url });
    };
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, doctor_image: "" });
    };
    render() {
        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Department Doctors
                                    <small />
                                </h1>
                            </div>


                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">
                                <BootstrapTable
                                    wrapperClasses="table-responsive"
                                    data={this.props.location.state.doctorList}
                                >
                                    <TableHeaderColumn
                                        isKey
                                        dataField="doctor_image"
                                        dataFormat={setDoctorImage(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Image
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="doctor_name"
                                        dataFormat={setName(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Doctor Name
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="designation"
                                        dataFormat={__htmlDecode(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Designation
                                    </TableHeaderColumn>

                                    <TableHeaderColumn
                                        dataField="date_posted"
                                        dataFormat={setDate(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Date Added
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="status"
                                        dataFormat={doctorStatus(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Status
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
                                {/* =====Image modal===== */}
                                <Modal
                                    show={this.state.thumbNailModal}
                                    onHide={() => this.imageModalCloseHandler()}
                                    backdrop="static"
                                >
                                    <Modal.Header closeButton>Doctor Image</Modal.Header>
                                    <Modal.Body>
                                        <center>
                                            <div className="imgUi">
                                                <img
                                                    src={this.state.doctor_image}
                                                    alt="Doctor Image"
                                                ></img>
                                            </div>
                                        </center>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        );
    }
}
export default DepartmentDoctors;
