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


class EBookUpload extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            pdfDetails: {},
            detailsId: 0,
            isLoading: false,
            showModal: false,
            totalCount: 0,
            itemPerPage: 10,
            activePage: 1,
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
        }
        this.inputFile = React.createRef();
    }

    getPDF = (page = 1) => {


        API.get(
            `/api/covid/e_Book`
        )
            .then((res) => {
                this.setState({
                    pdfDetails: res.data.data[0],
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

    handleFileUpload = e => {
        const { files } = e.target;
        console.log(files);
      };

   
    componentDidMount() {
        this.getPDF();
    }

    fileChangedHandler = (event, file, setFieldTouched, setFieldValue, setErrors) => {
            const SUPPORTED_FORMATS = ["application/pdf"];
            if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
                var formData = new FormData();
                formData.append("file", event.target.files[0]);
                API({
                    method: 'PUT',
                    url: `api/covid/e_Book_update/${this.state.pdfDetails.id}`,
                    data: formData
                }).then((res) => {
                   this.getPDF();
                }).catch((err) => {
                    this.setState({ showModalLoader: false });
                    if (err.data.status === 3) {
                        this.setState({
                            showModal: false,
                        });
                        showErrorMessage(err, this.props);
                    }
                });
            } else {
                swal({
                    closeOnClickOutside: false,
                    title: "Error",
                    text: "Only PDF files allowed!",
                    icon: "error"
                }).then(() => {
                });
            }
    };

    render() {
        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage EBook
                <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">
                                    <input 
                                     type="file" 
                                     ref={this.inputFile} 
                                     style={{ display: 'none' }}
                                     onChange={this.fileChangedHandler} 
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={() =>  this.inputFile.current.click()}
                                    >
                                        <i className="far fa-edit" /> Edit EBook

                                  </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">
                                <object data={this.state.pdfDetails.ebook_file} width="100%" height="650" hspace="0" vspace="0"></object>
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}
export default EBookUpload