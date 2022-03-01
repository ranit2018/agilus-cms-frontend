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

class Disclaimer extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            disclaimer: {},
            page_name: '',
            disclaimerId: 0,
            isloading:true 
        }
    }

    componentDidMount() {
        this.getDisclaimer();
    }

    getDisclaimer = () => {
        API.get(`/api/feed/page_details/4`)
        .then((res) => {
          this.setState({
            disclaimer: res.data.data[0].content,
            disclaimerId: res.data.data[0].id,
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
                      Manage Disclaimer
                        <small />
                    </h1>
                  </div>
    
                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
    
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.props.history.push({
                            pathname: '/pages/edit-disclaimer/'+this.state.disclaimerId,
                            state: { content: this.state.disclaimer}
                        })}
                      >
                        <i className="fas fa-plus m-r-5" /> Edit Disclaimer
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
                      {ReactHtmlParser(htmlDecode(this.state.disclaimer))}

                  </div>
                </div>
              </section>
            </div>
          </Layout >
        )
    }
}
export default Disclaimer