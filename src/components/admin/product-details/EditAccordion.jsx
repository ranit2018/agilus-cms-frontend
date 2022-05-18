import React, { Component } from "react";
import { Row, Col, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import TinyMCE from "react-tinymce";
import API from "../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { showErrorMessage } from "../../../shared/handle_error";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import { htmlDecode, DEFAULT_CITY } from "../../../shared/helper";
import Layout from "../layout/Layout";
import SRL_API from "../../../shared/srl-axios";
import ReactHtmlParser from "react-html-parser";
import { Input } from "reactstrap";
import { reorderData, convertIntoSingleArray, spliceIntoChunks, reorderNEW } from '../ordering/reorder'

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

const scrollTo = (id) => {
  // For full window scroll bar
  let scrollDIV = document.getElementById(id);
  let scrollPosition = scrollDIV && scrollDIV.offsetTop;
  if (scrollPosition) {
    window.scrollTo({
      top: scrollPosition - 150,
      behavior: "smooth",
    });
  }
};
let add_more_counter = 1;
class AddAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      NewAccordionDetails: {},
      accordionDetails: "",
      selectedValue: "",
      suggestions: [],
      selectStatus: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      selectType: [
        { value: "1", label: "Accordion" },
        { value: "2", label: "Description" },
      ],
      selProducts: [],
      SWIhtml: "",
      tinymceValue: "",
      openPopup: false
    };
  }

  componentDidMountNew(list) {
    let prev_state = [];

    for (var j = 0; j < list.length; j++) {
      prev_state.push({
        common_err: "",
        newContent: htmlDecode(list[j].newContent),
        newDescription: htmlDecode(list[j].newDescription),
        newTitle: htmlDecode(list[j].newTitle),
        type: list[j].type,
      });
    }

    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
  }
  componentDidMount() {
    const NewAccordionDetails = this.props.location.state.NewAccordionDetails;
    // console.log("list>>", list);

    let prev_state = [];

    if (
      NewAccordionDetails.accordion_details &&
      NewAccordionDetails.accordion_details.length > 0
    ) {
      for (var i = 0; i < NewAccordionDetails.accordion_details.length; i++) {
        prev_state.push({
          common_err: "",
          newContent:
            NewAccordionDetails.accordion_details[i].type === 1
              ? htmlDecode(NewAccordionDetails.accordion_details[i].content)
              : "",
          newDescription:
            NewAccordionDetails.accordion_details[i].type === 2
              ? htmlDecode(NewAccordionDetails.accordion_details[i].content)
              : "",
          newTitle:
            NewAccordionDetails.accordion_details[i].type === 1
              ? htmlDecode(NewAccordionDetails.accordion_details[i].title)
              : "",
          type: NewAccordionDetails.accordion_details[i].type === 1 ? "1" : "2",
        });
      }
    }

    this.setState(
      { selProducts: prev_state, NewAccordionDetails: NewAccordionDetails },
      () => {
        this.getHtmlSIW(this.state.selProducts);
      }
    );
  }
  hideError = () => {
    this.setState({ errMsg: "" });
  };
  removeError = (setErrors) => {
    setErrors({});
  };

  rmError = (index) => {
    let prev_state = this.state.selProducts;
    prev_state[index].common_err = "";
    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(prev_state);
    });
  };

  handleSWI = (event, index, key) => {
    let value = "";
    if (event.target.getContent) {
      value = event.target.getContent();
    } else {
      value = event.target.value;
    }

    let prev_state = this.state.selProducts;
    prev_state[index].common_err = "";

    if (key === "type") {
      prev_state[index].type = value;
    }
    if (key === "newTitle") {
      prev_state[index].newTitle = value;
    }

    if (key === "newContent") {
      prev_state[index].newContent = value;
    }
    if (key === "newDescription") {
      prev_state[index].newDescription = value;
    }

    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(prev_state);
    });
  };

  getHtmlSIW = (theState) => {
    this.setState({ SWIhtml: "" });
    let htmlData = [];
    for (let index = 0; index < theState.length; index++) {
      const element = theState[index];
      console.log("element>>", element);
      htmlData.push(
        <div
          className="sampleCheckSec addMoreSec"
          key={`sampleCheckSec${index}`}
        >
          <div
            className="messageserror"
            style={{
              display: element.common_err !== "" ? "block" : "none",
            }}
          >
            <Link to="#" className="close">
              {/*   <button width="17.69px"
                height="22px"
                onClick={(e) => this.rmError(index)}>X</button> */}
            </Link>
          </div>

          <div className="form-group">
            <label>
              Type
              <span className="impField">*</span>
            </label>
            <Input
              name="type"
              type="select"
              className={`selectArowGray form-control`}
              autoComplete="off"
              onChange={(e) => {
                this.handleSWI(e, index, "type");
              }}
              value={element.type}
            >
              <option key="-1" value="">
                Select
              </option>
              {this.state.selectType.map((val, i) => (
                <option key={i} value={val.value}>
                  {val.label}
                </option>
              ))}
            </Input>
          </div>

          {element.type === "1" ? (
            <div>
              <div className="form-group">
                <label>
                  Title
                  <span className="impField">*</span>
                </label>
                <Field
                  name="newTitle"
                  type="text"
                  className={`form-control`}
                  placeholder="Enter Title"
                  autoComplete="off"
                  value={element.newTitle}
                  onChange={(e) => {
                    this.handleSWI(e, index, "newTitle");
                  }}
                />
              </div>
              <div className="form-group">
                <label>
                  Content
                  <span className="impField">*</span>
                </label>
                <Editor
                  initialValue={element.newContent}
                  init={{
                    height: 250,
                    menubar: false,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                    ],
                    toolbar:
                      "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    file_browser_callback_types: "image",
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype == "image") {
                        var input = document.getElementById("my-file");
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
                    this.handleSWI(e, index, "newContent");
                  }}
                />
              </div>

              {/* {index > 0 ? (
                <>
                  <Link
                    to=""
                    onClick={(e) => this.rowUp(e, index)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i> Up
                  </Link>
                  {index < theState.length - 1 ? (
                    <Link
                      to=""
                      onClick={(e) => this.rowDown(e, index)}
                      className="btn btnAdd btn-primary pull-right mb-3"
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true"></i>{" "}
                      Down
                    </Link>
                  ) : null}
                </>
              ) : (
                <Link
                  to=""
                  onClick={(e) => this.rowDown(e, index)}
                  className="btn btnAdd btn-primary pull-right mb-3"
                >
                  <i className="fa fa-arrow-down" aria-hidden="true"></i> Down
                </Link>
              )} */}
              {index == 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>

                  <Link
                    to=""
                    onClick={(e) => this.addRow(e)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-plus" aria-hidden="true"></i> Add
                  </Link>
                </div>
              )}
              {index > 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.deleteRow(e, index)}
                    className="btn btnRemove btn-danger pull-right mb-3"
                  >
                    <i className="fa fa-minus" aria-hidden="true"></i> Remove
                  </Link>
                </div>
              )}
              <div className="clearfix" />
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label>
                  Description
                  <span className="impField">*</span>
                </label>

                <Editor
                  initialValue={element.newDescription}
                  init={{
                    height: 250,
                    menubar: false,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                    ],
                    toolbar:
                      "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    file_browser_callback_types: "image",
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype == "image") {
                        var input = document.getElementById("my-file");
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
                    this.handleSWI(e, index, "newDescription");
                  }}
                />
              </div>
              {/* {index > 0 ? (
                <>
                  <Link
                    to=""
                    onClick={(e) => this.rowUp(e, index)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i> Up
                  </Link>
                  {index < theState.length - 1 ? (
                    <Link
                      to=""
                      onClick={(e) => this.rowDown(e, index)}
                      className="btn btnAdd btn-primary pull-right mb-3"
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true"></i>{" "}
                      Down
                    </Link>
                  ) : null}
                </>
              ) : (
                <Link
                  to=""
                  onClick={(e) => this.rowDown(e, index)}
                  className="btn btnAdd btn-primary pull-right mb-3"
                >
                  <i className="fa fa-arrow-down" aria-hidden="true"></i> Down
                </Link>
              )} */}
              {index == 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.addRow(e)}
                    className="btn btnAdd btn-primary pull-right mb-3"
                  >
                    <i className="fa fa-plus" aria-hidden="true"></i> Add
                  </Link>
                </div>
              )}
              {index > 0 && (
                <div>
                  <ul
                    style={{
                      color: "red",
                      marginLLeft: "0",
                      paddingLeft: "16px",
                    }}
                    className="pull-left"
                  >
                    {ReactHtmlParser(htmlDecode(element.common_err))}
                  </ul>
                  <Link
                    to=""
                    onClick={(e) => this.deleteRow(e, index)}
                    className="btn btnRemove btn-danger pull-right mb-3"
                  >
                    <i className="fa fa-minus" aria-hidden="true"></i> Remove
                  </Link>
                </div>
              )}
              <div className="clearfix" />
            </div>
          )}
          {/*   {element.type === "2" ? (
            
          ) : null} */}
          <div className="clearfix" />
        </div>
      );
    }

    this.setState({ SWIhtml: htmlData });
  };

  addRow = (e) => {
    e.preventDefault();
    add_more_counter = add_more_counter + 1;
    let prev_state = this.state.selProducts;
    prev_state.push({
      // newTitle: "",
      // newDescription: "",
      // newContent: "",
      // common_err: "",
      // type: [],
      common_err: "",
      newContent: "",
      newDescription: "",
      newTitle: "",
      type: "",
    });

    this.setState({ selProducts: prev_state }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
  };

  deleteRow = (e, sel_index) => {
    e.preventDefault();
    add_more_counter = add_more_counter - 1;
    let prev_state = this.state.selProducts;
    let new_arr = [];
    for (let index = 0; index < prev_state.length; index++) {
      const element = prev_state[index];
      if (sel_index != index) {
        new_arr.push(prev_state[index]);
      }
    }

    this.setState({ selProducts: new_arr }, () => {
      this.getHtmlSIW(this.state.selProducts);
    });
  }
  /** changed **/
  getProductDataByCode = (search_name) => {
    return new Promise((resolve, reject) => {
      let payload = {
        search_name: search_name.toUpperCase(),
      };
      SRL_API.post(`/feed/code-search`, payload)
      .then((res) => {
        if(res.data && res.data.data && res.data.data.length > 0){
          if(res.data.data.CITY_NM != null){
            const searchDetails = res.data.data[0];
            resolve(searchDetails);
          }else{
            swal({
              closeOnClickOutside: true,
              title: "Error",
              text: `This Product is in-active on SRL, You can't update the Content`,
              icon: "error",
            });
          }
      }else{
        swal({
          closeOnClickOutside: true,
          title: "Error",
          text: `This Product is in-active on SRL, You can't update the Content.`,
          icon: "error",
        });
      }
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      });
    })
  }

  handleSubmitEvent = async (values, actions) => {
    // console.log('values',values)
    const { selectedValue, NewAccordionDetails } = this.state;

    let swiData = this.state.selProducts;
    let contentarray = [];

    let url = `api/lead_landing/accordion/${NewAccordionDetails.product_code}`;
    let method = "PUT";

    let err = 0;
    for (let index = 0; index < swiData.length; index++) {

      const element = swiData[index];
      element.common_err = "";
      let err_arr = [];

      if (element.newTitle == "" && element.type === "1") {
        err_arr.push("Please enter title");
        err++;
      }

      if (element.newContent == "" && element.type === "1") {
        err_arr.push("Please enter content");
        err++;
      }

      if (element.newDescription == "" && element.type === "2") {
        err_arr.push("Please enter Description");
        err++;
      }
      if (err_arr.length > 0) {
        //err_arr.push(`${element.product_name}`);
        element.common_err = `<li>${err_arr.join("</li><li>")}`;
        swal({
          closeOnClickOutside: true,
          title: "Error",
          text: "Please fill all details",
          icon: "error",
        });
      }
    }

    if (err > 0) {
      this.setState({ selProducts: swiData }, () => {
        this.getHtmlSIW(swiData);
        scrollTo("top");
        actions.setSubmitting(false);
      });
     
    } else {
  
      for (var i = 0; i < swiData.length; i++) {
        contentarray.push({
          title: swiData[i].type === "1" ? swiData[i].newTitle : "",
          content:
            swiData[i].type === "1"
              ? swiData[i].newContent
              : swiData[i].newDescription,
          type: swiData[i].type, 
        });
      }

      let product_city = NewAccordionDetails.product_city;
      let product_type = NewAccordionDetails.product_type;
      if(!product_city || !product_type){
        const product_data = await this.getProductDataByCode(NewAccordionDetails.product_code);
        if(product_data){
          product_city = product_data.CITY_NM;
          product_type = product_data.PROFILE_FLAG;
        }
      }

      let post_data_product = {
        product_name: NewAccordionDetails.product_name,
        product_code: NewAccordionDetails.product_code,
        product_type: product_type,
        product_city: product_city, 
        product_id: NewAccordionDetails.product_id,
      };
      
      API({
        method: method,
        url: url,
        data: {
          accordion_details: contentarray,
          status: values.status,
          product: post_data_product,
        },
      })
        .then((res) => {
          this.setState({ showModal: false, value: "", selectedValue: "" });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Record updated successfully.",
            icon: "success",
          }).then(() => {
            this.props.history.push("/product-details/accordion");
          });
        })
        .catch((err) => {
          this.setState({
            // showModalLoader: false,
            // value: "",
            // selectedValue: "",
          });
          if (err.data.status === 3) {
            this.setState({
              showModal: false,
              value: "",
              selectedValue: "",
            });
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };

  // rowUp = (e, index) => {
  //   e.preventDefault();
  //   var prev_state = this.state.selProducts;
  //   var b = prev_state[index];
  //   prev_state[index] = prev_state[index - 1];
  //   prev_state[index - 1] = b;

  //   this.setState({ selProducts: prev_state }, () => {
  //     //  this.getHtmlSIW(this.state.selProducts);
  //     this.componentDidMountNew(prev_state);
  //   });
  // };
  // rowDown = (e, index) => {
  //   e.preventDefault();
  //   var prev_state = this.state.selProducts;
  //   var b = prev_state[index];
  //   prev_state[index] = prev_state[index + 1];
  //   prev_state[index + 1] = b;

  //   this.setState({ selProducts: prev_state }, () => {
  //     //this.getHtmlSIW(this.state.selProducts);
  //     this.componentDidMountNew(prev_state);
  //   });
  // };

  imageModalCloseHandler = () => {
    this.setState({ openPopup: false });
  }

  handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = reorderNEW(this.state.selProducts, result.source.index, result.destination.index);
    this.setState({
      selProducts: items,
    }, () => {
      this.getHtmlSIW(items);
    })
    
  }

  dragFunction = () => {
    return (
      <DragDropContext onDragEnd={this.handleOnDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal" >
          {(provided, snapshot) => (
            <div
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {this.state.selProducts.map((val, i) => (
                <Draggable
                  key={i}
                  draggableId={String(i)}
                  index={i}
                >
                  {(provided, snapshot) => (
                    <div
                      className="col-sm-3"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <div className="drag-box">
                        <span>
                          {val.type == 1 ? 'Accordion' : 'Description'}
                        </span>
                        {/* <span>
                          {val.type == 1 ? val.newTitle : ''}
                        </span>
                        <span>
                          {val.type == 1 ? val.newContent : val.newDescription}
                        </span> */}

                      </div>
                    </div>)}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  render() {
    const NewAccordionDetails = this.props.location.state.NewAccordionDetails;

    // console.log("this.state.selProducts in render==", this.state.selProducts);
    const newInitialValues = {
      product: NewAccordionDetails.product_name
        ? NewAccordionDetails.product_name
        : "",

      status:
        NewAccordionDetails.status || +NewAccordionDetails.status === 0
          ? NewAccordionDetails.status.toString()
          : "",
    };

    const validateStopFlag = Yup.object().shape({
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),

      description: Yup.string().when("type", {
        is: "Description",
        then: Yup.string().required("Please enter Description"),
      }),
    });
    return (
      <Layout {...this.props}>
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              Edit Accordion
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

            <input
              type="button"
              value="Change Ordering"
              className="btn btn-primary btn-sm"
              onClick={() => {
                console.log('this.state.selProducts', this.state.selProducts);
                this.setState({ openPopup: true });
              }}
              style={{ right: "83px", position: "absolute", top: "13px" }}
            />

          </section>

          {this.state.openPopup && this.state.selProducts.length > 1 && this.dragFunction()}

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
                    setFieldTouched,
                    setFieldValue,
                  }) => {
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
                                <label>Product</label>
                                <Field
                                  name="product"
                                  type="text"
                                  className={`form-control`}
                                  placeholder="Enter Title"
                                  autoComplete="off"
                                  value={values.product}
                                  disabled
                                />
                              </div>
                            </Col>

                            <Col xs={12} sm={12} md={12}>
                              {this.state.SWIhtml}
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
                                  {this.state.selectStatus.map((val, i) => (
                                    <option key={i} value={val.value}>
                                      {val.label}
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

            {/* <Modal
              show={this.state.openPopup}
              onHide={this.imageModalCloseHandler}
              backdrop='static'
            >
              <Modal.Header closeButton>Change Order</Modal.Header>
              <Modal.Body>
                <center>
                  
                </center>
              </Modal.Body>
            </Modal> */}

          </section>
        </div>
      </Layout>
    );
  }
}
export default AddAccordion;