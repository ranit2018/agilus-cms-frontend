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
import Switch from "react-switch";
import Layout from "../layout/Layout";

const initialValues = {
  type: "",
  name: "",
  file: "",
  status: "",
};
const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const setType = (refObj) => (cell) => {
  if (cell === 1) {
    return "Composite Scheme of Arrangement And Amalgamation";
  } else if (cell === 2) {
    return "Annual Reports";
  } else if (cell === 3) {
    return "Download Content";
  } else if (cell === 4) {
    return "Financials of Subsidiaries";
  }
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

const setsocialLink = (refOBj) => (cell, row) => {
  return (
    <a href={row.link} target="_blank">
      {row.link}
    </a>
  );
};

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

const setPDF = (refObj) => (cell, row) => {
  return (
    <LinkWithTooltip
      tooltip="Click to View PDF"
      href="#"
      clicked={(e) => refObj.imageModalShowHandler(e, row.category_file)}
      id="tooltip-1"
    >
      {capitalizeFirstLetter(row.title.replaceAll(" ", "_"))}
      {`.pdf`}
    </LinkWithTooltip>
  );
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

class RnDocuments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      documentList: [],
      documentDetails: {},
      documentId: 0,
      isLoading: false,
      showModal: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      categoryType: [],
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      type: "",
      display_name: "",
      status: "",
    };
  }

  getCategories = (page = 1) => {
    const status = 1;
    API.get(
      `/api/rnd/rnd_category?page=${page}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        console.log(res.data.data);
        this.setState({
          categoryType: res.data.data,
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

  getDocumets = (page = 1) => {
    const type = this.state.type;
    const display_name = this.state.display_name;
    const status = this.state.status;

    API.get(
      `/api/rnd/rnd_category_file?page=${page}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        console.log(res.data.data);
        this.setState({
          documentList: res.data.data,
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

  documentSearch = (e) => {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const display_name = document.getElementById("display_name").value;
    const status = document.getElementById("status").value;

    if (type === "" && display_name === "" && status === "") {
      return false;
    }

    API.get(
      `/api/rnd/rnd_category_file?page=1&category_id=${encodeURIComponent(
        type
      )}&title=${encodeURIComponent(display_name)}&status=${encodeURIComponent(
        status
      )}`
    )
      .then((res) => {
        this.setState({
          documentList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          type: type,
          display_name: display_name,
          status: status,
          remove_search: true,
          activePage: 1,
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
    document.getElementById("type").value = "";
    document.getElementById("display_name").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        type: "",
        display_name: "",
        status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDocumets();
      }
    );
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
        this.deleteDocument(id);
      }
    });
  };

  deleteDocument = (id) => {
    API.post(`/api/rnd/rnd_category_file/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.setState({ activePage: 1 });
          this.getDocumets(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getDocumentDetails(id) {
    API.get(`/api/rnd/rnd_category_file/${Number(id)}`)
      .then((res) => {
        console.log(res.data.data[0]);
        this.setState({
          showModal: true,
          documentDetails: res.data.data[0],
          documentId: id,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  handleSubmitEvent = (values, actions) => {
    let url = "";
    let method = "";
    let err_count = 0;
    const formData = new FormData();
    formData.append("category_id", values.type);
    formData.append("title", values.name);
    formData.append("status", values.status);

    if (this.state.file) {
      if (this.state.file.size > 20728640) {
        actions.setErrors({ file: "The file exceeds maximum size." });
        actions.setSubmitting(false);
        err_count++;
      } else {
        formData.append("category_file", this.state.file);
        //  formData.append("category_image", this.state.file);
      }
    }
    if (this.state.documentId > 0) {
      url = `/api/rnd/rnd_category_file/${this.state.documentId}`;
      method = "PUT";
    } else {
      url = `/api/rnd/rnd_category_file/`;
      method = "POST";
    }

    if (err_count == 0) {
      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text:
              method === "PUT"
                ? "Record updated successfully."
                : "Record added successfully.",
            icon: "success",
          }).then(() => {
            this.getDocumets(this.state.activePage);
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
    }
  };

  chageStatus = (cell, status) => {
    API.put(`/api/rnd/rnd_category_file/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getDocumets(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  componentDidMount() {
    this.getDocumets();
    this.getCategories();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDocumets(pageNumber > 0 ? pageNumber : 1);
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("file");
    setFieldValue("file", event.target.value);
    console.log(event.target.files[0]);

    const SUPPORTED_FORMATS = ["application/pdf"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        file: "",
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
        file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        file: "Only files with the following extensions are allowed: pdf",
      }); //Not working- So Added validation in "yup"
      this.setState({
        file: "",
        isValidFile: false,
      });
    }
  };

  imageModalShowHandler = (e, url) => {
    e.preventDefault();
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  };

  modalCloseHandler = () => {
    this.setState({
      documentDetails: {},
      documentId: "",
      showModal: false,
      file: "",
    });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    this.getCategories();
    if (id) {
      this.getDocumentDetails(id);
    } else {
      this.setState({ documentDetails: {}, documentId: "", showModal: true });
    }
  };

  render() {
    const { documentDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      type: documentDetails.category_id ? documentDetails.category_id : "",
      name: documentDetails.title ? documentDetails.title : "",
      file: "",
      status:
        documentDetails.status || +documentDetails.status === 0
          ? documentDetails.status.toString()
          : "",
    });

    let validateStopFlag = {};

    if (this.state.documentId > 0) {
      validateStopFlag = Yup.object().shape({
        type: Yup.string().notRequired(),
        name: Yup.string().notRequired(),
        file: Yup.string().when(`${this.state.file != ""}`, {
          is: (value) => value != "",
          then: Yup.string().test(
            "file",
            "Only files with the following extensions are allowed: pdf",
            (file) => {
              if (file) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        }),
        //   .test(
        //     "file",
        //     "Only files with the following extensions are allowed: pdf",
        //     (file) => {
        //       if (file) {
        //         return this.state.isValidFile;
        //       } else {
        //         return true;
        //       }
        //     }
        //   ),
        // file: Yup.string()
        //   .notRequired()
        //   .test(
        //     "file",
        //     "Only files with the following extensions are allowed: pdf",
        //     (file) => {
        //       if (file) {
        //         return this.state.isValidFile;
        //       } else {
        //         return true;
        //       }
        //     }
        //   ),
        status: Yup.string()
          .trim()
          .notRequired()
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        type: Yup.string().required("Please select the type"),
        name: Yup.string().required("Please enter the name"),
        file: Yup.string()
          .required("Please select the file")
          .test(
            "file",
            "Only files with the following extensions are allowed: pdf",
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
                  Manage Documents
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
                    <i className="fas fa-plus m-r-5" /> Add Document
                  </button>
                </div>

                <div className=""></div>
                <form className="form">
                  <div className="">
                    <select name="type" id="type" className="form-control">
                      <option value="">Select Category</option>
                      {this.state.categoryType.map((val) => {
                        return (
                          <option key={val.id} value={val.id}>
                            {val.category_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="display_name"
                      id="display_name"
                      placeholder="Filter by Display Name"
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
                      onClick={(e) => this.documentSearch(e)}
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
                <BootstrapTable data={this.state.documentList}>
                  <TableHeaderColumn
                    dataField="category_name"
                    //dataFormat={setType(this)}
                  >
                    Category Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Display Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="category_file"
                    dataFormat={setPDF(this)}
                  >
                    PDF File
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
                  >
                    Status
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    isKey
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
                              {this.state.documentId > 0
                                ? "Edit Document"
                                : "Add Document"}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Category
                                      {this.state.documentId == 0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                    </label>
                                    <Field
                                      name="type"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.type}
                                    >
                                      <option key="-1" value="">
                                        Select Category
                                      </option>
                                      {this.state.categoryType.map((val, i) => (
                                        <option key={i} value={val.id}>
                                          {val.category_name}
                                        </option>
                                      ))}
                                    </Field>
                                    {errors.type && touched.type ? (
                                      <span className="errorMsg">
                                        {errors.type}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Display Name
                                      {this.state.documentId == 0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                    </label>
                                    <Field
                                      name="name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter The Display Name"
                                      autoComplete="off"
                                      value={values.name}
                                    />
                                    {errors.name && touched.name ? (
                                      <span className="errorMsg">
                                        {errors.name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Choose File
                                      <br />{" "}
                                      <i>
                                        (Image type should be .pdf and maximum
                                        file size is 20 mb.)
                                      </i>
                                      {this.state.documentId == 0 ? (
                                        <span className="impField">*</span>
                                      ) : null}
                                    </label>
                                    <Field
                                      name="file"
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
                                    {errors.file && touched.file ? (
                                      <span className="errorMsg">
                                        {errors.file}
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
                              {this.state.documentId > 0
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
                  <Modal.Header closeButton>PDF File</Modal.Header>
                  <Modal.Body>
                    <center>
                      <object
                        data={this.state.url}
                        width="100%"
                        height="650"
                        hspace="0"
                        vspace="0"
                      ></object>
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
export default RnDocuments;
