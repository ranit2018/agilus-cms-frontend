import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import API from "../../../shared/admin-axios";
import SRL_API from "../../../shared/srl-axios";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import Pagination from "react-js-pagination";
import { htmlDecode, DEFAULT_CITY, stringToSlug } from "../../../shared/helper";
import Switch from "react-switch";
import Layout from "../layout/Layout";

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
        clicked={(e) => refObj.editAccordion(e, cell, row)}
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

const setPageUrl = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip="View Page"
        clicked={(e) => refObj.openProductDetailsPage(e, row)}
        href={`#`}
        id="tooltip-1"
      >
        <i className="far fa-eye" />
      </LinkWithTooltip>
    </div>
  );
};

class Accordion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      NewAccordionDetails: {},
      accordionList: [],
      accordionDetails: {},
      accordionId: 0,
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
      selectType: [
        { value: "1", label: "Accordion" },
        { value: "2", label: "Description" },
      ],
      value: "",
      selectedValue: "",
      suggestions: [],
      search_product_name: "",
      search_product_code: "",
      search_by_title: "",
    };
  }

  getAccordionList = (page = 1) => {
    let { search_product_name, search_by_title, search_product_code } =
      this.state;
    API.get(
      //   `api/lead_landing/accordion?page=${page}&product_name=${encodeURIComponent(
      //     search_product_name
      //   )}&title=${encodeURIComponent(
      //     search_by_title
      //   )}&product_code=${encodeURIComponent(search_product_code)}
      //  `
      `api/rnd/rnd_content_tab`
    )
      .then((res) => {
        this.setState({
          accordionList: res.data.data,
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
        this.deleteAccordion(id, row);
      }
    });
  };

  deleteAccordion = (id, row) => {
    API.post(`api/rnd/rnd_content_tab/${row.id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getAccordionList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getaccordionDetails(id) {
    API.get(`api/lead_landing/accordion/${id}`)
      .then((res) => {
        this.setState({
          showModalUpdate: true,
          accordionDetails: res.data.data[0],
          accordionId: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }
  editAccordion(e, id, row) {
    e.preventDefault();

    API.get(`api/rnd/rnd_content_tab/${row.id}`)
      .then((res) => {
        this.props.history.push({
          pathname: "/rnd_content_tab/edit-accordion/" + id,
          state: {
            NewAccordionDetails: res.data.data[0],
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }
  changeStatus = (cell, status, row) => {
    API.put(`api/rnd/rnd_content_tab/change_status/${row.id}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getAccordionList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getProductDataByCode = (search_name) => {
    return new Promise((resolve, reject) => {
      let payload = {
        search_name: search_name.toUpperCase(),
      };
      SRL_API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];
            resolve(searchDetails);
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          console.log(error);
          resolve(null);
        });
    });
  };

  openProductDetailsPage = async (e, row) => {
    e.preventDefault();
    let product_type = "";
    if (row.product_type === "T") product_type = "test";
    else if (row.product_type === "P") product_type = "package";
    let product_city = row.product_city;
    if (!product_city || !product_type) {
      const product_data = await this.getProductDataByCode(row.product_code);
      if (product_data) {
        product_city = product_data.CITY_NM;
        product_type = product_data.PROFILE_FLAG === "T" ? "test" : "package";
      } else {
        product_type = "test";
        product_city = DEFAULT_CITY;
      }
    }
    window.open(
      `${process.env.REACT_APP_SRL}/${product_type}/${stringToSlug(
        product_city
      )}/${row.product_id}/${stringToSlug(row.product_name)}`,
      "_blank"
    );
  };

  componentDidMount() {
    this.getAccordionList();
  }

  modalCloseHandler = () => {
    this.setState({
      accordionId: "",
      showModal: false,
      value: "",
      selectedValue: "",
    });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    if (id) {
      this.getaccordionDetails(id);
    } else {
      this.setState({ accordionDetails: {}, accordionId: "", showModal: true });
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getAccordionList(pageNumber > 0 ? pageNumber : 1);
  };

  ProductSearch = (e) => {
    e.preventDefault();

    //const search_by_title = document.getElementById("search_by_title").value;
    const search_product_name = document.getElementById(
      "search_product_name"
    ).value;
    const search_product_code = document.getElementById(
      "search_product_code"
    ).value;

    if (
      search_product_name === "" &&
      //  search_by_title === "" &&
      search_product_code === ""
    ) {
      return false;
    }

    API.get(
      `api/lead_landing/accordion?page=1&product_name=${encodeURIComponent(
        search_product_name
      )}&product_code=${encodeURIComponent(search_product_code)}`
    )
      .then((res) => {
        this.setState({
          accordionList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_product_name: search_product_name,
          // search_by_title: search_by_title,
          search_product_code: search_product_code,

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

  setContentImage = (refObj) => (cell, row) => {
    if (row.health_image !== null) {
      return (
        <img
          src={row.rnd_content_tab_image}
          alt="rnd_content_tab_image"
          height="100"
          //   onClick={(e) => refObj.imageModalShowHandler(row.health_image)}
        ></img>
      );
    } else {
      return null;
    }
  };

  clearSearch = () => {
    document.getElementById("search_product_name").value = "";
    // document.getElementById("search_by_title").value = "";

    document.getElementById("search_product_code").value = "";
    this.setState(
      {
        search_product_name: "",
        search_product_code: "",

        search_by_title: "",
        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getAccordionList();
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
                  Manage Content Tab
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
                        pathname: "/rnd_content_tab/add-accordion",
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Content Tab
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.accordionList}>
                  <TableHeaderColumn
                    isKey
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={__htmlDecode(this)}
                  >
                    Content
                  </TableHeaderColumn>
                  {/*  <TableHeaderColumn
                    isKey
                    dataField="type"
                    dataFormat={accordionType(this)}
                  >
                    Type
                  </TableHeaderColumn> */}
                  {/* <TableHeaderColumn
                    tdStyle={{height:"100px"}}
                    dataField="content"
                    dataFormat={__htmlDecode(this)}
                    columnClassName={"contentPara"}
                  >
                    Content
                  </TableHeaderColumn> */}
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={this.setContentImage(this)}
                  >
                    Image
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
export default Accordion;
