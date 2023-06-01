import React, { Component } from 'react'
import { Row, Col } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import { htmlDecode } from "../../../../shared/helper";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";

import Select from "react-select";
import Layout from "../../layout/Layout";
import GalleryModal from "../../gallery-modal/GalleryModal";



class EditAboutSRL extends Component {

    constructor(props) {
        super(props)

        this.state = {
            show: false
        };
    };
    setShow = () => {
        this.setState({
            show: !this.state.show
        });
    }


    handleSubmitEvent = (values, actions) => {

        API.put(`/api/feed/page_details/14`, { content: values.content, status: '1' })
            .then(res => {
                this.setState({ showModal: false })
                swal({
                    closeOnClickOutside: false,
                    title: "Success",
                    text: "About Agilus Updated Successfully",
                    icon: "success"
                }).then(() => {
                    this.props.history.push('/about-us/about-srl')
                });
            })
            .catch(err => {
                this.setState({ closeModal: true, showModalLoader: false });
                if (err.data.status === 3) {
                    showErrorMessage(err, this.props);
                } else {
                    actions.setErrors(err.data.errors)
                }
            });

    };

    render() {
        const initialValues = {
            content: ""
        };
        const newInitialValues = Object.assign(initialValues, {
            content: htmlDecode(this.props.location.state.content)
        });
        const validateStopFlag = Yup.object().shape({
            content: Yup.string().required("Please enter the Content"),
        });

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">

                    <section className="content-header">
                        <h1>
                            Edit About Agilus
                    <small />
                        </h1> <br />

                        <div className="">
                            <button
                                type="button"
                                className="btn btn-info btn-sm"
                                onClick={this.setShow}
                            >
                                <i className="fas fa-plus m-r-5" /> Open Gallery
        </button>
                        </div>
                        <input
                            type="button"
                            value="Go Back"
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                                window.history.go(-1);
                                return false;
                            }}
                            style={{ right: "9px", position: "absolute", top: "13px" }}
                        />
                    </section>
                    <section className="content">
                        <div className="box">
                            <div className="box-body">
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
                                        setErrors
                                    }) => {
                                        return (
                                            <Form>

                                                <div className="contBox">



                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Content
                                        <span className="impField">*</span>
                                                                </label>
                                                                <input id="my-file" type='file' name="my-file" style={{ display: "none" }}  />
                                                                <Editor
                                                                    value={values.content}
                                                                    init={{
                                                                        height: 500,
                                                                        menubar: false,
                                                                        plugins: [
                                                                            'advlist autolink lists link image charmap print preview anchor',
                                                                            'searchreplace visualblocks code fullscreen',
                                                                            'insertdatetime media table paste code help wordcount'
                                                                        ],
                                                                        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ',
                                                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                                        file_browser_callback_types: 'image',
                                                                        file_picker_callback: function (callback, value, meta) {
                                                                            if (meta.filetype == 'image') {
                                                                                var input = document.getElementById('my-file');
                                                                                input.click();
                                                                                input.onchange = function () {
                                                                                    var file = input.files[0];
                                                                                    var reader = new FileReader();
                                                                                    reader.onload = function (e) {
                                                                                        console.log('name', e.target.result);
                                                                                        callback(e.target.result, {
                                                                                            alt: file.name
                                                                                        });
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                };
                                                                            }
                                                                        },
                                                                        paste_data_images: true
                                                                    }}
                                                                    onEditorChange={(value) =>
                                                                        setFieldValue(
                                                                            "content",
                                                                            value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <button
                                                    className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                                        } m-r-10`}
                                                    type="submit"
                                                    disabled={isValid ? (isSubmitting ? true : false) : true}
                                                >
                                                    {isSubmitting
                                                        ? "Updating..."
                                                        : "Update"
                                                    }
                                                </button>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>
                        </div>
                    </section>
                    <GalleryModal
                        show={this.state.show}
                        setShow={this.setShow}
                    />

                </div>
            </Layout >

        )
    }
}
export default EditAboutSRL