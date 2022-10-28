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
import ChipInput from "material-ui-chip-input";

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
  region: "",
  state: "",
  email: "",
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
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
class Events extends Component {
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
      selectState: [],
      selectRegion: [],
      files: [],
      thumbNailModal: false,
      timePickerModal: false,
      event_title: "",
      event_location: "",
      event_type: "",
      status: "",

      chips: [],
      region: [],
      state: [],
      handleRegion: "",
      handleState: [],
      emailErr: false,
      selectType: [
        { value: "0", label: "Region" },
        { value: "1", label: "State" },
      ],
      isState: false,
    };
  }

  componentDidMount() {
    // this.getEventsList();
    this.getAllState();
    // this.getAllRegion();
    this.emailRegion();
  }

  addChip = (value) => {
    const validEmail = new RegExp(
      "^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$"
    );
    if (validEmail.test(value)) {
      const chips = this.state.chips.slice();
      chips.push(value);
      this.setState({ chips });
      this.setState({ emailErr: false });
    } else {
      this.setState({ emailErr: true });
    }
  };
  removeChip = (index) => {
    const chips = this.state.chips.slice();
    chips.splice(index, 1);
    this.setState({ chips });
  };

  changeHandler = (newValue) => {
    const newValuesArr = newValue
      ? newValue.map((item) => item.value.toString())
      : [];
    this.setState({ handleState: newValuesArr });

    // this.emailState();
  };

  emailRegion = (e) => {
    API.get(`/api/feed/all-region`)
      .then((res) => {
        this.setState({ region: res.data.data, selectRegion: res.data.data });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  emailState = (id) => {
    if (id != undefined) {
      API.get(`/api/feed/all-state/${id}`)
        .then((res) => {
          this.setState({ state: res.data.data });
        })
        .catch((err) => {
          this.setState({
            isLoading: false,
          });
          showErrorMessage(err, this.props);
        });
    }
  };

  getAllState = (page = 1) => {
    API.get(`/api/feed/all-state`)
      .then((res) => {
        this.setState({
          selectState: res.data.data,
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

  // getEventsList = (page = 1) => {
  //   let event_title = this.state.event_title;
  //   let event_location = this.state.event_location;
  //   let event_type = this.state.event_type;
  //   let status = this.state.status;

  //   API.get(`/api/feed/all-email?page=1&region=`)
  //     .then((res) => {
  //       console.log(res);
  //       this.setState({
  //         events: res.data.data,
  //         totalCount: res.data.count,
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

  eventSearch = (e) => {
    e.preventDefault();
    let url = "";
    let method = "GET";

    const status = document.getElementById("status").value;
    // const region = document.getElementById("region").value;
    // const state = document.getElementById("state").value;

    if (status === "") {
      return false;
    }

    if (status == 0) {
      url = `/api/feed/email-Address?region=1`;
      this.setState({ isState: false });
    } else if (status == 1) {
      url = `/api/feed/email-Address?state=1`;
      this.setState({ isState: true });
    }

    API(
      // `/api/feed/all-email?page=1&status=${encodeURIComponent(
      //   status
      // )}&region=${encodeURIComponent(region)}&state=${encodeURIComponent(
      //   state
      // )}`
      { method: method, url: url }
    )
      .then((res) => {
        this.setState({
          events: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
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

  // editEvent(e, id) {
  //   e.preventDefault();
  //   API.get(`/api/events/${id}`)
  //     .then((res) => {
  //       const image_details = [];

  //       for (let i in res.data.data.image_details) {
  //         image_details.push({
  //           name: res.data.data.image_details[i].featured_image,
  //           image_id: res.data.data.image_details[i].id,
  //         });
  //       }
  //       // console.log("details image",image_details);
  //       res.data.data.eventDetails["featured_image"] = image_details;

  //       this.props.history.push({
  //         pathname: "/edit-event/" + id,
  //         state: {
  //           eventDetails: res.data.data.eventDetails,
  //           //  image_details: image_details
  //         },
  //       });
  //     })
  //     .catch((err) => {
  //       showErrorMessage(err, this.props);
  //     });
  // }

  clearSearch = () => {
    document.getElementById("status").value = "";
    // document.getElementById("state").value = "";

    this.setState(
      {
        status: "",
        // state: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1, events: [] });
        // this.getEventsList();
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
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getEventsList(pageNumber > 0 ? pageNumber : 1);
  };

  handleSubmitEvent = async (values, actions) => {
    let method = "";
    let url = "/api/feed/email-Address";
    const post_data = {
      region: values.region,
      state: this.state.handleState,
      email: this.state.chips,
    };
    method = "POST";
    API({
      method: method,
      url: url,
      data: post_data,
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record added successfully.",
          icon: "success",
        }).then(() => {
          this.props.history.push("/email");
        });
      })
      .catch((err) => {
        this.setState({ showModalLoader: false });
        if (err.data.status === 3) {
          this.setState({
            showModal: false,
          });
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  render() {
    const validateStopFlag = Yup.object().shape({
      region: Yup.string().required("Please enter the Region"),
    });
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Email
                  <small />
                </h1>
              </div>
              <br />

              <div>
                {/* <Layout> */}
                <div>
                  <section className="content-header"></section>
                  <section className="content">
                    <div className="box">
                      <div className="box-body">
                        <Formik
                          initialValues={initialValues}
                          validationSchema={validateStopFlag}
                          onSubmit={this.handleSubmitEvent}
                        >
                          {({
                            values,
                            errors,
                            touched,
                            isValid,
                            isSubmitting,
                            setFieldValue,
                            setFieldTouched,
                            handleChange,
                            setErrors,
                          }) => {
                            return (
                              <Form>
                                <div className="contBox">
                                  <Row>
                                    <Row>
                                      <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                          <label>
                                            Region
                                            <span className="impField">*</span>
                                          </label>
                                          <Field
                                            name="region"
                                            component="select"
                                            className={`selectArowGray form-control`}
                                            autoComplete="off"
                                            value={values.region}
                                            onClick={() => {
                                              this.setState({
                                                handleRegion: values.region,
                                              });
                                              this.emailState(values.region);
                                            }}
                                          >
                                            <option key="-1" value="">
                                              Select Region
                                            </option>
                                            {this.state.region.map(
                                              (region, i) => (
                                                <option
                                                  key={i}
                                                  value={region.value}
                                                >
                                                  {region.label}
                                                </option>
                                              )
                                            )}
                                          </Field>
                                          {errors.region && touched.region ? (
                                            <span className="errorMsg">
                                              {errors.region}
                                            </span>
                                          ) : null}
                                        </div>
                                      </Col>
                                    </Row>

                                    <Row>
                                      <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                          <label>
                                            State
                                            {/* <span className="impField">*</span> */}
                                          </label>
                                          <Select
                                            name="state"
                                            options={this.state.state}
                                            isMulti={true}
                                            // value={values.state}
                                            onChange={this.changeHandler}
                                          ></Select>
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col xs={12} sm={12} md={12}>
                                        <div className="form-group">
                                          <label>
                                            Email
                                            <span className="impField">*</span>
                                          </label>

                                          <ChipInput
                                            allowDuplicates={false}
                                            fullWidth={true}
                                            value={this.state.chips}
                                            onAdd={(chip) => this.addChip(chip)}
                                            onDelete={(chip, index) =>
                                              this.removeChip(index)
                                            }
                                          />

                                          {this.state.emailErr && (
                                            <span className="errorMsg">
                                              Your email is invalid
                                            </span>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  </Row>
                                </div>

                                <button
                                  className={`btn btn-success btn-sm ${
                                    isValid ? "btn-custom-green" : "btn-disable"
                                  } m-r-10`}
                                  type="submit"
                                  disabled={
                                    isValid
                                      ? isSubmitting
                                        ? true
                                        : false
                                      : true
                                  }
                                >
                                  {this.state.banner_id > 0
                                    ? isSubmitting
                                      ? "Updating..."
                                      : "Update"
                                    : isSubmitting
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                              </Form>
                            );
                          }}
                        </Formik>
                      </div>
                    </div>
                  </section>
                </div>
                {/* </Layout> */}
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <select name="status" id="status" className="form-control">
                    <option value="">Select Event Status</option>
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
                  <select name="region" id="region" className="form-control">
                    <option value="">Search Email by Region</option>
                    {this.state.selectRegion.map((val) => {
                      return (
                        <option key={val.value} value={val.value}>
                          {val.label}
                        </option>
                      );
                    })}
                  </select>
                </div> */}

                {/* <div className="">
                  <select name="state" id="state" className="form-control">
                    <option value="">Search Email by State</option>
                    {this.state.selectState.map((val) => {
                      return (
                        <option key={val.value} value={val.value}>
                          {val.label}
                        </option>
                      );
                    })}
                  </select>
                </div> */}

                <form className="form">
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
                  <TableHeaderColumn isKey dataField="region">
                    {this.state.isState ? "State" : "Region"}
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="state"
                  >
                    State
                  </TableHeaderColumn> */}

                  <TableHeaderColumn
                    dataField="emails"
                    // dataFormat={__htmlDecode(this)}
                  >
                    Email
                  </TableHeaderColumn>
                  {/* 
                  <TableHeaderColumn
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
export default Events;
