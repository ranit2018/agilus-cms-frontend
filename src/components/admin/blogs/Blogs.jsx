import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Button, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
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
import Layout from "../layout/Layout";
import dateFormat from "dateformat";
import Switch from "react-switch";


const initialValues = {
    featured_image: "",
    title: "",
    content: "",
    status: ""
};
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
                tooltip="Click to edit"
                href="#"
                clicked={(e) => refObj.editBlog(e, cell)}
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
        <div style={{
            width: "100px",
            height: "100px",
            overflow: "hidden"
        }}>
            <img src={cell} alt="Blog Image" width="100%" onClick={(e) => refObj.imageModalShowHandler(row.blog_image)}></img>

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

class Blog extends Component {
    constructor(props) {
        super(props)

        this.state = {
            blogs: [],
            blogDetails: {},
            categoryList: [],
            blog_id: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectedCategoryList: [],
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
            thumbNailModal: false,
            blog_title: "",
            status: "",
        }
    }
    componentDidMount() {
        this.getBlogsList();
        this.getBlogCategory();
    }

    getBlogsList = (page = 1) => {
        let blog_title = this.state.blog_title;
        let status = this.state.status;

        API.get(
            `/api/blog?page=${page}&blog_title=${encodeURIComponent(blog_title)}&status=${encodeURIComponent(status)}`
        )
            .then((res) => {
                this.setState({
                    blogs: res.data.data,
                    totalCount: Number(res.data.count),
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

    getBlogCategory = (page = 1) => {

        API.get(
            `/api/feed/get_category_by_medium/1`
        )
            .then((res) => {
                this.setState({
                    categoryList: res.data.data,
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


    editBlog(e, id) {
        e.preventDefault();
        var selDetailsCategory = [];
        var selCategory = [];
        API.get(`/api/blog/${id}`)
            .then((res) => {
                for (let index = 0; index < res.data.data.blog_mapping_details.length; index++) {
                    const element = res.data.data.blog_mapping_details[index];
                    selDetailsCategory.push({
                        value: element["value"],
                        label: element["label"],
                    });

                    selCategory.push(element["id"]);
                }

                this.props.history.push({
                    pathname: '/edit-blog/' + id,
                    state: {
                        blogDetails: res.data.data.blog_details,
                        selectedCategoryList: selDetailsCategory,
                        selectedCategory: selCategory,
                        categoryList: this.state.categoryList
                    }
                })

            })
            .catch((err) => {
                showErrorMessage(err, this.props);
            });
    }


    blogSearch = (e) => {
        e.preventDefault();

        const blog_title = document.getElementById("blog_title").value;
        const status = document.getElementById("status").value;

        if (blog_title === "" && status === "") {
            return false;
        }
        API.get(`/api/blog?page=1&blog_title=${encodeURIComponent(blog_title)}&status=${encodeURIComponent(status)}`)
            .then((res) => {
                this.setState({
                    blogs: res.data.data,
                    totalCount: Number(res.data.count),
                    isLoading: false,
                    blog_title: blog_title,
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

    clearSearch = () => {

        document.getElementById("blog_title").value = "";
        document.getElementById("status").value = "";

        this.setState(
            {
                blog_title: "",
                status: "",
                remove_search: false,
            },
            () => {
                this.setState({ activePage: 1 });
                this.getBlogsList();

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
                this.deleteBlogs(id);
            }
        });
    };

    deleteBlogs = (id) => {
        API.delete(`/api/blog/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "Record deleted successfully.",
                    icon: "success",
                }).then(() => {
                    this.getBlogsList(this.state.activePage);
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
        API.put(`/api/blog/change_status/${cell}`, {status: status == 1 ? String(0) : String(1)})
        .then((res) => {
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.getBlogsList(this.state.activePage);
          });
        })
        .catch((err) => {
          if (err.data.status === 3) {
            this.setState({ closeModal: true });
            showErrorMessage(err, this.props);
          }
        });
      }

    imageModalShowHandler = (url) => {
        this.setState({ thumbNailModal: true, url: url });
    }
    imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, url: "" });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getBlogsList(pageNumber > 0 ? pageNumber : 1);
    };

    render() {

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage Blogs
                    <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">

                                <div className="">
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={(e) => this.props.history.push({
                                            pathname: '/add-blog',
                                            state: { categoryList: this.state.categoryList }
                                        })}
                                    >
                                        <i className="fas fa-plus m-r-5" /> Add Blog
                    </button>
                                </div>
                                <form className="form">
                                    <div className="">
                                        <input
                                            className="form-control"
                                            name="blog_title"
                                            id="blog_title"
                                            placeholder="Filter by Blog Title"
                                        />
                                    </div>

                                    <div className="">
                                        <select
                                            name="status"
                                            id="status"
                                            className="form-control"
                                        >
                                            <option value="">Select Blog Status</option>
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
                                            onClick={(e) => this.blogSearch(e)}
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

                                <BootstrapTable data={this.state.blogs}>
                                    <TableHeaderColumn
                                        isKey
                                        dataField="title"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Title
                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="blog_image"
                                        dataFormat={setBlogImage(this)}
                                    >
                                        Blog Image
                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="permalink"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Permalink
                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        dataField="blog_subtext"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Blog Subtext
                    </TableHeaderColumn>
                    {/* <TableHeaderColumn
                                        dataField="keywords"
                                        dataFormat={__htmlDecode(this)}
                                    >
                                        Keywords
                    </TableHeaderColumn> */}
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
                                <Modal
                                    show={this.state.thumbNailModal}
                                    onHide={() => this.imageModalCloseHandler()}
                                    backdrop='static'
                                >
                                    <Modal.Header closeButton>Blog Image</Modal.Header>
                                    <Modal.Body>
                                        <center>
                                            <div className="imgUi">
                                                <img src={this.state.url} alt="Blog Image"></img>
                                            </div>
                                        </center>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}

export default Blog
