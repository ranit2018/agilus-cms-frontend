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

import swal from "sweetalert";
import Switch from "react-switch";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import { showErrorMessage } from "../../../../shared/handle_error";

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
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={(e) => refObj.chageStatus(row.publication_id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, row.publication_id)}
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

// const PublicationsStatus = (refObj) => (cell) => {
//   //return cell === 1 ? "Active" : "Inactive";
//   if (cell === 1) {
//     return "Active";
//   } else if (cell === 0) {
//     return "Inactive";
//   }
// };

const setPublicationsImage = (refObj) => (cell, row) => {
  if (row.publication_image === null) {
    return "No image";
  } else {
    return (
      <img
        src={row.publication_image}
        alt="Publication image"
        height="100"
        onClick={(e) => refObj.imageModalShowHandler(e, row.publication_image)}
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

class DepartmentPublications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      department_id: this.props.match.params.id,
      publicationList: [],
      types: [],
    };
  }

  componentDidMount() {
    this.getTypes();
    this.getPublicationsList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDoctorList(pageNumber > 0 ? pageNumber : 1);
  };

  getPublicationsList = (page = 1) => {
    var short_name = document.getElementById("short_name").value;
    API.get(
      `/api/department/department-all-type/${
        this.state.department_id
      }/3?page=${page}&short_name=${encodeURIComponent(short_name)}`
    )
      .then((res) => {
        this.setState({
          publicationList: res.data.data,
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
  publicationSearch = (e) => {
    e.preventDefault();
    const publicationtype = this.state.types.publication;
    var short_name = document.getElementById("short_name").value;

    if (short_name === "") {
      return false;
    }
    API.get(
      `/api/department/department-all-type/${
        this.state.department_id
      }/${publicationtype}?page=1&short_name=${encodeURIComponent(short_name)}`
    )
      .then((res) => {
        this.setState({
          publicationList: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
          short_name: short_name,
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
    document.getElementById("short_name").value = "";
    this.setState(
      {
        short_name: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getPublicationsList();
      }
    );
  };

  //change status
  // chageStatus = (id, status) => {
  //   const publicationtype = this.state.types.publication;

  //   API.put(
  //     `/api/department/department-all-type/change_status/${this.state.department_id}/${publicationtype}/${id}`,
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
  //         this.getPublicationsList(this.state.activePage);
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
        this.deletePublications(id);
      }
    });
  };

  deletePublications = (id) => {
    const publicationtype = this.state.types.publication;

    API.post(
      `/api/department/department-all-type/${this.state.department_id}/${publicationtype}/${id}`
    )
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

  //image modal
  imageModalShowHandler = (e, url) => {
    e.preventDefault();
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
                  Department Publication
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
                      name="short_name"
                      id="short_name"
                      placeholder="Filter by Short Name"
                    />
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
                  data={this.state.publicationList}
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
                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Date Added
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="status"
                    dataFormat={PublicationsStatus(this)}
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
export default DepartmentPublications;
