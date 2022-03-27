/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Pagination from "react-js-pagination";
import Layout from "../../layout/Layout";
import dateFormat from "dateformat";
import Switch from "react-switch";

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
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
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.modalShowHandler(e, cell)}
        // clicked={(e) => refObj.editJob(e, cell)}
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
          onChange={() => refObj.chageStatus(row.id, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell, row.id)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};
const setJobImage = (refObj) => (cell, row) => {
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
        alt="Jobs"
        width="100%"
        onClick={(e) => refObj.imageModalShowHandler(row.department_image)}
      ></img>
    </div>
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
  department_image: "",
  department_title: "",
  doctor_name: "",
  equipment_name: "",
  publication_heading: "",
  test_name: "",
  date_posted: "",
  status: "",
};

class Departments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      departmentList: [],
      departmentDetails: [],
      department_id: 0,
      isLoading: false,
      showModal: false,
      showModalLoader: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      thumbNailModal: false,
      department_title: "",
      doctor_name: "",
      department_image: "",
      equipment_name: "",
      publication_heading: "",
      test_name: "",
      date_posted: "",
      status: "",
      doctor_name_arr: [],
      equipment_name_arr: [],
      publication_heading_arr: [],
      search_department_title: "",
      search_doctor_name: "",
      search_equipment_name: "",
      search_publication_heading: "",
      search_status: "",
    };
  }
  componentDidMount() {
    this.getDepartmentsList();
    // this.getDoctorArr();
    // this.getEquipmentArr();
    // this.getPublicationArr();
    // this.getTestArr();
    // this.setState({
    //   validationMessage: generateResolutionText('departments'),
    //   fileValidationMessage: FILE_VALIDATION_MASSAGE,
    // });
  }

  getDepartmentsList = (page = 1) => {
    // const search_department_title = document.getElementById(
    //   "search_department_title"
    // ).value;
    // const search_doctor_name =
    //   document.getElementById("search_doctor_name").value;
    // const search_publication_heading = document.getElementById(
    //   "search_publication_heading"
    // ).value;
    // const search_equipment_name = document.getElementById(
    //   "search_equipment_name"
    // ).value;
    // const search_status = document.getElementById("search_status").value;
    // API.get(
    //   `/api/job_portal/job?page=${page}&department_title=${encodeURIComponent(
    //     search_department_title
    //   )}&doctor_name=${encodeURIComponent(
    //     search_doctor_name
    //   )}&publication_heading=${encodeURIComponent(
    //     search_publication_heading
    //   )}&equipment_name=${encodeURIComponent(
    //     search_equipment_name
    //   )}&status=${encodeURIComponent(search_status)}`
    // )
    //   .then((res) => {
    //     this.setState({
    //       departmentList: res.data.data,
    //       totalCount: Number(res.data.count),
    //       isLoading: false,
    //       showModalLoader: true,
    //     });
    //   })
    //   .catch((err) => {
    //     this.setState({
    //       isLoading: false,
    //     });
    //     showErrorMessage(err, this.props);
    //   });
  };

  getDoctorArr = () => {
    // API.get(`api/job_portal/job/role?page=1`)
    //   .then((res) => {
    //     let options = [];
    //     for (var i = 0; i < res.data.data.length; i++) {
    //       options.push({
    //         value: res.data.data[i].id,
    //         label: res.data.data[i].doctor_name,
    //       });
    //     }
    //     this.setState({
    //       doctor_name_arr: options,
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  };
  getEquipmentArr = () => {
    // API.get(`api/job_portal/job/location?page=1`)
    //   .then((res) => {
    //     let options = [];
    //     for (var i = 0; i < res.data.data.length; i++) {
    //       options.push({
    //         value: res.data.data[i].id,
    //         label: res.data.data[i].equipment_name,
    //       });
    //     }
    //     this.setState({
    //       equipment_name_arr: options,
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  };
  getPublicationArr = () => {
    // API.get(`api/job_portal/job/category?page=1`)
    //   .then((res) => {
    //     let options = [];
    //     for (var i = 0; i < res.data.data.length; i++) {
    //       options.push({
    //         value: res.data.data[i].id,
    //         label: res.data.data[i].publication_heading,
    //       });
    //     }
    //     this.setState({
    //       publication_heading_arr: options,
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  };

  getdepartmentDetailsbyId = (id) => {
    // API.get(`api/job_portal/job/${id}`)
    //   .then((res) => {
    //     this.setState({
    //       departmentDetails: res.data.data[0],
    //       department_id: res.data.data[0].id,
    //       isLoading: false,
    //       showModal: true,
    //       showModalLoader: true,
    //     });
    //   })
    //   .catch((err) => {
    //     showErrorMessage(err, this.props);
    //   });
  };

  departmentSearch = (e) => {
    e.preventDefault();

    // const search_department_title = document.getElementById(
    //   "search_department_title"
    // ).value;
    // const search_doctor_name =
    //   document.getElementById("search_doctor_name").value;
    // const search_publication_heading = document.getElementById(
    //   "search_publication_heading"
    // ).value;
    // const search_equipment_name = document.getElementById(
    //   "search_equipment_name"
    // ).value;
    // const search_status = document.getElementById("search_status").value;
    // if (
    //   search_department_title === "" &&
    //   search_doctor_name === "" &&
    //   search_publication_heading === "" &&
    //   search_equipment_name === "" &&
    //   search_status === ""
    // ) {
    //   return false;
    // }

    // API.get(
    //   `/api/job_portal/job?page=1&department_title=${encodeURIComponent(
    //     search_department_title
    //   )}&doctor_name=${encodeURIComponent(
    //     search_doctor_name
    //   )}&publication_heading=${encodeURIComponent(
    //     search_publication_heading
    //   )}&equipment_name=${encodeURIComponent(
    //     search_equipment_name
    //   )}&status=${encodeURIComponent(search_status)}`
    // )
    //   .then((res) => {
    //     this.setState({
    //       jobs: res.data.data,
    //       totalCount: Number(res.data.count),
    //       isLoading: false,
    //       search_department_title: search_department_title,
    //       search_doctor_name: search_doctor_name,
    //       search_publication_heading: search_publication_heading,
    //       search_equipment_name: search_equipment_name,
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
    document.getElementById("search_department_title").value = "";
    document.getElementById("search_doctor_name").value = "";
    document.getElementById("search_publication_heading").value = "";
    document.getElementById("search_equipment_name").value = "";
    document.getElementById("search_status").value = "";

    this.setState(
      {
        search_department_title: "",
        search_doctor_name: "",
        search_equipment_name: "",
        search_publication_heading: "",
        search_status: "",

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getDepartmentsList();
      }
    );
  };

  confirmDelete = (event, cell, id) => {
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
        this.deleteDepartment(id);
      }
    });
  };

  deleteDepartment = (id) => {
    // API.post(`/api/job_portal/job/${id}`)
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record deleted successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getDepartmentsList(this.state.activePage);
    //     });
    //   })
    //   .catch((err) => {
    //     if (err.data.status === 3) {
    //       this.setState({ closeModal: true });
    //       showErrorMessage(err, this.props);
    //     }
    //   });
  };

  chageStatus = (cell, status) => {
    // API.put(`/api/job_portal/job/change_status/${cell}`, {
    //   status: status == 1 ? String(0) : String(1),
    // })
    //   .then((res) => {
    //     swal({
    //       closeOnClickOutside: false,
    //       title: "Success",
    //       text: "Record updated successfully.",
    //       icon: "success",
    //     }).then(() => {
    //       this.getDepartmentsList(this.state.activePage);
    //     });
    //   })
    //   .catch((err) => {
    //     if (err.data.status === 3) {
    //       this.setState({ closeModal: true });
    //       showErrorMessage(err, this.props);
    //     }
    //   });
  };

  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getDepartmentsList(pageNumber > 0 ? pageNumber : 1);
  };

  //for edit/add part
  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      department_title: "",
      doctor_name: "",
      equipment_name: "",
      // test_name: "",
      publication_heading: "",
      status: "",
      id: 0,
      department_id: 0,
    });
  };

  //for edit/add part
  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getdepartmentDetailsbyId(id);
    } else {
      this.setState({ showModal: true });
    }
  };

  handleSubmitEventAdd = (values, actions) => {
    // let postdata = {
    //   // id: this.state.departmentDetails.id ? this.state.departmentDetails.id : '',
    //   department_image: values.department_image,
    //   department_title: values.department_title,
    //   doctor_name: values.doctor_name,
    //   equipment_name: values.equipment_name,
    //   publication_heading: values.publication_heading,
    //   test_name: values.test_name,
    //   desired_skill_set: values.job_skill,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };
    // console.log('postdata', postdata);
    // let formData = new FormData();
    // // formData.append('id',this.state.departmentDetails.id)
    // formData.append("department_title", values.department_title);
    // formData.append("doctor_name", values.doctor_name);
    // formData.append("equipment_name", values.equipment_name);
    // formData.append("publication_heading", values.publication_heading);
    // formData.append("test_name", values.test_name);
    // formData.append("status", String(values.status));
    // let url = `api/job_portal/job`;
    // let method = "POST";
    // if (this.state.department_image.size > FILE_SIZE) {
    //   actions.setErrors({
    //     department_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
    //   });
    //   actions.setSubmitting(false);
    // } else {
    //   getHeightWidth(this.state.department_image).then((dimension) => {
    //     const { height, width } = dimension;
    //     const offerDimension = getResolution("jobs");
    //     if (height != offerDimension.height || width != offerDimension.width) {
    //       actions.setErrors({
    //         department_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
    //       });
    //       actions.setSubmitting(false);
    //     } else {
    //       formData.append("department_image", this.state.department_image);
    //       API({
    //         method: method,
    //         url: url,
    //         data: formData,
    //       })
    //         .then((res) => {
    //           this.setState({ showModal: false, department_image: "" });
    //           swal({
    //             closeOnClickOutside: false,
    //             title: "Success",
    //             text: "Added Successfully",
    //             icon: "success",
    //           }).then(() => {
    //             this.getDepartmentsList();
    //           });
    //         })
    //         .catch((err) => {
    //           this.setState({
    //             closeModal: true,
    //             showModalLoader: false,
    //             department_image: "",
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
    // let formData = new FormData();
    // formData.append("department_title", values.department_title);
    // formData.append("doctor_name", values.doctor_name);
    // formData.append("equipment_name", values.equipment_name);
    // formData.append("publication_heading", values.publication_heading);
    // formData.append("test_name", values.test_name);
    // formData.append("status", String(values.status));
    // let url = `/api/job_portal/job/${this.state.department_id}`;
    // let method = "PUT";
    // if (this.state.department_image) {
    //   if (this.state.department_image.size > FILE_SIZE) {
    //     actions.setErrors({
    //       department_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
    //     });
    //     actions.setSubmitting(false);
    //   } else {
    //     getHeightWidth(this.state.department_image).then((dimension) => {
    //       const { height, width } = dimension;
    //       const offerDimension = getResolution("jobs");
    //       if (
    //         height != offerDimension.height ||
    //         width != offerDimension.width
    //       ) {
    //         //    actions.setErrors({ file: "The file is not of desired height and width" });
    //         actions.setErrors({
    //           department_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
    //         });
    //         actions.setSubmitting(false);
    //       } else {
    //         formData.append("department_image", this.state.department_image);
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
    //               this.getDepartmentsList();
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
    //         this.getDepartmentsList();
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

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("department_image");
    setFieldValue("department_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        department_image: "",
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
        department_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        department_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        department_image: "",
        isValidFile: false,
      });
    }
  };

  render() {
    const { departmentDetails } = this.state;

    const newInitialValues = Object.assign(initialValues, {
      id: departmentDetails.id ? departmentDetails.id : "",
      department_image: "",
      department_title: departmentDetails.department_title
        ? departmentDetails.department_title
        : "",
      doctor_name:
        departmentDetails.doctor_id || departmentDetails.doctor_id === 0
          ? departmentDetails.doctor_id.toString()
          : "",
      equipment_name:
        departmentDetails.equipment_id || departmentDetails.equipment_id === 0
          ? departmentDetails.equipment_id.toString()
          : "",
      equipment_heading:
        departmentDetails.publication_id ||
        departmentDetails.publication_id === 0
          ? departmentDetails.publication_id.toString()
          : "",
      // test_name:
      //   departmentDetails.test_id || departmentDetails.test_id === 0
      //     ? departmentDetails.test_id.toString()
      //     : "",
      date_posted: departmentDetails.date_posted
        ? departmentDetails.date_posted
        : "",
      status:
        departmentDetails.status || departmentDetails.status === 0
          ? departmentDetails.status.toString()
          : "",
    });

    const validateStopFlagUpdate = Yup.object().shape({
      department_image: Yup.string()
        .notRequired()
        .test(
          "jobimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (department_image) => {
            if (department_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
        ),
      department_title: Yup.string().required("Please enter department title"),
      doctor_name: Yup.string().required("Please select doctor name"),
      equipment_name: Yup.string().required(
        "Please select equipment & instrument name"
      ),
      // test_name: Yup.string().required('Please enter job description'),
      publication_heading: Yup.string().required(
        "Please enter publication heading"
      ),
      status: Yup.number().required("Please select status"),
    });

    const validateStopFlag = Yup.object().shape({
      department_image: Yup.mixed()
        .required("Please select image")
        .test(
          "jobimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      department_title: Yup.string().required("Please enter department title"),
      doctor_name: Yup.string().required("Please select doctor name"),
      equipment_name: Yup.string().required(
        "Please select equipment & instrument name"
      ),
      // test_name: Yup.string().required('Please enter job description'),
      publication_heading: Yup.string().required(
        "Please enter publication heading"
      ),
      status: Yup.number().required("Please select status"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12  m-b-15">
                <h1>
                  Manage Departments
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12">
                <form className="leadForm">
                  <div className="">
                    <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={(e) => this.modalShowHandler(e, "")}
                    >
                      <i className="fas fa-plus m-r-5" /> Add Departments
                    </button>
                  </div>
                  <div className="">
                    <input
                      className="form-control"
                      name="department_title"
                      id="search_department_title"
                      placeholder="Filter by Department Title"
                    />
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="search_doctor_name"
                      id="search_doctor_name"
                    >
                      <option value=""> Select Doctor Name </option>
                      {this.state.doctor_name_arr.map((val, i) => {
                        return (
                          <option key={i} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="search_equipment_name"
                      id="search_equipment_name"
                    >
                      <option value="">Select Equipment</option>
                      {this.state.equipment_name_arr.map((val, i) => {
                        return (
                          <option key={i} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="search_publication_heading"
                      id="search_publication_heading"
                    >
                      <option value="">Select Publication</option>
                      {this.state.publication_heading_arr.map((val, i) => {
                        return (
                          <option key={i} value={val.value}>
                            {val.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="">
                    <select
                      className="form-control"
                      name="status"
                      id="search_status"
                    >
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
                      onClick={(e) => this.departmentSearch(e)}
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
                <BootstrapTable data={this.state.departmentList}>
                  <TableHeaderColumn
                    isKey
                    dataField="department_title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Department Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="department_image"
                    dataFormat={setJobImage(this)}
                  >
                    Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="doctor_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Doctor
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="equipment_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Equipments & Instruments
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="test_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Test
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="publication_heading"
                    dataFormat={__htmlDecode(this)}
                  >
                    Publications
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_posted"
                    dataFormat={setDate(this)}
                  >
                    Post Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="status"
                    dataFormat={custStatus(this)}
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

                {/* ======= Image Modal ======== */}

                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>Departments Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img
                          src={this.state.department_image}
                          alt="department"
                        ></img>
                      </div>
                    </center>
                  </Modal.Body>
                </Modal>

                {/* ======= Add/Edit Jobs Modal ======== */}

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Formik
                    initialValues={newInitialValues}
                    validationSchema={
                      this.state.department_id > 0
                        ? validateStopFlagUpdate
                        : validateStopFlag
                    }
                    onSubmit={
                      this.state.department_id > 0
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
                              {this.state.department_id == 0 ? "Add" : "Edit"}{" "}
                              Department
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className="contBox">
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Department Title
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="department_title"
                                      id="department_title"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter Job Title"
                                      autoComplete="off"
                                      value={values.department_title}
                                    />
                                    {errors.department_title &&
                                    touched.department_title ? (
                                      <span className="errorMsg">
                                        {errors.department_title}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Roles
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="doctor_name"
                                      id="doctor_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.doctor_name}
                                    >
                                      <option key="-1" value="">
                                        Select Job Role
                                      </option>
                                      {this.state.doctor_name_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.doctor_name &&
                                    touched.doctor_name ? (
                                      <span className="errorMsg">
                                        {errors.doctor_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Location
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="equipment_name"
                                      id="equipment_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.equipment_name}
                                    >
                                      <option key="-1" value="">
                                        Select Job Location
                                      </option>
                                      {this.state.equipment_name_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
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
                                      Job Category
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="category_name"
                                      id="category_name"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.category_name}
                                    >
                                      <option key="-1" value="">
                                        Select Job Category
                                      </option>
                                      {this.state.publication_heading_arr.map(
                                        (val, i) => (
                                          <option
                                            key={val.id}
                                            value={val.value}
                                          >
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.category_name &&
                                    touched.category_name ? (
                                      <span className="errorMsg">
                                        {errors.category_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Skill
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="job_skill"
                                      id="job_skill"
                                      component="select"
                                      className={`selectArowGray form-control`}
                                      autoComplete="off"
                                      value={values.job_skill}
                                    >
                                      <option key="-1" value="">
                                        Select Job Skill
                                      </option>
                                      {this.state.job_skill_arr.map(
                                        (val, i) => (
                                          <option key={i} value={val.value}>
                                            {val.label}
                                          </option>
                                        )
                                      )}
                                    </Field>
                                    {errors.job_skill && touched.job_skill ? (
                                      <span className="errorMsg">
                                        {errors.job_skill}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Job Description
                                      <span className="impField">*</span>
                                    </label>
                                    <Field
                                      name="test_name"
                                      id="test_name"
                                      type="text"
                                      className={`form-control`}
                                      placeholder="Enter job description"
                                      autoComplete="off"
                                      value={values.test_name}
                                    />
                                    {errors.test_name && touched.test_name ? (
                                      <span className="errorMsg">
                                        {errors.test_name}
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
                                      <span className="impField">*</span>
                                      <br />{" "}
                                      <i>{this.state.fileValidationMessage}</i>
                                      <br />{" "}
                                      <i>{this.state.validationMessage} </i>
                                    </label>
                                    <Field
                                      name="department_image"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="department_image"
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
                                    {errors.department_image &&
                                    touched.department_image ? (
                                      <span className="errorMsg">
                                        {errors.department_image}
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
                              {this.state.department_id > 0
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
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}

export default Departments;