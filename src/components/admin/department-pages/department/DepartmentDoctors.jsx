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
import API from "../../../../shared/admin-axios";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

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
    console.log(row)
    return (
        <div className="actionStyle">
            <LinkWithTooltip
                tooltip={"Click to change status"}
                href="#"
                id="tooltip-1"
            >
                <Switch
                    checked={row.status == 1 ? true : false}
                    uncheckedIcon={false}
                    onChange={(e) => refObj.chageStatus( row.doctor_id, row.status)}
                    height={20}
                    width={45}
                />
            </LinkWithTooltip>
            <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, row.doctor_id)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip>
        </div>
    );
};


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
      types:[],


        };
    }

    componentDidMount() {
        console.log('doctors')
        this.getDoctorList(this.state.activePage);
        this.getTypes();

    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
    };

    getDoctorList = (page = 1) => {

        API.get(
            `/api/department/department-all-type/${this.state.department_id}/1?page=1`
        )
            .then((res) => {
                this.setState({
                    doctorList: res.data.data,
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
    };

    getTypes() {
        ///api/department/type?page=1&department_type=Publication
            API.get(`/api/department/type?page=1`)
              .then((res) => {
                console.log('res',res.data.data)
                this.setState({
                  types: res.data.data,
                }); 
              })
              .catch((err) => {
                showErrorMessage(err, this.props);
              });
          }

    //search
    doctorSearch = (e) => {
        e.preventDefault();
        var doctor_name = document.getElementById("doctor_name").value;
        var designation = document.getElementById("designation").value;
        let status = document.getElementById("status").value;
    
        if (
          doctor_name === "" &&
          designation === "" &&
          status === ""
        ) {
          return false;
        }
    
        API.get(
          `/api/department/department-all-type/${this.state.department_id}/1?page=1&doctor_name=${encodeURIComponent(
            doctor_name
          )}&designation=${encodeURIComponent(
            designation
          )}&status=${encodeURIComponent(
            status
          )}`
        )
          .then((res) => {
            this.setState({
                doctorList: res.data.data,
              totalCount: Number(res.data.count),
              isLoading: false,
    
              doctor_name: doctor_name,
              designation: designation,
              status: status,
    
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
        document.getElementById("doctor_name").value = "";
        document.getElementById("designation").value = "";
        document.getElementById("status").value = "";
    
        this.setState(
          {
            designation: "",
            doctor_name: "",
            status: "",
    
            remove_search: false,
          },
          () => {
            this.setState({ activePage: 1 });
            this.getDoctorList();
          }
        );
      };

    //change status
    chageStatus = (id, status) => {
       
        API.put(`/api/department/department-all-type/change_status/${this.state.department_id}/1/${id}`, {
            status: status == 1 ? String(0) : String(1),
        })
            .then((res) => {
                console.log('res status',res.data)
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record updated successfully.",
                    icon: "success",
                }).then(() => {
                    this.getDoctorList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    //delete
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
                this.deleteDoctor(id);
            }
        });
    };

    deleteDoctor = (id) => {
        console.log('id',id)
        API.post(`/api/department/department-all-type/${this.state.department_id}/1/${id}`)

            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getDoctorList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };


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
                                    Departments Doctors
                                    <small />
                                </h1>
                                <input
                                    type="button"
                                    value="Go Back"
                                    className="btn btn-warning btn-sm"
                                    onClick={() => {
                                        window.history.go(-1);
                                        return false;
                                    }}
                                    style={{ right: "9px", position: "absolute", top: "13px" }}
                                />
                            </div>
                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">

                                <form className="form">
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="doctor_name"
                                            id="doctor_name"
                                            placeholder="Filter by Doctor Name"
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
                                        <select name="status" id="status" className="form-control">
                                            <option value="">Select Status</option>
                                            {this.state.selectStatus.map((val) => {
                                                return (
                                                    <option key={val.value} value={val.value}>
                                                        {val.label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="">
                                        <input
                                            type="submit"
                                            value="Search"
                                            className="btn btn-warning btn-sm"
                                            onClick={(e) => this.doctorSearch(e)}
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
                                <BootstrapTable
                                    wrapperClasses="table-responsive"
                                    data={this.state.doctorList}
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
                                    <TableHeaderColumn
                                        dataField="id"
                                        dataFormat={actionFormatter(this)}
                                        dataAlign=""
                                        width="125"
                                        tdStyle={{ wordBreak: "break-word" }}
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
