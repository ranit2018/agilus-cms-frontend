/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */
import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
// import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import TinyMCE from "react-tinymce";
import Autosuggest from "react-autosuggest";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../../shared/helper";
import Layout from "../../layout/Layout";
import Select from "react-select";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

class AddDepartment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      selectType: [
        { value: "1", label: "Instrument" },
        { value: "2", label: "Equipment" },
      ],
      department_id: 0,
      suggestions: [],
      value: "",
      selectedValue: "",
      doctors_arr: [],
      equipments_arr: [],
      publications_arr: [],
      isValidFile: false,
    };
  }

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

  componentDidMount() {
    this.setState({
      validationMessage: generateResolutionText("department"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  getDoctorArr = (value) => {
    // console.log('prop',value)
    if (value.length == 3) {
      console.log("yes");
      API.get(`/api/department/doctor-search-list?doctor_name=${value}`)
        .then((res) => {
          console.log("res.data.data", res.data.data);
          this.setState({
            doctors_arr: res.data.data,
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
  };

  getEquipmentArr = (value) => {
    if (value.length == 3) {
      console.log("yes");
      API.get(`/api/department/equipment-search-list`)
        .then((res) => {
          this.setState({
            equipments_arr: res.data.data,
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
  };

  getPublicationArr = (value) => {
    if (value.length == 3) {
      console.log("yes");
      API.get(`/api/department/publication-search-list`)
        .then((res) => {
          this.setState({
            publications_arr: res.data.data,
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
  };

  handleSubmitEvent = (values, actions) => {
    let postdata = {
      department_name: values.department_name,
      department_description: values.department_description,
      total_lab_technical: values.total_lab_technical,
      total_lab_executive: values.total_lab_executive,
      doctor_id: values.doctor_id,
      equipment_id: values.equipment_id,
      publication_id: values.publication_id,
      department_image: values.department_image,
      date_posted: new Date().toLocaleString(),
      status: String(values.status),
    };
    console.log("postdata", postdata);

    let formData = new FormData();

    formData.append("department_name", values.department_name);
    formData.append("department_description", values.department_description);
    formData.append("total_lab_technical", values.total_lab_technical);
    formData.append("total_lab_executive", values.total_lab_executive);
    formData.append(
      "total_consultant_scientists",
      values.total_consultant_scientists
    );

    // if (values.doctor_id.length > 1) {
    //   for (let i in values.doctor_id) {
    //     formData.append("doctors", JSON.stringify(values.doctor_id[i]));
    //   }
    // } else {
    //   console.log("else");
    //   formData.append("doctors[]", JSON.stringify(values.doctor_id));
    // }

    // for (let i in values.doctor_id) {
    formData.append("doctors[]", JSON.stringify(values.doctor_id));
    formData.append("equipments[]", JSON.stringify(values.equipment_id));
    formData.append("publications[]", JSON.stringify(values.publication_id));

    // }
    // if (values.equipment_id.length > 1) {
    //   for (let i in values.equipment_id) {
    //     formData.append("equipments", JSON.stringify(values.equipment_id[i]));
    //   }
    // } else {
    //   console.log("else");
    //   formData.append("equipments[]", JSON.stringify(values.equipment_id));
    // }
    // if (values.publication_id.length > 1) {
    //   for (let i in values.publication_id) {
    //     formData.append(
    //       "publications",
    //       JSON.stringify(values.publication_id[i])
    //     );
    //   }
    // } else {
    //   console.log("else");
    //   formData.append("publications[]", JSON.stringify(values.publication_id));
    // }
    // formData.append("publications", values.publications);
    formData.append("status", String(values.status));

    let url = `/api/department`;
    let method = "POST";
    if (this.state.department_image.size > FILE_SIZE) {
      actions.setErrors({
        department_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
      });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.department_image).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("department");
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({
            department_image: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
          });
          actions.setSubmitting(false);
        } else {
          formData.append("department_image", this.state.department_image);

          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, department_image: "" });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.props.history.push("/department/departments");
              });
            })
            .catch((err) => {
              actions.setSubmitting(false);
              console.log("error", err);
              this.setState({
                department_image: "",
              });
              if (err.data.status === 3) {
                showErrorMessage(err, this.props);
              } else {
                actions.setErrors(err.data.errors);
              }
            });
        }
      });
    }
  };

  render() {
    const initialValues = {
      id: "",
      department_name: "",
      department_image: "",
      department_description: "",
      total_lab_technical: "",
      total_lab_executive: "",
      total_consultant_scientists: "",
      doctor_id: "",
      equipment_id: "",
      publication_id: "",
      date_posted: "",
      status: "",
    };
    const validateStopFlag = Yup.object().shape({
      department_image: Yup.mixed()
        .required("Please select image")
        .test(
          "jobimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      department_name: Yup.string().required("Please enter department name"),
      department_description: Yup.string().required(
        "Please enter department description"
      ),
      total_lab_technical: Yup.number().required(
        "Please enter total technical lab"
      ),
      total_lab_executive: Yup.number().required(
        "Please enter total executive lab"
      ),
      total_consultant_scientists: Yup.number().required(
        "Please enter total consltant scientists"
      ),
      doctor_id: Yup.array().optional(),
      // .ensure()
      // .min(1, "Please add at least one doctor name")
      // .of(Yup.string().ensure().required("doctor name cannot be empty")),
      equipment_id: Yup.array().optional(),
      // .ensure()
      // .min(1, "Please add at least one equipment & instrument")
      // .of(
      //   Yup.string()
      //     .ensure()
      //     .required("equipment & instrument cannot be empty")
      // ),
      publication_id: Yup.array().optional(),
      // .ensure()
      // .min(1, "Please add at least one publication")
      // .of(Yup.string().ensure().required("publication cannot be empty")),
      status: Yup.number().required("Please select status"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Department
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
                  initialValues={initialValues}
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
                    setErrors,
                  }) => {
                    return (
                      <Form>
                        {/* {console.log({ errors })}
                        {console.log({ values })} */}
                        <div className="contBox">
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Department Name
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="department_name"
                                  id="department_name"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Department Name"
                                  autoComplete="off"
                                  value={values.department_name}
                                />
                                {errors.department_name &&
                                  touched.department_name ? (
                                  <span className="errorMsg">
                                    {errors.department_name}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Description
                                  <span className="impField">*</span>
                                </label>

                                <input
                                  id="my-file"
                                  type="file"
                                  name="my-file"
                                  style={{ display: "none" }}
                                />
                                <TinyMCE
                                  name="department_description"
                                  // id="department_description"
                                  config={{
                                    menubar: false,
                                    branding: false,
                                    selector: "textarea",
                                    height: 350,
                                    plugins: [
                                      "advlist autolink lists link image charmap print preview anchor",
                                      "searchreplace wordcount visualblocks code fullscreen",
                                      "insertdatetime media table contextmenu paste code",
                                    ],
                                    font_formats:
                                      "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats",
                                    toolbar:
                                      "bold italic strikethrough superscript subscript | forecolor backcolor | removeformat underline | link unlink | alignleft aligncenter alignright alignjustify | numlist bullist | blockquote table  hr | visualblocks code | fontselect | link image",
                                    content_css:
                                      "//www.tinymce.com/css/codepen.min.css",
                                    file_browser_callback_types: "image",
                                    file_picker_callback: function (
                                      callback,
                                      value,
                                      meta
                                    ) {
                                      if (meta.filetype == "image") {
                                        var input =
                                          document.getElementById("my-file");
                                        input.click();
                                        input.onchange = function () {
                                          var file = input.files[0];
                                          var reader = new FileReader();
                                          reader.onload = function (e) {
                                            console.log(
                                              "name",
                                              e.target.result
                                            );
                                            callback(e.target.result, {
                                              alt: file.name,
                                            });
                                          };
                                          reader.readAsDataURL(file);
                                        };
                                      }
                                    },
                                    paste_data_images: true,
                                  }}
                                  onChange={(e) => {
                                    setFieldValue(
                                      "department_description",
                                      e.target.getContent()
                                    );
                                  }}
                                />
                                {errors.department_description &&
                                  touched.department_description ? (
                                  <span className="errorMsg">
                                    {errors.department_description}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Number of Technical Lab
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="total_lab_technical"
                                  id="total_lab_technical"
                                  type="number"
                                  className={`form-control`}
                                  placeholder="Enter Total Technical Lab"
                                  autoComplete="off"
                                  value={values.total_lab_technical}
                                />
                                {errors.total_lab_technical &&
                                  touched.total_lab_technical ? (
                                  <span className="errorMsg">
                                    {errors.total_lab_technical}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Number of Executive Lab
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="total_lab_executive"
                                  id="total_lab_executive"
                                  type="number"
                                  className={`form-control`}
                                  placeholder="Enter Total Executive Lab"
                                  autoComplete="off"
                                  value={values.total_lab_executive}
                                />
                                {errors.total_lab_executive &&
                                  touched.total_lab_executive ? (
                                  <span className="errorMsg">
                                    {errors.total_lab_executive}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Number of Total Consultant Scientists
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="total_consultant_scientists"
                                  id="total_consultant_scientists"
                                  type="number"
                                  className={`form-control`}
                                  placeholder="Enter Total Consultant Scientists"
                                  autoComplete="off"
                                  value={values.total_consultant_scientists}
                                />
                                {errors.total_consultant_scientists &&
                                  touched.total_consultant_scientists ? (
                                  <span className="errorMsg">
                                    {errors.total_consultant_scientists}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Doctors
                                </label>
                                <Select
                                  isMulti
                                  name="doctor_id"
                                  options={this.state.doctors_arr}
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.doctor_name}
                                  noOptionsMessage={() => 'No Results Found'}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onInputChange={(value) => {
                                    console.log("value", value);
                                    this.getDoctorArr(value);
                                  }}
                                  onChange={(evt) => {
                                    if (evt === null) {
                                      setFieldValue("doctor_id", []);
                                    } else {
                                      // setFieldValue( "doctor_id", evt)

                                      setFieldValue(
                                        "doctor_id",
                                        [].slice.call(evt).map((val) => {
                                          return {
                                            doctor_id: val.id,
                                            doctor_name: val.doctor_name,
                                          };
                                        })
                                      );
                                    }
                                  }}
                                  placeholder="Choose Doctors"
                                />
                                {errors.doctor_id && touched.doctor_id ? (
                                  <span className="errorMsg">
                                    {errors.doctor_id}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Equipments & Instruments
                                </label>
                                <Select
                                  isMulti
                                  name="equipment_id"
                                  options={this.state.equipments_arr}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.equipment_name}
                                  noOptionsMessage={() => 'No Results Found'}
                                  onInputChange={(value) => {
                                    console.log("value", value);
                                    this.getEquipmentArr(value);
                                  }}
                                  onChange={(evt) => {
                                    console.log("evt", evt);
                                    if (evt === null) {
                                      setFieldValue("equipment_id", []);
                                    } else {
                                      // setFieldValue( "equipment_id", evt)

                                      setFieldValue(
                                        "equipment_id",
                                        [].slice.call(evt).map((val) => {
                                          return {
                                            equipment_id: val.id,
                                            equipment_name: val.equipment_name,
                                          };
                                        })
                                      );
                                    }
                                  }}
                                  placeholder="Choose Equipments & Instruments"
                                />
                                {errors.equipment_id && touched.equipment_id ? (
                                  <span className="errorMsg">
                                    {errors.equipment_id}
                                  </span>
                                ) : null}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Publications
                                </label>
                                <Select
                                  isMulti
                                  name="publication_id"
                                  options={this.state.publications_arr}
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.short_name}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  noOptionsMessage={() => 'No Results Found'}
                                  onInputChange={(value) => {
                                    console.log("value", value);
                                    this.getPublicationArr(value);
                                  }}
                                  onChange={(evt) => {
                                    console.log("evt", evt);

                                    if (evt === null) {
                                      setFieldValue("publication_id", []);
                                    } else {
                                      setFieldValue("publication_id", evt);
                                      setFieldValue(
                                        "publication_id",
                                        [].slice.call(evt).map((val) => {
                                          return {
                                            publication_id: val.id,
                                            publication_name: val.short_name,
                                          };
                                        })
                                      );
                                    }
                                  }}
                                  placeholder="Choose Publications"
                                />
                                {errors.publication_id &&
                                  touched.publication_id ? (
                                  <span className="errorMsg">
                                    {errors.publication_id}
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
                                  <i> {this.state.fileValidationMessage}</i>
                                  <br /> <i>{this.state.validationMessage}</i>
                                </label>
                                <Field
                                  name="department_image"
                                  type="file"
                                  className={`form-control`}
                                  placeholder="Doctor Image"
                                  autoComplete="off"
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
                                  {this.state.selectStatus.map((status, i) => (
                                    <option key={i} value={status.value}>
                                      {status.label}
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
                        <button
                          className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
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
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }
}
export default AddDepartment;
