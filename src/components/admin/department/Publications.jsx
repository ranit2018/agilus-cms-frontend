/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tooltip,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Select from "react-select";

import Layout from "../layout/Layout";
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
} from "../../../shared/helper";
// import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import SRL from "../../../assets/images/SRL.png";

import exclamationImage from "../../../assets/images/exclamation-icon-black.svg";
import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import { values } from "methods";

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
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        href="#"
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

const initialValues = {
  id: "",
  publication_heading: "",
  publication_description: "",
  publication_image: "",
  date_posted: "",
  status: "",
};

class Publications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicationDetails: [],
      isLoading: false,
      showModal: false,
      publication_id: 0,
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
    // var publication_heading = document.getElementById("publication_heading").value;
    // var publication_description = document.getElementById("publication_description").value;
    // let status = document.getElementById("status").value;
    // API.get(`/api/department/Publications?page=${page}&publication_heading=${encodeURIComponent(
    //   publication_heading
    // )}&publication_description=${encodeURIComponent(
    //   publication_description
    // )}&status=${encodeURIComponent(
    //   status
    // )}`)
    //   .then((res) => {
    //     this.setState({
    //       publicationDetails: res.data.data,
    //       totalCount: Number(res.data.count),
    //       isLoading: false,
    //     });
    //   })
    //   .catch((err) => {
    //     this.setState({
    //       isLoading: false,
    //     });
    //     showErrorMessage(err, this.props);
    //   });
  };

  publicationSearch = (e) => {
    // e.preventDefault();
    // var publication_heading = document.getElementById("publication_heading").value;
    // var publication_description = document.getElementById("publication_description").value;
    // let status = document.getElementById("status").value;
    // if (
    //   publication_heading === "" &&
    //   publication_description === "" &&
    //   status === ""
    // ) {
    //   return false;
    // }
    // API.get(
    //   `/api/department/Publications?page=1&publication_heading=${encodeURIComponent(
    //     publication_heading
    //   )}&publication_description=${encodeURIComponent(
    //     publication_description
    //   )}&status=${encodeURIComponent(
    //     status
    //   )}`
    // )
    //   .then((res) => {
    //     this.setState({
    //       publicationDetails: res.data.data,
    //       totalCount: Number(res.data.count),
    //       isLoading: false,
    //       publication_heading: publication_heading,
    //       publication_description: publication_description,
    //       status: status,
    //       activePage: 1,
    //       remove_search: true,
    //     });
    //   })
    //   .catch((err) => {
    //     this.setState({
    //       isLoading: false,
    //     });
    //     showErrorMessage(err, this.props);
    //   });
  };

  clearSearch = () => {
    // document.getElementById("publication_heading").value = "";
    // document.getElementById("publication_description").value = "";
    // document.getElementById("status").value = "";
    // this.setState(
    //   {
    //     publication_description: "",
    //     publication_heading: "",
    //     status: "",
    //     remove_search: false,
    //   },
    //   () => {
    //     this.setState({ activePage: 1 });
    //     this.getPublicationsList();
    //   }
    // );
  };

  //change status
  chageStatus = (cell, status) => {
    // API.put(`/api/department/Publications/change_status/${cell}`, {
    //   status: status == 1 ? String(0) : String(1),
    // })
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record updated successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getPublicationsList(this.state.activePage);
    //     });
    //   })
    //   .catch((err) => {
    //     if (err.data.status === 3) {
    //       this.setState({ closeModal: true });
    //       showErrorMessage(err, this.props);
    //     }
    //   });
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
    // API.post(`/api/department/Publications/${id}`)
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record deleted successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getPublicationsList(this.state.activePage);
    //     });
    //   })
    //   .catch((err) => {
    //     if (err.data.status === 3) {
    //       this.setState({ closeModal: true });
    //       showErrorMessage(err, this.props);
    //     }
    //   });
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
  //get data by id
  getIndividualPublications(id) {
    // API.get(`/api/department/Publications/${id}`)
    //   .then((res) => {
    //     this.setState({
    //       alldata: res.data.data[0],
    //       publication_id: id,
    //       showModal: true,
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  }

  //for edit/add part
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      // id: "",
      alldata: "",
      publication_heading: "",
      publication_description: "",
      publication_image: "",
      date_posted: "",
      status: "",
      publicationDetails: "",
      publication_id: 0,
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualPublications(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("publication_image");
    setFieldValue("publication_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        publication_image: "",
        isValidFile: true,
      });
      return;
    }
    if (
      event.target.files[0] &&
      SUPPORTED_FORMATS.includes(event.target.files[0].type)
    ) {
      //Supported
      this.setState({
        publication_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        publication_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        publication_image: "",
        isValidFile: false,
      });
    }
  };

  handleSubmitEventAdd = (values, actions) => {
    // // let postdata = {
    // //   publication_heading: values.publication_heading,
    // //   publication_description: values.publication_description,
    // //   publication_image: values.publication_image,
    // //   date_posted: new Date().toLocaleString(),
    // //   status: String(values.status),
    // // };
    // // console.log("postdata", postdata);
    // let formData = new FormData();
    // formData.append("publication_heading", values.publication_heading);
    // formData.append("publication_description", values.publication_description);
    // formData.append("status", String(values.status));
    // let url = `/api/department/Publications`;
    // let method = "POST";
    // if (this.state.publication_image.size > FILE_SIZE) {
    //   actions.setErrors({ publication_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
    //   actions.setSubmitting(false);
    // } else {
    //   getHeightWidth(this.state.publication_image).then((dimension) => {
    //     const { height, width } = dimension;
    //     const offerDimension = getResolution("Publications");
    //     if (height != offerDimension.height || width != offerDimension.width) {
    //       actions.setErrors({
    //         publication_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
    //       });
    //       actions.setSubmitting(false);
    //     } else {
    //       formData.append("publication_image", this.state.publication_image);
    //       API({
    //         method: method,
    //         url: url,
    //         data: formData,
    //       })
    //         .then((res) => {
    //           this.setState({ showModal: false, publication_image: "" });
    //           swal({
    //             closeOnClickOutside: false,
    //             title: "Success",
    //             text: "Added Successfully",
    //             icon: "success",
    //           }).then(() => {
    //             this.getPublicationsList();
    //           });
    //         })
    //         .catch((err) => {
    //           this.setState({
    //             closeModal: true,
    //             showModalLoader: false,
    //             publication_image: "",
    //           });
    //           if (err.data.status === 3) {
    //             showErrorMessage(err, this.props);
    //           } else {
    //             actions.setErrors(err.data.errors);
    //             actions.setSubmitting(false);
    //           }
    //         });
    //     }
    //   });
    // }
  };

  handleSubmitEventUpdate = async (values, actions) => {
    // // let postdata = {
    // //   publication_heading: values.publication_heading,
    // //   publication_description: values.publication_description,
    // //   publication_image: values.publication_image,
    // //   date_posted: new Date().toLocaleString(),
    // //   status: String(values.status),
    // // };
    // // console.log("postdata edit", postdata);
    // let formData = new FormData();
    // formData.append("publication_heading", values.publication_heading);
    // formData.append("publication_description", values.publication_description);
    // formData.append("status", String(values.status));
    // let url = `/api/department/Publications/${this.state.publication_id}`;
    // let method = "PUT";
    // if (this.state.publication_image) {
    //   if (this.state.publication_image.size > FILE_SIZE) {
    //     actions.setErrors({
    //       publication_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
    //     });
    //     actions.setSubmitting(false);
    //   } else {
    //     getHeightWidth(this.state.publication_image).then((dimension) => {
    //       const { height, width } = dimension;
    //       const offerDimension = getResolution("Publications");
    //       if (
    //         height != offerDimension.height ||
    //         width != offerDimension.width
    //       ) {
    //         //    actions.setErrors({ file: "The file is not of desired height and width" });
    //         actions.setErrors({
    //           publication_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
    //         });
    //         actions.setSubmitting(false);
    //       } else {
    //         formData.append("publication_image", this.state.publication_image);
    //         API({
    //           method: method,
    //           url: url,
    //           data: formData,
    //         })
    //           .then((res) => {
    //             this.setState({ showModal: false });
    //             swal({
    //               closeOnClickOutside: false,
    //               title: "Success",
    //               text: "Updated Successfully",
    //               icon: "success",
    //             }).then(() => {
    //               this.getPublicationsList();
    //             });
    //           })
    //           .catch((err) => {
    //             this.setState({ closeModal: true, showModalLoader: false });
    //             if (err.data.status === 3) {
    //               showErrorMessage(err, this.props);
    //             } else {
    //               actions.setErrors(err.data.errors);
    //               actions.setSubmitting(false);
    //             }
    //           });
    //       }
    //     });
    //   }
    // } else {
    //   API({
    //     method: method,
    //     url: url,
    //     data: formData,
    //   })
    //     .then((res) => {
    //       this.setState({ showModal: false });
    //       swal({
    //         closeOnClickOutside: false,
    //         title: "Success",
    //         text: "Updated Successfully",
    //         icon: "success",
    //       }).then(() => {
    //         this.getPublicationsList();
    //       });
    //     })
    //     .catch((err) => {
    //       this.setState({ closeModal: true, showModalLoader: false });
    //       if (err.data.status === 3) {
    //         showErrorMessage(err, this.props);
    //       } else {
    //         actions.setErrors(err.data.errors);
    //         actions.setSubmitting(false);
    //       }
    //     });
    // }
  };

  //image modal
  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, publication_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, publication_image: "" });
  };

  render() {
    const { alldata } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      publication_image: "",
      publication_heading: alldata.publication_heading
        ? alldata.publication_heading
        : "",
      publication_description: alldata.publication_description
        ? alldata.publication_description
        : "",
      status:
        alldata.status || alldata.status === 0 ? alldata.status.toString() : "",
    });

    const validateStopFlagUpdate = Yup.object().shape({
      publication_image: Yup.string()
        .notRequired()
        .test(
          "Publicationsimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (publication_image) => {
            if (publication_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      publication_heading: Yup.string().required(
        "Please enter publication heading"
      ),
      publication_description: Yup.string().required(
        "Please enter description"
      ),
      status: Yup.number().required("Please select status"),
    });

    const validateStopFlag = Yup.object().shape({
      publication_image: Yup.mixed()
        .required("Please select image")
        .test(
          "Publicationsimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      publication_heading: Yup.string().required(
        "Please enter publication heading"
      ),
      publication_description: Yup.string().required(
        "Please enter description"
      ),
      status: Yup.number().required("Please select status"),
    });

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
                    onClick={(e) => this.modalShowHandler(e, "")}
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
                      name="publication_description"
                      id="publication_description"
                      placeholder="Filter by Description"
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
                    dataField="publication_heading"
                    dataFormat={setName(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Publication Heading
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="publication_description"
                    dataFormat={__htmlDecode(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Description
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Post Date
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
                {/* ======= Add/ Edit  Modal ======== */}
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.publication_id > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.publication_id > 0
                        ? this.handleSubmitEventUpdate
                        : this.handleSubmitEventAdd
                    }
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
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {this.state.publication_id == 0 ? "Add" : "Edit"}{" "}
                              Publication Details
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Publication Heading
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="publication_heading"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Publications Name"
                                      autoComplete="off"
                                      value={values.publication_heading}
                                    />
                                    {errors.publication_heading &&
                                    touched.publication_heading ? (
                                      <span className="errorMsg">
                                        {errors.publication_heading}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Description
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="publication_description"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Description"
                                      autoComplete="off"
                                      value={values.publication_description}
                                    />
                                    {errors.publication_description &&
                                    touched.publication_description ? (
                                      <span className="errorMsg">
                                        {errors.publication_description}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {this.state.publication_id == 0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                      <br />{" "}
                                      <i>{this.state.fileValidationMessage}</i>
                                      {this.state.message != "" ? (
                                        <>
                                          <br /> <i>{this.state.message}</i>
                                        </>
                                      ) : null}
                                    </label>
                                    <Field
                                      name="publication_image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Publications Image"
                                      autoComplete="off"
                                      id=""
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.publication_image &&
                                    touched.publication_image ? (
                                      <span className="errorMsg">
                                        {errors.publication_image}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Status
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="status"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.status}
                                    >
                                      <option key="-1" value="">
                                        Select
                                      </option>
                                      {this.state.selectStatus.map((val, i) => (
                                        <option key={i} value={val.value}>
                                          {val.label}
                                        </option>
                                      ))}
                                    </Field>
                                    {errors.status && touched.status ? (
                                      <span className="errorMsg">
                                        {errors.status}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <button
                              className={`btn btn-success btn-sm ${
                                isValid ? "btn-custom-green" : "btn-disable"
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {this.state.publication_id > 0
                                ? isSubmitting
                                  ? "Updating..."
                                  : "Update"
                                : isSubmitting
                                ? "Submitting..."
                                : "Submit"}
                            </button>
                            <button
                              onClick={(e) => this.modalCloseHandler()}
                              className={`btn btn-danger btn-sm`}
                              type="button"
                            >
                              Close
                            </button>
                          </Modal.Footer>
                        </Form>
                      );
                    }}
                  </Formik>
                </Modal>

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
