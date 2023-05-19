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
import ReactPlayer from "react-player";

const initialValues = {
  name: "",
  category_description: "",
  file: "",
  status: "",
  tab: "",
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
      inside_srl_file: "",
      video_url: "",
      category_description: "",
      isValidFilepdf: false,
      isValidFile: false,
      youtube_video_code: "",
      showPreview: false,
      tabData: [],
      tab: "",
    };
  }

  getCategories = (page = 1) => {
    const status = this.state.status;

    API.get(`/api/home/inside_us?page=${page}`)
      .then((res) => {
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
  getTabs = (page = 1) => {
    API.get(`/api/home/inside_us_tab`)
      .then((res) => {
        this.setState({
          tabData: res.data.data,
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
      this.setState({ inside_srl_file: "", video_url: "" });

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
      showPreview: false,
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
    API.get(`/api/home/inside_us/${Number(id)}`)
      .then((res) => {
        this.setState({
          showModal: true,
          categoryDetails: res.data.data[0],
          categoryId: id,
          youtube_video_code: res.data.data[0].youtube_url,
        });
        if (res.data.data[0].youtube_url != "") {
          this.setState({ showPreview: true });
        }
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  deleteCategory = (id) => {
    API.post(`/api/home/inside_us/${id}`)
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
    API.put(`/api/home/inside_us/change_status/${cell}`, {
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
    setFieldTouched("inside_srl_file");
    setFieldValue("inside_srl_file", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        inside_srl_file: "",
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
        inside_srl_file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        inside_srl_file:
          "Only files with the following extensions are allowed: jpg/png/jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        inside_srl_file: "",
        isValidFile: false,
      });
    }
  };

  handleVideoPreview = (id) => {
    // console.log("id:", id);
    if (id == "") {
      this.setState({
        showPreview: false,
      });
    }
    this.setState({
      youtube_video_code: id,
    });
  };

  setHealthBenefitImage = (refObj) => (cell, row) => {
    let exten = row.inside_us_file.split(".").pop();
    if (row.inside_us_file !== null) {
      return (
        <>
          <img
            src={row.inside_us_file}
            alt="Inside SRL Image"
            height="100"
            //   onClick={(e) => refObj.imageModalShowHandler(row.health_image)}
          ></img>
        </>
      );
    } else {
      return null;
    }
  };
  setInsideSrlVideo = (refObj) => (cell, row) => {
    if (row.youtube_url !== "") {
      return (
        <>
          <ReactPlayer
            url={row.youtube_url}
            width="100%"
            height="100px"
            controls
            // playing={true}
            loop={false}
            // light={i.type == 2 ? "" : i.image}
          />
        </>
      );
    } else {
      return null;
    }
  };

  handleSubmitEvent = async (values, actions) => {
    let url = "";
    let method = "";
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("status", values.status);
    formData.append("content", values.category_description);
    formData.append("inside_file", this.state.inside_srl_file);
    formData.append("youtube_url", values.video_url);
    formData.append("inside_tab", values.tab);

    if (this.state.categoryId > 0) {
      url = `/api/home/inside_us/${this.state.categoryId}`;
      method = "PUT";
    } else {
      url = `/api/home/inside_us`;
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
          showErrorMessage(err, this.props);
        }
      });
  };
  componentDidMount() {
    this.getCategories();
    this.getTabs();
  }
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getCategories(pageNumber > 0 ? pageNumber : 1);
  };

  render() {
    const { categoryDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      title: categoryDetails.title ? htmlDecode(categoryDetails.title) : "",
      category_description: categoryDetails.content
        ? htmlDecode(categoryDetails.content)
        : "",
      status:
        categoryDetails.status || +categoryDetails.status === 0
          ? categoryDetails.status.toString()
          : "",
      tab: categoryDetails.inside_tab_id ? categoryDetails.inside_tab_id : "",
      inside_srl_file: "",
      video_url: categoryDetails.youtube_url
        ? htmlDecode(categoryDetails.youtube_url)
        : "",
    });

    let validateStopFlag = {};
    if (this.state.categoryId > 0) {
      validateStopFlag = Yup.object().shape({
        title: Yup.string().notRequired(),
        category_description: Yup.string().notRequired(),
        status: Yup.string()
          .trim()
          .notRequired()
          .matches(/^[0|1]$/, "Invalid status selected"),
        tab: Yup.string().trim().required("Invalid tab selected"),
        inside_srl_file: Yup.string()
          .notRequired()
          .test(
            "file",
            "Only files with the following extensions are allowed: jpeg/jpg/png",
            (file) => {
              if (file) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        video_url: Yup.string().notRequired(),
        // .matches(
        //   /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        //   "Please Enter correct URL"
        // ),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        title: Yup.string().required("Please enter the title"),
        category_description: Yup.string().required(
          "Please enter the description"
        ),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
        inside_srl_file: Yup.string()
          .required("Please select the file")
          .test(
            "file",
            "Only files with the following extensions are allowed: jpeg/jpg/png",
            () => this.state.isValidFile
          ),
        video_url: Yup.string(),
        // .matches(
        //   /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        //   "Please Enter correct URL"
        // )
        // .required("Please enter Video URL"),
        tab: Yup.string().required("Please Select Tab"),
      });
    }

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>Manage Inside SRL</h1>
              </div>
              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.modalShowHandler(e, "")}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Inside Srl
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
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="content"
                    dataFormat={__htmlDecode(this)}
                  >
                    Description
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="inside_us_file"
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
          {/* ======= Add Inside SRL Modal ======== */}
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
                          ? "Edit Inside Srl"
                          : "Add Inside Srl"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="contBox">
                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Tab
                                {this.state.categoryId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="tab"
                                component="select"
                                className={`selectArowGray form-control`}
                                autoComplete="off"
                                value={values.tab}
                              >
                                <option key="-1" value="">
                                  {" "}
                                  Select{" "}
                                </option>
                                {this.state.tabData.map((val, i) => (
                                  <option key={i} value={val.value}>
                                    {val.label}
                                  </option>
                                ))}
                              </Field>
                              {errors.tab && touched.tab ? (
                                <span className="errorMsg">{errors.tab}</span>
                              ) : null}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Title
                                {this.state.categoryId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="title"
                                type="text"
                                className={`form-control`}
                                placeholder="Enter The Title"
                                autoComplete="off"
                                value={values.title}
                              />
                              {errors.title && touched.title ? (
                                <span className="errorMsg">{errors.title}</span>
                              ) : null}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Descriptions
                                {this.state.categoryId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="category_description"
                                type="text"
                                as="textarea"
                                rows={3}
                                className={`form-control`}
                                placeholder="Enter The Description"
                                autoComplete="off"
                                value={values.category_description}
                              />
                              {errors.category_description &&
                              touched.category_description ? (
                                <span className="errorMsg">
                                  {errors.category_description}
                                </span>
                              ) : null}
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Choose Image
                                <br />{" "}
                                <i>(Image maximum file size is 20 mb.)</i>
                                {this.state.documentId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>
                              <Field
                                name="inside_srl_file"
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

                              {errors.inside_srl_file &&
                              touched.inside_srl_file ? (
                                <span className="errorMsg">
                                  {errors.inside_srl_file}
                                </span>
                              ) : null}
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Youtube Video ID{" "}
                                {values.video_url != "" ? (
                                  <a
                                    onClick={() => {
                                      this.setState({
                                        showPreview: !this.state.showPreview,
                                      });
                                    }}
                                  >
                                    {this.state.showPreview == false ? (
                                      <>(Preview)</>
                                    ) : (
                                      <>(Close Preview)</>
                                    )}
                                  </a>
                                ) : null}
                                <br />{" "}
                                {this.state.documentId == 0 ? (
                                  <span className="impField">*</span>
                                ) : null}
                              </label>

                              <Field
                                name="video_url"
                                type="text"
                                className={`form-control`}
                                placeholder="Enter The Video URL"
                                autoComplete="off"
                                value={values.video_url}
                                onChange={(e) => {
                                  this.handleVideoPreview(e.target.value);
                                  setFieldValue("video_url", e.target.value);
                                }}
                              />

                              {errors.video_url && touched.video_url ? (
                                <span className="errorMsg">
                                  {errors.video_url}
                                </span>
                              ) : null}
                            </div>
                          </Col>
                        </Row>
                        {this.state.showPreview == true ? (
                          <>
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <iframe
                                    width="560"
                                    height="255"
                                    src={`https://www.youtube.com/embed/${this.state.youtube_video_code}`}
                                    title="YouTube video player"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                  ></iframe>
                                </div>
                              </Col>
                            </Row>
                          </>
                        ) : null}

                        <Row>
                          <Col xs={12} sm={12} md={12}>
                            <div className="form-group">
                              <label>
                                Status
                                {this.state.categoryId == 0 ? (
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
