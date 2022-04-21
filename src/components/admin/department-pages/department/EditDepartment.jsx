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
  getUniqueListBy,
} from "../../../../shared/helper";
import Layout from "../../layout/Layout";
import Select from "react-select";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.
import Loader from "../../../shared-components/Loader";

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

      department_id: this.props.match.params.id,
      departmentDetails: [],
      doctors_arr: [],
      doctor_data: "",
      selected_doctors: "",
      equipments_arr: [],
      publications_arr: [],
      product_arr: [],
      isValidFile: false,
      isLoading: true,

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
    this.getAllDoctors();
    this.getAllEquipments();
    this.getAllPublications();
    this.getAllProducts();
    this.getDepartmentById(this.state.department_id);

    this.setState({
      validationMessage: generateResolutionText("department"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  getAllDoctors = () => {
    API.get(`/api/department/doctor-search-list`)
      .then((res) => {
        this.setState({
          doctors_arr: res.data.data,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  getAllEquipments = () => {
    API.get(`/api/department/equipment-search-list`)
      .then((res) => {
        this.setState({
          equipments_arr: res.data.data,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  getAllPublications = () => {
    API.get(`/api/department/publication-search-list`)
      .then((res) => {
        this.setState({
          publications_arr: res.data.data,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  getAllProducts = () => {
    API.get(`api/department/test-search-list`)
      .then((res) => {
        this.setState({
          product_arr: res.data.data,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  getDepartmentById = (id) => {
    API.get(`/api/department/${id}`)
      .then((res) => {
        this.setState({
          departmentDetails: res.data.data[0],
          selected_doctors: res.data.data[0].doctors,
          selected_equipments: res.data.data[0].equipments,
          selected_publications: res.data.data[0].publications,
          selected_products: res.data.data[0].products,
          department_id: res.data.data[0].id,
          isLoading: false,
        });
      })
      .catch((err) => {
        showErrorMessage(err, this.props);
      });
  };

  getDoctorArr = (value) => {
    if (value.length == 3) {
      API.get(`/api/department/doctor-search-list?doctor_name=${value}`)
        .then((res) => {
          let doctors_arr = [...this.state.doctors_arr, ...res.data.data];
          doctors_arr = getUniqueListBy(doctors_arr, "id");

          this.setState({
            doctors_arr: doctors_arr,
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
      API.get(`/api/department/equipment-search-list?equipment_name=${value}`)
        .then((res) => {
          let equipments_arr = [...this.state.equipments_arr, ...res.data.data];
          equipments_arr = getUniqueListBy(equipments_arr, "id");

          this.setState({
            equipments_arr: res.data.data,
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
          let publications_arr = [
            ...this.state.publications_arr,
            ...res.data.data,
          ];
          publications_arr = getUniqueListBy(publications_arr, "id");

          this.setState({
            publications_arr: res.data.data,
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

  getProductArr = (value) => {
    if (value.length == 3) {
      API.get(`api/lead_landing/product`)
        .then((res) => {
          let product_arr = [...this.state.product_arr, ...res.data.data];
          product_arr = getUniqueListBy(product_arr, "id");

          this.setState({
            product_arr: res.data.data,
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
    let formData = new FormData();

    formData.append("department_name", values.department_name);
    formData.append("department_description", values.department_description);
    formData.append("total_lab_technical", values.total_lab_technical);
    formData.append("total_lab_executive", values.total_lab_executive);
    formData.append(
      "total_consultant_scientists",
      values.total_consultant_scientists
    );
    formData.append("doctors[]", JSON.stringify(values.doctors));
    formData.append("equipments[]", JSON.stringify(values.equipments));
    formData.append("publications[]", JSON.stringify(values.publications));
    formData.append("tests[]", JSON.stringify(values.products));

    formData.append("status", String(values.status));

    let url = `/api/department/${this.state.department_id}`;
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
            this.props.history.push("/department/departments");
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
    const {
      departmentDetails,
      selected_doctors,
      selected_equipments,
      selected_publications,
      selected_products,
      isLoading,
    } = this.state;

    const initialValues = {
      id: "",
      department_name: "",
      department_image: "",
      department_description: "",
      total_lab_technical: "",
      total_lab_executive: "",
      total_consultant_scientists: "",
      doctors: "",
      equipments: "",
      publications: "",
      products: "",
      date_posted: "",
      status: "",
    };

    const newInitialValues = Object.assign(initialValues, {
      id: departmentDetails.id ? departmentDetails.id : "",
      department_image: "",
      department_name: departmentDetails.department_name,
      department_description: htmlDecode(
        departmentDetails.department_description
      ),
      total_lab_technical: departmentDetails.total_lab_technical
        ? departmentDetails.total_lab_technical
        : 0,
      total_lab_executive: departmentDetails.total_lab_executive
        ? departmentDetails.total_lab_executive
        : 0,
      total_consultant_scientists: departmentDetails.total_consultant_scientists
        ? departmentDetails.total_consultant_scientists
        : 0,
      doctors: selected_doctors ? selected_doctors : "",
      equipments: selected_equipments ? selected_equipments : "",
      publications: selected_publications ? selected_publications : "",
      products: selected_products ? selected_products : "",
      date_posted: departmentDetails.date_posted
        ? departmentDetails.date_posted
        : "",
      status:
        departmentDetails.status || departmentDetails.status === 0
          ? departmentDetails.status.toString()
          : "",
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
      department_name: Yup.string()
        .min(5, "please add at least five characters")
        .max(100, "department name cannot be more than 100  characters")
        .required("Please enter department name")
        .matches(/^[a-zA-Z'.]+( [a-zA-Z'.]+)*$/, "department name validation field"),
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
      doctors: Yup.array().optional(),
      equipments: Yup.array().optional(),
      publications: Yup.array().optional(),
      products: Yup.array().optional(),
      status: Yup.number().required("Please select status"),
    });

    return (
      <Layout {...this.props}>
        {isLoading ? (
          <>
            <Loader/>
          </>
        ) : (
          <div className="content-wrapper">
            <section className="content-header">
              <h1>
                Edit Department
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
                                  <label>Doctors</label>
                                  <Select
                                    isMulti
                                    name="doctors"
                                    maxMenuHeight={200}
                                    options={this.state.doctors_arr}
                                    getOptionValue={(x) => x.id}
                                    getOptionLabel={(x) => x.doctor_name}
                                    noOptionsMessage={() => "No Results Found"}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    value={values.doctors}
                                    onInputChange={(value) => {
                                      this.getDoctorArr(value);
                                    }}
                                    onChange={(evt) => {
                                      if (evt === null) {
                                        setFieldValue("doctors", []);
                                      } else {
                                        setFieldValue(
                                          "doctors",
                                          [].slice.call(evt).map((val) => {
                                            return {
                                              id: val.id,
                                              doctor_name: val.doctor_name,
                                            };
                                          })
                                        );
                                      }
                                    }}
                                    placeholder="Choose Doctor Name"
                                  />
                                  {errors.doctors && touched.doctors ? (
                                    <span className="errorMsg">
                                      {errors.doctors}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>Equipments & Instruments</label>
                                  <Select
                                    isMulti
                                    name="equipments"
                                    options={this.state.equipments_arr}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    getOptionValue={(x) => x.id}
                                    getOptionLabel={(x) => x.equipment_name}
                                    noOptionsMessage={() => "No Results Found"}
                                    value={values.equipments}
                                    onInputChange={(value) => {
                                      this.getEquipmentArr(value);
                                    }}
                                    onChange={(evt) => {
                                      if (evt === null) {
                                        setFieldValue("equipments", []);
                                      } else {
                                        setFieldValue(
                                          "equipments",
                                          [].slice.call(evt).map((val) => {
                                            return {
                                              id: val.id,
                                              equipment_name:
                                                val.equipment_name,
                                            };
                                          })
                                        );
                                      }
                                    }}
                                    placeholder="Choose Equipment & Instrument"
                                  />
                                  {errors.equipments && touched.equipments ? (
                                    <span className="errorMsg">
                                      {errors.equipments}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>Publications</label>
                                  <Select
                                    isMulti
                                    name="publications"
                                    options={this.state.publications_arr}
                                    getOptionValue={(x) => x.id}
                                    getOptionLabel={(x) => x.short_name}
                                    noOptionsMessage={() => "No Results Found"}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    value={values.publications}
                                    onInputChange={(value) => {
                                      this.getPublicationArr(value);
                                    }}
                                    onChange={(evt) => {
                                      if (evt === null) {
                                        setFieldValue("publications", []);
                                      } else {
                                        setFieldValue("publications", evt);
                                        setFieldValue(
                                          "publications",
                                          [].slice.call(evt).map((val) => {
                                            return {
                                              id: val.id,
                                              short_name: val.short_name,
                                            };
                                          })
                                        );
                                      }
                                    }}
                                    placeholder="Choose Publications"
                                  />
                                  {errors.publications &&
                                  touched.publications ? (
                                    <span className="errorMsg">
                                      {errors.publications}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
                            {/*====== Test Form ======= */}
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>Search Products</label>
                                  <Select
                                    isMulti
                                    name="products"
                                    options={this.state.product_arr}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    getOptionValue={(x) => x.id}
                                    getOptionLabel={(x) => x.product_name}
                                    noOptionsMessage={() => "No Results Found"}
                                    value={values.products}
                                    onInputChange={(value) => {
                                      this.getProductArr(value);
                                    }}
                                    onChange={(evt) => {
                                      if (evt === null) {
                                        setFieldValue("products", []);
                                      } else {
                                        // setFieldValue( "product_id", evt)

                                        setFieldValue(
                                          "products",
                                          [].slice.call(evt).map((val) => {
                                            return {
                                              id: val.id,
                                              product_name: val.product_name,
                                            };
                                          })
                                        );
                                      }
                                    }}
                                    placeholder="Choose Product Code"
                                  />
                                  {errors.product && touched.product ? (
                                    <span className="errorMsg">
                                      {errors.product}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>

                            {/* ===== end test form ===== */}
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
                                    placeholder="Department Image"
                                    autoComplete="off"
                                    value={values.department_image}
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
        )}
      </Layout>
    );
  }
}
export default EditDepartment;
