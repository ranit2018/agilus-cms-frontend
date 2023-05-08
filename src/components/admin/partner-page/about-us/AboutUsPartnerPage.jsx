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

import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import whitelogo from "../../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import Select from "react-select";
import Switch from "react-switch";
import Layout from "../../layout/Layout";
import ReactHtmlParser from "react-html-parser";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Autosuggest from "react-autosuggest";
const initialValues = {
  status: "",
  labId: "",
  content: "",
};
const __htmlDecode = (refObj) => (cell) => {
  return ReactHtmlParser(htmlDecode(cell));
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
        clicked={(e) => refObj.getAboutUsDetails(e, cell, row)}
        // clicked={(e) => refObj.editAccordion(e, cell, row)}
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.changeStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.changeStatus(row.id, row.status)}
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
class AboutUsPartnerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      AboutUsList: [],
      AboutUsDetail: {},
      abousUsEditType: 0,
      isLoading: false,
      showModal: false,
      thumbNailModal: false,
      search_by_status: "",
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      suggestions: [],
      labIdValue: "",
      selectedLabIdValue: "",
    };
  }

  getAboutUsList = (page = 1) => {
    API.get(`/api/center/about?page=${page}`)
      .then((res) => {
        this.setState({
          AboutUsList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          abousUsEditType: 0,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
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
        this.deleteAboutUs(id);
      }
    });
  };

  deleteAboutUs = (id) => {
    API.post(`api/center/about/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getAboutUsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  getAboutUsDetails(e, id, row) {
    API.get(`/api/center/about/${id}`)
      .then((res) => {
        // this.setState({
        //   showModal: true,
        //   AboutUsDetail: res.data.data[0],
        //   abousUsEditType: id,
        // });
        this.props.history.push({
          pathname: "/partner-page/edit-aboutus/" + id,
          state: {
            AboutUsDetail: res.data.data[0],
            abousUsEditType: id,
          },
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  }

  changeStatus = (cell, status) => {
    API.put(`/api/center/about/change_status/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getAboutUsList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  handleSubmitEventAdd = (values, actions) => {
    // let formData = new FormData();
    // console.log({values})
    // formData.append("title", values.title);
    // formData.append("content", values.content);
    // formData.append("status", values.status);
    let formData = {
      status: values.status,
      heading: "", // Need to remove this
      content: values.content,
    };
    let url = `api/center/about/`;
    let method = "POST";
    API({
      method: method,
      url: url,
      data: formData,
    })
      .then((res) => {
        this.setState({ showModal: false, file: "", suggestions: [] });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Added Successfully",
          icon: "success",
        }).then(() => {
          this.getAboutUsList();
        });
      })
      .catch((err) => {
        this.setState({
          closeModal: true,
          showModalLoader: false,
          file: "",
          suggestions: [],
        });
        if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  handleSubmitEventUpdate = (values, actions) => {
    // let formData = new FormData();
    // formData.append("status", values.status);
    // formData.append("content", values.content);
    let formData = {
      status: values.status,
      content: values.content,
    };
    let url = `/api/center/about/${this.state.abousUsEditType}`;
    let method = "PUT";
    API({
      method: method,
      url: url,
      data: formData,
    })
      .then((res) => {
        this.setState({ showModal: false, file: "", suggestions: [] });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Updated Successfully",
          icon: "success",
        }).then(() => {
          this.getAboutUsList();
        });
      })
      .catch((err) => {
        this.setState({
          closeModal: true,
          showModalLoader: false,
          suggestions: [],
        });
        if (err.data.status === 3) {
          showErrorMessage(err, this.props);
        } else {
          actions.setErrors(err.data.errors);
          actions.setSubmitting(false);
        }
      });
  };

  componentDidMount() {
    this.getAboutUsList();
  }

  modalCloseHandler = () => {
    this.setState({
      AboutUsDetail: {},
      abousUsEditType: 0,
      showModal: false,
      suggestion: [],
    });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();
    if (id) {
      // this.getAboutUsDetails(id);
    } else {
      this.setState({
        AboutUsDetail: {},
        abousUsEditType: 0,
        showModal: true,
        suggestion: [],
      });
    }
  };

  // imageModalShowHandler = (url) => {
  //   console.log(url);
  //   this.setState({ thumbNailModal: true, banner_url: url });
  // };
  // imageModalCloseHandler = () => {
  //   this.setState({ thumbNailModal: false, banner_url: "" });
  // };
  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getAboutUsList(pageNumber > 0 ? pageNumber : 1);
  };
  // fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
  //   //console.log(event.target.files);
  //   setFieldTouched("file");
  //   setFieldValue("file", event.target.value);
  //   const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
  //   if (!event.target.files[0]) {
  //     //Supported
  //     this.setState({
  //       file: "",
  //       isValidFile: true,
  //     });
  //     return;
  //   }
  //   if (
  //     event.target.files[0] &&
  //     SUPPORTED_FORMATS.includes(event.target.files[0].type)
  //   ) {
  //     //Supported
  //     this.setState({
  //       file: event.target.files[0],
  //       isValidFile: true,
  //     });
  //   } else {
  //     //Unsupported
  //     setErrors({
  //       file: "Only files with the following extensions are allowed: png jpg jpeg",
  //     }); //Not working- So Added validation in "yup"
  //     this.setState({
  //       file: "",
  //       isValidFile: false,
  //     });
  //   }
  // };

  // setCurrentOfferImage = (refObj) => (cell, row) => {
  //   if (row.offer_image !== null) {
  //     return (
  //       <img
  //         src={row.offer_image}
  //         alt="Current Offers Image"
  //         height="100"
  //         onClick={(e) => refObj.imageModalShowHandler(row.offer_image)}
  //       ></img>
  //     );
  //   } else {
  //     return null;
  //   }
  // };

  AboutUsSearch = (e) => {
    e.preventDefault();

    const search_by_status = document.getElementById("status").value;
    console.log("search_by_status:", search_by_status);
    const search_lab_code = document.getElementById("search_lab_code").value;
    console.log("search_lab_code:", search_lab_code);

    if (search_by_status === "" && search_lab_code == "") {
      return false;
    }
    API.get(
      `/api/center/about?page=1&status=${search_by_status}&heading=${search_lab_code}`
    )
      .then((res) => {
        this.setState({
          AboutUsList: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          activePage: 1,
          search_by_status: search_by_status,
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
    document.getElementById("search_lab_code").value = "";
    this.setState(
      {
        search_by_status: "",
        remove_search: false,
      },
      () => {
        // this.setState({ activePage: 1 });
        this.getAboutUsList();
      }
    );
  };

  // onSuggestionsFetchRequested = ({ value }) => {
  //   if (value && value.length >= 3) {
  //     let payload = {
  //       //  city_id:location.value,
  //       search_name: value.toUpperCase(),
  //     };

  //     API.post(`/feed/code-search-autocomplete`, payload)
  //       .then((res) => {
  //         const suggestion_list = res.data.data;
  //         this.setState({
  //           suggestions: suggestion_list.length > 0 ? suggestion_list : [],
  //         });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         this.setState({ suggestions: [] });
  //       });
  //   } else {
  //     this.setState({ suggestions: [] });
  //   }
  // };

  // onSuggestionsClearRequested = () => {};

  // getSuggestionValue = (suggestion) => suggestion.label;

  // renderSuggestion = (suggestion) => <span>{suggestion.label}</span>;

  // onChangeAutoSuggest = (event, { newValue }) => {
  //   this.setState({ labIdValue: newValue });
  // };

  // handleSearchLab = (event) => {
  //   if (event.key === "Enter") {
  //     event.target.blur();
  //     // history.push(`/health-packages/search/${stringToSlug(location.city_name)}/${encodeURIComponent(value)}`);
  //   }
  // };

  // onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
  //   if (method === "click" || method === "enter") {
  //     let payload = {
  //       search_name: suggestion.value.toUpperCase(),
  //     };
  //     API.post(`/feed/code-search`, payload)
  //       .then((res) => {
  //         if (res.data && res.data.data && res.data.data.length > 0) {
  //           const searchDetails = res.data.data[0];
  //           this.setState({ selectedLabIdValue: searchDetails }, () => {
  //             setFieldTouched("labId");
  //           });
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         this.setState({ selectedLabIdValue: "" }, () => {
  //           setFieldTouched("labId");
  //         });
  //       });
  //   }
  // };
  openProductDetailsPage = async (e, row) => {
    e.preventDefault();

    window.open(`${process.env.REACT_APP_SRL}/${row.lab_url_key}/}`, "_blank");
  };
  contentModalShowHandler = (e, url) => {
    e.preventDefault();
    this.setState({ thumbNailModal: true, singlecontent: url });
  };
  render() {
    const { AboutUsDetail, selectedLabIdValue } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      status:
        AboutUsDetail.status || +AboutUsDetail.status === 0
          ? AboutUsDetail.status.toString()
          : "",
      content: AboutUsDetail.content ? htmlDecode(AboutUsDetail.content) : "",
    });

    // const setPageUrl = (refObj) => (cell, row) => {
    //   return (
    //     <div className="actionStyle">
    //       <LinkWithTooltip
    //         tooltip="View Page"
    //         clicked={(e) => refObj.openProductDetailsPage(e, row)}
    //         href={`#`}
    //         id="tooltip-1"
    //       >
    //         <i className="far fa-eye" />
    //       </LinkWithTooltip>
    //     </div>
    //   );
    // };
    const showContent = (refObj) => (cell, row) => {
      return (
        <div className="actionStyle">
          <LinkWithTooltip
            tooltip="View Page"
            clicked={(e) => refObj.contentModalShowHandler(e, row.content)}
            href={`#`}
            id="tooltip-1"
          >
            <i className="far fa-eye" />
          </LinkWithTooltip>
        </div>
      );
    };

    const validateStopFlag = Yup.object().shape({
      // labId: Yup.string()
      //   .test("labId", "Please select a Lab Id", () => {
      //     return selectedLabIdValue && selectedLabIdValue !== "";
      //   }),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
      content: Yup.string().trim().required("Please enter the content"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage About Us
                  <small />
                </h1>
              </div>
              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    // onClick={(e) => this.modalShowHandler(e, "")}
                    onClick={(e) =>
                      this.props.history.push({
                        pathname: "/partner-page/add-aboutus",
                      })
                    }
                  >
                    <i className="fas fa-plus m-r-5" /> Add About Us
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <select name="status" id="status" className="form-control">
                      <option value="">Select About Us Status</option>
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
                      className="form-control"
                      id="search_lab_code"
                      placeholder="Filter by Lab Name"
                    />
                  </div>
                  <div className="">
                    <input
                      type="submit"
                      value="Search"
                      className="btn btn-warning btn-sm"
                      onClick={(e) => this.AboutUsSearch(e)}
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
                <BootstrapTable data={this.state.AboutUsList}>
                  <TableHeaderColumn
                    isKey
                    dataField="lab_name"
                    dataFormat={__htmlDecode(this)}
                  >
                    Lab Name
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="content"
                    // dataFormat={__htmlDecode(this)}
                    dataFormat={showContent(this)}
                  >
                    Content
                  </TableHeaderColumn>
                  {/* <TableHeaderColumn
                    dataField="status"
                    width="5%"
                    dataFormat={setPageUrl(this)}
                  >
                    Page
                  </TableHeaderColumn> */}
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
              </div>
            </div>
          </section>
        </div>
        <Modal
          show={this.state.thumbNailModal}
          onHide={() => this.setState({ thumbNailModal: false })}
          backdrop="static"
        >
          <Modal.Header closeButton>Content</Modal.Header>
          <Modal.Body>
            <center>
              <div className="">
                <span>{this.state.singlecontent}</span>
              </div>
            </center>
          </Modal.Body>
        </Modal>
      </Layout>
    );
  }
}
export default AboutUsPartnerPage;
