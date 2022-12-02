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
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
} from "../../../shared/helper";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import SRL from "../../../assets/images/SRL.png";

import exclamationImage from "../../../assets/images/exclamation-icon-black.svg";
import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import { Editor } from "@tinymce/tinymce-react";

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
        tooltip="Click to view page"
        href="#"
       clicked={(e) => {
        window.open(`http://srl.indusnettechnologies.com/landing/${row.slug}`, "_blank")
        
       }}
        id="tooltip-0"
      >
        <i className="far fa-eye" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.editPage(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(cell, row.status)}
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

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const bannerStatus = (refObj) => (cell) => {
  //return cell === 1 ? "Active" : "Inactive";
  if (cell === 1) {
    return "Active";
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

const setBannerImage = (refObj) => (cell, row) => {
  return (
    // <LinkWithTooltip
    //   tooltip={"View Image"}
    //   id="tooltip-1"
    //   clicked={(e) => refObj.imageModalShowHandler(row.banner_image)}
    // >
    <div
      style={{
        width: "100px",
        height: "100px",
        overflow: "hidden",
      }}
    >
      <img
        src={cell}
        alt="dynamic landing page"
        width="100%"
        onClick={(e) => refObj.imageModalShowHandler(row.page_image)}
      ></img>
    </div>

    // </LinkWithTooltip>
  );
};

const initialValues = {
  image: "",
  page_name: "",
  page_slug: "",
  feedback: "",
};

class Pages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //   dynamicLandingPage: [],
      dynamicLandingPageDetails: {},
      isLoading: false,
      showModal: false,
      page_name: "",
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      // thumbNailModal: false,
      apiAfterValidation: true,

      status: "",
      avalible_slug: [],
    };
  }

  slugValidation = (value) => {
    const regex = new RegExp("^[^0-9._]*[a-zA-Z0-9_]*[^0-9._]$");
    return regex.test(value);
  };

  componentDidMount() {
    this.getDynamicLandingPageList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDynamicLandingPageList(pageNumber > 0 ? pageNumber : 1);
  };

  getDynamicLandingPageList = (page = 1) => {
    let status = this.state.status;

    API.get(
      `api/llp/lead_landing_page?page=${page}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          dynamicLandingPage: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
        });
        res.data.data.map((item) => {
          this.setState({
            avalible_slug: [...this.state.avalible_slug, item.slug],
          });
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  dynamicLandingPageSearch = (e) => {
    e.preventDefault();
    const status = document.getElementById("status").value;

    if (status === "") {
      return false;
    }
    API.get(
      `api/llp/lead_landing_page?page=1&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          dynamicLandingPage: res.data.data,
          totalCount: res.data.count,
          isLoading: false,

          activePage: 1,
          status: status,
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
    document.getElementById("status").value = "";

    this.setState(
      {
        status: "",
        remove_search: true,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDynamicLandingPageList();
      }
    );
  };

  getIndividualDynamicLandingPage(id) {
    API.get(`/api/llp/lead_landing_page/${id}`)
      .then((res) => {
        this.setState({
          dynamicLandingPageDetails: res.data.data[0],
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  modalCloseHandler = () => {
    this.setState({ banner_id: 0 });
    this.setState({ showModal: false });
    this.setState({
      dynamic_landing_page_id: 0,
      dynamicLandingPageDetails: {},
      image: "",
      validationMessage: "",
    });
  };

  modalShowHandler = (event, id) => {
    this.setState({
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
    if (id) {
      event.preventDefault();
      this.setState({ dynamic_landing_page_id: id });
      this.getIndividualDynamicLandingPage(id);
      this.setState({ showModal: true });
    } else {
      this.setState({
        showModal: true,
        dynamic_landing_page_id: 0,
        dynamicLandingPageDetails: {},
        image: "",
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    let url = "";
    let method = "";

    let formData = new FormData();
    formData.append("page_name", values.page_name);
    formData.append("status", values.status);
    formData.append("content", values.content);
    formData.append("page_slug", values.page_slug);
    console.log(">>>>>>", this.state.dynamic_landing_page_id);

    // if (!this.state.avalible_slug.includes(values.page_slug)) {
    //   formData.append("page_slug", values.page_slug);
    // } else {
    //   actions.setErrors({
    //     page_slug:
    //       "Page Slug is already in use, please use different slug name.",
    //   });
    //   actions.setSubmitting(false);
    //   this.setState({
    //     apiAfterValidation: false,
    //   });
    // }

    if (this.state.image) {
      if (this.state.image.size > FILE_SIZE) {
        actions.setErrors({ image: "The file exceeds maximum size." });
        actions.setSubmitting(false);
      } else {
        formData.append("lead_landing_page_image", this.state.image);
      }
    }

    if (this.state.dynamic_landing_page_id > 0) {
      url = `/api/llp/lead_landing_page/${this.state.dynamic_landing_page_id}`;
      method = "PUT";
    } else {
      url = `/api/llp/lead_landing_page`;
      method = "POST";
    }

    if (this.state.apiAfterValidation == true) {
      API({
        url: url,
        method: method,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false, image: "" });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text:
              method === "PUT" ? "Updated Successfully" : "Added Successfully",
            icon: "success",
          }).then(() => {
            this.getDynamicLandingPageList();
          });
        })
        .catch((err) => {
          this.setState({ closeModal: true, showModalLoader: false });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
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
        this.deleteDynamicLandingPage(id);
      }
    });
  };

  chageStatus = (cell, status) => {
    console.log("cell:", cell);
    API.put(`/api/llp/lead_landing_page/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getDynamicLandingPageList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  deleteDynamicLandingPage = (id) => {
    API.post(`/api/llp/lead_landing_page/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getDynamicLandingPageList(this.state.activePage);
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
    setFieldTouched("image");
    setFieldValue("image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        image: "",
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
        image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        image: "",
        isValidFile: false,
      });
    }
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  };

  editPage(e, id) {
    e.preventDefault();
    this.props.history.push({
      pathname: '/edit-page/' + id      
  })
}

  render() {
    const { dynamicLandingPageDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      image: "",
      page_name: dynamicLandingPageDetails.name
        ? htmlDecode(dynamicLandingPageDetails.name)
        : "",
      page_slug: dynamicLandingPageDetails.slug
        ? htmlDecode(dynamicLandingPageDetails.slug)
        : "",
      content: dynamicLandingPageDetails.content
        ? htmlDecode(dynamicLandingPageDetails.content)
        : "",

      status:
        dynamicLandingPageDetails.status ||
        +dynamicLandingPageDetails.status === 0
          ? dynamicLandingPageDetails.status.toString()
          : "",
    });

    let validateStopFlag = {};

    if (this.state.dynamic_landing_page_id > 0) {
      validateStopFlag = Yup.object().shape({
        page_name: Yup.string().required("Please enter the name"),
        page_slug: Yup.string()
          .matches(
            /^[a-zA-Z-]+$/,
            "Please enter the page slug without any special character"
          )
          .required("Please enter the page slug"),
        content: Yup.string(),

        image: Yup.string()
          .notRequired()
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            (image) => {
              if (image) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        page_name: Yup.string().required("Please enter the name"),
        page_slug: Yup.string()
          .matches(
            /^[a-zA-Z-]+$/,
            "Please enter the page slug without any apecial chracter"
          )
          .required("Please enter the page slug"),
        content: Yup.string(),

        image: Yup.string()
          .required("Please select the image")
          .test(
            "image",
            "Only files with the following extensions are allowed: png jpg jpeg",
            () => this.state.isValidFile
          ),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    }

    return (
      <Layout {...this.props}>
        
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Pages
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.props.history.push({
                      pathname: '/add-page',
                      state: { categoryList: this.state.categoryList }
                  })}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Page
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <select name="status" id="status" className="form-control">
                      <option value="">
                        Select Dynamic Landing Page Status
                      </option>
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
                      onClick={(e) => this.dynamicLandingPageSearch(e)}
                    />
                    {this.state.remove_search && this.state.status != "" ? (
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
                <BootstrapTable data={this.state.dynamicLandingPage}>
                  <TableHeaderColumn
                    isKey
                    dataField="name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Page Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="slug"
                    dataFormat={__htmlDecode(this)}
                  >
                    Page Slug
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="page_image"
                    dataFormat={setBannerImage(this)}
                  >
                    Image
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="status"
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
                              {this.state.dynamic_landing_page_id > 0
                                ? "Edit Page"
                                : "Add Page"}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Page Name
                                      {this.state.dynamic_landing_page_id >
                                      0 ? null : (
                                        <span className="impField">*</span>
                                      )}
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="page_name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter name"
                                      autoComplete="off"
                                      value={values.page_name}
                                    />
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
                                      Page Slug
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="page_slug"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Location"
                                      autoComplete="off"
                                      value={values.page_slug}
                                    />
                                    {errors.page_slug && touched.page_slug ? (
                                      <span className="errorMsg">
                                        {errors.page_slug}
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
                                      {this.state.dynamic_landing_page_id ==
                                      0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                      <br />{" "}
                                      <i> {this.state.fileValidationMessage}</i>
                                      <br />{" "}
                                      <i>{this.state.validationMessage}</i>
                                    </label>
                                    <Field
                                      name="image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Banner File"
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
                                    {errors.image && touched.image ? (
                                      <span className="errorMsg">
                                        {errors.image}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <label>Banner Contet</label>
                                  <Editor
                                    value={values.content}
                                    init={{
                                      height: 200,
                                      menubar: false,
                                      plugins: [
                                        "advlist autolink lists link image charmap print preview anchor",
                                        "searchreplace visualblocks  code fullscreen",
                                        "insertdatetime media table paste code help wordcount",
                                      ],
                                      toolbar:
                                        "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                                      content_style:
                                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                      file_browser_callback_types: "image",
                                      file_picker_callback: function (
                                        callback,
                                        value,
                                        meta
                                      ) {
                                        if (meta.filetype == "image") {
                                          var input =
                                            document.getElementById("my-file");
                                          input.click();
                                          input.onchange = function () {
                                            var file = input.files[0];
                                            var reader = new FileReader();
                                            reader.onload = function (e) {
                                              // console.log(
                                              //   "name",
                                              //   e.target.result
                                              // );
                                              callback(e.target.result, {
                                                alt: file.name,
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          };
                                        }
                                      },
                                      paste_data_images: true,
                                    }}
                                    onEditorChange={(value) =>
                                      setFieldValue("content", value)
                                    }
                                  />
                                  {errors.content && touched.content ? (
                                    <span className="errorMsg">
                                      {errors.content}
                                    </span>
                                  ) : null}
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
                                      {this.state.selectStatus.map(
                                        (status, i) => (
                                          <option key={i} value={status.value}>
                                            {status.label}
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
                              className={`btn btn-success btn-sm ${
                                isValid ? "btn-custom-green" : "btn-disable"
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {this.state.dynamic_landing_page_id > 0
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


                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    Dynamic Landing Page Image
                  </Modal.Header>
                  <Modal.Body>
                    <center>
                      <img
                        src={this.state.url}
                        alt="Dynamic Landing Page Image"
                        width="500"
                        height="300"
                      ></img>
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
export default Pages;
