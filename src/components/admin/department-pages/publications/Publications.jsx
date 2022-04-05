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
        clicked={(e) => refObj.editPublication(e, cell)}
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

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
  return cell.replace(".png", " ");
};

const PublicationsStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const setPublicationsImage = (refObj) => (cell, row) => {
  return (
    <img
      src={row.publication_image}
      alt="Publications"
      height="100"
      onClick={(e) => refObj.imageModalShowHandler(row.publication_image)}
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

class Publications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicationDetails: [],
      isLoading: false,
      showModal: false,
      publication_id: 0,
      publication_code: "",
      publication_heading: "",
      publication_description: "",
      publication_image: "",
      date_posted: "",
      status: "",

      alldata: [],
      publicationSearch: [],
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
    this.getPublicationsList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getPublicationsList(pageNumber > 0 ? pageNumber : 1);
  };

  getPublicationsList = (page = 1) => {
    var publication_heading = document.getElementById(
      "publication_heading"
    ).value;
    var short_name = document.getElementById("short_name").value;
    let status = document.getElementById("status").value;
    API.get(
      `/api/department/publication?page=${page}&publication_heading=${encodeURIComponent(
        publication_heading
      )}&short_name=${encodeURIComponent(
        short_name
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          publicationDetails: res.data.data,
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

  publicationSearch = (e) => {
    e.preventDefault();
    var publication_heading = document.getElementById(
      "publication_heading"
    ).value;
    var short_name = document.getElementById("short_name").value;
    let status = document.getElementById("status").value;
    if (publication_heading === "" && short_name === "" && status === "") {
      return false;
    }
    API.get(
      `/api/department/publication?page=1&publication_heading=${encodeURIComponent(
        publication_heading
      )}&short_name=${encodeURIComponent(
        short_name
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          publicationDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          publication_heading: publication_heading,
          short_name: short_name,
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
    document.getElementById("publication_heading").value = "";
    document.getElementById("short_name").value = "";
    document.getElementById("status").value = "";
    this.setState(
      {
        short_name: "",
        publication_heading: "",
        status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getPublicationsList();
      }
    );
  };

  //change status
  chageStatus = (cell, status) => {
    API.put(`/api/department/publication/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Status updated successfully.",
          icon: "success",
        }).then(() => {
          this.getPublicationsList(this.state.activePage);
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
        this.deletePublications(id);
      }
    });
  };

  deletePublications = (id) => {
    API.post(`/api/department/publication/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getPublicationsList(this.state.activePage);
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
  editPublication(e, id) {
    e.preventDefault();

    API.get(`/api/department/publication/${id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/department/edit-publication/" + id,
          state: {
            alldata: res.data.data[0],
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  //image modal
  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, publication_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, publication_image: "" });
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Publications
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
                        pathname: "/department/add-publication",
                        state: { alldata: this.state.alldata },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Publication
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="publication_heading"
                      id="publication_heading"
                      placeholder="Filter by Publication Heading"
                    />
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      name="short_name"
                      id="short_name"
                      placeholder="Filter by Short Name"
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
                      onClick={(e) => this.publicationSearch(e)}
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
                  data={this.state.publicationDetails}
                >
                  <TableHeaderColumn
                    isKey
                    dataField="publication_image"
                    dataFormat={setPublicationsImage(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="publication_code"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Code
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="short_name"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Short Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="publication_heading"
                    dataFormat={setName(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Publication Heading
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="publication_description"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Description
                  </TableHeaderColumn> */}

                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Date Added
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={PublicationsStatus(this)}
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
                  <Modal.Header closeButton>Publication Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.publication_image}
                          alt="Publication Image"
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
export default Publications;
