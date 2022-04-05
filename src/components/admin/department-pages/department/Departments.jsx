/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Pagination from "react-js-pagination";
import Layout from "../../layout/Layout";
import dateFormat from "dateformat";
import Switch from "react-switch";

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
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.editDepartment(e, cell)}
        href="#"
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
        clicked={(e) => refObj.confirmDelete(e, cell, row.id)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="View Doctors"
        href="#"
        clicked={(e) => refObj.departmentDoctors(e, row)}
        id="tooltip-1"
      >
        <i className="fa fa-user-md" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="View Equipments & Instruments"
        href="#"
        clicked={(e) => refObj.departmentEquipments(e, row)}
        id="tooltip-1"
      >
        <i className="fa fa-medkit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="View Publications"
        href="#"
        clicked={(e) => refObj.departmentPublications(e, row)}
        id="tooltip-1"
      >
        <i className="fa fa-sticky-note" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="View Tests"
        href="#"
        clicked={(e) => refObj.departmentTests(e, row)}
        id="tooltip-1"
      >
        <i className="fa fa-flask" />
      </LinkWithTooltip>
    </div>
  );
};
const setDepartmentImage = (refObj) => (cell, row) => {
  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        overflow: "hidden",
      }}
    >
      <img
        src={cell}
        alt="department"
        width="100%"
        onClick={(e) => refObj.imageModalShowHandler(row.department_image)}
      ></img>
    </div>
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

const initialValues = {
  id: "",
  department_image: "",
  department_name: "",
  doctors: "",
  equipments: "",
  publications: "",
  date_posted: "",
  status: "",
};

class Departments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      departmentList: [],
      departmentDetails: [],
      department_id: 0,
      isLoading: false,
      showModal: false,
      showModalLoader: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      department_name: "",
      doctors: "",
      department_image: "",
      equipments: "",
      publications: "",
      date_posted: "",
      status: "",
      search_department_name: "",
      search_doctors: "",
      search_equipments: "",
      search_publications: "",
      search_status: "",
      types: [],
    };
  }
  componentDidMount() {
    this.getDepartmentsList();
    this.getTypes();
    this.setState({
      validationMessage: generateResolutionText("departments"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  getDepartmentsList = (page = 1) => {
    const search_department_name = document.getElementById(
      "search_department_name"
    ).value;
    const search_status = document.getElementById("search_status").value;
    API.get(
      `/api/department?page=${page}&department_name=${encodeURIComponent(
        search_department_name
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          departmentList: res.data.data,
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

  getTypes() {
    ///api/department/type?page=1&department_type=Publication
    API.get(`/api/department/type?page=1`)
      .then((res) => {
        this.setState({
          types: res.data.data,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  getdepartmentDetailsbyId = (id) => {
    API.get(`/api/department/${id}`)
      .then((res) => {
        this.setState({
          departmentDetails: res.data.data[0],
          department_id: res.data.data[0].id,
          isLoading: false,
          showModal: true,
          showModalLoader: true,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  departmentSearch = (e) => {
    e.preventDefault();

    const search_department_name = document.getElementById(
      "search_department_name"
    ).value;

    const search_status = document.getElementById("search_status").value;
    if (search_department_name === "" && search_status === "") {
      return false;
    }

    API.get(
      `/api/department?page=1&department_name=${encodeURIComponent(
        search_department_name
      )}&status=${encodeURIComponent(search_status)}`
    )
      .then((res) => {
        this.setState({
          departmentList: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          search_department_name: search_department_name,
          // search_doctors: search_doctors,
          // search_publications: search_publications,
          // search_equipments: search_equipments,
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
    document.getElementById("search_department_name").value = "";
    // document.getElementById("search_doctors").value = "";
    // document.getElementById("search_publications").value = "";
    // document.getElementById("search_equipments").value = "";
    document.getElementById("search_status").value = "";

    this.setState(
      {
        search_department_name: "",
        // search_doctors: "",
        // search_equipments: "",
        // search_publications: "",
        search_status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDepartmentsList();
      }
    );
  };

  confirmDelete = (event, cell, id) => {
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
        this.deleteDepartment(id);
      }
    });
  };

  deleteDepartment = (id) => {
    API.post(`/api/department/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getDepartmentsList(this.state.activePage);
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
    API.put(`/api/department/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getDepartmentsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  //imgae modal
  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDepartmentsList(pageNumber > 0 ? pageNumber : 1);
  };

  //for edit/add part
  editDepartment(e, id) {
    e.preventDefault();

    API.get(`/api/department/${id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/departments/edit-department/" + id,
          state: {
            alldata: res.data.data[0],
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  //for department doctors
  departmentDoctors(e, row) {
    e.preventDefault();
    const doctype = this.state.types.doctor;
    this.props.history.push(
      `/departments/department-doctors/${row.id}/${doctype}`
    );
  }

  //for department equipment
  departmentEquipments(e, row) {
    e.preventDefault();
    const equipmenttype = this.state.types.equipment_and_instrument;

    this.props.history.push(
      `/departments/department-equipments/${row.id}/${equipmenttype}`
    );
  }

  //for department publication
  departmentPublications(e, row) {
    e.preventDefault();
    const publicationtype = this.state.types.publication;

    this.props.history.push(
      `/departments/department-publications/${row.id}/${publicationtype}`
    );
  }

  //for department test
  departmentTests(e, id) {
    // e.preventDefault();
    // API.get(`/api/department/doctor/${id}`)
    //   .then((res) => {
    //     this.props.history.push({
    //       pathname: "/departments/edit-department/" + id,
    //       state: {
    //         alldata: res.data.data[0],
    //       },
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  }

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("department_image");
    setFieldValue("department_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        department_image: "",
        isValidFile: true,
      });
      return;
    }
    if (
      event.target.files[0] &&
      SUPPORTED_FORMATS.includes(event.target.files[0].type)
    ) {
      //Supported
      this.setState({
        department_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        department_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        department_image: "",
        isValidFile: false,
      });
    }
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12 ">
                <h1>
                  Manage Department
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
                        pathname: "/departments/add-department",
                        state: {
                          departmentList: this.state.departmentList,
                          doctors_arr: this.state.doctors_arr,
                          equipments_arr: this.state.equipments_arr,
                          publications_arr: this.state.publications_arr,
                        },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Department
                  </button>
                </div>
                <form className="leadForm">
                  <div className="">
                    <input
                      className="form-control"
                      name="department_name"
                      id="search_department_name"
                      placeholder="Filter by Department Name"
                    />
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="status"
                      id="search_status"
                    >
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
                      onClick={(e) => this.departmentSearch(e)}
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
                <BootstrapTable data={this.state.departmentList}>
                  <TableHeaderColumn
                    isKey
                    dataField="department_image"
                    dataFormat={setDepartmentImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="department_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Department
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="department_description"
                    dataFormat={__htmlDecode(this)}
                  >
                    Description
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="total_lab_technical"
                    // dataFormat={__htmlDecode(this)}
                  >
                    Total Technical Lab
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="total_lab_executive"
                    // dataFormat={__htmlDecode(this)}
                  >
                    Total Executive Labs
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="total_consultant_scientists"
                    // dataFormat={__htmlDecode(this)}
                  >
                    Total Consultant Scientists
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                  >
                    Added Date
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

                {/* ======= Image Modal ======== */}

                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Departments Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.url} alt="department"></img>
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

export default Departments;
