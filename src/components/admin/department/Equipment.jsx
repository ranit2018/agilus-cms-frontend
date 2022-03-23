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
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE, FILE_VALIDATION_SIZE_ERROR_MASSAGE, FILE_VALIDATION_TYPE_ERROR_MASSAGE } from "../../../shared/helper";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import SRL from '../../../assets/images/SRL.png'

import exclamationImage from '../../../assets/images/exclamation-icon-black.svg';
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
                tooltip={'Click to Edit'}
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
            {/* <LinkWithTooltip
        tooltip="Click to Change Status"
        href="#"
        clicked={(e) => refObj.sendPassword(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-envelope" />
      </LinkWithTooltip> */}
        </div>
    );
};

const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
    return cell.replace('.png', " ")
}

const bannerStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Active";
    } else if (cell === 0) {
        return "Inactive";
    }
};

const setBannerImage = (refObj) => (cell, row) => {

    return (
        // <LinkWithTooltip
        //   tooltip={"View Image"}
        //   id="tooltip-1"
        //   clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
        // >
        <img src={row.banner_image} alt="Banner Image" height="100" onClick={(e) => refObj.imageModalShowHandler(row.banner_image)}></img>
        // </LinkWithTooltip>
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
    file: "",
    page_name: "",
    banner_text: "",
    button_text: "",
    button_url: "",
    status: ""
};

class Equipment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equipmentDetails: [],
            isLoading: false,
            showModal: false,
            status: '',
            equipment_name: '',
            equipment_description: '',
            equipment_id: 0,
            equipment_file: '',
            searchDetails: [],

            selectStatus: [
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' }
            ],
            activePage: 1,
            totalCount: 0,
            itemPerPage: 10,
            thumbNailModal: false,
            message: '',
        };
    }

    componentDidMount() {
        // this.getBannerList();
        // this.getPageArr();
        // this.fetchScreen();
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getBannerList(pageNumber > 0 ? pageNumber : 1);
    };

    getBannerList = (page = 1) => {

        let equipment_name = this.state.equipment_name;
        let equipment_description = this.state.equipment_description;

        API.get(
            `/api/banner?page=${page}&status=${encodeURIComponent(equipment_description)}&equipment_name=${encodeURIComponent(equipment_name)}`
        ).then((res) => {
            this.setState({
                equipmentDetails: res.data.data,
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
    }


    bannerSearch = (e) => {
        e.preventDefault();

        var equipment_name = document.getElementById("equipment_name").value;
        var status = document.getElementById("status").value;

        if (equipment_name === "" && status === "") {
            return false;
        }

        API.get(`/api/banner?page=1&status=${encodeURIComponent(status)}&equipment_name=${encodeURIComponent(equipment_name)}`)
            .then((res) => {
                this.setState({
                    equipmentDetails: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false,
                    equipment_name: equipment_name,
                    status: status,
                    activePage: 1,
                    remove_search: true
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false
                });
                showErrorMessage(err, this.props);
            });
    };

    getIndividualBanner(id) {
        API.get(`/api/banner/${id}`)
            .then((res) => {
                this.setState({
                    equipmentDetails: res.data.data[0],
                    equipment_id: id,
                    showModal: true
                });
            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }

    modalCloseHandler = () => {
        this.setState({ showModal: false, equipmentDetails: "", equipment_id: 0, equipment_file: "", message: "", fileValidationMessage: "" });
    };

    modalShowHandler = (event, id) => {
        this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE })
        if (id) {
            event.preventDefault();
            this.getIndividualBanner(id);
        } else {
            this.setState({ showModal: true });
        }
    };

    handleBannerEdit = (id) => {
        swal({
            closeOnClickOutside: false,
            title: "Are you sure?",
            text: "Click to edit the banner",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willEdit) => {
            if (willEdit) {
                this.getIndividualBanner(id);
            }
        })
    }

    handleSubmitEvent = async (values, actions) => {
        // var formData = new FormData();
        // formData.append("status", values.status);
        // formData.append("equipment_name", values.equipment_name);
        // formData.append("equipment_description", values.equipment_description);


        //   formData.append("equipment_file", this.state.equipment_file);

        // API.put(`/api/banner/${this.state.equipment_id}`, formData)
        //   .then(res => {
        //     this.modalCloseHandler();
        //     swal({
        //       closeOnClickOutside: false,
        //       title: "Success",
        //       text: "Banner Updated Successfully",
        //       icon: "success"
        //     }).then(() => {
        //       this.getBannerList(this.state.activePage);
        //     });
        //   })
        //   .catch(err => {
        //     this.setState({ closeModal: true, showModalLoader: false });
        //     if (err.data.status === 3) {
        //       showErrorMessage(err, this.props);
        //     } else {
        //       actions.setErrors(err.data.errors)
        //     }
        //   });  


    }

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
                this.deleteBanner(id);
            }
        });
    };

    deleteBanner = (id) => {
        API.delete(`/api/banner/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getBannerList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    chageStatus = (cell, status) => {
        API.put(`/api/banner/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record updated successfully.",
                    icon: "success",
                }).then(() => {
                    this.getBannerList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    }

    renderShowsTotal = (start, to, total) => {
        return (
            <span className="pageShow">
                Showing {start} to {to}, of {total} records
            </span>
        );
    };

    clearSearch = () => {

        document.getElementById("status").value = "";
        document.getElementById("equipment_name").value = "";

        this.setState(
            {
                equipment_name: "",
                status: "",

                remove_search: false,
            },
            () => {
                this.setState({ activePage: 1 });
                this.getBannerList();
            }
        );
    };

    checkHandler = (event) => {
        event.preventDefault();
    };

    imageModalShowHandler = (url) => {
        console.log(url);
        this.setState({ thumbNailModal: true, equipment_url: url });
    }
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, equipment_url: "" });
    }

    fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);
        setFieldTouched("equipment_file");
        setFieldValue("equipment_file", event.target.value);
        console.log(event.target.files);
        const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
        if (!event.target.files[0]) {
            //Supported
            this.setState({
                equipment_file: "",
                isValidFile: true,
                isValidHeightWidth: true,
            });
            return;
        }
        if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
            this.setState({
                equipment_file: event.target.files[0],
                isValidFile: true,
            });


        } else {
            setErrors({ banner_file: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
            this.setState({
                banner_file: "",
                isValidFile: false,
                isValidHeightWidth: true
            });
        }
    };

    render() {

        const { equipmentDetails } = this.state;
        // const newInitialValues = Object.assign(initialValues, {

        //     equipment_name: equipmentDetails.equipment_name ? equipmentDetails.equipment_name : "",
        //     equipment_description: equipmentDetails.equipment_description ? equipmentDetails.equipment_description : "",
        //     status: equipmentDetails.status || equipmentDetails.status === 0 ? equipmentDetails.status.toString() : ""
        // });

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Banners
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
                                        <i className="fas fa-plus m-r-5" /> Add Equipment  Instrument
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
                                        <select
                                            name="status"
                                            id="status"
                                            className="form-control"
                                        >
                                            <option value="">Select Equipment Status</option>
                                            {this.state.selectStatus.map((val) => {
                                                return (
                                                    <option key={val.value} value={val.value}>{val.label}</option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="">
                                        <input
                                            type="submit"
                                            value="Search"
                                            className="btn btn-warning btn-sm"
                                            onClick={(e) => this.bannerSearch(e)}
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

                                <BootstrapTable  data={this.state.equipmentDetails}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="equipment_name"
                                        dataFormat={setName(this)}
                                        // width="125"
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Equipment Name
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="image"
                                        dataFormat={setBannerImage(this)}
                                        // width="125"
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Thumbnail
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="equipment_description"
                                        dataFormat={__htmlDecode(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Equipment Description
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="date_added"
                                        dataFormat={setDate(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Post Date
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="status"
                                        dataFormat={bannerStatus(this)}
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

                                {/* ======= Add Banner Modal ========
                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
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
                      setErrors
                    }) => {
                      return (
                        <Form>
                          {this.state.showModalLoader === true ? (
                            <div className="loading_reddy_outer">
                              <div className="loading_reddy">
                                <img src={whitelogo} alt="loader" />
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                          <Modal.Header closeButton>
                            <Modal.Title>
                              {this.state.banner_id == 0 ? "Add" : "Edit"} Banner
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Page Name
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="page_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      onChange={(e) => {
                                        setFieldValue("page_name", e.target.value)
                                        if (e.target.value == 1) {
                                          this.setState({
                                            message: generateResolutionText("home-banner-images")
                                          });
                                        }
                                        else if (e.target.value == 10) {
                                          this.setState({
                                            message: generateResolutionText("landening-banner-images")
                                          });
                                        } else {
                                          this.setState({
                                            message: generateResolutionText("others-banner-images")
                                          })
                                        }
                                      }}
                                      value={values.page_name}
                                    >
                                      <option value="">Select</option>
                                      {this.state.page_name_arr.map((val) => {
                                        return (
                                          <option value={val.value}>{val.label}</option>
                                        );
                                      })}
                                    </Field>
                                    {errors.page_name && touched.page_name ? (
                                      <span className="errorMsg">
                                        {errors.page_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Screen Name
                                    </label>
                                    <Field
                                      name="screen_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.screen_name}
                                    >
                                      <option key="-1" value="">
                                        Select
                                      </option>
                                      {this.state.screens.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.screen_name && touched.screen_name ? (
                                      <span className="errorMsg">
                                        {errors.screen_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Banner Text
                                    </label>
                                    <Field
                                      name="banner_text"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Banner Text"
                                      autoComplete="off"
                                      value={values.banner_text}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Banner Subtext
                                    </label>
                                    <Field
                                      name="banner_subtext"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Banner Subtext"
                                      autoComplete="off"
                                      value={values.banner_subtext}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Button Text
                                    </label>
                                    <Field
                                      name="button_text"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Button Text"
                                      autoComplete="off"
                                      value={values.button_text}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Button Url
                                    </label>
                                    <Field
                                      name="button_url"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Button Url"
                                      autoComplete="off"
                                      value={values.button_url}
                                    />
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {
                                        this.state.banner_id == 0 ?
                                          <span className="impField">*</span>
                                          : null
                                      }
                                      <br /> <i>{this.state.fileValidationMessage}</i>
                                      {
                                        this.state.message != '' ?
                                          <>
                                            <br /> <i>{this.state.message}</i>
                                          </>
                                          : null
                                      }
                                    </label>
                                    <Field
                                      name="banner_file"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Banner File"
                                      autoComplete="off"
                                      id=''
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.banner_file && touched.banner_file ? (
                                      <span className="errorMsg">{errors.banner_file}</span>
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
                                      {this.state.status_banners.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
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
                              className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                } m-r-10`}
                              type="submit"
                              disabled={isValid ? (isSubmitting ? true : false) : true}
                            >
                              {this.state.banner_id > 0
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
                </Modal> */}

                                <Modal
                                    show={this.state.thumbNailModal}
                                    onHide={() => this.imageModalCloseHandler()}
                                    backdrop='static'
                                >
                                    <Modal.Header closeButton>Equipment and Instrument Image</Modal.Header>
                                    <Modal.Body>
                                        <center>
                                            <div className="imgUi">
                                                <img src={this.state.equipment_url} alt="Equipment Image"></img>
                                            </div>
                                        </center>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout >
        );
    }
}
export default Equipment;
