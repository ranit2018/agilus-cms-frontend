import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
    Row,
    Col,
    ButtonToolbar,
    Button,
    Tooltip,
    OverlayTrigger,
    Modal,
} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import API from "../../../shared/admin-axios";
import { htmlDecode, getHeightWidth, getHeightWidthFromURL, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import { showErrorMessage } from "../../../shared/handle_error";
import { CopyToClipboard } from "react-copy-to-clipboard";
import 'react-toastify/dist/ReactToastify.css';
import Pagination from "react-js-pagination";

class GalleryModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            list: [],
            isCopied: false,
            activePage: 1,
        };
    };

    getImage = (page = 1) => {


        API.get(
            `/api/events/event_gallery_new/?page=${page}`
        )
            .then((res) => {
                this.setState({
                    list: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false,
                    copySuccess: ''
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });

    }

    componentDidMount() {
        this.getImage();
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getImage(pageNumber > 0 ? pageNumber : 1);
    };



    copy = () => {
        toast.info("Image Copied!", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });
    }

    onHide = () => {
        this.handlePageChange(1);
        this.props.setShow();

    }



    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.onHide}
                backdrop='static'
                className='lg-custom'
            >
                <ToastContainer />
                <Modal.Header closeButton>
                    <Modal.Title>
                        Gallery
      </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        {
                            this.state.list.map((img, key) => (
                                <div key={key} className="col-sm-2">
                                    <div class="imgUiGal">
                                        <CopyToClipboard text={img.new_image_name} onCopy={this.copy}>
                                            <img
                                                src={img.new_image_name}
                                                alt="Image"
                                                height="100"
                                            />
                                        </CopyToClipboard>

                                    </div>
                                </div>

                            ))
                        }
                    </div>
                    <Modal.Footer>
                        {this.state.totalCount > 30 ? (
                            <Row>
                                <Col md={12}>
                                    <div className="paginationOuter text-right">
                                        <Pagination
                                            activePage={this.state.activePage}
                                            itemsCountPerPage={30}
                                            totalItemsCount={Number(this.state.totalCount)}
                                            itemClass="nav-item"
                                            linkClass="nav-link"
                                            activeClass="active"
                                            onChange={this.handlePageChange}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        ) : null}
                    </Modal.Footer>
                </Modal.Body>

            </Modal>
        )
    }
}
export default GalleryModal