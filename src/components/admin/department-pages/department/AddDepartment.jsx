/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
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
      selectProductType: [
        { value: "1", label: "Tests" },
        { value: "2", label: "Popular  Packages" },
      ],
      selectCityType: [
        { value: "1", label: "Select All Cities" },
        { value: "2", label: "Select Particular City" },
      ],
      department_id: 0,
      suggestions: [],
      
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

  fileChangedTestHandler= (event, setFieldTouched, setFieldValue, setErrors) => {
    setFieldTouched("test_image");
    setFieldValue("test_image", event.target.value);

    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        test_image: "",
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
        test_image: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        test_image:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        test_image: "",
        isValidFile: false,
      });
    }
  };

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

  // FOR AUTOSUGGEST CODE
  onSuggestionsFetchRequested = ({ value }) => {
    if (value && value.length >= 3) {
      let payload = {
        //  city_id:location.value,
        search_name: value.toUpperCase(),
      };

      if (this.state.cityType && this.state.cityType === "2") {
        payload.city_id = this.state.selectedCity.value;
      }

      API.post(`/feed/code-search-autocomplete`, payload)
        .then((res) => {
          const suggestion_list = res.data.data;
          this.setState({
            suggestions: suggestion_list.length > 0 ? suggestion_list : [],
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ suggestions: [] });
        });
    } else {
      this.setState({ suggestions: [] });
    }
  };

  onSuggestionsClearRequested = () => {};

  onChangeAutoSuggest = (event, { newValue }) => {
    this.setState({ value: newValue });
  };

  getSuggestionValue = (suggestion) => suggestion.label;

  renderSuggestion = (suggestion) => <span>{suggestion.label} </span>;

  onSuggestionSelected = (event, { suggestion, method }, setFieldTouched) => {
    if (method === "click" || method === "enter") {
      let payload = {
        search_name: suggestion.value.toUpperCase(),
      };

      if (this.state.cityType && this.state.cityType === "2") {
        payload.city_id = this.state.selectedCity.value;
      }

      API.post(`/feed/code-search`, payload)
        .then((res) => {
          if (res.data && res.data.data && res.data.data.length > 0) {
            const searchDetails = res.data.data[0];
            if (
              this.state.packageType === "2" &&
              searchDetails.PROFILE_FLAG == "T"
            ) {
              this.setState({ validProduct: false });
            } else {
              this.setState({ validProduct: true });
            }
            this.setState({ selectedValue: searchDetails }, () => {
              setFieldTouched("product");
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ selectedValue: "" }, () => {
            setFieldTouched("product");
          });
        });
    }
  };

  handleAutoSuggestClick = () => {
    this.setState({ selectedValue: "", value: "" });
  };

  Truncate = (str, number) => {
    return str.length > number ? str.substring(0, number) + "..." : str;
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

      packageType: "",
      cityType: "",
      cities: "",
      product: "",
      test_image: "",
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
                                <label>Doctors</label>
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
                                <label>Equipments & Instruments</label>
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
                                <label>Publications</label>
                                <Select
                                  isMulti
                                  name="publication_id"
                                  options={this.state.publications_arr}
                                  getOptionValue={(x) => x.id}
                                  getOptionLabel={(x) => x.short_name}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  noOptionsMessage={() => "No Results Found"}
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
                          {/*====== Test Form ======= */}
                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>Product Type</label>

                                <Field
                                  name="packageType"
                                  component="select"
                                  className={`selectArowGray form-control`}
                                  autoComplete="off"
                                  //value={values.packageType}
                                  value={this.state.packageType}
                                  onChange={(evt) => {
                                    if (evt) {
                                      const { value } = evt.target;
                                      this.setState({
                                        packageType: value,
                                        value: "",
                                        selectedValue: "",
                                        validProduct: true,
                                      });
                                      setFieldValue("packageType", value);
                                    } else {
                                      this.setState({
                                        packageType: "1",
                                        value: "",
                                        selectedValue: "",
                                        validProduct: true,
                                      });
                                      setFieldValue("packageType", "1");
                                    }
                                  }}
                                >
                                  {this.state.selectProductType.map(
                                    (element, i) => (
                                      <option key={i} value={element.value}>
                                        {element.label}
                                      </option>
                                    )
                                  )}
                                </Field>
                              </div>
                            </Col>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>City Type</label>

                                <Field
                                  name="cityType"
                                  component="select"
                                  className={`selectArowGray form-control`}
                                  autoComplete="off"
                                  // value={values.cityType}
                                  value={this.state.cityType}
                                  onChange={(evt) => {
                                    if (evt) {
                                      const { value } = evt.target;
                                      this.setState({
                                        cityType: value,
                                        value: "",
                                        selectedValue: "",
                                      });
                                      setFieldValue("cityType", value);
                                    } else {
                                      this.setState({
                                        cityType: "1",
                                        value: "",
                                        selectedValue: "",
                                      });
                                      setFieldValue("cityType", "1");
                                    }
                                  }}
                                >
                                  {this.state.selectCityType.map(
                                    (cityType, i) => (
                                      <option key={i} value={cityType.value}>
                                        {cityType.label}
                                      </option>
                                    )
                                  )}
                                </Field>
                                {/* {errors.cityType && touched.cityType ? (
                                      <span className="errorMsg">
                                        {errors.cityType}
                                      </span>
                                    ) : null} */}

                                {/* {errors.city ? (
                                      <p
                                        className="errorMsg"
                                        style={{ wordBreak: "break-word" }}
                                      >
                                        {errors.city}
                                      </p>
                                    ) : null} */}
                              </div>
                            </Col>
                            {this.state.cityType == "2" ? (
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>
                                    City
                                    <span className="impField">*</span>
                                  </label>

                                  <Select
                                    name="cities"
                                    maxMenuHeight={200}
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={true}
                                    placeholder="Select City"
                                    options={this.state.city_state_list}
                                    // value={values.cities}
                                    value={this.state.selectedCity}
                                    onChange={(evt) => {
                                      this.setState({
                                        selectedCity: evt,
                                        value: "",
                                        selectedValue: "",
                                      });
                                      setFieldValue("cities", evt);
                                    }}
                                  />
                                  {errors.cities && touched.cities ? (
                                    <p className="errorMsg">{errors.cities}</p>
                                  ) : null}
                                </div>
                              </Col>
                            ) : null}
                            <Col xs={12} sm={12} md={12}>
                              <label>Search Test Product</label>
                              <div className="form-group">
                                <div className="position-relative">
                                  <Autosuggest
                                    suggestions={this.state.suggestions}
                                    onSuggestionsFetchRequested={(req) => {
                                      this.onSuggestionsFetchRequested(req);
                                      setFieldTouched("product");
                                    }}
                                    onSuggestionsClearRequested={() => {
                                      this.onSuggestionsClearRequested();
                                      this.setState({ selectedValue: "" });
                                    }}
                                    getSuggestionValue={this.getSuggestionValue}
                                    renderSuggestion={this.renderSuggestion}
                                    focusInputOnSuggestionClick={false}
                                    inputProps={{
                                      style: {
                                        width: "100%",
                                        textTransform: "uppercase",
                                        display: "block",
                                        width: "100%",
                                        height: "34px",
                                        padding: "6px 12px",
                                        fontSize: "14px",
                                        lineHeight: "1.42857143",
                                        color: "#555555",
                                        backgroundColor: "#fff",
                                        backgroundImage: "none",
                                        border: "1px solid #d2d6de",
                                      },
                                      placeholder: "Enter Product Code",
                                      // value: this.state.value,
                                      value: this.Truncate(
                                        this.state.value,
                                        70
                                      ),
                                      onChange: this.onChangeAutoSuggest,
                                      onKeyDown: this.handleSearch,
                                      onBlur: () => setFieldTouched("product"),
                                      disabled: this.state.selectedValue != "",
                                    }}
                                    onSuggestionSelected={(event, req) => {
                                      this.onSuggestionSelected(
                                        event,
                                        req,
                                        setFieldTouched
                                      );
                                    }}
                                  />
                                  {this.state.selectedValue !== "" ? (
                                    <button
                                      onClick={() =>
                                        this.handleAutoSuggestClick()
                                      }
                                      className="crossBtn btn btn-danger pull-right"
                                    >
                                      X
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </Col>
                            {values.packageType == "1" ? (
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>
                                    Upload Test Image
                                    <span className="impField">*</span>
                                    <br />
                                    <i>{this.state.fileValidationMessage}</i>
                                    <br />
                                    <i>{this.state.validationMessage}</i>
                                  </label>
                                  <Field
                                    name="test_image"
                                    type="file"
                                    className={`form-control`}
                                    placeholder="Test Image"
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
                                  {errors.test_image && touched.test_image ? (
                                    <span className="errorMsg">
                                      {errors.test_image}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            ) : null}

                            <br></br>
                          </Row>
                          {/* ===== end test form ===== */}

                          <Row>
                            <Col xs={12} sm={12} md={12}>
                              <div className="form-group">
                                <label>
                                  Upload Department Image
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
                                    this.fileChangedTestHandler(
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
export default AddDepartment;
