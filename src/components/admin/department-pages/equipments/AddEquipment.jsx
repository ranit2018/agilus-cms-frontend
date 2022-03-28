// import React, { Component } from "react";
// import { Row, Col, Button, Alert, } from "react-bootstrap";
// import { Formik, Field, Form } from "formik";
// // import { Editor } from "@tinymce/tinymce-react";
// import API from "../../../../shared/admin-axios";
// import Dropzone from "react-dropzone";
// import * as Yup from "yup";
// import swal from "sweetalert";
// import { showErrorMessage } from "../../../../shared/handle_error";
// import { trimString } from "../../../../shared/helper"
// import Select from "react-select";
// import {
//   htmlDecode,
//   getHeightWidth,
//   generateResolutionText,
//   getResolution,
//   FILE_VALIDATION_MASSAGE,
//   FILE_SIZE,
//   FILE_VALIDATION_TYPE_ERROR_MASSAGE,
//   FILE_VALIDATION_SIZE_ERROR_MASSAGE,
// } from "../../../../shared/helper";
// import Layout from "../../layout/Layout";
// import TinyMCE from 'react-tinymce';
// import { tinymce } from "react-tinymce";
// import TagsInput from "react-tagsinput";
// import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

// // const stringFormat = (str) => {
// //   str = str.replace(/[-[\]{}@'!*+?.,/;\\^$|#\s]/g, " ");
// //   str = str.split(" ");
// //   const strArr = [];
// //   console.log(str);

// //   for (let i in str) {
// //     if (str[i] !== "") {
// //       strArr.push(str[i]);
// //     }
// //   }
// //   const formatedString = strArr.join("-");
// //   return formatedString.toLowerCase();
// // };

// const removeDropZoneFiles = (fileName, objRef, setErrors) => {
//   var newArr = [];
//   for (let index = 0; index < objRef.state.files.length; index++) {
//     const element = objRef.state.files[index];

//     if (fileName === element.name) {
//     } else {
//       newArr.push(element);
//     }
//   }

//   var fileListHtml = newArr.map((file) => (
//     <Alert key={file.name}>
//       <span onClick={() => removeDropZoneFiles(file.name, objRef, setErrors)}>
//         <i className="far fa-times-circle"></i>
//       </span>{" "}
//       {file.name}
//     </Alert>
//   ));
//   setErrors({ file_name: "" });
//   objRef.setState({
//     files: newArr,
//     filesHtml: fileListHtml,
//   });
// };


// class AddEquipment extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       selectStatus: [
//         { value: "0", label: "Inactive" },
//         { value: "1", label: "Active" },
//       ],
//       files: [],
//       equipment_id: 0,
//       prev_files: [],
//       file_name: [],
//       clonePrevFiles: [],
//     };
//   }

//   // fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
//   //   setFieldTouched("images");
//   //   setFieldValue("images", event.target.value);

//   //   const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
//   //   if (!event.target.files[0]) {
//   //     //Supported
//   //     this.setState({
//   //       images: "",
//   //       isValidFile: true,
//   //     });
//   //     return;
//   //   }
//   //   if (
//   //     event.target.files &&
//   //     SUPPORTED_FORMATS.includes(event.target.file.type)
//   //   ) { 
//   //     //Supported
//   //     this.setState({
//   //       images: event.target.files,
//   //       isValidFile: true,
//   //     });
//   //   } else {
//   //     //Unsupported
//   //     setErrors({
//   //       images:
//   //         "Only files with the following extensions are allowed: png jpg jpeg",
//   //     }); //Not working- So Added validation in "yup"
//   //     this.setState({
//   //       images: "",
//   //       isValidFile: false,
//   //     });
//   //   }
//   // };

//   componentDidMount() {
//     this.setState({
//       validationMessage: generateResolutionText("equipment"),
//       fileValidationMessage: FILE_VALIDATION_MASSAGE,
//     });
//   }

//   handleSubmitEvent = (values, actions) => {
//     let postdata = {
//       equipment_name: values.equipment_name,
//       equipment_description: values.equipment_description,
//       images: values.file_name,
//       date_posted: new Date().toLocaleString(),
//       status: String(values.status),
//     };
//     console.log("postdata", postdata);

//     //  // file upload
//     //  if (this.state.files && this.state.files.length > 0) {
//     //   for (let index = 0; index < this.state.files.length; index++) {
//     //     const element = this.state.files[index];
//     //     formData.append("file", element);
//     //   }
//     //   // for (const file of this.state.files) {
//     //   //     alert(file);
//     //   //     formData.append('file', file)
//     //   // }
//     //   //formData.append('file', this.state.file);
//     // } else {
//     //   formData.append("file", "");
//     // }

//     // let formData = new FormData();

//     // formData.append("equipment_name", values.equipment_name);
//     // formData.append("equipment_description", values.equipment_description);
//     // formData.append("status", String(values.status));

//     // let url = `/api/department/equipment`;
//     // let method = "POST";
//     // if (this.state.images.size > FILE_SIZE) {
//     //   actions.setErrors({ images: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
//     //   actions.setSubmitting(false);
//     // } else {
//     //   getHeightWidth(this.state.images).then((dimension) => {
//     //     const { height, width } = dimension;
//     //     const offerDimension = getResolution("equipment");
//     //     if (height != offerDimension.height || width != offerDimension.width) {
//     //       actions.setErrors({
//     //         images: FILE_VALIDATION_TYPE_ERROR_MASSAGE,
//     //       });
//     //       actions.setSubmitting(false);
//     //     } else {
//     //       formData.append("images", this.state.images);

//     //       API({
//     //         method: method,
//     //         url: url,
//     //         data: formData,
//     //       })
//     //         .then((res) => {
//     //           this.setState({ showModal: false, images: "" });
//     //           swal({
//     //             closeOnClickOutside: false,
//     //             title: "Success",
//     //             text: "Added Successfully",
//     //             icon: "success",
//     //           }).then(() => {
//     //             this.props.history.push("/department/equipment");
//     //           });
//     //         })
//     //         .catch((err) => {
//     //           this.setState({
//     //             closeModal: true,
//     //             showModalLoader: false,
//     //             images: "",
//     //           });
//     //           if (err.data.status === 3) {
//     //             showErrorMessage(err, this.props);
//     //           } else {
//     //             actions.setErrors(err.data.errors);
//     //             actions.setSubmitting(false);
//     //           }
//     //         });
//     //     }
//     //   });
//     // }
//   };

//   setDropZoneFiles = (acceptedFiles, setErrors, setFieldValue) => {
//     console.log('this.state.files acceptedFiles',this.state.files)
//     setErrors({ file_name: false });
//     setFieldValue(this.state.files);
//     var prevFiles = this.state.files;
//     var newFiles;
//     if (prevFiles.length > 0) {
//       //newFiles = newConcatFiles = acceptedFiles.concat(prevFiles);
//       console.log('acceptedFiles.length',acceptedFiles, acceptedFiles.length)
//       for (let index = 0; index < acceptedFiles.length; index++) {
//         var remove = 0;

//         for (let index2 = 0; index2 < prevFiles.length; index2++) {
//           if (acceptedFiles[index].name === prevFiles[index2].name) {
//             remove = 1;
//             break;
//           }
//         }

//         //console.log('remove',acceptedFiles[index].name,remove);

//         if (remove === 0) {
//           prevFiles.push(acceptedFiles[index]);
//         }
//       }
//       //console.log('acceptedFiles',acceptedFiles);
//       //console.log('prevFiles',prevFiles);
//       newFiles = prevFiles;
//     } else {
//       newFiles = acceptedFiles;
//     }

//     var fileListHtml = newFiles.map((file) => (
//       <Alert key={file.name}>
//         <span onClick={() => removeDropZoneFiles(file.name, this, setErrors)}>
//           <i className="far fa-times-circle"></i>
//         </span>{" "}
//         {trimString(25, file.name)}
//       </Alert>
//     ));
//       console.log('newFiles fileListHtml', newFiles, fileListHtml)
//     this.setState({
//       files: newFiles,
//       filesHtml: fileListHtml,
//     });
//   };


//   // showAttachments = () => {
//   //   console.log('this.state.files', this.state.files)
//   //   var fileListHtml = this.state.files.map((file) => (
//   //     <Alert key={file.upload_id}>
//   //       <span onClick={() => this.removeDropZoneFiles(file.upload_id)}>
//   //         <i className="far fa-times-circle" style={{ cursor: "pointer" }}></i>
//   //       </span>{" "}
//   //       <span
//   //         onClick={(e) =>
//   //           this.redirectUrlTask(e, `${file.upload_id}`)
//   //         }
//   //       >
//   //         <i className="fa fa-download" style={{ cursor: "pointer" }}></i>
//   //       </span>{" "}
//   //       {file.actual_files}
//   //     </Alert>
//   //   ));

//   //   return fileListHtml;
//   // };

//   showAttachments = () => {
//     var fileListHtml = (
//       <Alert key={this.state.currRow.file_name}>
//         <span onClick={() => this.removeProformaGenpactFile()}>
//           <i className="far fa-times-circle" style={{ cursor: "pointer" }}></i>
//         </span>{" "}
//         <span
//           onClick={(e) =>
//             this.downloadFile(
//               e,
//               this.state.currRow.download_url,
//               this.state.currRow.file_name
//             )
//           }
//         >
//           <i className="fa fa-download" style={{ cursor: "pointer" }}></i>
//         </span>{" "}
//         {this.state.currRow.file_name.length > 50
//           ? `${this.state.currRow.file_name.substr(0, 40)}...`
//           : this.state.currRow.file_name}
//       </Alert>
//     );

//     return fileListHtml;
//   };

//   render() {
//     const initialValues = {
//       id: "",
//       equipment_name: "",
//       equipment_description: "",
//       file_name: [],
//       images: "",
//       date_posted: "",
//       status: "",
//     };
//     const validateStopFlag = Yup.object().shape({
//       // images: Yup.mixed()
//       //   .required("Please select image")
//       //   .test(
//       //     "equipmentimage",
//       //     "Only files with the following extensions are allowed: png jpg jpeg",
//       //     () => this.state.isValidFile
//       //   ),
//       equipment_name: Yup.string().required(
//         "Please enter equipment & instrument name"
//       ),
//       // equipment_description: Yup.string().required("Please enter description"),
//       status: Yup.number().required("Please select status"),
//     });

//     return (
//       <Layout {...this.props}>
//         <div className="content-wrapper">
//           <section className="content-header">
//             <h1>
//               Add Equipment
//               <small />
//             </h1>
//             <input
//               type="button"
//               value="Go Back"
//               className="btn btn-warning btn-sm"
//               onClick={() => {
//                 window.history.go(-1);
//                 return false;
//               }}
//               style={{ right: "9px", position: "absolute", top: "13px" }}
//             />
//           </section>
//           <section className="content">
//             <div className="box">
//               <div className="box-body">
//                 <Formik
//                   initialValues={initialValues}
//                   validationSchema={validateStopFlag}
//                   onSubmit={this.handleSubmitEvent}
//                 >
//                   {({
//                     values,
//                     errors,
//                     touched,
//                     isValid,
//                     isSubmitting,
//                     setFieldValue,
//                     setFieldTouched,
//                     handleChange,
//                     setErrors,
//                   }) => {
//                     return (
//                       <Form>
//                         {console.log('errors formik', errors)}
//                         <div className="contBox">
//                           <Row>
//                             <Col xs={12} sm={12} md={12}>
//                               <div className="form-group">
//                                 <label>
//                                   Equipment Name
//                                   <span className="impField">*</span>
//                                 </label>
//                                 <Field
//                                   name="equipment_name"
//                                   type="text"
//                                   className={`form-control`}
//                                   placeholder="Enter Equipment  Name"
//                                   autoComplete="off"
//                                   value={values.equipment_name}
//                                 />
//                                 {errors.equipment_name && touched.equipment_name ? (
//                                   <span className="errorMsg">
//                                     {errors.equipment_name}
//                                   </span>
//                                 ) : null}
//                               </div>
//                             </Col>
//                           </Row>

//                           <Row>
//                             <Col xs={12} sm={6} md={6}>
//                               <div className="form-group custom-file-upload">
//                                 <label>&nbsp;</label>
//                                 <Dropzone
//                                   onDrop={(acceptedFiles) =>
//                                     this.setDropZoneFiles(
//                                       acceptedFiles,
//                                       setErrors,
//                                       setFieldValue
//                                     )
//                                   }
//                                   multiple={true}
//                                 >
//                                   {({ getRootProps, getInputProps }) => (
//                                     <section>
//                                       <div
//                                         {...getRootProps()}
//                                         className="custom-file-upload-header"
//                                       >
//                                         <input {...getInputProps()} />
//                                         <p>Upload file</p>
//                                       </div>
//                                       <div className="custom-file-upload-area">
//                                         {/* {this.state.currRow.proforma_id > 0 && this.showAttachments()} */}
//                                         {this.state.clone_sub === 1 &&
//                                           this.showAttachmentsClone()}
//                                         {this.state.clone_main_task === 1 &&
//                                           this.showAttachmentsCloneMain()}
//                                         {this.state.filesHtml}
//                                       </div>
//                                     </section>
//                                   )}
//                                 </Dropzone>

//                                 {errors.file_name || touched.file_name ? (
//                                   <p className="sub-task-er-msg sub-task-er-msg3">
//                                     {errors.file_name}
//                                   </p>
//                                 ) : null}
//                               </div>
//                             </Col>
//                           </Row>
//                           <Row>
//                             <Col xs={12} sm={12} md={12}>
//                               <div className="form-group">
//                                 <label>
//                                   Description
//                                   <span className="impField">*</span>
//                                 </label>
//                                 <input
//                                   id="my-file"
//                                   type="file"
//                                   name="my-file"
//                                   style={{ display: "none" }}
//                                 />
//                                 <input
//                                   id="my-file"
//                                   type="file"
//                                   name="my-file"
//                                   style={{ display: "none" }}
//                                 />
//                                 <TinyMCE
//                                   content={values.equipment_description}
//                                   init={{
//                                     selector: 'textarea',
//                                     height: 500,
//                                     menubar: false,
//                                     plugins: [
//                                       "advlist autolink lists link image charmap print preview anchor",
//                                       "searchreplace visualblocks code fullscreen",
//                                       "insertdatetime media table paste code help wordcount",
//                                     ],
//                                     toolbar:
//                                       "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
//                                     // content_css: '//www.tinymce.com/css/codepen.min.css',
//                                     content_style:
//                                       "body { font-family:Helvetica,Arial,sans-serif; font-size:10px, }",
//                                     file_browser_callback_types: "image",
//                                     file_picker_callback: function (
//                                       callback,
//                                       value,
//                                       meta
//                                     ) {
//                                       if (meta.filetype == "image") {
//                                         var input =
//                                           document.getElementById("my-file");
//                                         input.click();
//                                         input.onchange = function () {
//                                           var file = input.files[0];
//                                           var reader = new FileReader();
//                                           reader.onload = function (e) {
//                                             console.log(
//                                               "name",
//                                               value
//                                             );
//                                             callback(e.target.result, {
//                                               alt: file.name,
//                                             });
//                                           };
//                                           reader.readAsDataURL(file);
//                                         };
//                                       }
//                                     },
//                                     paste_data_images: true,
//                                   }}
//                                   onEditorChange={(value) =>
//                                     setFieldValue("equipment_description", value)
//                                   }
//                                 />

//                                 {errors.equipment_description && touched.equipment_description ? (
//                                   <span className="errorMsg">
//                                     {errors.equipment_description}
//                                   </span>
//                                 ) : null}
//                               </div>
//                             </Col>
//                           </Row>

//                           <hr className="blue" />
//                           <Row>
//                             <Col xs={12} sm={12} md={12}>
//                               <div className="form-group">
//                                 <label>
//                                   Status
//                                   <span className="impField">*</span>
//                                 </label>
//                                 <Field
//                                   name="status"
//                                   component="select"
//                                   className={`selectArowGray form-control`}
//                                   autoComplete="off"
//                                   value={values.status}
//                                 >
//                                   <option key="-1" value="">
//                                     Select
//                                   </option>
//                                   {this.state.selectStatus.map((status, i) => (
//                                     <option key={i} value={status.value}>
//                                       {status.label}
//                                     </option>
//                                   ))}
//                                 </Field>
//                                 {errors.status && touched.status ? (
//                                   <span className="errorMsg">
//                                     {errors.status}
//                                   </span>
//                                 ) : null}
//                               </div>
//                             </Col>
//                           </Row>
//                         </div>
//                         <button
//                           className={`btn btn-success btn-sm ${isValid ? "btn-custom-green" : "btn-disable"
//                             } m-r-10`}
//                           type="submit"
//                           disabled={
//                             isValid ? (isSubmitting ? true : false) : true
//                           }
//                         >
//                           {this.state.equipment_id > 0
//                             ? isSubmitting
//                               ? "Updating..."
//                               : "Update"
//                             : isSubmitting
//                               ? "Submitting..."
//                               : "Submit"}
//                         </button>
//                       </Form>
//                     );
//                   }}
//                 </Formik>
//               </div>
//             </div>
//           </section>
//         </div>
//       </Layout>
//     );
//   }
// }
// export default AddEquipment;


// /**
//   <Col xs={12} sm={12} md={12}>
//                               <div className="form-group">
//                                 {/* <label>
//                                   Upload Image
//                                   <span className="impField">*</span>
//                                   <br />{" "}
//                                   <i> {this.state.fileValidationMessage}</i>
//                                   <br /> <i>{this.state.validationMessage}</i>
//                                 </label>
//                                 <Field
//                                   name="images"
//                                   type="file"
//                                   multiple
//                                   className={`form-control`}
//                                   placeholder="Equipment Image"
//                                   autoComplete="off"
//                                   onChange={(e) => {
//                                     this.fileChangedHandler(
//                                       e,
//                                       setFieldTouched,
//                                       setFieldValue,
//                                       setErrors
//                                     );
//                                   }}
//                                 />

//                                 {errors.images && touched.images ? (
//                                   <span className="errorMsg">
//                                     {errors.images}
//                                   </span>
//                                 ) : null} /
//                                 <Dropzone
//                                   onDrop={(acceptedFiles) =>
//                                     this.setDropZoneFiles(
//                                       acceptedFiles,
//                                       setErrors,
//                                       setFieldValue
//                                     )
//                                   }
//                                 >
//                                   {({ getRootProps, getInputProps }) => (
//                                     <section>
//                                       <div
//                                         {...getRootProps()}
//                                         className="custom-file-upload-header"
//                                       >
//                                         <input {...getInputProps()} />
//                                         <label>
//                                           Upload Image
//                                           <span className="impField">*</span>
//                                           <br />{" "}
//                                           <i> {this.state.fileValidationMessage}</i>
//                                           <br /> <i>{this.state.validationMessage}</i>
//                                         </label>
//                                         <Field
//                                           name="images"
//                                           type="file"
//                                           multiple
//                                           className={`form-control`}
//                                           placeholder="Equipment Image"
//                                           autoComplete="off"
//                                           // onChange={(e) => {
//                                           //   // this.showAttachments(e)
//                                           // }}
                                         
//                                         />
//                                       </div>
//                                       <div className="custom-file-upload-area">
//                                         {this.state.files && 
//                                           this.showAttachments()
//                                         }
//                                         / {this.state.files} /
//                                       </div>
//                                     </section>
//                                   )}
//                                 </Dropzone>
//                                 {errors.files && touched.files ? (
//                                   <span className="errorMsg errorExpandView">
//                                     {errors.files}
//                                   </span>
//                                 ) : null}
//                               </div>
//                             </Col> 
//  */
