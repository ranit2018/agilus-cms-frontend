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
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
} from "../../../shared/helper";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../layout/Layout";

const initialValues = {
  file: "",
  status: "",
};
const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};
const custStatus = (refObj) => (cell) => {
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
      {/* <LinkWithTooltip
                tooltip="Click to Delete"
                href="#"
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id="tooltip-1"
            >
                <i className="far fa-trash-alt" />
            </LinkWithTooltip> */}
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.modalShowHandler(e, cell)}
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
          onChange={() => refObj.chageStatus(row.id, row.status)}
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

export default class RnDCategories extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categoriesList: [],
      categoryDetails: {},
      categoryId: 0,
      isLoading: false,
      showModal: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectType: [],
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      name: "",
      designation: "",
      status: "",
      rnd_partner_image: "",
      description: "",
    };
  }

  getCategories = (page = 1) => {
    const status = this.state.status;
    //https://srlcmsbackend.indusnettechnologies.com/api/rnd/rnd_category?page=1&category_name=cat&status=0

    API.get(
      `/api/rnd/rnd_partner?page=${page}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        console.log(res.data.data);
        this.setState({
          categoriesList: res.data.data,
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
  modalShowHandler = (event, id) => {
    event.preventDefault();

    if (id) {
      this.getCategorydetails(id);
    } else {
      this.setState({ showModal: true });
    }
  };
  modalCloseHandler = () => {
    this.setState({
      categoryDetails: {},
      categoryId: "",
      showModal: false.valueOf,
      showModal: false,
    });
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
        this.deleteCategory(id);
      }
    });
  };

  getCategorydetails(id) {
    API.get(`/api/rnd/rnd_partner/${Number(id)}`)
      .then((res) => {
        console.log(res.data.data[0]);
        this.setState({
          showModal: true,
          categoryDetails: res.data.data[0],
          categoryId: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  deleteCategory = (id) => {
    API.post(`/api/rnd/rnd_partner/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getCategories(this.state.activePage);
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
    API.put(`/api/rnd/rnd_partner/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getCategories(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("rnd_partner_image");
    setFieldValue("rnd_partner_image", event.target.value);
    console.log(event.target.files[0]);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        rnd_partner_image: "",
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
        rnd_partner_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        rnd_partner_image:
          "Only files with the following extensions are allowed: jpg/png/jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        rnd_partner_image: "",
        isValidFile: false,
      });
    }
  };

  setHealthBenefitImage = (refObj) => (cell, row) => {
    if (row.health_image !== null) {
      return (
        <img
          src={row.rnd_partner_image}
          alt="rnd_partner_image"
          height="100"
          //   onClick={(e) => refObj.imageModalShowHandler(row.health_image)}
        ></img>
      );
    } else {
      return null;
    }
  };

  handleSubmitEvent = async (values, actions) => {
    let url = "";
    let method = "";
    const formData = new FormData();

    formData.append("status", values.status);
    formData.append("rnd_partner_image", this.state.rnd_partner_image);

    if (this.state.categoryId > 0) {
      url = `/api/rnd/rnd_partner/${this.state.categoryId}`;
      method = "PUT";
    } else {
      url = `/api/rnd/rnd_partner/`;
      method = "POST";
    }

    API({
      method: method,
      url: url,
      data: formData,
    })
      .then((res) => {
        this.modalCloseHandler();
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text:
            method === "PUT"
              ? "Record updated successfully."
              : "Record added successfully.",
          icon: "success",
        }).then(() => {
          this.getCategories(this.state.activePage);
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
  componentDidMount() {
    this.getCategories();
  }

  render() {
    const { categoryDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      status:
        categoryDetails.status || +categoryDetails.status === 0
          ? categoryDetails.status.toString()
          : "",
      rnd_partner_image: "",
    });

    let validateStopFlag = {};
    if (this.state.categoryId > 0) {
      validateStopFlag = Yup.object().shape({
        status: Yup.string()
          .trim()

          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        // rnd_partner_image: Yup.string()
        //   // .required("Please select the image")

        //   .when(`${this.state.category_image != ""}`, {
        //     is: (value) => value != "",
        //     then: Yup.string().test(
        //       "file",
        //       "Only files with the following extensions are allowed: jpg/jpeg/png",
        //       () => this.state.isValidFile
        //     ),
        //   }),
        rnd_partner_image: Yup.string()
          .notRequired()
          .test(
            "file",
            "Only files with the following extensions are allowed: jpeg/jpg/png",
            // () => this.state.isValidFile
            (file) => {
              if (file) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        rnd_partner_image: Yup.string()
          .required("Please select the file")
          .test(
            "file",
            "Only files with the following extensions are allowed: jpeg/jpg/png",
            () => this.state.isValidFile
          ),
      });
    }

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>Manage Partners</h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.modalShowHandler(e, "")}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Partner
                  </button>
                </div>

                <div className=""></div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.categoriesList}>
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={this.setHealthBenefitImage(this)}
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
                    isKey
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
              </div>
            </div>
          </section>
          {/* ======= Add Banner Modal ======== */}
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
                setErrors,
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
                        {this.state.categoryId > 0
                          ? "Edit Partner"
                          : "Add Partner"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="contBox">
                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Choose File
                                <br />{" "}
                                <i>(Image maximum file size is 20 mb.)</i>
                                {this.state.documentId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="rnd_partner_image"
                                type="file"
                                className={`form-control`}
                                autoComplete="off"
                                onChange={(e) => {
                                  this.fileChangedHandler(
                                    e,
                                    setFieldTouched,
                                    setFieldValue,
                                    setErrors
                                  );
                                }}
                              />
                              {errors.rnd_partner_image &&
                              touched.rnd_partner_image ? (
                                <span className="errorMsg">
                                  {errors.rnd_partner_image}
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
                                {this.state.documentId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="status"
                                component="select"
                                className={`selectArowGray form-control`}
                                autoComplete="off"
                                value={values.status}
                              >
                                <option key="-1" value="">
                                  {" "}
                                  Select{" "}
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
                        {this.state.memberId > 0
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
        </div>
      </Layout>
    );
  }
}
