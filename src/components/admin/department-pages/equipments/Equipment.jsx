/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import swal from "sweetalert";
import Select from "react-select";
import Layout from "../../layout/Layout";

import {
  htmlDecode,
  getHeightWidth,
  getHeightWidthFromURL,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../../shared/helper";
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
        clicked={(e) => refObj.editEquipment(e, cell)}
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

const imageFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      {row.images.map((val, index) => {
        return (
          <LinkWithTooltip
            tooltip="Click to see picture"
            href="#"
            // clicked={(e) => refObj.imageModalShowHandler(val.equipment_image)}
            id="tooltip-1"
            key={index}
          >
            <img
              src={val.equipment_image}
              alt="Equipment"
              height="30"
              onClick={(e) =>
                refObj.imageModalShowHandler(e, val.equipment_image)
              }
            />
          </LinkWithTooltip>
        );
      })}
    </div>
  );
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
  return cell.replace(".png", " ");
};

const EquipmentStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
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

const setType = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return " Instrument";
  } else if (cell === 2) {
    return "Equipment";
  }
};

class Equipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      equipmentDetails: [],
      selectedOption: [],
      checkedRows: [],
      isLoading: false,
      showModal: false,
      equipment_id: 0,
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
      type: "",

      alldata: [],
      equipmentSearch: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      selectType: [
        { value: "1", label: "Instrument" },
        { value: "2", label: "Equipment" },
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      message: "",
    };
  }

  componentDidMount() {
    this.getEquipmentList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getEquipmentList(pageNumber > 0 ? pageNumber : 1);
  };

  getEquipmentList = (page = 1) => {
    let type = document.getElementById("type").value;
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;

    API.get(
      `/api/department/equipment?page=${page}&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&type=${encodeURIComponent(type)}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
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

  equipmentSearch = (e) => {
    e.preventDefault();
    let type = document.getElementById("type").value;
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;

    if (
      type === "" &&
      equipment_name === "" &&
      equipment_description === "" &&
      status === ""
    ) {
      return false;
    }

    API.get(
      `/api/department/equipment?page=1&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&type=${encodeURIComponent(type)}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,

          equipment_name: equipment_name,
          equipment_description: equipment_description,
          status: status,
          type: type,

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
    document.getElementById("equipment_name").value = "";
    document.getElementById("equipment_description").value = "";
    document.getElementById("status").value = "";
    document.getElementById("type").value = "";

    this.setState(
      {
        type: "",
        equipment_description: "",
        equipment_name: "",
        status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getEquipmentList();
      }
    );
  };

  //change status
  chageStatus = (cell, status) => {
    API.put(`/api/department/equipment/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Status updated successfully.",
          icon: "success",
        }).then(() => {
          this.getEquipmentList(this.state.activePage);
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
        this.deleteEquipment(id);
      }
    });
  };

  deleteEquipment = (id) => {
    API.post(`/api/department/equipment/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getEquipmentList(this.state.activePage);
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
  editEquipment(e, id) {
    e.preventDefault();

    API.get(`/api/department/equipment/${id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/department/edit-equipment/" + id,
          state: {
            alldata: res.data.data[0],
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      // id: "",
      type: "",
      alldata: "",
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
      // equipmentDetails: "",
      equipment_id: 0,
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualEquipment(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  //image modal
  imageModalShowHandler = (e, url) => {
    e.preventDefault();
    console.log("url", url);
    this.setState({ thumbNailModal: true, equipment_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, equipment_image: "" });
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Equipments & Instruments
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
                        pathname: "/department/add-equipment",
                        state: { alldata: this.state.alldata },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Equipment &
                    Instrument
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_name"
                      id="equipment_name"
                      placeholder="Filter by Equipment Name"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_description"
                      id="equipment_description"
                      placeholder="Filter by Description"
                    />
                  </div>

                  <div className="">
                    <select name="type" id="type" className="form-control">
                      <option value="">Select Type</option>
                      {this.state.selectType.map((val) => {
                        return (
                          <option key={val.value} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
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
                      onClick={(e) => this.equipmentSearch(e)}
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
                  data={this.state.equipmentDetails}
                >
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={setType(this)}
                  >
                    Type
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="id"
                    dataAlign=""
                    width="125"
                    dataFormat={imageFormatter(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    isKey
                    dataField="equipment_name"
                    dataFormat={setName(this)}
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Equipment & Instrument Name
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="equipment_description"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Description
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Post Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={EquipmentStatus(this)}
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

                {/* =====Image modal===== */}
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    Equipment & Instrument Image
                  </Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.equipment_image}
                          alt="Equipment Image"
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
export default Equipment;
