import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getSuperAdmin } from '../../../shared/helper';

class SidebarAdmin extends Component {
  constructor() {
    super();
    this.state = {
      shown: '',
      innerShown: '',
      super_admin: 0,
    };
  }

  toggleMenu(event) {
    event.preventDefault();
    this.setState({ shown: !this.state.shown });
  }

  componentDidMount = () => {
    var path = this.props.path_name; //console.log(path);
    if (
      path === '/admin/pages/privacy-policy' ||
      path === '/admin/pages/disclaimer' ||
      path === '/admin/pages/terms-and-conditions' ||
      path === '/admin/pages/covidantibody'
    ) {
      this.setState({ shown: '1' });
    }

    if (
      path === '/admin/home/know-who-we-are' ||
      path === '/admin/home/sample-journey'
    ) {
      this.setState({ shown: '1', innerShown: '1' });
    }

    if (
      path === '/admin/contact-us/numbers' ||
      path === '/admin/contact-us/office-addresses'
    ) {
      this.setState({ shown: '1', innerShown: '2' });
    }

    if (
      path === '/admin/covid19/faq' ||
      path === '/admin/covid19/speciality' ||
      path === '/admin/covid19/ebook-upload' ||
      path === '/admin/covid19/testing-center' ||
      path === '/admin/covid19/testing-center'
    ) {
      this.setState({ shown: '1', innerShown: '3' });
    }

    if (
      path === '/admin/investors/members' ||
      path === '/admin/investors/code-of-conduct' ||
      path === '/admin/investors/documents' ||
      path === '/admin/investors/memberstype'
    ) {
      this.setState({ shown: '1', innerShown: '4' });
    }

    if (
      path === '/admin/about-us/about-srl' ||
      path === '/admin/about-us/why-us' ||
      path === '/admin/about-us/values' ||
      path === '/admin/about-us/awards-accreditation' ||
      path === '/admin/about-us/key-members'
    ) {
      this.setState({ shown: '1', innerShown: '5' });
    }

    if (
      path === '/admin/app/splash-schreen' ||
      path === '/admin/app/helptour' ||
      path === '/admin/app/application-banner'
    ) {
      this.setState({ shown: '2' });
    }
    if (
      path === '/admin/ordering/banner' ||
      path === '/admin/ordering/speciality' ||
      path === '/admin/ordering/code-of-conduct' ||
      path === '/admin/ordering/faq'
    ) {
      this.setState({ shown: '3' });
    }

    if (
      path === '/admin/lead_landing_page/product' ||
      path === '/admin/lead_landing_page/health&benefits'
    ) {
      this.setState({ shown: '4' });
    }

    if (
      path === '/admin/product-details/accordion' ||
      path === '/admin/product-details/add-accordion'
    ) {
      this.setState({ shown: '5' });
    }

    if (this.props.isLoggedIn === true) {
      const superAdmin = getSuperAdmin(localStorage.admin_token);
      if (superAdmin) {
        this.setState({ super_admin: 1 });
      } else {
        return null;
      }
    }

  };

  handlePlus = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute('data-id');
    id != this.state.shown
      ? this.setState({ shown: id })
      : this.setState({ shown: '' });
  };

  innerHandlePlus = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute('inner-data-id');
    console.log(id);
    id != this.state.innerShown
      ? this.setState({ innerShown: id })
      : this.setState({ innerShown: '' });
  };

  getAdminMenu = () => {
    const rotate = this.state.shown;
    const innerRotate = this.state.innerShown;
    return (
      <section className="sidebar">
        <ul className="sidebar-menu">
          {this.props.path_name === '/admin/dashboard' ? (
            <li className="active">
              {' '}
              <Link to="/admin/dashboard">
                {' '}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/dashboard">
                {' '}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{' '}
            </li>
          )}

          {this.props.path_name === '/admin/banner' ? (
            <li className="active">
              {' '}
              <Link to="/admin/banner">
                {' '}
                <i className="fa fa-flag"></i> <span> Banners</span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/banner">
                {' '}
                <i className="fa fa-flag"></i> <span> Banners</span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/testimonials' ? (
            <li className="active">
              {' '}
              <Link to="/admin/testimonials">
                {' '}
                <i className="fa fa-quote-left"></i> <span> Testimonial </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/testimonials">
                {' '}
                <i className="fa fa-quote-left"></i> <span> Testimonial </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/categories' ? (
            <li className="active">
              {' '}
              <Link to="/admin/categories">
                {' '}
                <i className="fa fa-list-alt"></i> <span>Blog Categories </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/categories">
                {' '}
                <i className="fa fa-list-alt"></i> <span>Blog Categories </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/blogs' ? (
            <li className="active">
              {' '}
              <Link to="/admin/blogs">
                {' '}
                <i className="fa fa-rss"></i> <span> Blogs </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/blogs">
                {' '}
                <i className="fa fa-rss"></i> <span> Blogs </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/events' ? (
            <li className="active">
              {' '}
              <Link to="/admin/events">
                {' '}
                <i className="fa fa-calendar"></i> <span> Events & Camps </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/events">
                {' '}
                <i className="fa fa-calendar"></i> <span> Events & Camps </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/offers' ||
          this.props.path_name === '/admin/add-offer' ? (
            <li className="active">
              {' '}
              <Link to="/admin/offers">
                {' '}
                <i className="fa fa-percent"></i> <span> Offers </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/offers">
                {' '}
                <i className="fa fa-percent"></i> <span> Offers </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/auto-popup' ||
          this.props.path_name === '/admin/auto-popup' ? (
            <li className="active">
              {' '}
              <Link to="/admin/auto-popup">
                {' '}
                <i className="fa fa-magic"></i> <span> Auto Popup </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/auto-popup">
                {' '}
                <i className="fa fa-magic"></i> <span> Auto Popup </span>
              </Link>{' '}
            </li>
          )}

          {/* =================================================== */}
          <li className={rotate == '4' ? 'treeview active' : 'treeview'}>
            <Link to="/admin/#" data-id="4" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="4"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="4" onClick={this.handlePlus}>
                Lead Landing Page{' '}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="4"
                  onClick={this.handlePlus}
                  className={
                    rotate == '4'
                      ? 'fa pull-right fa-minus'
                      : 'fa pull-right fa-plus'
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === '/admin/lead_landing_page/product' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/lead_landing_page/product">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Products </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/lead_landing_page/product">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Products </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name ===
              '/admin/lead_landing_page/health&benefits' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/lead_landing_page/health&benefits">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Health with Benefits </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/lead_landing_page/health&benefits">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Health with Benefits </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
          </li>

          {/* =================================================== */}
          {this.props.path_name === '/admin/sociallink' ? (
            <li className="active">
              {' '}
              <Link to="/admin/sociallink">
                {' '}
                <i className="fa fa-link"></i> <span> Social Links </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/sociallink">
                {' '}
                <i className="fa fa-link"></i> <span> Social Links </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/message' ? (
            <li className="active">
              {' '}
              <Link to="/admin/message">
                {' '}
                <i className="fa fa-envelope"></i> <span> Messages </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/message">
                {' '}
                <i className="fa fa-envelope"></i> <span> Messages </span>
              </Link>{' '}
            </li>
          )}

          <li className={rotate == '5' ? 'treeview active' : 'treeview'}>
            <Link to="/admin/#" data-id="5" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="5"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="5" onClick={this.handlePlus}>
                Product Details{' '}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="5"
                  onClick={this.handlePlus}
                  className={
                    rotate == '5'
                      ? 'fa pull-right fa-minus'
                      : 'fa pull-right fa-plus'
                  }
                ></i>
              </span>
            </Link>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/lead_landing_page/product' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/product-details/accordion">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Accordion </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/product-details/accordion">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Accordion </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
          </li>

          <li className={rotate == '1' ? 'treeview active' : 'treeview'}>
            <Link to="/admin/#" data-id="1" onClick={this.handlePlus}>
              <i
                className="fas fa-clipboard-list sub-menu"
                data-id="1"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="1" onClick={this.handlePlus}>
                Pages{' '}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="1"
                  onClick={this.handlePlus}
                  className={
                    rotate == '1'
                      ? 'fa pull-right fa-minus'
                      : 'fa pull-right fa-plus'
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === '/admin/pages/privacy-policy' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/pages/privacy-policy">
                    {' '}
                    <i className="fa fa-user-secret"></i>{' '}
                    <span>Privacy Policy</span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/pages/privacy-policy">
                    {' '}
                    <i className="fa fa-user-secret"></i>{' '}
                    <span>Privacy Policy</span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/admin/pages/disclaimer' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/pages/disclaimer">
                    {' '}
                    <i className="fa fa-exclamation-triangle"></i>
                    <span>Disclaimer</span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/pages/disclaimer">
                    {' '}
                    <i className="fa fa-exclamation-triangle"></i>{' '}
                    <span>Disclaimer</span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/admin/pages/terms-and-conditions' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/pages/terms-and-conditions">
                    {' '}
                    <i className="fa fa-list-ol"></i>
                    <span>Terms and Conditions</span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/pages/terms-and-conditions">
                    {' '}
                    <i className="fa fa-list-ol"></i>{' '}
                    <span>Terms and Conditions</span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/admin/pages/covidantibody' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/pages/covidantibody">
                    {' '}
                    <i className="fas fa-vial"></i>
                    <span>Covid Antibody</span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/pages/covidantibody">
                    {' '}
                    <i className="fas fa-vial"></i> <span>Covid Antibody</span>
                  </Link>{' '}
                </li>
              )}

              <li
                className={innerRotate == '1' ? 'treeview active' : 'treeview'}
              >
                <Link to="/admin/#" inner-data-id="1" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-home sub-menu"
                    inner-data-id="1"
                    onClick={this.innerHandlePlus}
                  ></i>{' '}
                  <span inner-data-id="1" onClick={this.innerHandlePlus}>
                    Home{' '}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="1"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == '1'
                          ? 'fa pull-right fa-minus'
                          : 'fa pull-right fa-plus'
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/home/know-who-we-are' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/home/know-who-we-are">
                        {' '}
                        <i className="fas fa-child"></i>{' '}
                        <span>Know Who We Are</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/home/know-who-we-are">
                        {' '}
                        <i className="fas fa-child"></i>{' '}
                        <span>Know Who We Are</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/home/sample-journey' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/home/sample-journey">
                        {' '}
                        <i className="fas fa-file-medical"></i>{' '}
                        <span>Patient Sample Journey</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/home/sample-journey">
                        {' '}
                        <i className="fas fa-file-medical"></i>{' '}
                        <span>Patient Sample Journey</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
              </li>
              <li
                className={innerRotate == '2' ? 'treeview active' : 'treeview'}
              >
                <Link to="/admin/#" inner-data-id="2" onClick={this.innerHandlePlus}>
                  <i
                    className="fa fa-address-book sub-menu"
                    inner-data-id="2"
                    onClick={this.innerHandlePlus}
                  ></i>{' '}
                  <span inner-data-id="2" onClick={this.innerHandlePlus}>
                    Contact Us{' '}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="2"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == '2'
                          ? 'fa pull-right fa-minus'
                          : 'fa pull-right fa-plus'
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/contact-us/numbers' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/contact-us/numbers">
                        {' '}
                        <i className="fa fa-phone"></i> <span>Numbers</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/contact-us/numbers">
                        {' '}
                        <i className="fa fa-phone"></i> <span>Numbers</span>
                      </Link>{' '}
                    </li>
                  )}
                  {this.props.path_name ===
                  '/admin/contact-us/office-addresses' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/contact-us/office-addresses">
                        {' '}
                        <i class="fa fa-building"></i>
                        <span>Office Addresses</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/contact-us/office-addresses">
                        {' '}
                        <i className="fa fa-building"></i>{' '}
                        <span>Office Addresses</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
              </li>

              <li
                className={innerRotate == '3' ? 'treeview active' : 'treeview'}
              >
                <Link to="/admin/#" inner-data-id="3" onClick={this.innerHandlePlus}>
                  <i
                    className="fa fa-heartbeat sub-menu sub-menu"
                    inner-data-id="3"
                    onClick={this.innerHandlePlus}
                  ></i>{' '}
                  <span inner-data-id="3" onClick={this.innerHandlePlus}>
                    Covid 19{' '}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="3"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == '3'
                          ? 'fa pull-right fa-minus'
                          : 'fa pull-right fa-plus'
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/covid19/faq' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/covid19/faq">
                        {' '}
                        <i className="fas fa-book"></i> <span>FAQ</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/covid19/faq">
                        {' '}
                        <i className="fas fa-book"></i> <span>FAQ</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/covid19/speciality' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/covid19/speciality">
                        {' '}
                        <i className="fas fa-notes-medical"></i>{' '}
                        <span>Speciality</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/covid19/speciality">
                        {' '}
                        <i className="fas fa-notes-medical"></i>{' '}
                        <span>Speciality</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/covid19/ebook-upload' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/covid19/ebook-upload">
                        {' '}
                        <i className="fas fa-book-open"></i>{' '}
                        <span>E-Book Upload</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/covid19/ebook-upload">
                        {' '}
                        <i className="fas fa-book-open"></i>{' '}
                        <span>E-Book Upload</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/covid19/testing-center' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/covid19/testing-center">
                        {' '}
                        <i className="fas fa-microscope"></i>{' '}
                        <span>Testing Centers</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/covid19/testing-center">
                        {' '}
                        <i className="fas fa-microscope"></i>{' '}
                        <span>Testing Centers</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
              </li>

              <li
                className={innerRotate == '4' ? 'treeview active' : 'treeview'}
              >
                <Link to="/admin/#" inner-data-id="4" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-coins sub-menu"
                    inner-data-id="4"
                    onClick={this.innerHandlePlus}
                  ></i>{' '}
                  <span inner-data-id="4" onClick={this.innerHandlePlus}>
                    Investors{' '}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="4"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == '4'
                          ? 'fa pull-right fa-minus'
                          : 'fa pull-right fa-plus'
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/investors/members' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/investors/members">
                        {' '}
                        <i className="fas fa-chalkboard-teacher"></i>{' '}
                        <span>Members</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/investors/members">
                        {' '}
                        <i className="fas fa-chalkboard-teacher"></i>{' '}
                        <span>Members</span>
                      </Link>{' '}
                    </li>
                  )}
                  {this.props.path_name === '/admin/investors/memberstype' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/investors/memberstype">
                        {' '}
                        <i className="fas fa-portrait"></i>{' '}
                        <span>Members Type</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/investors/memberstype">
                        {' '}
                        <i className="fas fa-portrait"></i>{' '}
                        <span>Members Type</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name ===
                  '/admin/investors/code-of-conduct' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/investors/code-of-conduct">
                        {' '}
                        <i className="fas fa-receipt"></i>{' '}
                        <span>Code Of Conduct</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/investors/code-of-conduct">
                        {' '}
                        <i className="fas fa-receipt"></i>{' '}
                        <span>Code Of Conduct</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/investors/documents' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/investors/documents">
                        {' '}
                        <i className="fas fa-file-alt"></i>{' '}
                        <span>Documents</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/investors/documents">
                        {' '}
                        <i className="fas fa-file-alt"></i>{' '}
                        <span>Documents</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
              </li>
              <li
                className={innerRotate == '5' ? 'treeview active' : 'treeview'}
              >
                <Link to="/admin/#" inner-data-id="5" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-hiking sub-menu"
                    inner-data-id="5"
                    onClick={this.innerHandlePlus}
                  ></i>{' '}
                  <span inner-data-id="5" onClick={this.innerHandlePlus}>
                    About Us{' '}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="5"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == '5'
                          ? 'fa pull-right fa-minus'
                          : 'fa pull-right fa-plus'
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/about-us/about-srl' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/about-us/about-srl">
                        {' '}
                        <i className="fas fa-chalkboard-teacher"></i>{' '}
                        <span>About SRL</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/about-us/about-srl">
                        {' '}
                        <i className="fas fa-chalkboard-teacher"></i>{' '}
                        <span>About SRL</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/about-us/why-us' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/about-us/why-us">
                        {' '}
                        <i className="fas fa-receipt"></i> <span>Why Us</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/about-us/why-us">
                        {' '}
                        <i className="fas fa-receipt"></i> <span>Why Us</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/about-us/values' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/about-us/values">
                        {' '}
                        <i className="fas fa-lightbulb"></i> <span>Values</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/about-us/values">
                        {' '}
                        <i className="fas fa-lightbulb"></i> <span>Values</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === '/admin/about-us/key-members' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/about-us/key-members">
                        {' '}
                        <i className="fab fa-black-tie"></i>{' '}
                        <span>Key Members</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/about-us/key-members">
                        {' '}
                        <i className="fab fa-black-tie"></i>{' '}
                        <span>Key Members</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name ===
                  '/admin/about-us/awards-accreditation' ? (
                    <li className="active">
                      {' '}
                      <Link to="/admin/about-us/awards-accreditation">
                        {' '}
                        <i className="fas fa-award"></i>{' '}
                        <span>Awards & Accreditations</span>
                      </Link>{' '}
                    </li>
                  ) : (
                    <li>
                      {' '}
                      <Link to="/admin/about-us/awards-accreditation">
                        {' '}
                        <i className="fas fa-award"></i>{' '}
                        <span>Awards & Accreditations</span>
                      </Link>{' '}
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </li>

          {this.props.path_name === '/admin/lead-forms' ? (
            <li className="active">
              {' '}
              <Link to="/admin/lead-forms">
                {' '}
                <i className="fa fa-magic" aria-hidden="true"></i>{' '}
                <span> Lead Form Responses </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/lead-forms">
                {' '}
                <i className="fa fa-magic" aria-hidden="true"></i>{' '}
                <span> Lead Form Responses </span>
              </Link>{' '}
            </li>
          )}
          {this.props.path_name === '/admin/gallery' ? (
            <li className="active">
              {' '}
              <Link to="/admin/gallery">
                {' '}
                <i className="fas fa-file-image" aria-hidden="true"></i>{' '}
                <span> Gallery </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/admin/gallery">
                {' '}
                <i className="fas fa-file-image" aria-hidden="true"></i>{' '}
                <span> Gallery </span>
              </Link>{' '}
            </li>
          )}
          <li className={rotate == '2' ? 'treeview active' : 'treeview'}>
            <Link to="/admin/#" data-id="2" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="2"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="2" onClick={this.handlePlus}>
                Application{' '}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="2"
                  onClick={this.handlePlus}
                  className={
                    rotate == '2'
                      ? 'fa pull-right fa-minus'
                      : 'fa pull-right fa-plus'
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === '/admin/app/splash-schreen' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/app/splash-schreen">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Splash Screen </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/app/splash-schreen">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Splash Screen </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/app/helptour' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/app/helptour">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Help Tour </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/app/helptour">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Help Tour </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/app/application-banner' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/app/application-banner">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Application Banner </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/app/application-banner">
                    {' '}
                    <i className="fas fa-file-medical"></i>{' '}
                    <span> Application Banner </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
          </li>
          <li className={rotate == '3' ? 'treeview active' : 'treeview'}>
            <Link to="/admin/#" data-id="3" onClick={this.handlePlus}>
              <i
                className="fas fa-sort-amount-down sub-menu"
                data-id="3"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="3" onClick={this.handlePlus}>
                Ordering{' '}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="3"
                  onClick={this.handlePlus}
                  className={
                    rotate == '3'
                      ? 'fa pull-right fa-minus'
                      : 'fa pull-right fa-plus'
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === '/admin/ordering/banner' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/ordering/banner">
                    {' '}
                    <i className="fas fa-image"></i> <span> Banner </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/ordering/banner">
                    {' '}
                    <i className="fas fa-image"></i> <span> Banner </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/ordering/speciality' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/ordering/speciality">
                    {' '}
                    <i className="fas fa-sun"></i> <span> Speciality </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/ordering/speciality">
                    {' '}
                    <i className="fas fa-sun"></i> <span> Speciality </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/ordering/code-of-conduct' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/ordering/code-of-conduct">
                    {' '}
                    <i className="fas fa-laptop-code"></i>{' '}
                    <span> Code of Conduct </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/ordering/code-of-conduct">
                    {' '}
                    <i className="fas fa-laptop-code"></i>{' '}
                    <span> Code of Conduct </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === '/admin/ordering/faq' ? (
                <li className="active">
                  {' '}
                  <Link to="/admin/ordering/faq">
                    {' '}
                    <i className="fas fa-question-circle"></i>{' '}
                    <span> FAQ </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/admin/ordering/faq">
                    {' '}
                    <i className="fas fa-question-circle"></i>{' '}
                    <span> FAQ </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
          </li>
        </ul>
      </section>
    );
  };

  render() {
    if (this.props.isLoggedIn === false) return null;
    return <aside className="main-sidebar">{this.getAdminMenu()}</aside>;
  }
}

export default SidebarAdmin;
