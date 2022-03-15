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
import DatePicker from "react-datepicker";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode, setFieldName } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import dateFormat from "dateformat";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { formatDate, parseDate } from "react-day-picker/moment";
import "react-day-picker/lib/style.css";
import moment from "moment";
import DayPicker from "react-day-picker";

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

const generateHTML = (data) => {
  let ret = [];
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      let uploadData = data["File"];
      console.log('uploadData',uploadData)
      if (
        [
          "Company Profile",
          "Product Specification",
          "Prescription",
          "File",
          "UTM",
        ].includes(key)
      ) {
        if (key == "File") {
          ret.push(
            <Row>
              <Col xs={6} sm={6} md={6} key={key}>
                {key}
              </Col>
              <Col xs={6} sm={6} md={6}>
                <a target="_blank" href={uploadData}>
                  Download
                </a>
              </Col>
            </Row>
          );
        } else {
          ret.push(
            <Row>
              <Col xs={6} sm={6} md={6} key={key}>
                {key}
              </Col>
              <Col xs={6} sm={6} md={6}>
                <a target="_blank" href={uploadData}>
                  Download
                </a>
              </Col>
            </Row>
          );
        }
      } else {
        ret.push(
          <Row>
            <Col xs={6} sm={6} md={6} key={key}>
              {key}
            </Col>
            <Col xs={6} sm={6} md={6}>
              {element}
            </Col>
          </Row>
        );
      }
    }
  }

  return ret;
};

const generateCheckbox = (refObj) => (cell, row) => {
  let defaultChecked = false;

  if (refObj.state.checkedRows.includes(row.id)) {
    defaultChecked = true;
  }
  return (
    <input
      type="checkbox"
      checked={defaultChecked}
      onChange={(e) => {
        let prev = refObj.state.checkedRows;
        if (e.target.checked) {
          prev.push(row.id);
        } else {
          let index = prev.indexOf(row.id);
          prev.splice(index, 1);
        }
        refObj.setState({ checkedRows: prev });
      }}
      className={`genCheck`}
    />
  );
};

const custStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Request A Callback";
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

const actionFormatter = (refObj) => (cell, row) => {
  let dataArr = [];
  dataArr = {
    Name: row.name,
    Email: row.email,
    City: row.city,
    State: row.state,
    File: row.demographic_doc,
  };
  if (dataArr === null) {
    return null;
  } else {
    return (
      <div className="actionStyle">
        <LinkWithTooltip
          tooltip="Click to View"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, dataArr)}
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
      </div>
    );
  }
};

class DemographicUpdate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leadForms: [],
      checkedRows: [],
      isLoading: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      name: "",
      email: "",
      state: "",
      city: "",
      showModal: false,
      selectedDay: "",
      post_data: null,
      file: "",
    };
  }

  getPatientList = (page) => {
    API.get(`/api/home/demographic_list?page=${page}`)
      .then((res) => {
        console.log('res.data.data',res.data.data)
        console.log('res',res)

        let filterData = [];
        let dataArr = [];

        for (let i = 0; i < res.data.data.length; i++) {
          if(res.data.data[i].demographic_doc){
            filterData.push(res.data.data[i]);
            dataArr.push ({
              Name: res.data.data[i].name,
              Email: res.data.data[i].email,
              City: res.data.data[i].city,
              State: res.data.data[i].state,
              File: res.data.data[i].demographic_doc,
            });
          }
        }
        console.log('dataArr',dataArr)
        console.log('filterData',filterData)
        console.log('filterData',filterData.length)

        this.setState({
          leadForms: filterData,
          totalCount: Number(res.data.count),
          post_data: dataArr,
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

  modalShowHandler = (event, dataArr) => {
    event.preventDefault();
    this.setState({ showModal: true, post_data: dataArr });
  };

  modalCloseHandler = () => {
    this.setState({ showModal: false });
  };

  patientSearch = (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const state = document.getElementById("state").value;
    const city = document.getElementById("city").value;

    API.get(
      `/api/home/demographic_list?page=1&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&state=${encodeURIComponent(
        state
      )}&city=${encodeURIComponent(city)}`
    )
      .then((res) => {
        console.log('res.data.data',res.data.data)
        let filterData = [];
        let dataArr = [];

        for (let i = 0; i < res.data.data.length; i++) {
          if(res.data.data[i].demographic_doc){
            filterData.push(res.data.data[i]);
            dataArr.push ({
              Name: res.data.data[i].name,
              Email: res.data.data[i].email,
              City: res.data.data[i].city,
              State: res.data.data[i].state,
              File: res.data.data[i].demographic_doc,
            });
          }
        }
        console.log('dataArr',dataArr)
        console.log('filterData',filterData)
        console.log('filterData',filterData.length)
        this.setState({
          leadForms: filterData,
          totalCount: Number(filterData.length),
          isLoading: false,
          name: name,
          email: email,
          state: state,
          city: city,
          post_data: dataArr,
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

  downloadXLSX = (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const state = document.getElementById("state").value;
    const city = document.getElementById("city").value;

    API.get(
      `/api/home/demographic_list?page=1&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&state=${encodeURIComponent(
        state
      )}&city=${encodeURIComponent(city)}`,
      { responseType: "blob" }
    )
      .then((res) => {
        let url = window.URL.createObjectURL(res.data);
        let a = document.createElement("a");
        a.href = url;
        a.download = "leadforms.csv";
        a.click();
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  clearSearch = () => {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("state").value = "";
    document.getElementById("city").value = "";

    this.setState(
      {
        name: "",
        email: "",
        state: "",
        city: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getPatientList();
      }
    );
  };

  componentDidMount() {
    this.getPatientList(this.state.activePage);
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getPatientList(pageNumber > 0 ? pageNumber : 1);
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12 m-b-15">
                <h1>
                  Manage Patient Demography
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12">
                <form>
                  <div className="leadForm">
                    <div>
                      <input
                        className="form-control"
                        name="name"
                        id="name"
                        placeholder="Filter by Name"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Filter by Email"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="state"
                        id="state"
                        placeholder="Filter by State"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="city"
                        id="city"
                        placeholder="Filter by City"
                      />
                    </div>

                    <div>
                      <div>
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.patientSearch(e)}
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
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <div className="nav-tabs-custom">
                  <ul className="nav nav-tabs">
                    <li className="tabButtonSec pull-right">
                      {this.state.totalCount > 0 ? (
                        <span onClick={(e) => this.downloadXLSX(e)}>
                          <LinkWithTooltip
                            tooltip={`Click here to download excel`}
                            href="#"
                            id="tooltip-my"
                            clicked={(e) => this.checkHandler(e)}
                          >
                            <i className="fas fa-download"></i>
                          </LinkWithTooltip>
                        </span>
                      ) : null}
                    </li>
                  </ul>
                </div>

                <BootstrapTable data={this.state.leadForms}>
                  <TableHeaderColumn
                    dataField="type"
                    dataFormat={generateCheckbox(this)}
                    width="5%"
                  ></TableHeaderColumn>

                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    // dataFormat={htmlDecode(this)}
                  >
                    Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="email"
                    // dataFormat={htmlDecode(this)}
                  >
                    Email
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="state"
                    // dataFormat={htmlDecode(this)}
                  >
                    State
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="city"
                    // dataFormat={htmlDecode(this)}
                  >
                    City
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_added"
                    dataFormat={setDate(this)}
                  >
                    Post Date
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Patient Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="contBox">
                      {generateHTML(this.state.post_data)}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      onClick={(e) => this.modalCloseHandler()}
                      className={`btn btn-danger btn-sm`}
                      type="button"
                    >
                      Close
                    </button>
                  </Modal.Footer>
                </Modal>
                { console.log('this.state.totalCount',this.state.totalCount)}

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
export default DemographicUpdate;
