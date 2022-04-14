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
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import swal from "sweetalert";
import Switch from "react-switch";
import { showErrorMessage } from "../../../../shared/handle_error";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

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
      {/* <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={(e) => refObj.chageStatus(row.equipment_id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, row.equipment_id)}
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

// const equipmentStatus = (refObj) => (cell) => {
//   //return cell === 1 ? "Active" : "Inactive";
//   if (cell === 1) {
//     return "Active";
//   } else if (cell === 0) {
//     return "Inactive";
//   }
// };

const setType = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return " Instrument";
  } else if (cell === 2) {
    return "Equipment";
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

const imageFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      {row.images.map((val, index) => {
        return (
          <LinkWithTooltip
            tooltip="Click to see picture"
            href="#"
            id="tooltip-1"
            key={index}
          >
            <img
              src={val.equipment_image}
              alt="Equipment image"
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

class DepartmentEquipments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      selectType: [
        { value: "1", label: "Instrument" },
        { value: "2", label: "Equipment" },
      ],
      department_id: this.props.match.params.id,
      equipmentList: [],
      equipment_image: "",
      activePage: 1,
      types: [],
    };
  }

  componentDidMount() {
    this.getTypes();
    this.getequipmentList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getequipmentList(pageNumber > 0 ? pageNumber : 1);
  };

  getequipmentList = (page = 1) => {
    let type = document.getElementById("type").value;
    var equipment_name = document.getElementById("equipment_name").value;

    API.get(
      `/api/department/department-all-type/${
        this.state.department_id
      }/2?page=${page}&equipment_name=${encodeURIComponent(
        equipment_name
      )}&type=${encodeURIComponent(type)}`
    )
      .then((res) => {
        this.setState({
          equipmentList: res.data.data,
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

  //search
  equipmentSearch = (e) => {
    e.preventDefault();
    const equipmenttype = this.state.types.equipment_and_instrument;
    let type = document.getElementById("type").value;
    var equipment_name = document.getElementById("equipment_name").value;

    if (type === "" && equipment_name === "") {
      return false;
    }

    API.get(
      `/api/department/department-all-type/${
        this.state.department_id
      }/${equipmenttype}?page=1&equipment_name=${encodeURIComponent(
        equipment_name
      )}&type=${encodeURIComponent(type)}`
    )
      .then((res) => {
        this.setState({
          equipmentList: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,

          equipment_name: equipment_name,
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
    document.getElementById("status").value = "";
    document.getElementById("type").value = "";

    this.setState(
      {
        type: "",
        equipment_name: "",
        status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getequipmentList();
      }
    );
  };

  //change status
  // chageStatus = (id, status) => {
  //   const equipmenttype = this.state.types.equipment_and_instrument;

  //   API.put(
  //     `/api/department/department-all-type/change_status/${this.state.department_id}/${equipmenttype}/${id}`,
  //     {
  //       status: status == 1 ? String(0) : String(1),
  //     }
  //   )
  //     .then((res) => {
  //       swal({
  //         closeOnClickOutside: false,
  //         title: "Success",
  //         text: "Status updated successfully.",
  //         icon: "success",
  //       }).then(() => {
  //         this.getequipmentList(this.state.activePage);
  //       });
  //     })
  //     .catch((err) => {
  //       if (err.data.status === 3) {
  //         this.setState({ closeModal: true });
  //         showErrorMessage(err, this.props);
  //       }
  //     });
  // };

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
    const equipmenttype = this.state.types.equipment_and_instrument;

    API.post(
      `/api/department/department-all-type/${this.state.department_id}/${equipmenttype}/${id}`
    )
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getequipmentList(this.state.activePage);
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
  imageModalShowHandler = (e, url) => {
    e.preventDefault();
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
                  Departments Equipments & Instruments
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
                      name="equipment_name"
                      id="equipment_name"
                      placeholder="Filter by Equipment Name"
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

                  {/* <div className="">
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
                  </div> */}

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
                  data={this.state.equipmentList}
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
                  {/* <TableHeaderColumn
                    dataField="status"
                    dataFormat={equipmentStatus(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Status
                  </TableHeaderColumn> */}
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
export default DepartmentEquipments;
