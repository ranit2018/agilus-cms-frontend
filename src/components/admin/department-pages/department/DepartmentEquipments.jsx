/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import Layout from "../../layout/Layout";
import Pagination from "react-js-pagination";
import dateFormat from "dateformat";
import { htmlDecode, FILE_VALIDATION_MASSAGE } from "../../../../shared/helper";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

const __htmlDecode = (refObj) => (cell) => {
    return htmlDecode(cell);
};

const setName = (refObj) => (cell) => {
    return cell.replace(".png", " ");
};

const equipmentStatus = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
        return "Active";
    } else if (cell === 0) {
        return "Inactive";
    }
};

const setType = (refObj) => (cell) => {
    //return cell === 1 ? "Active" : "Inactive";
    if (cell === 1) {
      return " Instrument";
    } else if (cell === 2) {
      return "Equipment";
    }
  };

const setDoctorImage = (refObj) => (cell, row) => {
    return (
        <img
            src={row.equipment_image}
            alt=""
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

const imageFormatter = (refObj) => (cell, row) => {
    return (
      <div className="actionStyle">
        {row.images.map((val, index) => {
          return (
            <LinkWithTooltip
              tooltip="Click to see picture"
              href="#"
              // clicked={(e) => refObj.imageModalShowHandler(val.equipment_image)}
              id="tooltip-1"
              key={index}
            >
              <img
                src={val.equipment_image}
                alt="Equipment"
                height="30"
                onClick={(e) =>
                  refObj.imageModalShowHandler(e, val.equipment_image)
                }
              />
            </LinkWithTooltip>
          );
        })}
      </div>
    );
  };
  

class DepartmentEquipments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectStatus: [
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
            ],
            department_id: this.props.match.params.id,
            equipmentList: [],
            equipment_image: "",
            

        };
    }

    // componentDidMount() {
    //     this.getequipmentList(this.state.activePage);
    // }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getequipmentList(pageNumber > 0 ? pageNumber : 1);
    };

    // getequipmentList = (page = 1) => {

    //     API.get(
    //         `/api/department/doctor?page=${page}`
    //     )
    //         .then((res) => {
    //             this.setState({
    //                 equipmentList: res.data.data,
    //                 totalCount: Number(res.data.count),

    //                 isLoading: false,
    //             });
    //         })
    //         .catch((err) => {
    //             this.setState({
    //                 isLoading: false,
    //             });
    //             showErrorMessage(err, this.props);
    //         });
    // };


    //image modal
    imageModalShowHandler = (url) => {
        this.setState({ thumbNailModal: true, equipment_image: url });
    };
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, equipment_image: "" });
    };
    render() {
        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Department Equipments & Instruments
                                    <small />
                                </h1>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">
                                <BootstrapTable
                                    wrapperClasses="table-responsive"
                                    data={this.props.location.state.equipmentDetails}
                                >
                                    <TableHeaderColumn
                                        dataField="type"
                                        dataFormat={setType(this)}
                                    >
                                        Type
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="id"
                                        dataAlign=""
                                        width="125"
                                        dataFormat={imageFormatter(this)}
                                        tdStyle={{ wordBreak: "break-word" }}
                                    >
                                        Image
                                    </TableHeaderColumn>
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
                                        dataFormat={equipmentStatus(this)}
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
export default DepartmentEquipments;
