import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
// import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../../shared/helper";
import Select from "react-select";
import Layout from "../../layout/Layout";
import dateFormat from "dateformat";
import Switch from "react-switch";

const initialValues = {
  member_image: "",
  member_name: "",
  designation: "",
  about_member: "",
  status: "",
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
        clicked={(e) => refObj.editKeyMember(e, cell)}
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
const setMmemberImage = (refObj) => (cell, row) => {
  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        overflow: "hidden",
      }}
    >
      <img
        src={cell}
        alt="Blog Image"
        width="100%"
        onClick={(e) => refObj.imageModalShowHandler(row.member_image)}
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

class KeyMembers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keyMembers: [],
      keyMmeberDetails: {},
      member_id: 0,
      isLoading: false,
      showModal: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      name: "",
      status: "",
    };
  }
  componentDidMount() {
    this.getKeyMemberList();
  }

  getKeyMemberList = (page = 1) => {
    let name = this.state.name;
    let status = this.state.status;

    API.get(
      `/api/feed/key-members?page=${page}&name=${encodeURIComponent(
        name
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          keyMembers: res.data.data,
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

  editKeyMember(e, id) {
    e.preventDefault();

    this.props.history.push(`/about-us/edit-key-member/${id}`)
  }

  keyMemberSearch = (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const status = document.getElementById("status").value;

    if (name === "" && status === "") {
      return false;
    }
    API.get(
      `/api/feed/key-members?page=1&name=${encodeURIComponent(
        name
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          keyMembers: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          name: name,
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
    document.getElementById("name").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        name: "",
        status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getKeyMemberList();
      }
    );
  };

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
        this.deleteKeyMmember(id);
      }
    });
  };

  deleteKeyMmember = (id) => {
    API.delete(`/api/feed/key-members/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getKeyMemberList(this.state.activePage);
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
    console.log('id',cell , status)
    API.put(`/api/feed/key-members/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getKeyMemberList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getKeyMemberList(pageNumber > 0 ? pageNumber : 1);
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Key Members
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
                        pathname: "/about-us/add-key-members",
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Key Member
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="name"
                      id="name"
                      placeholder="Filter by Member Name"
                    />
                  </div>

                  <div className="">
                    <select name="status" id="status" className="form-control">
                      <option value="">Select Member Status</option>
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
                      onClick={(e) => this.keyMemberSearch(e)}
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
                <BootstrapTable data={this.state.keyMembers}>
                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="member_image"
                    dataFormat={setMmemberImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="designation"
                    dataFormat={__htmlDecode(this)}
                  >
                    Designation
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="about"
                    dataFormat={__htmlDecode(this)}
                  >
                    About
                  </TableHeaderColumn> */}
                  <TableHeaderColumn
                    dataField="date_added"
                    dataFormat={setDate(this)}
                  >
                    Date Added
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
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Member Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.url} alt="Member Image"></img>
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

export default KeyMembers;
