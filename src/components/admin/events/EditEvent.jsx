import React, { Component } from 'react'
import { Row, Col, Button, Modal } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import './Event.css'
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE, FILE_VALIDATION_TYPE_ERROR_MASSAGE, FILE_VALIDATION_SIZE_ERROR_MASSAGE } from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import Dropzone from 'react-dropzone'
import TimeKeeper from 'react-timekeeper';
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css' // If using WebPack and style-loader.

function formatAMPM(date) {
    date = new Date("1970-01-01 " + date);;
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

const stringFormat = (str) => {
    str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
    str = str.split(" ");
    const strArr = [];
    console.log(str);

    for (let i in str) {
        if (str[i] !== "") {
            strArr.push(str[i])
        }
    }
    const formatedString = strArr.join("-");
    return formatedString.toLowerCase();
}


class Thumb extends React.Component {
    state = {
        loading: false,
        thumb: undefined,
    };

    componentWillReceiveProps(nextProps) {
        if (!nextProps.file) { return; }

        this.setState({ loading: true }, () => {
            let reader = new FileReader();


            if (nextProps.file instanceof Blob) {
                reader.onloadend = () => {
                    this.setState({ loading: false, thumb: reader.result });
                };
                reader.readAsDataURL(nextProps.file);
            }
        });
    }

    render() {
        const { file } = this.props;
        const thumb = file.hasOwnProperty('image_id') ? file.name : this.state.thumb;
        if (!file) { return null; }
        return (
            <>
                <span>
                    <Field
                        type="radio"
                        name="default_image"
                        value={file.name === this.props.defaultValue ? this.props.defaultValue : ""}
                        className="diBlock vTop mR"
                        onChange={() => this.props.setFieldValue('default_image', file.name)}
                    />
                </span>
                <span className="diBlock vTop">
                    <div className="bannerPic">
                        <div className="bannerClose">
                            <i className="fa fa-trash" aria-hidden="true" onClick={(e) => this.props.remove(this.props.index, file)}></i>
                        </div>
                        <img src={thumb} alt={file.name} />
                    </div>
                </span>

            </>


        );
    }
}

const dropzoneStyle = {
    width: "100%",
    height: "auto",
    borderWidth: 2,
    borderColor: "rgb(102, 102, 102)",
    borderStyle: "dashed",
    borderRadius: 5,
}
const initialValues = {
    featured_image: "",
    title: "",
    content: "",
    status: "",
    event_date: "",
    event_time: "",
    event_location: ""
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

class AddEvent extends Component {
    constructor(props) {
        super(props)

        this.onDrop = (files) => {
            this.setState({ files })
        };

        this.state = {
            time: '12:34pm',
            featured_image: [],
            selectedCategoryList: [],
            selectStatus: [
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" }
            ],
            selectMedium: [
                { value: "2", label: "Event" },
                { value: "3", label: "Camp" }
            ],
            files: [],
            thumbNailModal: false,
            timePickerModal: false,
        }
    }
    componentDidMount() {
        this.setState({
            validationMessage: generateResolutionText('event'),
            fileValidationMessage: FILE_VALIDATION_MASSAGE
        })
    }


    handleSubmitEvent = async (values, actions) => {
        let method = 'PUT';
        let url = `/api/events/${this.props.match.params.id}`;
        if (values.featured_image.length > 20) {
            actions.setErrors({ errors: "Only 20 images can be added" });
            actions.setSubmitting(false);
        } else {

            const formData = new FormData();
            formData.append('medium_id', values.medium_id);
            formData.append('title', values.title);
            formData.append('event_location', values.event_location);
            formData.append('event_date', setDateValue(values.event_date));
            formData.append('event_time', values.event_time);
            formData.append('content', values.content);
            formData.append('default_image', values.default_image.replace("https://srlcmsbackend.indusnettechnologies.com/events/", ""));
            formData.append('permalink', values.permalink);
            formData.append('meta_title', values.meta_title);
            formData.append('meta_description', values.meta_description);
            formData.append('keywords', values.keywords.toString());
            formData.append('status', values.status);
            const images = [];
            for (let i = 0; i < values.featured_image.length; i++) {
                if (!values.featured_image[i].hasOwnProperty('image_id')) {
                    images.push(values.featured_image[i]);
                }
            }
            if (values.deleted_image_id.length > 0) {
                if (values.deleted_image_id.length > 1) {
                    for (let i in values.deleted_image_id) {
                        formData.append("deleted_image_id", Number(values.deleted_image_id[i]));
                    }
                } else {
                    formData.append("deleted_image_id[]", Number(values.deleted_image_id));
                }
            }
            let rejectImage = [];
            let err_count = 0;
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    if (images[i].size > FILE_SIZE) {
                        rejectImage.push({
                            name: images[i].name,
                            err: FILE_VALIDATION_SIZE_ERROR_MASSAGE
                        });
                        err_count++;
                    } else {
                        let dimension = await getHeightWidth(images[i])
                        const { height, width } = dimension;
                        const eventDimension = getResolution("event");
                        console.log(dimension, height != eventDimension.height || width != eventDimension.width);
                        if (height != eventDimension.height || width != eventDimension.width) {
                            rejectImage.push({
                                name: images[i].name,
                                err: FILE_VALIDATION_TYPE_ERROR_MASSAGE
                            });
                            err_count++;
                        }
                    }
                }
            }
            if (err_count == 0) {
                if (images.length > 0) {
                    for (let i in images) {
                        formData.append('featured_image', images[i]);
                    }
                }
                API({
                    method: method,
                    url: url,
                    data: formData
                }).then((res) => {
                    swal({
                        closeOnClickOutside: false,
                        title: "Success",
                        text: "Record updated successfully.",
                        icon: "success",
                    }).then(() => {
                        this.props.history.push('/events');
                    })
                }).catch((err) => {
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

            } else {
                actions.setFieldValue('rejected_image', rejectImage);
                actions.setSubmitting(false);
            }

        }


        // if (values.category_id.length > 1) {
        //     for (let i = 0; i < values.category_id.length; i++) {
        //         formData.append('category_id', values.category_id[i]);
        //     }
        // } else {
        //     formData.append('category_id[]', values.category_id);
        // }
    }







    render() {
        const { eventDetails } = this.props.location.state;
        console.log(eventDetails.featured_image);

        const newInitialValues = {
            featured_image: eventDetails.featured_image,
            default_image: eventDetails.default_image ? eventDetails.default_image : "",
            title: eventDetails.title ? htmlDecode(eventDetails.title) : "",
            content: eventDetails.content ? htmlDecode(eventDetails.content) : "",
            event_time: eventDetails.event_time ? formatAMPM(eventDetails.event_time) : "",
            event_date: eventDetails.event_date ? new Date(eventDetails.event_date) : "",
            event_location: eventDetails.event_location ? eventDetails.event_location : "",
            keywords: eventDetails.keywords.split(","),
            deleted_image_id: [],
            rejected_image: [],
            permalink: htmlDecode(eventDetails.permalink),
            // category_id: "",
            meta_title: htmlDecode(eventDetails.meta_title),
            meta_description: htmlDecode(eventDetails.meta_description),
            status: eventDetails.status || eventDetails.status === 0 ? eventDetails.status.toString() : "",
            medium_id: eventDetails.medium_id || eventDetails.medium_id === 0 ? eventDetails.medium_id.toString() : "",
            errors: ""
        };

        const validateStopFlag = Yup.object().shape({
            title: Yup.string().required("Please enter the title"),
            content: Yup.string().required("Please enter the content"),
            keywords: Yup.string().required("Please enter the keyword"),
            event_time: Yup.string().required("Please enter the event Time"),
            event_location: Yup.string().required("Please enter the event Location"),
            event_date: Yup.string().required("Please enter the event Date"),
            keywords: Yup.string().required("Please enter the keyword"),
            // category_id: Yup.array()
            //     .ensure()
            //     .min(1, "Please add at least one category name")
            //     .of(Yup.string().ensure().required("category name cannot be empty")),
            default_image: Yup
                .string()
                .label('Default Image').required('Please select default image')
                .test('Please select default image', function (value) {
                    if (this.parent.featured_image.length > 0 && value != '') {
                        return value;
                    } else {
                        return false;
                    }
                }),
            status: Yup.string().trim()
                .required("Please select status")
                .matches(/^[0|1]$/, "Invalid status selected"),
            medium_id: Yup.string().trim()
                .required("Please select type")
                .matches(/^[2|3]$/, "Invalid medium selected"),
            deleted_image_id: Yup.array()
                .optional(),
            permalink: Yup.string().required("Please enter the permalink").matches(/^[a-zA-Z0-9\-\s]*$/, "Only '-' is allowed in permalink"),

            featured_image: Yup.array()
                .ensure()
                .min(1, "Please add at least one image")
                .of((Yup.string().ensure().required("image cannot be empty"))).test("Please add at least one image", (value) => {
                    if (value.length > 0) {
                        return value;
                    } else {
                        return false;
                    }
                })
        });

        return (
            <Layout {...this.props}>
                <div className="content-wrapper">

                    <section className="content-header">
                        <h1>
                            Edit Event
                <small />
                        </h1>
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
                                        const remove = (index, file) => {
                                            const newFiles = [...values.featured_image];
                                            setFieldValue('rejected_image', []);
                                            if (file.hasOwnProperty('image_id')) {
                                                const deleteImageArr = [...values.deleted_image_id];
                                                deleteImageArr.push(file.image_id);
                                                setFieldValue('deleted_image_id', deleteImageArr);
                                            }
                                            if (file.name === values.default_image) {
                                                setFieldValue('default_image', null);
                                            }
                                            newFiles.splice(index, 1);
                                            setFieldValue("featured_image", newFiles);
                                        };
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
                                                <div className="contBox">
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Type
                                                                    <span className="impField">*</span>
                                                                </label>
                                                                <Field
                                                                    name="medium_id"
                                                                    component="select"
                                                                    className={`selectArowGray form-control`}
                                                                    autoComplete="off"
                                                                    value={values.medium_id}
                                                                >
                                                                    <option key="-1" value="">
                                                                        Select Type
                                                                        </option>
                                                                    {this.state.selectMedium.map(
                                                                        (medium_id, i) => (
                                                                            <option key={i} value={medium_id.value}>
                                                                                {medium_id.label}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </Field>
                                                                {errors.medium_id && touched.medium_id ? (
                                                                    <span className="errorMsg">
                                                                        {errors.medium_id}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Title
                                                                      <span className="impField">*</span>
                                                                </label>
                                                                <Field
                                                                    name="title"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Enter title"
                                                                    autoComplete="off"
                                                                    value={values.title}
                                                                    onChange={(e) => {
                                                                        setFieldValue('title', e.target.value);
                                                                        setFieldValue('permalink', stringFormat(e.target.value));
                                                                    }}
                                                                />
                                                                {errors.title && touched.title ? (
                                                                    <span className="errorMsg">
                                                                        {errors.title}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    {/* <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Category Name
                                        <span className="impField">*</span>
                                                                </label>
                                                                <Select
                                                                    isMulti
                                                                    name="category_id[]"
                                                                    options={this.props.location.state.categoryList}
                                                                    className="basic-multi-select"
                                                                    classNamePrefix="select"
                                                                    onChange={(evt) => {
                                                                        if (evt === null) {
                                                                            setFieldValue("category_id", []);
                                                                        } else {
                                                                            setFieldValue(
                                                                                "category_id",
                                                                                [].slice.call(evt).map((val) => val.value)
                                                                            );
                                                                        }
                                                                    }}
                                                                    placeholder="Category Name"
                                                                    onBlur={() => setFieldTouched("medium_id")}
                                                                // defaultValue={
                                                                //     this.state.selectedMediumList
                                                                // }
                                                                />
                                                                {errors.category_id && touched.category_id ? (
                                                                    <span className="errorMsg">{errors.category_id}</span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row> */}


                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Content
                                        <span className="impField">*</span>
                                                                </label>
                                                                <input id="my-file" type='file' name="my-file" style={{ display: "none" }} onChange="" />
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
                                                                {errors.content && touched.content ? (
                                                                    <span className="errorMsg">{errors.content}</span>
                                                                ) : null}




                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Event Location
                                                                      <span className="impField">*</span>
                                                                </label>
                                                                <Field
                                                                    name="event_location"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Enter Event Location"
                                                                    autoComplete="off"
                                                                    value={values.event_location}
                                                                />
                                                                {errors.event_location && touched.event_location ? (
                                                                    <span className="errorMsg">
                                                                        {errors.event_location}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Event Time
                                                                      <span className="impField">*</span>
                                                                </label>

                                                                <Field
                                                                    name="event_time"
                                                                    type=""
                                                                    className={`form-control`}
                                                                    placeholder="Enter Event Time"
                                                                    autoComplete="off"
                                                                    value={values.event_time}
                                                                    onClick={() => {
                                                                        this.setState({
                                                                            timePickerModal: !this.state.timePickerModal
                                                                        })
                                                                    }}
                                                                />
                                                                {this.state.timePickerModal ?
                                                                    <TimeKeeper
                                                                        time={values.event_time}
                                                                        onChange={(data) => {
                                                                            setFieldValue('event_time', data.formatted12)
                                                                        }}
                                                                        onDoneClick={() => this.setState({ timePickerModal: false })}
                                                                        switchToMinuteOnHourSelect
                                                                    /> : null
                                                                }
                                                                {/* <Modal
                                                                    show={this.state.timePickerModal}
                                                                    onHide={() => {
                                                                        this.setState({
                                                                            timePickerModal: false
                                                                        })
                                                                    }}
                                                                >
                                                                    <Modal.Header closeButton></Modal.Header>
                                                                    <Modal.Body>
                                                                        <center>
                                                                            <TimeKeeper
                                                                                // time={this.state.time}
                                                                                value={values.event_time}
                                                                                onChange={(data) => {
                                                                                    setFieldValue('event_time', data.formatted12)
                                                                                }}
                                                                            />
                                                                        </center>
                                                                    </Modal.Body>
                                                                    <Modal.Footer>
                                                                        <Button
                                                                            onClick={() => {
                                                                                this.setState({
                                                                                    timePickerModal: false
                                                                                })
                                                                            }}
                                                                            className="btn btn-primary"                                                                                >
                                                                            Set
                                                                                </Button>
                                                                    </Modal.Footer>
                                                                </Modal> */}
                                                                {errors.event_time && touched.event_time ? (
                                                                    <span className="errorMsg">
                                                                        {errors.event_time}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Event Date
                                                                      <span className="impField">*</span>
                                                                </label>
                                                                <div className="dateCustom">

                                                                    <DatePicker
                                                                        name={'event_date'}
                                                                        selected={values.event_date}
                                                                        className={`form-control`}
                                                                        onChange={date => { setFieldValue("event_date", date) }}
                                                                        onTouch={() => setFieldTouched("event_date")}
                                                                        minDate={new Date()}
                                                                        maxDate="2050-06-01"
                                                                        placeholder="Select Date"
                                                                    />

                                                                    {errors.event_date && touched.event_date ? (
                                                                        <span className="errorMsg">
                                                                            {errors.event_date}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group drop-file">
                                                                <label>
                                                                    Upload Image
                                                                    <br /> <i> {this.state.fileValidationMessage}
                                                                    </i>
                                                                    <br /> <i>{this.state.validationMessage}
                                                                    </i>                                                                 </label>

                                                                <Dropzone style={dropzoneStyle} accept="image/png,image/jpg,image/jpeg" onDrop={(acceptedFiles) => {
                                                                    // do nothing if no files
                                                                    if (acceptedFiles.length === 0) { return; }

                                                                    // on drop we add to the existing files

                                                                    setFieldValue("featured_image", values.featured_image.concat(acceptedFiles));
                                                                    console.log("dropzone ", values.featured_image);
                                                                }}>
                                                                    {({ getRootProps, getInputProps }) => (
                                                                        <section>
                                                                            <div {...getRootProps({ className: 'dropzone' })}>
                                                                                <input {...getInputProps()} />
                                                                                <p
                                                                                    className='dragDrop'
                                                                                >
                                                                                    Upload image or Drag and drop some images here or click to select images</p>
                                                                            </div>
                                                                            <aside>
                                                                                <h4>Images</h4>
                                                                                <ul style={{ padding: 0, margin: 0 }}>
                                                                                    {
                                                                                        values.featured_image.map((file, i) => {
                                                                                            // console.log("file in loop-------",file);
                                                                                            return <label>
                                                                                                <Thumb
                                                                                                    key={i}
                                                                                                    index={i}
                                                                                                    file={file}
                                                                                                    remove={remove}
                                                                                                    // images={this.state.fea}
                                                                                                    setFieldValue={setFieldValue}
                                                                                                    defaultValue={values.default_image}
                                                                                                />
                                                                                            </label>
                                                                                        })

                                                                                    }
                                                                                    {
                                                                                        values.rejected_image.length > 0 ?
                                                                                            values.rejected_image.map((img, key) => (
                                                                                                <p className="errorMsg">
                                                                                                    {img.name} : {img.err}
                                                                                                </p>
                                                                                            )
                                                                                            )
                                                                                            : null
                                                                                    }
                                                                                </ul>
                                                                            </aside>
                                                                        </section>
                                                                    )}
                                                                </Dropzone>
                                                                {errors.featured_image && touched.featured_image ? (
                                                                    <span className="errorMsg">
                                                                        {errors.featured_image}
                                                                    </span>
                                                                ) : null}
                                                                {errors.errors && touched.errors ? (
                                                                    <span className="errorMsg">
                                                                        {errors.errors}
                                                                    </span>
                                                                ) : null}

                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    <hr className='blue' />
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    SEO Information
                                                                </label>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Meta Keywords
                                    <span className="impField">*</span>
                                                                </label>
                                                                <TagsInput
                                                                    value={values.keywords}
                                                                    onChange={(tags) => {
                                                                        setFieldValue('keywords', tags)
                                                                    }}
                                                                    onChangeInput={(tag) => {
                                                                        const validTag = tag
                                                                            .replace(/([^\w-\s]+)|(^\s+)/g, "")
                                                                            .replace(/\s+/g, "-");

                                                                        setFieldValue('keywords', validTag)
                                                                    }}
                                                                    inputProps={{
                                                                        className: 'react-tagsinput-input custom',
                                                                        placeholder: 'Add keyword'
                                                                    }}
                                                                    onlyUnique
                                                                    addOnPaste
                                                                />

                                                                {errors.keywords && touched.keywords ? (
                                                                    <span className="errorMsg">{errors.keywords}</span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Meta Description
                                                              <span className="impField">*</span>
                                                                </label>

                                                                <Field
                                                                    name="meta_description"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Enter meta description"
                                                                    autoComplete="off"
                                                                    value={values.meta_description}
                                                                />
                                                                {errors.meta_description && touched.meta_description ? (
                                                                    <span className="errorMsg">
                                                                        {errors.meta_description}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Meta Title
                                                                  <span className="impField">*</span>
                                                                </label>
                                                                <div class="side-by-side">
                                                                    <Field
                                                                        name="meta_title"
                                                                        type="text"
                                                                        className={`form-control`}
                                                                        placeholder="Enter meta title"
                                                                        autoComplete="off"
                                                                        value={values.meta_title}
                                                                    />
                                                                    <Button
                                                                        className="btn btn-info btn-sm"
                                                                        onClick={() => {
                                                                            setFieldValue('meta_title', values.title)
                                                                        }}
                                                                    >
                                                                        Copy Title
                                                                </Button>
                                                                </div>
                                                                {errors.meta_title && touched.meta_title ? (
                                                                    <span className="errorMsg">
                                                                        {errors.meta_title}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <div className="form-group">
                                                                <label>
                                                                    Permalink
                                                                      <span className="impField">*</span>
                                                                </label>
                                                                <Field
                                                                    name="permalink"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Enter Permalink"
                                                                    autoComplete="off"
                                                                    value={values.permalink}
                                                                />
                                                                {errors.permalink && touched.permalink ? (
                                                                    <span className="errorMsg">
                                                                        {errors.permalink}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <hr className='blue' />

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
                                                                    {this.state.selectStatus.map(
                                                                        (status, i) => (
                                                                            <option key={i} value={status.value}>
                                                                                {status.label}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </Field>
                                                                {errors.status && touched.status ? (
                                                                    <span className="errorMsg">
                                                                        {errors.status}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    {errors.event_date && touched.event_date ? (
                                                        <span className="errorMsg">
                                                            {errors.event_date}
                                                        </span>
                                                    ) : null}

                                                </div>
                                                <button
                                                    className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
                                                        } m-r-10`}
                                                    type="submit"
                                                    disabled={isValid ? (isSubmitting ? true : false) : true}
                                                >
                                                    {this.props.match.params.id > 0
                                                        ? isSubmitting
                                                            ? "Updating..."
                                                            : "Update"
                                                        : isSubmitting
                                                            ? "Submitting..."
                                                            : "Submit"}
                                                </button>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                            </div>
                        </div>
                    </section>

                </div>
            </Layout >
        )
    }

}
export default AddEvent