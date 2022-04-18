/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import Layout from "../../layout/Layout";
import Pagination from "react-js-pagination";
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
          onChange={() => refObj.chageStatus(row.product_id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, row.id)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

const productType = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Test";
  } else if (cell === 2) {
    return "Package";
  }
};

// const custStatus = (refObj) => (cell) => {
//   //return cell === 1 ? "Active" : "Inactive";
//   if (cell === 1) {
//     return "Active";
//   } else if (cell === 0) {
//     return "Inactive";
//   }
// };

const setProductImage = (refObj) => (cell, row) => {
  if (row.product_image !== null) {
    return (
      <img
        src={row.product_image}
        alt="Product Image"
        height="100"
        onClick={(e) => refObj.imageModalShowHandler(row.product_image)}
      ></img>
    );
  } else {
    return "No image";
  }
};

class DepartmentTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      department_id: this.props.match.params.id,
      productList: [],
      types: [],
      totalCount: 0,

      search_product_code: "",
      search_product_name: "",
    };
  }

  componentDidMount() {
    this.getTypes();
    this.getTestList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getTestList(pageNumber > 0 ? pageNumber : 1);
  };

  getTestList = (page = 1) => {
    API.get(
      `/api/department/department-all-type/${this.state.department_id}/4?page=1`
    )
      .then((res) => {
        this.setState({
          activePage: page,
          productList: res.data.data,
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
  ProductSearch = (e) => {
    e.preventDefault();
    const product_type = this.state.types.product;
    const search_product_name = document.getElementById(
      "search_product_name"
    ).value;

    if (  search_product_name == "" ) {
      return false;
    }
    API.get(
      `/api/department/department-all-type/${this.state.department_id}/${product_type}?page=1&product_name=${encodeURIComponent(
        search_product_name
      )}`
    )
      .then((res) => {
        this.setState({
          productList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,

          search_product_name: search_product_name,

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
    document.getElementById("search_product_name").value = "";

    this.setState(
      {
        search_product_name: "",

        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getTestList();
      }
    );
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
        this.deleteProduct(id);
      }
    });
  };

  deleteProduct = (id) => {
    const producttype = this.state.types.product;

    API.post(`/api/department/department-all-type/${ this.state.department_id}/${producttype}/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getTestList();
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  //chnage status
  // chageStatus = (id, status) => {
  //   API.put(`/api/department/test/change_status/${id}`, {
  //     status: status == 1 ? String(0) : String(1),
  //   })
  //     .then((res) => {
  //       swal({
  //         closeOnClickOutside: false,
  //         title: "Success",
  //         text: "Record updated successfully.",
  //         icon: "success",
  //       }).then(() => {
  //         this.getProductList(this.state.activePage);
  //       });
  //     })
  //     .catch((err) => {
  //       if (err.data.status === 3) {
  //         this.setState({ closeModal: true });
  //         showErrorMessage(err, this.props);
  //       }
  //     });
  // };

  //image modal
  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, product_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, product_image: "" });
  };
  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Department Products
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
                {/* <div className="row"> */}
                <div className="col-lg-4 col-sm-4 col-xs-4">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.modalShowHandler(e, "")}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Product
                  </button>
                </div>
                <form className="form">
                <div className="">
                    <input
                      className="form-control"
                      id="search_product_name"
                      placeholder="Filter by Product Name"
                    />
                  </div>

                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.ProductSearch(e)}
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
                {/* </div> */}
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable
                  wrapperClasses="table-responsive"
                  data={this.state.productList}
                >
                  <TableHeaderColumn isKey dataField="product_code">
                    Product Code
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="product_name"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Product Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={productType(this)}
                  >
                    Package Type
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="product_image"
                    dataFormat={setProductImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn> */}
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
                          src={this.state.product_image}
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
export default DepartmentTest;
