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
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import Dropzone from "react-dropzone";
import TimeKeeper from "react-timekeeper";
import dateFormat from "dateformat";
import Switch from "react-switch";
import TinyMCE from "react-tinymce";

import mockdatalead from "./mockdatalead.json";

class Thumb extends React.Component {
  state = {
    loading: false,
    thumb: undefined,
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.file) {
      return;
    }

    this.setState({ loading: true }, () => {
      let reader = new FileReader();

      reader.onloadend = () => {
        this.setState({ loading: false, thumb: reader.result });
      };

      reader.readAsDataURL(nextProps.file);
    });
  }

  remove = (file) => {
    const newFiles = [...this.props.images]; // make a var for the new array
    newFiles.splice(file, 1); // remove the file from the array
    this.props.setFieldValue("featured_image", newFiles);
  };

  render() {
    const { file } = this.props;
    const { loading, thumb } = this.state;

    if (!file) {
      return null;
    }

    // if (loading) { return <p>loading...</p>; }

    return (
      <span>
        <i
          className="fa fa-window-close"
          aria-hidden="true"
          onClick={(e) => this.remove(file)}
        />
        <img
          src={thumb}
          alt={file.name}
          className="img-thumbnail mt-2"
          height={200}
          width={200}
        />
      </span>
    );
  }
}

const dropzoneStyle = {
  width: "100%",
  height: "auto",
  borderWidth: 2,
  borderColor: "rgb(102, 102, 102)",
  borderStyle: "dashed",
  borderRadius: 5,
};
const initialValues = {
  featured_image: "",
  title: "",
  content: "",
  otp_status: "",
  event_date: "",
  event_time: "",
  event_location: "",
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};
const setType = (refOBj) => (cell) => {
  if (cell == 2) {
    return "Event";
  } else if (cell == 3) {
    return "Camp";
  } else {
    return "";
  }
};
const setTime = (refOBj) => (date) => {
  date = new Date("1970-01-01 " + date);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
  return date.toLocaleString("en-US", { hour: "numeric", hour12: true });
};
const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const setBannerImage = (refObj) => (cell, row) => {
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
        alt="Featured Image"
        width="60"
        height="60"
        onClick={(e) => refObj.imageModalShowHandler(row.featured_image)}
      ></img>
    </div>
  );
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
        clicked={(e) => refObj.editEvent(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change otp_status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.otp_status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.otp_status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.chageStatus(row.id, row.otp_status)}
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
class Leads extends Component {
  constructor(props) {
    super(props);

    this.onDrop = (files) => {
      this.setState({ files });
    };

    this.state = {
      events: [],
      eventDetails: {},
      time: "12:34pm",
      event_id: 0,
      isLoading: false,
      showModal: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      featured_image: "",
      selectedCategoryList: [],
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      files: [],
      thumbNailModal: false,
      timePickerModal: false,
      event_title: "",
      event_location: "",
      event_type: "",
      otp_status: "",
    };
  }

  componentDidMount() {
    this.getEventsList();
    // this.getEventCategory();
  }

  // getEventCategory = (page = 1) => {
  //   API.get(`/api/feed/get_category_by_medium/2`)
  //     .then((res) => {
  //       this.setState({
  //         categoryList: res.data.data,
  //         isLoading: false,
  //       });
  //     })
  //     .catch((err) => {
  //       this.setState({
  //         isLoading: false,
  //       });
  //       showErrorMessage(err, this.props);
  //     });
  // };

  getEventsList = (page = 1) => {
    let event_title = this.state.event_title;
    let event_location = this.state.event_location;
    let event_type = this.state.event_type;
    let otp_status = this.state.otp_status;

    // API.get(
    //   `/api/events?page=${page}&event_title=${encodeURIComponent(
    //     event_title
    //   )}&event_location=${encodeURIComponent(
    //     event_location
    //   )}&event_type=${encodeURIComponent(
    //     event_type
    //   )}&otp_status=${encodeURIComponent(otp_status)}`
    // )
    API.get(
      `api/llp/lead_landing_form?otp_status=${encodeURIComponent(
        otp_status
      )}&page=`
    )
      .then((res) => {
        console.log(res);
        this.setState({
          events: res.data.data,
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

  eventSearch = (e) => {
    e.preventDefault();

    const event_title = document.getElementById("event_title").value;
    const event_location = document.getElementById("event_location").value;
    const event_type = document.getElementById("event_type").value;
    const otp_status = document.getElementById("otp_status").value;

    if (
      event_title === "" &&
      event_location === "" &&
      event_type === "" &&
      otp_status === ""
    ) {
      return false;
    }

    API.get(
      `api/llp/lead_landing_form?otp_status=${encodeURIComponent(
        otp_status
      )}&page=`
    )
      .then((res) => {
        this.setState({
          events: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          event_title: event_title,
          event_location: event_location,
          event_type: event_type,
          otp_status: otp_status,
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

  editEvent(e, id) {
    e.preventDefault();
    API.get(`/api/events/${id}`)
      .then((res) => {
        const image_details = [];

        for (let i in res.data.data.image_details) {
          image_details.push({
            name: res.data.data.image_details[i].featured_image,
            image_id: res.data.data.image_details[i].id,
          });
        }
        // console.log("details image",image_details);
        res.data.data.eventDetails["featured_image"] = image_details;

        this.props.history.push({
          pathname: "/edit-event/" + id,
          state: {
            eventDetails: res.data.data.eventDetails,
            //  image_details: image_details
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  clearSearch = () => {
    document.getElementById("event_title").value = "";
    document.getElementById("event_location").value = "";
    document.getElementById("event_type").value = "";
    document.getElementById("otp_status").value = "";

    this.setState(
      {
        event_title: "",
        event_location: "",
        event_type: "",
        otp_status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getEventsList();
      }
    );
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
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
        this.deleteEvent(id);
      }
    });
  };

  deleteEvent = (id) => {
    API.delete(`/api/events/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getEventsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.otp_status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  chageStatus = (cell, otp_status) => {
    API.put(`/api/events/change_status/${cell}`, {
      otp_status: otp_status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getEventsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.otp_status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getEventsList(pageNumber > 0 ? pageNumber : 1);
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Leads
                  <small />
                </h1>
              </div>
              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  {/* <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) =>
                      this.props.history.push({
                        pathname: "/add-event",
                        state: { categoryList: this.state.categoryList },
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add Events & Camps
                  </button> */}
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="event_title"
                      id="event_title"
                      placeholder="Filter by City"
                    />
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      name="event_location"
                      id="event_location"
                      placeholder="Filter by Email"
                    />
                  </div>

                  <div className="">
                    <input
                      className="form-control"
                      name="mobile_number"
                      id="mobile_number"
                      placeholder="Filter by Mobile Number"
                    />
                  </div>

                  <div className="">
                    <select
                      name="otp_status"
                      id="otp_status"
                      className="form-control"
                    >
                      <option value="">Select Lead Status</option>
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
                      onClick={(e) => this.eventSearch(e)}
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
                <div className="table-responsive"></div>
                <BootstrapTable data={this.state.events}>
                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="city"
                    dataFormat={__htmlDecode(this)}
                  >
                    City
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="email"
                    dataFormat={__htmlDecode(this)}
                  >
                    Email
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="featured_image"
                    dataFormat={setBannerImage(this)}
                  >
                    Email
                  </TableHeaderColumn> */}
                  <TableHeaderColumn
                    dataField="mobile_no"
                    dataFormat={__htmlDecode(this)}
                  >
                    Mobile Number
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="otp_status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn>

                  {/* <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                  >
                    Action
                  </TableHeaderColumn> */}
                </BootstrapTable>

                {this.state.totalCount > 10 ? (
                  <Row>
                    <Col md={12}>
                      <div className="paginationOuter text-right">
                        <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={10}
                          totalItemsCount={this.state.banner_count}
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
                  <Modal.Header closeButton>Event Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.url} alt="Featured Image"></img>
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
export default Leads;
