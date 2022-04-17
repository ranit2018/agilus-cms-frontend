/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import swal from "sweetalert";
import Layout from "../../layout/Layout";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import Switch from "react-switch";

import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../../shared/handle_error";
import dateFormat from "dateformat";

/*For Tooltip*/

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
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.editDoctor(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      {/* <LinkWithTooltip
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        href="#"
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={(e) => refObj.chageStatus(cell, row.status)}
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
  if(row.doctor_image === null)
  {
    return "No image"
  } else {
    return (
      <img
        src={row.doctor_image}
        alt="Doctor image"
        height="100"
        onClick={(e) => refObj.imageModalShowHandler(row.doctor_image)}
      ></img>
    );
  }
  
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorDetails: [],
      isLoading: false,
      showModal: false,
      doctor_id: 0,
      doctor_name: "",
      education: "",
      expertise: "",
      designation: "",
      doctor_image: "",
      date_posted: "",
      status: "",

      alldata: [],
      doctorSearch: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      message: "",
    };
  }

  componentDidMount() {
    this.getDoctorList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
  };

  getDoctorList = (page = 1) => {
    var doctor_name = document.getElementById("doctor_name").value;
    var designation = document.getElementById("designation").value;
    let status = document.getElementById("status").value;

    API.get(
      `/api/department/doctor?page=${page}&doctor_name=${encodeURIComponent(
        doctor_name
      )}&designation=${encodeURIComponent(
        designation
      )}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          doctorDetails: res.data.data,
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
      `/api/department/doctor?page=1&doctor_name=${encodeURIComponent(
        doctor_name
      )}&designation=${encodeURIComponent(
        designation
      )}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          doctorDetails: res.data.data,
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
  chageStatus = (cell, status) => {
    API.put(`/api/department/doctor/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
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
    API.post(`/api/department/doctor/${id}`)
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

  renderShowsTotal = (start, to, total) => {
    return (
      <span className="pageShow">
        Showing {start} to {to}, of {total} records
      </span>
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  //for edit/add part

  editDoctor(e, id) {
    e.preventDefault();

    this.props.history.push(`/department/edit-doctor/${id}`)

    // API.get(`/api/department/doctor/${id}`)
    //   .then((res) => {
    //     this.props.history.push({
    //       pathname: "/department/edit-doctor/" + id,
    //       state: {
    //         alldata: res.data.data[0],
    //       },
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  }

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      id: "",
      alldata: "",
      doctor_name: "",
      education: "",
      expertise: "",
      designation: "",
      doctor_image: "",
      date_posted: "",
      status: "",
      doctorDetails: "",
      doctor_id: 0,
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualDoctor(id);
    } else {
      this.setState({ showModal: true });
    }
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
                  Manage Doctors
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) =>
                      this.props.history.push({
                        pathname: "/department/add-doctor",
                        state: { alldata: this.state.alldata },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Doctor
                  </button>
                </div>
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
                  data={this.state.doctorDetails}
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
export default Doctor;
