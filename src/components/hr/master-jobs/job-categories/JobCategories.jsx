import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import API from "../../../../../shared/admin-axios";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../../shared/handle_error";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../../../shared/helper";
import Switch from "react-switch";
import Layout from "../../../layout/Layout";

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
        //clicked={(e) => refObj.modalShowHandler(e, cell)}
        clicked={(e) => refObj.editCategories(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.changeStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.changeStatus(row.id, row.status, row)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

class JobCategories extends Component {
  constructor(props) {
    super(props);

    this.state = {
      NewCategoryDetails: {},
      categoryList: [],
      categoryDetails: {},
      categoryId: 0,
      isLoading: false,
      showModal: false,
      showModalUpdate: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      value: "",
      selectedValue: "",
      suggestions: [],
      search_category_name: "",
    };
  }

  getCategoryList = (page = 1) => {
    let { search_category_name } = this.state;
    API.get(
      `api/job_portal/job/category?page=${page}&category_name=${encodeURIComponent(
        search_category_name
      )}`
    )
      .then((res) => {
        this.setState({
          categoryList: res.data.data,
          totalCount: res.data.count,
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

  confirmDelete = (event, id, row) => {
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
        this.deleteCategory(id, row);
      }
    });
  };

  deleteCategory = (id, row) => {

    API.post(`api/job_portal/job/category/${row.id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getCategoryList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getcategoryDetails(id) {
    API.get(`api/job_portal/job/category/${id}`)
      .then((res) => {
        this.setState({
          showModalUpdate: true,
          categoryDetails: res.data.data[0],
          categoryId: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }
  editCategories(e, id, row) {
    e.preventDefault();

    API.get(`api/job_portal/job/category/${row.id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/master-jobs/editjobcategory/" + id,
          state: {
            NewCategoryDetails: res.data.data,
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }
  changeStatus = (cell, status, row) => {
    console.log("row.id", row.id);
    API.put(`api/job_portal/job/category/change_status/${row.id}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getCategoryList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  componentDidMount() {
    this.getCategoryList();
  }

  modalCloseHandler = () => {
    this.setState({
      categoryId: "",
      showModal: false,
      value: "",
      selectedValue: "",
    });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    if (id) {
      this.getcategoryDetails(id);
    } else {
      this.setState({ categoryDetails: {}, categoryId: "" });
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getCategoryList(pageNumber > 0 ? pageNumber : 1);
  };

  CategorySearch = (e) => {
    e.preventDefault();

    const search_category_name = document.getElementById("search_category_name").value;

    if (search_category_name === "") {
      return false;
    }

    API.get(
      `api/job_portal/job/category?page=1&category_name=${encodeURIComponent(
        search_category_name
      )}`
    )
      .then((res) => {
        this.setState({
          categoryList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_category_name: search_category_name,

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
    document.getElementById("search_category_name").value = "";

    this.setState(
      {
        search_category_name: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getCategoryList();
      }
    );
  };
  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + "..." : str;
  };
  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Masters Job
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
                        pathname: "/master-jobs/addjobcategory",
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Categories
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      id="search_category_name"
                      placeholder="Filter by Categories name"
                    />
                  </div>

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.CategorySearch(e)}
                    />
                    {this.state.remove_search ? (
                      <a
                        onClick={() => this.clearSearch()}
                        className="btn btn-danger btn-sm"
                        href="# "
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
                <BootstrapTable data={this.state.categoryList}>
                  <TableHeaderColumn
                    isKey
                    dataField="category_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Category Name
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
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default JobCategories;