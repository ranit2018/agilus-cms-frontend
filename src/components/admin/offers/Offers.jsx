import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import API from "../../../shared/admin-axios";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import Pagination from "react-js-pagination";
import { htmlDecode } from "../../../shared/helper";
import Layout from "../layout/Layout";
import dateFormat from "dateformat";
import Switch from "react-switch";
import DatePicker from "react-datepicker";

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

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const setDateValue = (cell) => {
  if (cell && cell != "") {
    var date = new Date(cell);
    var formatedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    return formatedDate;
  } else {
    return "---";
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
        tooltip="Click to edit"
        href="#"
        clicked={(e) => refObj.editOffer(e, cell)}
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

const setBlogImage = (refObj) => (cell, row) => {

  return (
    <img src={cell} alt="Offer Image" width="60" height="60" onClick={(e) => refObj.imageModalShowHandler(row.image)}></img>
  );
};


const initialValues = {
  title: "",
  end_date: "",
  description: "",
  status: "",
  file: ''
};

class Offers extends Component {

  constructor(props) {
    super(props);
    this.state = {
      offers: [],
      isLoading: false,
      showModal: false,
      page_name: '',
      banner_status: '',
      banner_name: '',
      offerDetails: [],
      page_name_arr: [],
      selectStatus: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'In-Active' }
      ],
      activePage: 1,
      totalCount: 0,
      itemPerPage: 10,
      thumbNailModal: false,
      offer_title: "",
      end_date: "",
      status: ""
    };
  }

  componentDidMount() {
    this.getOffersList();
  }

  getOffersList = (page = 1) => {
    let offer_title = this.state.offer_title;
    let end_date = this.state.end_date;
    let status = this.state.status;

    API.get(
      `/api/offers?page=${page}&offer_title=${encodeURIComponent(offer_title)}&end_date=${encodeURIComponent(end_date)}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          offers: res.data.data,
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
        this.deleteOffer(id);
      }
    });
  };

  deleteOffer = (id) => {
    API.delete(`/api/offers/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getOffersList(this.state.activePage);
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
    setFieldTouched("file");
    setFieldValue("file", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        file: "",
        isValidFile: true,
      });
      return;
    }
    if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
      //Supported
      this.setState({
        file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({ file: "Unsupported Format" }); //Not working- So Added validation in "yup"
      this.setState({
        file: "",
        isValidFile: false,
      });
    }
  };

  editOffer(e, id) {
    e.preventDefault();
    API.get(`/api/offers/${id}`)
      .then((res) => {
        this.props.history.push({
          pathname: '/edit-offer/' + id,
          state: {
            offerDetails: res.data.data[0],
          }
        })
      }).catch((err) => {
        showErrorMessage(err, this.props);
      });
  }


  offerSearch = (e) => {
    e.preventDefault();

    const offer_title = document.getElementById("offer_title").value;
    // const end_date = document.getElementById("end_date").value;
    const status = document.getElementById("status").value;

    if (offer_title === "" && this.state.end_date === "" && status === "") {
      return false;
    }

    API.get(`/api/offers?page=1&offer_title=${encodeURIComponent(offer_title)}&end_date=${encodeURIComponent(setDateValue(this.state.end_date))}&status=${encodeURIComponent(status)}`)
      .then((res) => {
        this.setState({
          offers: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          offer_title: offer_title,
          // end_date: end_date,
          status: status,
          remove_search: true,
          activePage: 1,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isLoading: false
        });
        showErrorMessage(err, this.props);
      });
  };

  clearSearch = () => {

    document.getElementById("offer_title").value = "";
    // document.getElementById("end_date").value = "";
    document.getElementById("status").value = "";

    this.setState(
      {
        offer_title: "",
        end_date: "",
        status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getOffersList();

      }
    );
  };

  chageStatus = (cell, status) => {
    API.put(`/api/offers/change_status/${cell}`, { status: status == 1 ? String(0) : String(1) })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getOffersList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  }

  modalCloseHandler = () => {
    this.setState({ showModal: false, offer_id: 0, offerDetails: {} });
  };

  modalShowHandler = (event, id) => {
    if (id) {
      event.preventDefault();
      this.getOfferdetails(id);


    } else {
      this.setState({ showModal: true, offer_id: 0, offerDetails: {} });
    }
  };


  imageModalShowHandler = (url) => {
    this.setState({ thumbNailModal: true, url: url });
  }
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, url: "" });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getOffersList(pageNumber > 0 ? pageNumber : 1);
  };


  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <h1>
                  Manage Offers
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">

                <div className="">
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={(e) => this.props.history.push('/add-offer')}
                  >
                    <i className="fas fa-plus m-r-5" /> Add Offer
                  </button>
                </div>
                <form className="form">
                  <div className="">
                    <input
                      className="form-control"
                      name="offer_title"
                      id="offer_title"
                      placeholder="Filter by Offer Title"
                    />
                  </div>

                  <div className="">
                    {/* <input
                      className="form-control"
                      type='date'
                      name="end_date"
                      id="end_date"
                      placeholder="Filter by Offer Title"
                    /> */}
                    <DatePicker
                      name={'date'}
                      selected={this.state.end_date}
                      className={`form-control`}
                      onChange={date => { this.setState({end_date: date}) }}
                    />
                  </div>

                  <div className="">
                    <select
                      name="status"
                      id="status"
                      className="form-control"
                    >
                      <option value="">Select Offer Status</option>
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
                      onClick={(e) => this.offerSearch(e)}
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

                <BootstrapTable data={this.state.offers}>
                  <TableHeaderColumn
                    isKey
                    dataField="title"
                    dataFormat={__htmlDecode(this)}
                  >
                    Title
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="image"
                    dataFormat={setBlogImage(this)}
                  >
                    Offer Image
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="end_date"
                    dataFormat={setDate(this)}
                  >
                    End Date
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="date_added"
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
                <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop='static'
                >
                  <Modal.Header closeButton>Offer Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.url} alt="Offer Image"></img>
                      </div>
                    </center>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </section>
        </div>
      </Layout >
    )
  }
}
export default Offers