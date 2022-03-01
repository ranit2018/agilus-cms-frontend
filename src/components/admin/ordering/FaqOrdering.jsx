import React, { Component } from 'react'
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Button, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import Pagination from "react-js-pagination";
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import { text } from 'body-parser';
import { reorderData, convertIntoSingleArray, spliceIntoChunks } from './reorder'


class FaqOrdering extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: [],
            // list: [],
            detailsId: 0,
            isLoading: false,
            showModal: false,
            screenDetails: '',
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

    getOrderingList = () => {


        API.get(
            `/api/ordering/4`
        )
            .then((res) => {
                this.setState({
                    list: spliceIntoChunks(res.data.data, 4),
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




    componentDidMount() {
        this.getOrderingList();
    }

    handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = reorderData(this.state.list, result.source, result.destination, 4);
        this.setState({
            list: items,
        })
    }

    saveOrdering = () => {
        const singleArray = convertIntoSingleArray(this.state.list);
        const ordering_arr = [];
        for (let i in singleArray) {
            ordering_arr.push(singleArray[i].id);
        }
        API({
            url: '/api/ordering/4',
            method: 'PUT',
            data: { ordering_arr: ordering_arr }
        }).then(res => {
            swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Record updated successfully.",
                icon: "success",
            }).then(() => {
                this.getOrderingList();
            }).catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });

        })
    }





    render() {

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">
                    <section className="content-header">
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-xs-12">
                                <h1>
                                    Manage FAQ Ordering
                                    <small />
                                </h1>
                            </div>

                            <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                                <div className="">
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm"
                                        onClick={this.saveOrdering}
                                    >
                                        <i className="fa fa-save" /> Save Ordering

                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="content">
                        <div className="box">

                        <div className="row">
                                <DragDropContext onDragEnd={this.handleOnDragEnd}>
                                    {
                                        Object.entries(this.state.list).map(([k, v], i) => (
                                            <Droppable
                                                internalScroll
                                                droppableId={k}
                                                direction="horizontal"
                                                isCombineEnabled={false}
                                                type="CARD"
                                            >
                                                {(provided) => (
                                                    <div
                                                    style={{ display: "flex" }}
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        {
                                                            v.map((val, key) => {
                                                                return (
                                                                    <Draggable
                                                                        key={val.id}
                                                                        draggableId={String(val.id)}
                                                                        index={key}
                                                                    >
                                                                        {(provided) => (
                                                                            <div
                                                                                className="col-sm-2"
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                            >

                                                                                <div
                                                                                    className="drag-box bdr"
                                                                                   
                                                                                >
                                                                                   <p>
                                                                                       {val.title}
                                                                                   </p>
                                                                                </div>
                                                                                </div>


                                                                                )
                                                                            }
                                                                        </Draggable>
                                                                        )

                                                                        }

                                                                        )

                                                            }
                                                        { provided.placeholder }
                                                    </div>
                                                )}
                                            </Droppable>
                                        ))
                                    }
                                </DragDropContext>
                            </div>
                        </div>
                    </section >
                </div >
            </Layout >
        )
    }
}
export default FaqOrdering

