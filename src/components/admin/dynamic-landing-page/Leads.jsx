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

      if (
        [
          "Company Profile",
          "Product Specification",
          "Prescription",
          "UTM",
        ].includes(key)
      ) {
        if (key == "Prescription") {
          let map_data = element.map((val, index) => {
            return (
              <Row>
                <Col xs={6} sm={6} md={6} key={index}>
                  {key} {index + 1}
                </Col>
                <Col xs={6} sm={6} md={6}>
                  <a target="_blank" href={val}>
                    Download
                  </a>
                </Col>
              </Row>
            );
          });

          ret.push(map_data);
        } else if (key == "UTM") {
          const items = element ? element.split("&") : [];
          if (items.length > 0) {
            let utm_data = items.map((item, index) => {
              const values = item ? item.split("=") : [];
              if (values && values.length > 1) {
                return (
                  <Row>
                    <Col xs={6} sm={6} md={6} key={`utm_${index}`}>
                      {`${setFieldName(values[0])}`}
                    </Col>
                    <Col
                      xs={6}
                      sm={6}
                      md={6}
                      key={`utm_${index}`}
                      style={{ wordWrap: "break-word" }}
                    >
                      {`${values[1]}`}
                    </Col>
                  </Row>
                );
              }
            });
            ret.push(utm_data);
          }
        } else {
          ret.push(
            <Row>
              <Col xs={6} sm={6} md={6} key={key}>
                {key}
              </Col>
              <Col xs={6} sm={6} md={6}>
                <a target="_blank" href={element}>
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

const setType = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return " Request A Callback";
  } else if (cell === 2) {
    return "Home Collection";
  } else if (cell === 3) {
    return " Covid19 Enquiry";
  } else if (cell === 9) {
    return " Contact Us";
  } else if (cell === 10) {
    return " Feedback";
  } else if (cell === 8) {
    return " Become A Vendor";
  } else if (cell === 7) {
    return " Become A Partner";
  } else if (cell === 11) {
    return " Prescription Upload";
  }
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
  if (row.post_data === null) {
    return null;
  } else {
    return (
      <div className="actionStyle">
        <LinkWithTooltip
          tooltip="Click to View"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, row.post_data)}
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
      </div>
    );
  }
};

const bannerStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const options = [
  { value: "1", label: "Request A Callback" },
  { value: "2", label: "Home Collection" },
  { value: "3", label: "Covid19 Enquiry" },
  { value: "7", label: "Become A Partner" },
  { value: "8", label: "Become A Vendor" },
  { value: "9", label: "Contact Us" },
  { value: "10", label: "Feedback" },
  { value: "11", label: "Prescription Upload" },
];

class Leads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leadForms: [],
      selectedOption: [],
      checkedRows: [],
      isLoading: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      name: "",
      email: "",
      mobile_no: "",
      city: "",
      type: "",
      from: "",
      to: "",
      showModal: false,
      selectedDay: "",
      post_data: null,
    };
  }

  getLeadFormsList = (page = 1) => {
    const name = this.state.name;
    const email = this.state.email;
    const mobile_no = this.state.email;
    const city = this.state.city;
    let type = "";
    if (this.state.selectedOption.length > 0) {
      type = this.state.selectedOption
        .map((val) => {
          return val.value;
        })
        .join(",");
    }
    let from = this.state.from;
    let to = this.state.to;
    if (from !== "" && to !== "") {
      from = new Date(from);
      to = new Date(to);
      from = dateFormat(from, "yyyy-mm-dd");
      to = dateFormat(to, "yyyy-mm-dd");
    }

    API.get(`/api//llp/lead_landing_form?otp_status=&page=`)
      .then((res) => {
        this.setState({
          leadForms: res.data.data,
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

  handleDayClick = (day, { selected }) => {
    this.setState({
      selectedDay: selected ? undefined : day,
    });
  };

  modalShowHandler = (event, post_data) => {
    event.preventDefault();
    this.setState({ showModal: true, post_data: JSON.parse(post_data) });
  };

  modalCloseHandler = () => {
    this.setState({ showModal: false });
  };

  leadFormSearch = (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile_no = document.getElementById("mobile_no").value;
    const city = document.getElementById("city").value;

    let type = "";
    if (this.state.selectedOption.length > 0) {
      type = this.state.selectedOption
        .map((val) => {
          return val.value;
        })
        .join(",");
    }

    let from = this.state.from;
    let to = this.state.to;
    if (
      name === "" &&
      email === "" &&
      mobile_no === "" &&
      city === "" &&
      type === "" &&
      this.state.from === "" &&
      this.state.to === ""
    ) {
      return false;
    }

    if (this.state.from !== "" && this.state.to !== "") {
      from = new Date(from);
      to = new Date(to);
      from = dateFormat(from, "yyyy-mm-dd");
      to = dateFormat(to, "yyyy-mm-dd");
    }

    API.get(
      `/api/feed/lead_data?page=1&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&mobile_no=${encodeURIComponent(
        mobile_no
      )}&city=${encodeURIComponent(city)}&type=${encodeURIComponent(
        type
      )}&date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(
        to
      )}`
    )
      .then((res) => {
        this.setState({
          leadForms: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          name: name,
          email: email,
          mobile_no: mobile_no,
          city: city,
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

  downloadXLSX = (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile_no = document.getElementById("mobile_no").value;
    const city = document.getElementById("city").value;
    let type = this.state.type;

    let lead_id = "";
    if (this.state.checkedRows.length > 0) {
      console.log(this.state.checkedRows);
      lead_id = this.state.checkedRows.join(",");
    }

    let from = this.state.from;
    let to = this.state.to;
    if (from !== "" && to !== "") {
      from = new Date(from);
      to = new Date(to);
      from = dateFormat(from, "yyyy-mm-dd");
      to = dateFormat(to, "yyyy-mm-dd");
    }

    API.get(
      `/api/feed/download_lead_data?page=1&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&mobile_no=${encodeURIComponent(
        mobile_no
      )}&city=${encodeURIComponent(city)}&type=${encodeURIComponent(
        type
      )}&date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(
        to
      )}&lead_id=${encodeURIComponent(lead_id)}`,
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
    document.getElementById("mobile_no").value = "";
    document.getElementById("city").value = "";
    //document.getElementById("type").value = '';

    this.setState(
      {
        name: "",
        email: "",
        mobile_no: "",
        city: "",
        selectedOption: [],
        from: "",
        to: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getLeadFormsList();
      }
    );
  };

  componentDidMount() {
    this.getLeadFormsList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getLeadFormsList(pageNumber > 0 ? pageNumber : 1);
  };

  showFromMonth = () => {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), "months") < 2) {
      this.to.getDayPicker().showMonth(from);
    }
  };

  handleFromChange = (from) => {
    // Change the from date and focus the "to" input field
    this.setState({
      from: from,
    });
  };

  handleToChange = (to) => {
    this.setState({ to: to }, this.showFromMonth);
  };

  render() {
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12 m-b-15">
                <h1>
                  Manage Lead Form Responses
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
                        name="mobile_no"
                        id="mobile_no"
                        placeholder="Filter by Mobile Number"
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
                      <DayPickerInput
                        value={from}
                        placeholder="Date From"
                        format="LL"
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                          selectedDays: [from, { from, to }],
                          disabledDays: { after: to },
                          toMonth: to,
                          modifiers,
                          numberOfMonths: 1,
                          disabledDays: {
                            before: new Date(2021, 5, 1),
                          },
                          onDayClick: () => this.to.getInput().focus(),
                        }}
                        onDayChange={this.handleFromChange}
                      />{" "}
                      {/* <DayPicker
                                            initialMonth={new Date(2017, 3)}
                                            selectedDays={this.state.selectedDay}
                                            onDayClick={this.handleDayClick}
                                        // selectedDays={[
                                        //     new Date(2017, 3, 12),
                                        //     new Date(2017, 3, 2),
                                        //     {
                                        //         after: new Date(2017, 3, 20),
                                        //         before: new Date(2017, 3, 25),
                                        //     },
                                        // ]}
                                        /> */}
                    </div>
                    <div>
                      <DayPickerInput
                        ref={(el) => (this.to = el)}
                        value={to}
                        placeholder="Date To"
                        format="LL"
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                          selectedDays: [from, { from, to }],
                          disabledDays: { before: from },
                          modifiers,
                          month: from,
                          fromMonth: from,
                          numberOfMonths: 1,
                        }}
                        onDayChange={this.handleToChange}
                      />
                    </div>
                    <div>
                      <Select
                        placeholder="Select Type"
                        width={250}
                        isMulti
                        isClearable={true}
                        isSearchable={true}
                        value={this.state.selectedOption}
                        onChange={(e) => {
                          let sel = [];
                          if (e != null) {
                            sel = e;
                          }
                          this.setState({ selectedOption: sel });
                        }}
                        options={options}
                      />
                    </div>
                    <div>
                      <div>
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.leadFormSearch(e)}
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
                  >
                    {/* <input type="checkbox" onChange={(e)=>{
                                            let checkboxes = document.getElementsByClassName('genCheck');

                                            for (var i = 0; i < checkboxes.length; i++) {
                                                checkboxes[i].checked = e.target.checked;
                                            }

                                        }} /> */}
                  </TableHeaderColumn>

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
                    dataField="mobile_no"
                    // dataFormat={htmlDecode(this)}
                  >
                    Mobile Number
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="city"
                    // dataFormat={htmlDecode(this)}
                  >
                    City
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="otp_status"
                    dataFormat={bannerStatus(this)}
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

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Lead Form Details</Modal.Title>
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
export default Leads;
