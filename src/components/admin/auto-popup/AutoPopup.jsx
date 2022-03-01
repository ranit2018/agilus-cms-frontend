import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Row, Col, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik, Field, Form } from 'formik'; // for add/edit only
import * as Yup from 'yup'; // for add/edit only
import swal from 'sweetalert';
import Select from 'react-select';
import { htmlDecode, getHeightWidth, generateResolutionText, getResolution, FILE_VALIDATION_MASSAGE, FILE_SIZE } from "../../../shared/helper";
import API from '../../../shared/admin-axios';
import SRL_API from '../../../shared/srl-axios';
import Layout from '../layout/Layout';
import Pagination from 'react-js-pagination';
import { showErrorMessage } from '../../../shared/handle_error';
/*For Tooltip*/
function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
    return (
        <OverlayTrigger
            overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
            placement='left'
            delayShow={300}
            delayHide={150}
            trigger={['hover']}
        >
            <Link to={href} onClick={clicked}>
                {children}
            </Link>
        </OverlayTrigger>
    );
}

/*For Tooltip*/
const actionFormatter = (refObj) => (cell, row) => {
    return (
        <div className='actionStyle'>
            <LinkWithTooltip
                tooltip='Click to Delete'
                href='#'
                clicked={(e) => refObj.confirmDelete(e, cell)}
                id='tooltip-1'
            >
                <i className='far fa-trash-alt' />
            </LinkWithTooltip>
        </div>
    );
};

const initialValues = {
	cities: '',
    status:'',
    imageUrl:'',
   file: ''
};


class AutoPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auto_popup_data: [],
			city_state_list: [],
            isLoading: false,
            showModal: false,
            AddAllCitiesShowModal:false,
            thumbNailModal:false,
            activePage: 1,
            totalCount: 0,
            itemPerPage: 10,
            search_city_name: '',
            selectStatus: [
                { value: "1", label: "Request Callback Popup" },
                { value: "2", label: "Image Popup" }
            ],
            status:"",
        };
    }

    componentDidMount() {
		this.getCityStateList();
        this.getAutoPopupList();
        this.setState({
          //  validationMessage: generateResolutionText('auto-popup'),
          validationMessage: `The image resolution should be of min-width 500px and min-height 300px and max-width 1100px and max-height 700px`,
            fileValidationMessage: FILE_VALIDATION_MASSAGE
        })
    }
    fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
        //console.log(event.target.files);
        setFieldTouched("file");
        setFieldValue("file", event.target.value);

        const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
        if (!event.target.files[0]) {
            //Supported
            this.setState({
                file: "",
                isValidFile: true,
            });
            return;
        }
        if (event.target.files[0] && SUPPORTED_FORMATS.includes(event.target.files[0].type)) {
            //Supported
            this.setState({
                file: event.target.files[0],
                isValidFile: true,
            });
        } else {
            //Unsupported
            setErrors({ file: "Only files with the following extensions are allowed: png jpg jpeg" }); //Not working- So Added validation in "yup"
            this.setState({
                file: "",
                isValidFile: false,
            });
        }
    };

	getCityStateList = () => {
		SRL_API.get(`/feed/get-city-state-list`)
		.then((res) => {
			this.setState({
				city_state_list: res.data.data,
			});
		})
		.catch((err) => {
			showErrorMessage(err, this.props);
		});
	}

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber });
        this.getAutoPopupList(pageNumber > 0 ? pageNumber : 1);
    };

    getAutoPopupList = (page = 1) => {
        let { search_city_name } = this.state;
        API.get(`/api/auto_popup?page=${page}&city_name=${encodeURIComponent(search_city_name)}`)
            .then((res) => {
                this.setState({
                    activePage: page,
                    auto_popup_data: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    };

    modalCloseHandler = () => {
        this.setState({ showModal: false });
    };

    modalShowHandler = (event) => {
        event.preventDefault();
        this.setState({ showModal: true });
    };

    imageModalShowHandler = (url) => {
        console.log(url);
        this.setState({ thumbNailModal: true, banner_url: url });
      }
      imageModalCloseHandler = () => {
        this.setState({ thumbNailModal: false, banner_url: "" });
      }

    AddAllCitiesmodalCloseHandler  = () => {
        this.setState({ AddAllCitiesShowModal: false });
    };

    AddAllCitiesmodalShowHandler = (event) => {
        event.preventDefault();
        this.setState({ AddAllCitiesShowModal: true });
    };

    handleSubmitEvent = (values, actions) => {
        let method = '';
        let post_data = [];
        values.cities.forEach(city => {
            post_data.push({
                city_name: city.city_name,
                city_id: city.value,
            })
        });
        let formData = new FormData();
          formData.append('cities', JSON.stringify(post_data));
        formData.append('type', values.status);
        formData.append('button_url', values.imageUrl);
        method = 'POST';
        let url = `/api/auto_popup`;
   
    if(values.status==="1"){
        API({
            method: method,
            url: url,
           data: formData,
          //  data:payload
        }).then((res) => {
            this.setState({ showModal: false });
            swal({
                closeOnClickOutside: false,
                title: 'Success',
                text: 'Added Successfully',
                icon: 'success',
            }).then(() => {
                this.getAutoPopupList();
            });
        })   .catch((err) => {
            this.setState({ closeModal: true, showModalLoader: false });
            if (err.data.status === 3) {
                showErrorMessage(err, this.props);
            } else {
                actions.setErrors(err.data.errors);
                actions.setSubmitting(false);
            }
        });
    }else{
        if (this.state.file.size > FILE_SIZE) {
            actions.setErrors({ file: "The file exceeds maximum size." });
            actions.setSubmitting(false);
        } else {
            getHeightWidth(this.state.file).then(dimension => {
                const { height, width } = dimension;
                const offerDimension = getResolution("auto-popup");
              //  if (height != offerDimension.height || width != offerDimension.width) {
         if (height > offerDimension.max_height || width > offerDimension.max_width || width < offerDimension.min_width || height < offerDimension.min_height) {
                    actions.setErrors({ file: "The file is not of desired height and width" });
                    actions.setSubmitting(false);
                    
                } else {
                    formData.append("auto_popup_file", this.state.file);
                    let payload={
                        cities: post_data,
                        type:values.status,
                        button_url:values.imageUrl,
                        auto_popup_file:this.state.file
                    }
                    API({
                        method: method,
                        url: url,
                       data: formData,
                      //  data:payload
                    }).then((res) => {
                        this.setState({ showModal: false });
                        swal({
                            closeOnClickOutside: false,
                            title: 'Success',
                            text: 'Added Successfully',
                            icon: 'success',
                        }).then(() => {
                            this.getAutoPopupList();
                        });
                    })   .catch((err) => {
                        this.setState({ closeModal: true, showModalLoader: false });
                        if (err.data.status === 3) {
                            showErrorMessage(err, this.props);
                        } else {
                            actions.setErrors(err.data.errors);
                            actions.setSubmitting(false);
                        }
                    });
                }
            })
        }
    }
    };

    addAllCities = (values,actions) => {
        const { city_state_list } = this.state;
        let post_data = [];
        for (const city in city_state_list) {
            if (Object.hasOwnProperty.call(city_state_list, city)) {
                const element = city_state_list[city];
                post_data.push({
                    city_name: element.city_name,
                    city_id: element.value,
                })
            }
        }
        let formData = new FormData();
        formData.append('cities', JSON.stringify(post_data));
        formData.append('type', values.status);
        formData.append('button_url', values.imageUrl);
      let  method = 'POST';
        let url = `/api/auto_popup/add_all`;
        if(values.status==="1"){
            API({
                method: method,
                url: url,
               data: formData,
            
            }).then((res) => {
                this.setState({ AddAllCitiesShowModal: false });
                swal({
                                closeOnClickOutside: false,
                                title: 'Success',
                                text: 'Added successfully.',
                                icon: 'success',
                            }).then(() => {
                                this.getAutoPopupList();
                            });
                        })
                       
                                .catch((err) => {
                                    this.setState({ closeModal: true, showModalLoader: false });
                                    if (err.data.status === 3) {
                                        showErrorMessage(err, this.props);
                                    } else {
                                        actions.setErrors(err.data.errors);
                                        actions.setSubmitting(false);
                                    }
                                });
        }else{
            if (this.state.file.size > FILE_SIZE) {
                actions.setErrors({ file: "The file exceeds maximum size." });
                actions.setSubmitting(false);
            } else {
                getHeightWidth(this.state.file).then(dimension => {
                    const { height, width } = dimension;
                    const offerDimension = getResolution("auto-popup");
                    // if (height != offerDimension.height || width != offerDimension.width) {
                    //     actions.setErrors({ file: "The file exceeds maximum height and width validation." });
                    //     actions.setSubmitting(false);
                        if (height > offerDimension.max_height || width > offerDimension.max_width || width < offerDimension.min_width || height < offerDimension.min_height) {
                            actions.setErrors({ file: "The file is not of desired height and width" });
                            actions.setSubmitting(false);
                    } else {
                        formData.append("auto_popup_file", this.state.file);
                      
                        API({
                            method: method,
                            url: url,
                           data: formData,
                        }).then((res) => {
                            this.setState({ AddAllCitiesShowModal: false });
                            swal({
                                            closeOnClickOutside: false,
                                            title: 'Success',
                                            text: 'Added successfully.',
                                            icon: 'success',
                                        }).then(() => {
                                            this.getAutoPopupList();
                                        });
                                    })
                                  
                                            .catch((err) => {
                                                this.setState({ closeModal: true, showModalLoader: false });
                                                if (err.data.status === 3) {
                                                    showErrorMessage(err, this.props);
                                                } else {
                                                    actions.setErrors(err.data.errors);
                                                    actions.setSubmitting(false);
                                                }
                                            });
                    }
                })
            }
        }
    };


    confirmDelete = (event, id) => {
        event.preventDefault();
        swal({
            closeOnClickOutside: false,
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.deleteAutoPopup(id);
            }
        });
    };

    deleteAutoPopup = (id) => {
        API.delete(`/api/auto_popup/${id}`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: 'Success',
                    text: 'Record deleted successfully.',
                    icon: 'success',
                }).then(() => {
                    this.getAutoPopupList(this.state.activePage);
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    confirmAddAllCities = (values,actions) => {
      
       // event.preventDefault();
       if(values.status==="1"){
        swal({
            closeOnClickOutside: false,
            title: 'Are you sure?',
            text: 'This will add all the cities to callback auto popup!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.addAllCities(values,actions);
            }
        });
    }else{
        swal({
            closeOnClickOutside: false,
            title: 'Are you sure?',
            text: 'This will add all the cities to image popup!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.addAllCities(values,actions);
            }
        });
    }
        
    };

   
    confirmDeleteAllCities = (event) => {
        event.preventDefault();
        swal({
            closeOnClickOutside: false,
            title: 'Are you sure?',
            text: 'This will remove all the cities from auto popup!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                this.deleteAllCities();
            }
        });
    };

    deleteAllCities = () => {
        API.post(`/api/auto_popup/delete_all`)
            .then((res) => {
                swal({
                    closeOnClickOutside: false,
                    title: 'Success',
                    text: 'Removed successfully.',
                    icon: 'success',
                }).then(() => {
                    this.getAutoPopupList();
                });
            })
            .catch((err) => {
                if (err.data.status === 3) {
                    this.setState({ closeModal: true });
                    showErrorMessage(err, this.props);
                }
            });
    };

    autoPopupSearch = (e) => {
        e.preventDefault();

        const search_city_name = document.getElementById('search_city_name').value;

        if (search_city_name === '') {
            return false;
        }

        API.get(`/api/auto_popup?page=1&city_name=${encodeURIComponent(search_city_name)}`)
            .then((res) => {
                this.setState({
                    auto_popup_data: res.data.data,
                    totalCount: res.data.count,
                    isLoading: false,
                    activePage: 1,
                    search_city_name: search_city_name,
                    remove_search: true,
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                });
                showErrorMessage(err, this.props);
            });
    };

    clearSearch = () => {
        document.getElementById('search_city_name').value = '';
        this.setState(
            {
                search_city_name: '',
                remove_search: false,
            },
            () => {
                // this.setState({ activePage: 1 });
                this.getAutoPopupList();
            }
        );
    };
    setAutoPopupImage = (refObj) => (cell, row) => {
      
        
        if (row.image !==null) {
              return <img src={row.image} alt="AutoPopup Image" height="100" onClick={(e) => refObj.imageModalShowHandler(row.image)}></img>;
        }
        else{
            return(null)
        }
      };
       __htmlDecode = (refObj) => (cell) => {
        return htmlDecode(cell);
      };
      popupType = (refObj) => (cell) => {
        //return cell === 1 ? "Active" : "Inactive";
        if (cell === 1) {
            return "Callback Popup";
        } else if (cell === 2) {
            return "Image Popup";
        }
    };
    setAutoPopupImageLink = (refOBj) => (cell, row) => {
        return (
    
            <a href={row.button_url} target="_blank">
                {row.button_url}
            </a>
    
        );
    };
    render() {
        const { auto_popup_data, city_state_list, totalCount, activePage,} = this.state;
        const regMatch=/^((https):\/\/)(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9-&.\?+=#]+)*\/?(\?[a-zA-Z0-9-]+=[a-zA-Z0-9-%]+&?)?$/


        let validateStopFlag = Yup.object().shape({
			cities: Yup.array().of(Yup.object()).required("Please select city"),

            status: Yup.string().trim()
            .required("Please select status")
            .matches(/^[1|2]$/, "Invalid status selected"),

            imageUrl: Yup.string().matches(regMatch,'Please enter a valid URL').max(250),

            file: Yup.string().when("status", {
                is: "2",
                then:  Yup.string().required("Please select the image").test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    () => this.state.isValidFile
                ),
              }),
        });

        let validateStopFlagAddAllCities = Yup.object().shape({
		
            status: Yup.string().trim()
            .required("Please select status")
            .matches(/^[1|2]$/, "Invalid status selected"),
            imageUrl: Yup.string().matches(regMatch,'Please enter a valid URL').max(250),

            file: Yup.string().when("status", {
                is: "2",
                then:  Yup.string().required("Please select the image").test(
                    "image",
                    "Only files with the following extensions are allowed: png jpg jpeg",
                    () => this.state.isValidFile
                ),
              }),
        });
        return (
         
            <Layout {...this.props}>
                <div className='content-wrapper'>
                    <section className='content-header'>
                        <div className='row'>
                            <div className='col-lg-12 col-sm-12 col-xs-12'>
                                <h1>
                                    Manage Callback Auto Popup
                                    <small />
                                </h1>
                            </div>
                            <div className='col-lg-12 col-sm-12 col-xs-12  topSearchSection'>
                                <div className='row'>
                                    <div className='col-lg-4 col-sm-4 col-xs-4'>
                                        <button
                                            type='button'
                                            className='btn btn-info btn-sm'
                                            onClick={(e) => this.modalShowHandler(e, '')}
                                        >
                                            <i className='fas fa-plus m-r-5' /> Add Auto Popup
                                        </button>
                                    </div>
                                    <div className='col-lg-3 col-sm-3 col-xs-3'>
                                        {
                                            city_state_list && totalCount >= city_state_list.length ? (
                                                <button
                                                    type='button'
                                                    className='btn btn-info btn-sm'
                                                    disabled
                                                >
                                                    <i className='fas fa-plus m-r-5' /> Add All Cities
                                                </button>
                                            ) : (
                                                <button
                                                    type='button'
                                                    className='btn btn-info btn-sm'
                                                    onClick={(e) => this.AddAllCitiesmodalShowHandler(e)}
                                                >
                                                    <i className='fas fa-plus m-r-5' /> Add All Cities
                                                </button>
                                            )
                                        }
                                    </div>
                                    <div className='col-lg-3 col-sm-3 col-xs-3'>
                                        {
                                            totalCount > 0 ? (
                                                <button
                                                    type='button'
                                                    className='btn btn-info btn-sm'
                                                    onClick={(e) => this.confirmDeleteAllCities(e)}
                                                >
                                                    <i className='fas fa-minus m-r-5' /> Remove All Cities
                                                </button>
                                            ) : (
                                                <button
                                                    type='button'
                                                    className='btn btn-info btn-sm'
                                                    disabled
                                                >
                                                    <i className='fas fa-minus m-r-5' /> Remove All Cities
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                                <form className='form'>
                                    <div className=''>
                                        <input
                                            className="form-control"
                                            id="search_city_name"
                                            placeholder='Filter by City Name'
                                        />
                                    </div>
                                    <div className=''>
                                        <input
                                            type='submit'
                                            value='Search'
                                            className='btn btn-warning btn-sm'
                                            onClick={(e) => this.autoPopupSearch(e)}
                                        />
                                        {this.state.remove_search ? (
                                            <a onClick={() => this.clearSearch()} className='btn btn-danger btn-sm'>
                                                {' '}
                                                Remove{' '}
                                            </a>
                                        ) : null}
                                    </div>
                                    <div className='clearfix'></div>
                                </form>
                            </div>
                        </div>
                    </section>
                    <section className='content'>
                        <div className='box'>
                            <div className='box-body'>
                                <BootstrapTable data={auto_popup_data}>
                                    <TableHeaderColumn isKey dataField='city_name'>
                                        City Name
                                    </TableHeaderColumn>
                                    <TableHeaderColumn  dataField='image'  dataFormat={this.setAutoPopupImage(this)}
                                    tdStyle={{ wordBreak: "break-word" }}>
                                                        Image
                                                    </TableHeaderColumn>
                                                    <TableHeaderColumn
                                    dataField="button_url"
                                    dataFormat={this.setAutoPopupImageLink(this)}
                                   
                                >
                                    Url
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                        dataField="type"
                                        dataFormat={this.popupType(this)}
                                    >
                                        Type
                    </TableHeaderColumn>
                                    <TableHeaderColumn dataField='id' dataFormat={actionFormatter(this)} dataAlign=''>
                                        Action
                                    </TableHeaderColumn>
                                </BootstrapTable>
                                {totalCount > 10 ? (
                                    <Row>
                                        <Col md={12}>
                                            <div className='paginationOuter text-right'>
                                                <Pagination
                                                    activePage={activePage}
                                                    itemsCountPerPage={10}
                                                    totalItemsCount={totalCount}
                                                    itemClass='nav-item'
                                                    linkClass='nav-link'
                                                    activeClass='active'
                                                    onChange={this.handlePageChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                ) : null}

                                {/* ======= Modal ======== */}
                                <Modal
                                    show={this.state.showModal}
                                    onHide={() => this.modalCloseHandler()}
                                    backdrop='static'
                                >
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
                                            setErrors,
                                            setFieldTouched
                                        }) => {
                                            return (
                                                <Form>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Add Auto Popup</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className='contBox'>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                    <div className='form-group'>
                                                                        <label>
                                                                            Cities
                                                                            <span className='impField'>*</span>
                                                                        </label>
                                                                        <Select
                                                                            name="cities"
																			maxMenuHeight={200}
                                                                            isMulti
                                                                            isClearable={true}
                                                                            isSearchable={true}
																			placeholder="Select City"
																			options={city_state_list}
																			value={values.cities}
																			onChange={(evt) => setFieldValue("cities",evt)}
																		/>
																		{errors.cities && touched.cities ? (
                                                                            <p className='errorMsg'>
                                                                                {errors.cities}
                                                                            </p>
                                                                        ) : null}
                                                                        {errors.city_name ? (
                                                                            <p className='errorMsg'>
                                                                                {errors.city_name}
                                                                            </p>
                                                                        ) : null}
																		{errors.city_id ? (
                                                                            <p className='errorMsg'>
                                                                                {errors.city_id}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                    <label>
                                                                            Type
                                                                            <span className='impField'>*</span>
                                                                        </label>
                                                               
                                                                          <Field 
                                                                    name="status"
                                                                    component="select"
                                                                    className={`selectArowGray form-control`}
                                                                    autoComplete="off"
                                                                    value={values.status}
                                                                    // onChange={(evt)=>{setFieldValue("status",evt) ;this.setState({
                                                                    //     status:evt.target.value
                                                                    // })}}
                                                                    
                                                                >
                                                                    <option key="-1" value="">
                                                                        Select Type
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
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    
                                                        {values.status == "2"?
                                                        
                                                            <div className="form-group">
                                                                  <br></br>
                                                               <label>
                                                                    Upload Image<span className="impField">*</span>
                                                                    <br /> <i> {this.state.fileValidationMessage}
                                                                    </i>
                                                                    <br /> <i>{this.state.validationMessage}

                                                                    </i>
                                                                </label> 
                                                                <Field
                                                                    name="file"
                                                                    type="file"
                                                                    className={`form-control`}
                                                                    placeholder="Select Image"
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
                                                                {errors.file && touched.file ? (
                                                                    <span className="errorMsg">{errors.file}</span>
                                                                ) : null} 
                                                                
                                                                <br></br>
                                                                <label>
                                                                    Url
                                                              </label>
                                                                <Field
                                                                    name="imageUrl"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="eg. https://example.com"
                                                                    autoComplete="off"
                                                                    value={values.imageUrl}
                                                                />
                                                                {errors.imageUrl && touched.imageUrl ? (
                                                                    <span className="errorMsg">
                                                                        {errors.imageUrl}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                       :null}
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                      
                                                        <button
                                                            className={`btn btn-success btn-sm ${
                                                                isValid ? 'btn-custom-green' : 'btn-disable'
                                                            } m-r-10`}
                                                            type='submit'
                                                            
                                                            disabled={isValid ? (isSubmitting ? true : false) : true}
                                                          
                                                        >
                                                            { isSubmitting
                                                                ? 'Submitting...'
                                                                : 'Submit' }
                                                        </button>
                                                        <button
                                                            onClick={(e) => this.modalCloseHandler()}
                                                            className={`btn btn-danger btn-sm`}
                                                            type='button'
                                                        >
                                                            Close
                                                        </button>
                                                    </Modal.Footer>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                </Modal>

                            {/* ======= Modal for Add all Cities ======== */}
                            <Modal
                                    show={this.state.AddAllCitiesShowModal}
                                    onHide={() => this.AddAllCitiesmodalCloseHandler()}
                                    backdrop='static'
                                >
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validateStopFlagAddAllCities}
                                        onSubmit={this.confirmAddAllCities}
                                    >
                                        {({
                                            values,
                                            errors,
                                            touched,
                                            isValid,
                                            isSubmitting,
                                            setFieldValue,
                                            setErrors,
                                            setFieldTouched
                                        }) => {
                                            return (
                                                <Form>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Add All Cities Popup</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <div className='contBox'>
                                                            <Row>
                                                                <Col xs={12} sm={12} md={12}>
                                                                   
                                                                    <label>
                                                                            Type
                                                                            <span className='impField'>*</span>
                                                                        </label>
                                                               
                                                                          <Field 
                                                                    name="status"
                                                                    component="select"
                                                                    className={`selectArowGray form-control`}
                                                                    autoComplete="off"
                                                                    value={values.status}
                                                                    // onChange={(evt)=>{setFieldValue("status",evt) ;this.setState({
                                                                    //     status:evt.target.value
                                                                    // })}}
                                                                    
                                                                >
                                                                    <option key="-1" value="">
                                                                        Select Type
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
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    
                                                        {values.status == "2"?
                                                        
                                                            <div className="form-group">
                                                                  <br></br>
                                                               <label>
                                                                    Upload Image<span className="impField">*</span>
                                                                    <br /> <i> {this.state.fileValidationMessage}
                                                                    </i>
                                                                    <br /> <i>{this.state.validationMessage}

                                                                    </i>
                                                                </label> 
                                                                <Field
                                                                    name="file"
                                                                    type="file"
                                                                    className={`form-control`}
                                                                    placeholder="Select Image"
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
                                                                {errors.file && touched.file ? (
                                                                    <span className="errorMsg">{errors.file}</span>
                                                                ) : null} 
                                                                
                                                                <br></br>
                                                                <label>
                                                                    Url
                                                              </label>
                                                                <Field
                                                                    name="imageUrl"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder="Enter Url"
                                                                    autoComplete="off"
                                                                    value={values.imageUrl}
                                                                />
                                                                {errors.imageUrl && touched.imageUrl ? (
                                                                    <span className="errorMsg">
                                                                        {errors.imageUrl}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                       :null}
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                      
                                                        <button
                                                            className={`btn btn-success btn-sm ${
                                                                isValid ? 'btn-custom-green' : 'btn-disable'
                                                            } m-r-10`}
                                                            type='submit'
                                                            
                                                            //disabled={isValid ? (isSubmitting ? true : false) : true}
                                                            disabled={isValid ?false : true}
                                                        >
                                                        {/*     { isSubmitting
                                                                ? 'Submitting...'
                                                                : 'Submit' } */}
                                                                Submit
                                                        </button>
                                                        <button
                                                            onClick={(e) => this.AddAllCitiesmodalCloseHandler()}
                                                            className={`btn btn-danger btn-sm`}
                                                            type='button'
                                                        >
                                                            Close
                                                        </button>
                                                    </Modal.Footer>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                </Modal>

                                      {/* MODAL FOR IMAGE*/}
               <Modal
                  show={this.state.thumbNailModal}
                  onHide={() => this.imageModalCloseHandler()}
                  backdrop='static'
                >
                  <Modal.Header closeButton>AutoPopup Image</Modal.Header>
                  <Modal.Body>
                    <center>
                      <div className="imgUi">
                        <img src={this.state.banner_url} alt="AutoPopup Image"></img>
                      </div>
                    </center>
                  </Modal.Body>
                </Modal>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        );
    }
}
export default AutoPopup;
