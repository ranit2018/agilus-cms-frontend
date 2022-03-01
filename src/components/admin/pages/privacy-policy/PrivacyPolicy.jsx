import React, { Component } from 'react'
import { Row, Col} from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import ReactHtmlParser from "react-html-parser";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import { htmlDecode } from "../../../../shared/helper";
import Select from "react-select";
import Layout from "../../layout/Layout";

class PrivacyPolicy extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            privacypolicy: {},
            page_name: '',
            privacypolicyId: 0,
            isloading:true 
        }
    }

    componentDidMount() {
        this.getPrivacyPolicy();
    }

    getPrivacyPolicy = () => {
        API.get(`/api/feed/page_details/3`)
        .then((res) => {
          this.setState({
            privacypolicy: res.data.data[0].content,
            privacypolicyId: res.data.data[0].id,
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
                      Manage Privacy Policy
                        <small />
                    </h1>
                  </div>
    
                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
    
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.props.history.push({
                            pathname: '/pages/edit-privacy-policy/'+this.state.privacypolicyId,
                            state: { content: this.state.privacypolicy }
                        })}
                      >
                        <i className="fas fa-plus m-r-5" /> Edit Privacy Policy
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
                      {ReactHtmlParser(htmlDecode(this.state.privacypolicy))}

                  </div>
                </div>
              </section>
            </div>
          </Layout >
        )
    }
}
export default PrivacyPolicy