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
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

class EditDepartment extends Component {
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
      selectProductType: [
        { value: "1", label: "Tests" },
        { value: "2", label: "Popular  Packages" },
      ],
      selectCityType: [
        { value: "1", label: "Select All Cities" },
        { value: "2", label: "Select Particular City" },
      ],
      department_id: this.props.match.params.id,
      doctors_arr: [],
      equipments_arr: [],
      publications_arr: [],
      isValidFile: false,

      cityType: "1",
      packageType: "1",
      product: "",
      suggestions: [],
      city_state_list: [],
      selectedCity: {
        city_name: "MUMBAI",
        label: "Mumbai (Maharashtra)",
        state_id: 15,
        value: 304,
      },
      value: "",
      selectedValue: "",
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
    if (value.length == 3) {
      API.get(`/api/department/doctor-search-list?doctor_name=${value}`)
        .then((res) => {
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
    // let postdata = {
    //   department_name: values.department_name,
    //   department_description: values.department_description,
    //   total_lab_technical: values.total_lab_technical,
    //   total_lab_executive: values.total_lab_executive,
    //   doctor_id: values.doctor_id,
    //   equipment_id: values.equipment_id,
    //   publication_id: values.publication_id,
    //   department_image: values.department_image,
    //   date_posted: new Date().toLocaleString(),
    //   status: String(values.status),
    // };
    // console.log("postdata", postdata);

    let formData = new FormData();

    formData.append("department_name", values.department_name);
    formData.append("department_description", values.department_description);
    formData.append("total_lab_technical", values.total_lab_technical);
    formData.append("total_lab_executive", values.total_lab_executive);
    formData.append(
      "total_consultant_scientists",
      values.total_consultant_scientists
    );
    formData.append("doctors[]", JSON.stringify(values.doctor_id));
    formData.append("equipments[]", JSON.stringify(values.equipment_id));
    formData.append("publications[]", JSON.stringify(values.publication_id));
    formData.append("status", String(values.status));

    let url = `/api/department/doctor/${this.props.match.params.id}`;
    let method = "PUT";
    if (this.state.department_image) {
      if (this.state.department_image.size > FILE_SIZE) {
        actions.setErrors({
          department_image: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
        });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.department_image).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("department");

          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
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
                this.setState({ showModal: false });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Record updated successfully.",
                  icon: "success",
                }).then(() => {
                  this.props.history.push("/department/departments");
                });
              })
              .catch((err) => {
                this.setState({ showModalLoader: false });
                if (err.data.status === 3) {
                  this.setState({
                    showModal: false,
                    department_image: "",
                  });
                  showErrorMessage(err, this.props);
                } else {
                  actions.setErrors(err.data.errors);
                  actions.setSubmitting(false);
                }
              });
          }
        });
      }
    } else {
      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/department/doctor");
          });
        })
        .catch((err) => {
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
    }
  };

  render() {
    const { alldata } = this.props.location.state;
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

      packageType: "",
      cityType: "",
      cities: "",
      product: "",
      test_image: "",
    };

    const newInitialValues = Object.assign(initialValues, {
      id: alldata.id ? alldata.id : "",
      department_image: "",
      department_name: htmlDecode(alldata.department_name),
      department_description: htmlDecode(alldata.department_description),
      total_lab_technical: alldata.total_lab_technical
        ? alldata.total_lab_technical
        : "",
      total_lab_executive: alldata.total_lab_executive
        ? alldata.total_lab_executive
        : "",
      total_consultant_scientists: alldata.total_consultant_scientists
        ? alldata.total_consultant_scientists
        : "",
      doctors:
        alldata.doctor_id || alldata.doctor_id === 0
          ? alldata.doctor_id.toString()
          : "",
      equipments:
        alldata.equipment_id || alldata.equipment_id === 0
          ? alldata.equipment_id.toString()
          : "",
      publications:
        alldata.publication_id || alldata.publication_id === 0
          ? alldata.publication_id.toString()
          : "",
      date_posted: alldata.date_posted ? alldata.date_posted : "",
      status:
        alldata.status || alldata.status === 0 ? alldata.status.toString() : "",
    });

    const validateStopFlag = Yup.object().shape({
      department_image: Yup.string()
        .notRequired()
        .test(
          "doctorimage",
          "Only files with the following extensions are allowed: png jpg jpeg",
          (department_image) => {
            if (department_image) {
              return this.state.isValidFile;
            } else {
              return true;
            }
          }
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
      equipment_id: Yup.array().optional(),
      publication_id: Yup.array().optional(),
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
                    setErrors,
                  }) => {
                    return (
                      <Form>
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
                                  content={values.department_description}
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
                                  Number of total_consultant_scientists
                                  <span className="impField">*</span>
                                </label>
                                <Field
                                  name="total_consultant_scientists"
                                  id="total_consultant_scientists"
                                  type="number"
                                  className={`form-control`}
                                  placeholder="Enter Total consultant scientists"
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
                                <label>Doctor</label>
                                <Select
                                  isMulti
                                  name="doctor_id"
                                  options={this.state.doctors_arr}
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.doctor_name}
                                  noOptionsMessage={() => "No Results Found"}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onInputChange={(value) => {
                                    this.getDoctorArr(value);
                                  }}
                                  onChange={(evt) => {
                                    if (evt === null) {
                                      setFieldValue("doctor_id", []);
                                    } else {
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
                                  placeholder="Choose Doctor Name"
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
                                <label>Equipment & Instrument</label>
                                <Select
                                  isMulti
                                  name="equipment_id"
                                  options={this.state.equipments_arr}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.equipment_name}
                                  noOptionsMessage={() => "No Results Found"}
                                  onInputChange={(value) => {
                                    this.getEquipmentArr(value);
                                  }}
                                  onChange={(evt) => {
                                    if (evt === null) {
                                      setFieldValue("equipment_id", []);
                                    } else {
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
                                  placeholder="Choose Equipment & Instrument"
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
                                <label>Publication</label>
                                <Select
                                  isMulti
                                  name="publication_id"
                                  options={this.state.publications_arr}
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.short_name}
                                  noOptionsMessage={() => "No Results Found"}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onInputChange={(value) => {
                                    this.getPublicationArr(value);
                                  }}
                                  onChange={(evt) => {
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
                          className={`btn btn-success btn-sm ${
                            isValid ? "btn-custom-green" : "btn-disable"
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
export default EditDepartment;
