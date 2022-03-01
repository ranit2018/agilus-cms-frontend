import React, { Component } from 'react'
import { Row, Col} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import { htmlDecode } from "../../../../shared/helper";
import ReactHtmlParser from "react-html-parser";
import Select from "react-select";
import Layout from "../../layout/Layout";

class WhyUs extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            conteny: {},
            page_name: '',
            contentId: 0,
            isloading:true 
        }
    }

    componentDidMount() {
        this.getDisclaimer();
    }

    getDisclaimer = () => {
        API.get(`/api/feed/page_details/15`)
        .then((res) => {
          this.setState({
            content: res.data.data[0].content,
            contentId: res.data.data[0].id,
            page_name: res.data.data[0].page_name,
            isloading: false
            
          });
        })
        .catch((err) => {
          showErrorMessage(err, this.props);
        });
    }
    render() {
        return (
            <Layout {...this.props}>
            <div className="content-wrapper">
              <section className="content-header">
                <div className="row">
                  <div className="col-lg-12 col-sm-12 col-xs-12">
                    <h1>
                      Manage Why Us
                        <small />
                    </h1>
                  </div>
    
                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
    
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.props.history.push({
                            pathname: '/about-us/edit-why-us/'+this.state.contentId,
                            state: { content: this.state.content}
                        })}
                      >
                        <i className="fas fa-plus m-r-5" /> Edit Why Us
                        </button>
                    </div>
                  </div>
                </div>
              </section>
              <section className="content">
                <div className="box">
                  <div className="box-body">
                      <center>
                          <h1>{this.state.page_name}</h1>
                      </center>
                      {ReactHtmlParser(htmlDecode(this.state.content))}

                  </div>
                </div>
              </section>
            </div>
          </Layout >
        )
    }
}
export default WhyUs