import React, { Component } from "react";
import { Row, Col, Button, Modal } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import "./Email.css";
import swal from "sweetalert";
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../shared/helper";
import Select from "react-select";
import Layout from "../layout/Layout";
import Dropzone from "react-dropzone";
import TimeKeeper from "react-timekeeper";
import dateFormat from "dateformat";
import DatePicker from "react-datepicker";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.
import ReactChipInput from "react-chip-input";
import ChipInput from "material-ui-chip-input";

const stringFormat = (str) => {
  str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
  str = str.split(" ");
  const strArr = [];
  console.log(str);

  for (let i in str) {
    if (str[i] !== "") {
      strArr.push(str[i]);
    }
  }
  const formatedString = strArr.join("-");
  return formatedString.toLowerCase();
};

class Thumb extends React.Component {
  state = {
    loading: false,
    thumb: undefined,
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.file) {
      return;
    }

    this.setState({ loading: true }, () => {
      let reader = new FileReader();

      reader.onloadend = () => {
        this.setState({ loading: false, thumb: reader.result });
      };

      reader.readAsDataURL(nextProps.file);
    });
  }

  render() {
    const { file } = this.props;
    const { loading, thumb } = this.state;
    if (!file) {
      return null;
    }
    return (
      <>
        <Field
          type="radio"
          name="default_image"
          value={file.name}
          className="diBlock vTop mR"
          onChange={() => this.props.setFieldValue("default_image", file.name)}
        />
        <span className="diBlock vTop">
          <div className="bannerPic">
            <div className="bannerClose">
              <i
                className="fa fa-trash"
                aria-hidden="true"
                onClick={(e) => this.props.remove(this.props.index, file)}
              ></i>
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
};
const initialValues = {
  featured_image: "",
  title: "",
  content: "",
  status: "",
  event_date: "",
  event_time: "",
  event_location: "",
};

const setDateValue = (cell) => {
  if (cell && cell != "") {
    var date = new Date(cell);
    var formatedDate = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;
    return formatedDate;
  } else {
    return "---";
  }
};

function formatAMPM(date) {
  // date = new Date("1970-01-01 " + date);;
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

class AddEvent extends Component {
  constructor(props) {
    super(props);

    this.onDrop = (files) => {
      this.setState({ files });
    };

    this.state = {
      chips: [],
      region: [],
      state: [],
      handleRegion: "",
      handleState: [],

      time: formatAMPM(new Date()),
      featured_image: "",
      selectedCategoryList: [],
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
      selectMedium: [
        { value: "2", label: "Event" },
        { value: "3", label: "Camp" },
      ],
      files: [],
      thumbNailModal: false,
      timePickerModal: false,
    };
  }
  addChip = (value) => {
    const chips = this.state.chips.slice();
    chips.push(value);
    this.setState({ chips });
  };
  removeChip = (index) => {
    const chips = this.state.chips.slice();
    chips.splice(index, 1);
    this.setState({ chips });
  };

  changeHandler = (newValue) => {
    const newValuesArr = newValue ? newValue.map((item) => item.value) : [];
    this.setState({ handleState: newValuesArr });
    // this.emailState();
  };

  // //////////////////////////////////

  emailRegion = (e) => {
    API.get(`/api/feed/all-region`)
      .then((res) => {
        this.setState({ region: res.data.data });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  emailState = (id) => {
    if (id != undefined) {
      API.get(`/api/feed/all-state/${id}`)
        .then((res) => {
          this.setState({ state: res.data.data });
        })
        .catch((err) => {
          this.setState({
            isLoading: false,
          });
          showErrorMessage(err, this.props);
        });
    }
  };

  // //////////////////////////////

  componentDidMount() {
    this.emailRegion();
    // this.emailState();

    // this.setState({
    //   validationMessage: generateResolutionText("event"),
    //   fileValidationMessage: FILE_VALIDATION_MASSAGE,
    // });
  }
  // componentDidUpdate() {
  //   this.emailState();
  // }

  handleSubmitEvent = async (values, actions) => {
    let method = "";
    let url = "/api/events";
    if (values.featured_image.length > 20) {
      actions.setErrors({ errors: "Only 20 images can be added" });
      actions.setSubmitting(false);
    } else {
      if (values.default_image === "") {
        actions.setErrors({ default_image: "Please select default image." });
        actions.setSubmitting(false);
      } else {
        const formData = new FormData();
        formData.append("medium_id", values.medium_id);
        formData.append("title", values.title);
        formData.append("event_location", values.event_location);
        formData.append("event_date", setDateValue(values.event_date));
        formData.append("event_time", values.event_time);
        formData.append("content", values.content);
        formData.append("default_image", values.default_image);
        formData.append("permalink", values.permalink);
        formData.append("meta_title", values.meta_title);
        formData.append("meta_description", values.meta_description);
        formData.append("keywords", values.keywords.toString());
        formData.append("status", values.status);
        let rejectImage = [];
        let err_count = 0;
        if (values.featured_image.length > 0) {
          for (let i = 0; i < values.featured_image.length; i++) {
            if (values.featured_image[i].size > FILE_SIZE) {
              rejectImage.push({
                name: values.featured_image[i].name,
                err: FILE_VALIDATION_SIZE_ERROR_MASSAGE,
              });
              err_count++;
            } else {
              let dimension = await getHeightWidth(values.featured_image[i]);
              const { height, width } = dimension;
              const eventDimension = getResolution("event");
              console.log(
                dimension,
                height != eventDimension.height || width != eventDimension.width
              );
              if (
                height != eventDimension.height ||
                width != eventDimension.width
              ) {
                rejectImage.push({
                  name: values.featured_image[i].name,
                  err: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
                });
                err_count++;
              }
            }
          }
        }

        if (err_count == 0) {
          if (values.featured_image.length > 0) {
            console.log(values.featured_image);
            for (let i = 0; i < values.featured_image.length; i++) {
              formData.append("featured_image", values.featured_image[i]);
            }
          }
          // if (values.category_id.length > 1) {
          //     for (let i = 0; i < values.category_id.length; i++) {
          //         formData.append('category_id', values.category_id[i]);
          //     }
          // } else {
          //     formData.append('category_id[]', values.category_id);
          // }
          method = "POST";
          url = `/api/events/`;
          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Record added successfully.",
                icon: "success",
              }).then(() => {
                this.props.history.push("/events");
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
        } else {
          actions.setFieldValue("rejected_image", rejectImage);
          actions.setSubmitting(false);
        }
      }
    }
  };

  render() {
    const newInitialValues = {
      featured_image: [],
      default_image: "",
      title: "",
      content: "",
      event_time: "",
      event_date: "",
      event_location: "",
      // category_id: "",
      status: "",
      medium_id: "",
      permalink: "",
      keywords: [],
      rejected_image: [],
      meta_title: "",
      meta_description: "",
      errors: "",
    };

    const validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter the title"),
      region: Yup.string().required("Please enter the Region"),
      state: Yup.string().required("Please enter the State"),
    });

    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Add Email
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
                    const remove = (index, file) => {
                      const newFiles = [...values.featured_image]; // make a var for the new array
                      newFiles.splice(index, 1);
                      setFieldValue("rejected_image", []);
                      if (newFiles.length == 0) {
                        setErrors({
                          featured_image: "Please select at least one image",
                        });
                        setFieldValue("featured_image", newFiles);
                      } else {
                        setFieldValue("featured_image", newFiles);
                      }
                      if (values.default_image === file.name) {
                        setFieldValue("default_image", "");
                      }
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
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>
                                    Region
                                    <span className="impField">*</span>
                                  </label>
                                  <Field
                                    name="region"
                                    component="select"
                                    className={`selectArowGray form-control`}
                                    autoComplete="off"
                                    value={values.region}
                                    onClick={() => {
                                      this.setState({
                                        handleRegion: values.region,
                                      });
                                      this.emailState(values.region);
                                    }}
                                  >
                                    <option key="-1" value="">
                                      Select Type
                                    </option>
                                    {this.state.region.map((region, i) => (
                                      <option key={i} value={region.value}>
                                        {region.label}
                                      </option>
                                    ))}
                                  </Field>
                                  {errors.region && touched.region ? (
                                    <span className="errorMsg">
                                      {errors.region}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>

                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>
                                    State
                                    <span className="impField">*</span>
                                  </label>
                                  <Select
                                    name="state"
                                    options={this.state.state}
                                    isMulti={true}
                                    value={values.state}
                                    onChange={this.changeHandler}
                                  ></Select>
                                  {errors.state && touched.state ? (
                                    <span className="errorMsg">
                                      {errors.state}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12} sm={12} md={12}>
                                <div className="form-group">
                                  <label>
                                    Email
                                    <span className="impField">*</span>
                                  </label>

                                  <ChipInput
                                    allowDuplicates={false}
                                    fullWidth={true}
                                    value={this.state.chips}
                                    onAdd={(chip) => this.addChip(chip)}
                                    onDelete={(chip, index) =>
                                      this.removeChip(index)
                                    }
                                  />

                                  {errors.title && touched.title ? (
                                    <span className="errorMsg">
                                      {errors.title}
                                    </span>
                                  ) : null}
                                </div>
                              </Col>
                            </Row>
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
                          {this.state.banner_id > 0
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
export default AddEvent;
