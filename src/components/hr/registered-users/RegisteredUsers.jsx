import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import API from '../../../shared/hrAxios';
import * as Yup from 'yup';
import { showErrorMessage } from '../../../shared/handle_error';
import whitelogo from '../../../assets/images/drreddylogo_white.png';
import Pagination from 'react-js-pagination';
import { htmlDecode, setFieldName } from '../../../shared/helper';
import Layout from '../layout/Layout';
import 'react-day-picker/lib/style.css';

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={['hover']}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}

const generateHTML = (data) => {
  let ret = [];
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      let uploadData = data['File'];
      if (
        [
          'File',
        ].includes(key)
      ) {
        if (key == 'File') {
          ret.push(
            <Row>
              <Col xs={6} sm={6} md={6} key={key}>
                {key}
              </Col>
              <Col xs={6} sm={6} md={6}>
                <a target="_blank" href={uploadData}>
                  Download
                </a>
              </Col>
            </Row>
          );
        } else {
          ret.push(
            <Row>
              <Col xs={6} sm={6} md={6} key={key}>
                {key}
              </Col>
              <Col xs={6} sm={6} md={6}>
                <a target="_blank" href={uploadData}>
                  Download
                </a>
              </Col>
            </Row>
          );
        }
      } else {
        ret.push(
          <Row>
            <Col xs={6} sm={6} md={6} key={key}>
              {key}
            </Col>
            <Col xs={6} sm={6} md={6}>
              {element}
            </Col>
          </Row>
        );
      }
    }
  }

  return ret;
};

const actionFormatter = (refObj) => (cell, row) => {
  let dataArr = [];
  dataArr = {
    Name: row.fullname,
    Email: row.email,
    PhoneNumber: row.phone_no,
  };
  console.log(' dataArr', dataArr);

  if (dataArr === null) {
    return null;
  } else {
    return (
      <div className="actionStyle">
        <LinkWithTooltip
          tooltip="Click to View"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, dataArr)}
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
      </div>
    );
  }
};

class RegisteredUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userDetails: [],
      userSearchList: [],
      isLoading: false,
      totalCount: 0,
      itemPerPage: 10,
      activePage: 1,
      id: '',
      first_name: '',
      last_name: '',
      fullname: '',
      email: '',
      phone_no: '',
      showModal: false,
      selectedDay: '',
      post_data: null,
      file: '',
    };
  }

  getUserList = (page = 1) => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone_no = document.getElementById('phone_no').value;

    API.get(
      `/api/job_portal/user/list?page=${page}&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&phone_no=${encodeURIComponent(
        phone_no
      )}`
    )
      .then((res) => {
        this.setState({
          userDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log('err', err);
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  modalShowHandler = (event, dataArr) => {
    event.preventDefault();
    this.setState({ showModal: true, post_data: dataArr });
  };

  modalCloseHandler = () => {
    this.setState({ showModal: false });
  };

  userSearch = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone_no = document.getElementById('phone_no').value;

    console.log('fist_name', name, email);
    if (name === '' && email === '' && phone_no == '') {
      return false;
    }

    API.get(
      `/api/job_portal/user/list?page=1&name=${encodeURIComponent(
        name
      )}&email=${encodeURIComponent(email)}&phone_no=${encodeURIComponent(
        phone_no
      )}`
    )
      .then((res) => {
        this.setState({
          userDetails: res.data.data,
          totalCount: Number(res.data.count),
          isLoading: false,
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
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone_no').value = '';

    this.setState(
      {
        name: '',
        email: '',
        phone_no: '',

        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getUserList(this.state.activePage);
      }
    );
  };

  componentDidMount() {
    this.getUserList();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getUserList(pageNumber > 0 ? pageNumber : 1);
  };

  render() {
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12 m-b-15">
                <h1>
                  Registered Users
                  <small />
                </h1>
              </div>

              <div className="col-lg-12 col-sm-12 col-xs-12">
                <form>
                  <div className="leadForm">
                    <div>
                      <input
                        className="form-control"
                        name="name"
                        id="name"
                        placeholder="Filter by Name"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Filter by Email"
                      />
                    </div>
                    <div>
                      <input
                        className="form-control"
                        name="phone_no"
                        id="phone_no"
                        placeholder="Filter by Phone Number"
                      />
                    </div>
                    <div>
                      <div>
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.userSearch(e)}
                        />
                        {this.state.remove_search ? (
                          <a
                            onClick={() => this.clearSearch()}
                            className="btn btn-danger btn-sm"
                          >
                            {' '}
                            Remove{' '}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="box">
              <div className="box-body">
                <BootstrapTable data={this.state.userDetails}>
                  <TableHeaderColumn
                    isKey
                    dataField="fullname"
                    // dataFormat={htmlDecode(this)}
                  >
                    Name
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="email"
                    // dataFormat={htmlDecode(this)}
                  >
                    Email
                  </TableHeaderColumn>
                  <TableHeaderColumn
                    dataField="phone_no"
                    // dataFormat={htmlDecode(this)}
                  >
                    Phone Number
                  </TableHeaderColumn>

                  <TableHeaderColumn
                    dataField="id"
                    dataFormat={actionFormatter(this)}
                    dataAlign=""
                  >
                    Action
                  </TableHeaderColumn>
                </BootstrapTable>

                <Modal
                  show={this.state.showModal}
                  onHide={() => this.modalCloseHandler()}
                  backdrop="static"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>user Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="contBox">
                      {generateHTML(this.state.post_data)}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      onClick={(e) => this.modalCloseHandler()}
                      className={`btn btn-danger btn-sm`}
                      type="button"
                    >
                      Close
                    </button>
                  </Modal.Footer>
                </Modal>

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
      </Layout>
    );
  }
}
export default RegisteredUsers;
