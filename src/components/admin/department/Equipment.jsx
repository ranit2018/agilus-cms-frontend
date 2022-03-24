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

const EquipmentStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
  } else if (cell === 0) {
    return "Inactive";
  }
};

const setEquipmentImage = (refObj) => (cell, row) => {
  return (
    <img
      src={row.equipment_image}
      alt="Equipment"
      height="100"
      onClick={(e) => refObj.imageModalShowHandler(row.equipment_image)}
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
  equipment_name: "",
  equipment_description: "",
  equipment_image: "",
  date_posted: "",
  status: "",
};

class Equipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      equipmentDetails: [],
      isLoading: false,
      showModal: false,
      equipment_id: 0,
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",

      alldata: [],
      equipmentSearch: [],
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
    this.getEquipmentList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getEquipmentList(pageNumber > 0 ? pageNumber : 1);
  };

  getEquipmentList = (page = 1) => {
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;

    API.get(
      `/api/department/equipment?page=${page}&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
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

  equipmentSearch = (e) => {
    e.preventDefault();
    var equipment_name = document.getElementById("equipment_name").value;
    var equipment_description = document.getElementById(
      "equipment_description"
    ).value;
    let status = document.getElementById("status").value;

    if (
      equipment_name === "" &&
      equipment_description === "" &&
      status === ""
    ) {
      return false;
    }

    API.get(
      `/api/department/equipment?page=1&equipment_name=${encodeURIComponent(
        equipment_name
      )}&equipment_description=${encodeURIComponent(
        equipment_description
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          equipmentDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,

          equipment_name: equipment_name,
          equipment_description: equipment_description,
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
    document.getElementById("equipment_name").value = "";
    document.getElementById("equipment_description").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        equipment_description: "",
        equipment_name: "",
        status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getEquipmentList();
      }
    );
  };

  //change status
  chageStatus = (cell, status) => {
    // API.put(`/api/department/Equipment/change_status/${cell}`, {
    //   status: status == 1 ? String(0) : String(1),
    // })
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record updated successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getEquipmentList(this.state.activePage);
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
    // console.log("id confirm", id);
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
        this.deleteEquipment(id);
      }
    });
  };

  deleteEquipment = (id) => {
    console.log("id delete post", id);
    // API.post(`/api/department/Equipment/${id}`)
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record deleted successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getEquipmentList(this.state.activePage);
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
  getIndividualEquipment(id) {
    console.log("get data id", id);
    // API.get(`/api/department/Equipment/${id}`)
    //   .then((res) => {
    //     console.log("get by id", res.data.data[0]);
    //     this.setState({
    //       alldata: res.data.data[0],
    //       equipment_id: id,
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
      equipment_name: "",
      equipment_description: "",
      equipment_image: "",
      date_posted: "",
      status: "",
      // equipmentDetails: "",
      equipment_id: 0,
      // Equipment_file: "",
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.getIndividualEquipment(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("equipment_image");
    setFieldValue("equipment_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        equipment_image: "",
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
        equipment_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        equipment_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        equipment_image: "",
        isValidFile: false,
      });
    }
  };

  handleSubmitEventAdd = (values, actions) => {
    // let postdata = {
    //   // job_id: this.state.jobDetails.job_id ? this.state.jobDetails.job_id : '',
    //   equipment_name: values.equipment_name,
    //   equipment_description: values.equipment_description,
    //   equipment_image: values.equipment_image,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };
    // console.log("postdata", postdata);

    let formData = new FormData();

    // formData.append('job_id',this.state.jobDetails.job_id)
    formData.append("equipment_name", values.equipment_name);
    formData.append("equipment_description", values.equipment_description);
    // formData.append('date_posted', new Date().toLocaleString());
    formData.append("status", String(values.status));

    let url = `/api/department/equipment`;
    let method = "POST";
    if (this.state.equipment_image.size > FILE_SIZE) {
      actions.setErrors({
        equipment_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
      });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.equipment_image).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("equipment");
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({
            equipment_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
          });
          actions.setSubmitting(false);
        } else {
          formData.append("equipment_image", this.state.equipment_image);

          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, equipment_image: "" });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.getEquipmentList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                equipment_image: "",
              });
              if (err.data.status === 3) {
                showErrorMessage(err, this.props);
              } else {
                actions.setErrors(err.data.errors);
                actions.setSubmitting(false);
              }
            });
        }
      });
    }
  };

  // handleSubmitEventUpdate = async (values, actions) => {
  //   console.log("edit function");
  //   let postdata = {
  //     // job_id: this.state.jobDetails.job_id ? this.state.jobDetails.job_id : '',
  //     equipment_name: values.equipment_name,
  //     equipment_description: values.equipment_description,
  //     equipment_image: values.equipment_image,
  //     date_posted: new Date().toLocaleString(),
  //     status: String(values.status),
  //   };
  //   console.log("postdata edit", postdata);

  //   let formData = new FormData();

  //   // formData.append('job_id',this.state.jobDetails.job_id)
  //   formData.append('equipment_name', values.equipment_name);
  //   formData.append('equipment_description', values.equipment_description);
  //   // formData.append('date_posted', new Date().toLocaleString());
  //   formData.append('status', String(values.status));

  //     let url = `/api/department/Equipment/${this.state.equipment_id}`;
  //     let method = 'PUT';

  //     if (this.state.equipment_image) {
  //       if (this.state.equipment_image.size > FILE_SIZE) {
  //         actions.setErrors({
  //           equipment_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  //         });
  //         actions.setSubmitting(false);
  //       } else {
  //         getHeightWidth(this.state.equipment_image).then((dimension) => {
  //           const { height, width } = dimension;
  //           const offerDimension = getResolution('equipment');

  //           if (
  //             height != offerDimension.height ||
  //             width != offerDimension.width
  //           ) {
  //             //    actions.setErrors({ file: "The file is not of desired height and width" });
  //             actions.setErrors({
  //               equipment_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  //             });
  //             actions.setSubmitting(false);
  //           } else {
  //             formData.append('equipment_image', this.state.equipment_image);
  //             API({
  //               method: method,
  //               url: url,
  //               data: formData,
  //             })
  //               .then((res) => {
  //                 this.setState({ showModal: false });
  //                 swal({
  //                   closeOnClickOutside: false,
  //                   title: 'Success',
  //                   text: 'Updated Successfully',
  //                   icon: 'success',
  //                 }).then(() => {
  //                   this.getEquipmentList();
  //                 });
  //               })
  //               .catch((err) => {
  //                 this.setState({ closeModal: true, showModalLoader: false });
  //                 if (err.data.status === 3) {
  //                   showErrorMessage(err, this.props);
  //                 } else {
  //                   actions.setErrors(err.data.errors);
  //                   actions.setSubmitting(false);
  //                 }
  //               });
  //           }
  //         });
  //       }
  //     } else {
  //       API({
  //         method: method,
  //         url: url,
  //         data: formData,
  //       })
  //         .then((res) => {
  //           this.setState({ showModal: false });
  //           swal({
  //             closeOnClickOutside: false,
  //             title: 'Success',
  //             text: 'Updated Successfully',
  //             icon: 'success',
  //           }).then(() => {
  //             this.getEquipmentList();
  //           });
  //         })
  //         .catch((err) => {
  //           this.setState({ closeModal: true, showModalLoader: false });
  //           if (err.data.status === 3) {
  //             showErrorMessage(err, this.props);
  //           } else {
  //             actions.setErrors(err.data.errors);
  //             actions.setSubmitting(false);
  //           }
  //         });
  //     }
  // };

  //image modal
  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, equipment_image: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, equipment_image: "" });
  };

  render() {
    const { alldata } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      equipment_image: "",
      equipment_name: alldata.equipment_name ? alldata.equipment_name : "",
      equipment_description: alldata.equipment_description
        ? alldata.equipment_description
        : "",
      // date_posted: equipmentDetails.date_posted ? equipmentDetails.date_posted : "",
      status:
        alldata.status || alldata.status === 0 ? alldata.status.toString() : "",
    });

    const validateStopFlagUpdate = Yup.object().shape({
      equipment_image: Yup.string()
        .notRequired()
        .test(
          "equipmentimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (equipment_image) => {
            if (equipment_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      equipment_name: Yup.string().required(
        "Please enter equipment & instrument name"
      ),
      equipment_description: Yup.string().required("Please enter description"),
      status: Yup.number().required("Please select status"),
    });

    const validateStopFlag = Yup.object().shape({
      equipment_image: Yup.mixed()
        .required("Please select image")
        .test(
          "equipmentimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      equipment_name: Yup.string().required(
        "Please enter equipment & instrument name"
      ),
      equipment_description: Yup.string().required("Please enter description"),
      status: Yup.number().required("Please select status"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Equipments
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
                    <i className="fas fa-plus m-r-5" /> Add Equipment &
                    Instrument
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_name"
                      id="equipment_name"
                      placeholder="Filter by Equipment Name"
                    />
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="equipment_description"
                      id="equipment_description"
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
                      onClick={(e) => this.equipmentSearch(e)}
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
                  data={this.state.equipmentDetails}
                >
                  <TableHeaderColumn
                    isKey
                    dataField="equipment_name"
                    dataFormat={setName(this)}
                    width="125"
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Equipment & Instrument Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="equipment_image"
                    dataFormat={setEquipmentImage(this)}
                    tdStyle={{ wordBreak: "break-word" }}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="equipment_description"
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
                    dataFormat={EquipmentStatus(this)}
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
                          totalItemsCount={Number(this.state.totalCount)}
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
                      this.state.equipment_id > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.equipment_id > 0
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
                              {this.state.equipment_id == 0 ? "Add" : "Edit"}{" "}
                              Equipment & Instrument
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Equipment & Instrument Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="equipment_name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Equipment Name"
                                      autoComplete="off"
                                      value={values.equipment_name}
                                    />
                                    {errors.equipment_name &&
                                    touched.equipment_name ? (
                                      <span className="errorMsg">
                                        {errors.equipment_name}
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
                                      name="equipment_description"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Description"
                                      autoComplete="off"
                                      value={values.equipment_description}
                                    />
                                    {errors.equipment_description &&
                                    touched.equipment_description ? (
                                      <span className="errorMsg">
                                        {errors.equipment_description}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Equipment & Instrument Image
                                      {this.state.equipment_id == 0 ? (
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
                                      name="equipment_image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Select any Equipment Image"
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
                                    {errors.equipment_image &&
                                    touched.equipment_image ? (
                                      <span className="errorMsg">
                                        {errors.equipment_image}
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
                              {this.state.equipment_id > 0
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
                  <Modal.Header closeButton>
                    Equipment & Instrument Image
                  </Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.equipment_image}
                          alt="Equipment Image"
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
export default Equipment;
