import React, { Component } from "react";
import { Link } from "react-router-dom";
import { getSuperAdmin } from "../../../shared/helper";

class SidebarAdmin extends Component {
  constructor() {
    super();
    this.state = {
      shown: "",
      innerShown: "",
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
      path === "/pages/privacy-policy" ||
      path === "/pages/disclaimer" ||
      path === "/pages/terms-and-conditions" ||
      path === "/pages/covidantibody"
    ) {
      this.setState({ shown: "1" });
    }

    if (path === "/home/know-who-we-are" || path === "/home/sample-journey") {
      this.setState({ shown: "1", innerShown: "1" });
    }

    if (
      path === "/contact-us/numbers" ||
      path === "/contact-us/office-addresses"
    ) {
      this.setState({ shown: "1", innerShown: "2" });
    }

    if (
      path === "/covid19/faq" ||
      path === "/covid19/speciality" ||
      path === "/covid19/ebook-upload" ||
      path === "/covid19/testing-center" ||
      path === "/covid19/testing-center"
    ) {
      this.setState({ shown: "1", innerShown: "3" });
    }

    if (
      path === "/investors/members" ||
      path === "/investors/code-of-conduct" ||
      path === "/investors/documents" ||
      path === "/investors/memberstype"
    ) {
      this.setState({ shown: "1", innerShown: "4" });
    }

    if (
      path === "/rnd/categories" ||
      path === "/rnd/documents" ||
      path === "/rnd/partners" ||
      path === "/rnd/rnd_content_tab"
    ) {
      this.setState({ shown: "1", innerShown: "45" });
    }

    if (
      path === "/about-us/about-srl" ||
      path === "/about-us/why-us" ||
      path === "/about-us/values" ||
      path === "/about-us/awards-accreditation" ||
      path === "/about-us/key-members"
    ) {
      this.setState({ shown: "1", innerShown: "5" });
    }

    if (
      path === "/app/splash-schreen" ||
      path === "/app/helptour" ||
      path === "/app/application-banner"
    ) {
      this.setState({ shown: "2" });
    }
    if (
      path === "/ordering/banner" ||
      path === "/ordering/speciality" ||
      path === "/ordering/code-of-conduct" ||
      path === "/ordering/faq"
    ) {
      this.setState({ shown: "3" });
    }

    if (
      path === "/lead_landing_page/product" ||
      path === "/lead_landing_page/health&benefits"
    ) {
      this.setState({ shown: "4" });
    }

    if (
      path === "/product-details/accordion" ||
      path === "/product-details/add-accordion"
    ) {
      this.setState({ shown: "5" });
    }
    if (
      path === "/partner-page/aboutus" ||
      path === "/partner-page/amenities" ||
      path === "/partner-page/services" ||
      path === "/partner-page/center-images" ||
      path === "/partner-page/current-offers" ||
      path === "/partner-page/add-aboutus"
    ) {
      this.setState({ shown: "6" });
    }

    if (
      path === "/dynamic_landing_page/page" ||
      path === "/dynamic_landing_page/lead" ||
      path === "/add-page" ||
      path === "/edit-page/:id"
    ) {
      this.setState({ shown: "7" });
    }
    if (
      path === "/career-page/inside-srl" ||
      path === "/career-page/life-at-srl" ||
      path === "/career-page/fact-about-srl" ||
      path === "/career-page/benefits"
      //  || path === "/partner-page/center-images"
      // || path === "/partner-page/current-offers"
    ) {
      this.setState({ shown: "8" });
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
    const id = event.target.getAttribute("data-id");
    id != this.state.shown
      ? this.setState({ shown: id })
      : this.setState({ shown: "" });
  };

  innerHandlePlus = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute("inner-data-id");
    console.log(id);
    id != this.state.innerShown
      ? this.setState({ innerShown: id })
      : this.setState({ innerShown: "" });
  };

  getAdminMenu = () => {
    const rotate = this.state.shown;
    const innerRotate = this.state.innerShown;
    return (
      <section className="sidebar">
        <ul className="sidebar-menu">
          {this.props.path_name === "/dashboard" ? (
            <li className="active">
              {" "}
              <Link to="/dashboard">
                {" "}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/dashboard">
                {" "}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{" "}
            </li>
          )}

          {this.props.path_name === "/banner" ? (
            <li className="active">
              {" "}
              <Link to="/banner">
                {" "}
                <i className="fa fa-flag"></i> <span> Banners</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/banner">
                {" "}
                <i className="fa fa-flag"></i> <span> Banners</span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/testimonials" ? (
            <li className="active">
              {" "}
              <Link to="/testimonials">
                {" "}
                <i className="fa fa-quote-left"></i> <span> Testimonial </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/testimonials">
                {" "}
                <i className="fa fa-quote-left"></i> <span> Testimonial </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/categories" ? (
            <li className="active">
              {" "}
              <Link to="/categories">
                {" "}
                <i className="fa fa-list-alt"></i> <span>Blog Categories </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/categories">
                {" "}
                <i className="fa fa-list-alt"></i> <span>Blog Categories </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/blogs" ? (
            <li className="active">
              {" "}
              <Link to="/blogs">
                {" "}
                <i className="fa fa-rss"></i> <span> Blogs </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/blogs">
                {" "}
                <i className="fa fa-rss"></i> <span> Blogs </span>
              </Link>{" "}
            </li>
          )}

          <li className={rotate == "6" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="6" onClick={this.handlePlus}>
              <i
                className="fas fa-handshake sub-menu"
                data-id="6"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="6" onClick={this.handlePlus}>
                Partner Page{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="6"
                  onClick={this.handlePlus}
                  className={
                    rotate == "6"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/partner-page/aboutus" ? (
                <li className="active">
                  {" "}
                  <Link to="/partner-page/aboutus">
                    {" "}
                    <i className="fas fa-compress"></i> <span> About Us </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/partner-page/aboutus">
                    {" "}
                    <i className="fas fa-compress"></i> <span> About Us </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/partner-page/amenities" ? (
                <li className="active">
                  {" "}
                  <Link to="/partner-page/amenities">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Amenities </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/partner-page/amenities">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Amenities </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/partner-page/services" ? (
                <li className="active">
                  {" "}
                  <Link to="/partner-page/services">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Services </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/partner-page/services">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Services </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/partner-page/center-images" ? (
                <li className="active">
                  {" "}
                  <Link to="/partner-page/center-images">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Center Images </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/partner-page/center-images">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Center Images </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/partner-page/current-offers" ? (
                <li className="active">
                  {" "}
                  <Link to="/partner-page/current-offers">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Current Offers </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/partner-page/current-offers">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Current Offers </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>

          {this.props.path_name === "/events" ? (
            <li className="active">
              {" "}
              <Link to="/events">
                {" "}
                <i className="fa fa-calendar"></i> <span> Events & Camps </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/events">
                {" "}
                <i className="fa fa-calendar"></i> <span> Events & Camps </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/offers" ||
          this.props.path_name === "/add-offer" ? (
            <li className="active">
              {" "}
              <Link to="/offers">
                {" "}
                <i className="fa fa-percent"></i> <span> Offers </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/offers">
                {" "}
                <i className="fa fa-percent"></i> <span> Offers </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/auto-popup" ||
          this.props.path_name === "/auto-popup" ? (
            <li className="active">
              {" "}
              <Link to="/auto-popup">
                {" "}
                <i className="fa fa-magic"></i> <span> Auto Popup </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/auto-popup">
                {" "}
                <i className="fa fa-magic"></i> <span> Auto Popup </span>
              </Link>{" "}
            </li>
          )}

          {/* =================================================== */}
          <li className={rotate == "4" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="4" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="4"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="4" onClick={this.handlePlus}>
                Lead Landing Page{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="4"
                  onClick={this.handlePlus}
                  className={
                    rotate == "4"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/lead_landing_page/product" ? (
                <li className="active">
                  {" "}
                  <Link to="/lead_landing_page/product">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Products </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/lead_landing_page/product">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Products </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/lead_landing_page/health&benefits" ? (
                <li className="active">
                  {" "}
                  <Link to="/lead_landing_page/health&benefits">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Health with Benefits </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/lead_landing_page/health&benefits">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Health with Benefits </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>

          {/* =================================================== */}

          {/* dynamic landing apge start */}
          <li className={rotate == "7" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="7" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="7"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="7" onClick={this.handlePlus}>
                Dynamic Landing Page{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="7"
                  onClick={this.handlePlus}
                  className={
                    rotate == "7"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/dynamic_landing_page/page" ||
              this.props.path_name === "/add-page" ||
              this.props.path_name === "/edit-page/:id" ? (
                <li className="active">
                  {" "}
                  <Link to="/dynamic_landing_page/page">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Pages </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/dynamic_landing_page/page">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Pages </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/dynamic_landing_page/lead" ? (
                <li className="active">
                  {" "}
                  <Link to="/dynamic_landing_page/lead">
                    {" "}
                    <i className="fas fa-file-medical"></i> <span> Leads </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/dynamic_landing_page/lead">
                    {" "}
                    <i className="fas fa-file-medical"></i> <span> Leads </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>
          {/* dynaimc landing page end */}

          {/* hr start */}
          <li className={rotate == "8" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="8" onClick={this.handlePlus}>
              <i
                className="fas fa-briefcase sub-menu"
                data-id="8"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="8" onClick={this.handlePlus}>
                Career Page{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="8"
                  onClick={this.handlePlus}
                  className={
                    rotate == "8"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/career-page/inside-srl" ? (
                <li className="active">
                  {" "}
                  <Link to="/career-page/inside-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Inside SRL </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/career-page/inside-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Inside SRL </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/career-page/life-at-srl" ? (
                <li className="active">
                  {" "}
                  <Link to="/career-page/life-at-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Life At SRL </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/career-page/life-at-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Life At SRL </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/career-page/fact-about-srl" ? (
                <li className="active">
                  {" "}
                  <Link to="/career-page/fact-about-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Fact About SRL </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/career-page/fact-about-srl">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Fact About SRL </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/career-page/benefits" ? (
                <li className="active">
                  {" "}
                  <Link to="/career-page/benefits">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Benefits </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/career-page/benefits">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Benefits </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>
          {/* hr end */}
          {this.props.path_name === "/sociallink" ? (
            <li className="active">
              {" "}
              <Link to="/sociallink">
                {" "}
                <i className="fa fa-link"></i> <span> Social Links </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/sociallink">
                {" "}
                <i className="fa fa-link"></i> <span> Social Links </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/message" ? (
            <li className="active">
              {" "}
              <Link to="/message">
                {" "}
                <i className="fa fa-envelope"></i> <span> Messages </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/message">
                {" "}
                <i className="fa fa-envelope"></i> <span> Messages </span>
              </Link>{" "}
            </li>
          )}

          <li className={rotate == "5" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="5" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="5"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="5" onClick={this.handlePlus}>
                Product Details{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="5"
                  onClick={this.handlePlus}
                  className={
                    rotate == "5"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>
            <ul className="treeview-menu">
              {this.props.path_name === "/lead_landing_page/product" ? (
                <li className="active">
                  {" "}
                  <Link to="/product-details/accordion">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Accordion </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/product-details/accordion">
                    {" "}
                    <i className="fas fa-compress"></i> <span> Accordion </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>

          <li className={rotate == "1" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="1" onClick={this.handlePlus}>
              <i
                className="fas fa-clipboard-list sub-menu"
                data-id="1"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="1" onClick={this.handlePlus}>
                Pages{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="1"
                  onClick={this.handlePlus}
                  className={
                    rotate == "1"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/pages/privacy-policy" ? (
                <li className="active">
                  {" "}
                  <Link to="/pages/privacy-policy">
                    {" "}
                    <i className="fa fa-user-secret"></i>{" "}
                    <span>Privacy Policy</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/pages/privacy-policy">
                    {" "}
                    <i className="fa fa-user-secret"></i>{" "}
                    <span>Privacy Policy</span>
                  </Link>{" "}
                </li>
              )}
              {this.props.path_name === "/pages/disclaimer" ? (
                <li className="active">
                  {" "}
                  <Link to="/pages/disclaimer">
                    {" "}
                    <i className="fa fa-exclamation-triangle"></i>
                    <span>Disclaimer</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/pages/disclaimer">
                    {" "}
                    <i className="fa fa-exclamation-triangle"></i>{" "}
                    <span>Disclaimer</span>
                  </Link>{" "}
                </li>
              )}
              {this.props.path_name === "/pages/terms-and-conditions" ? (
                <li className="active">
                  {" "}
                  <Link to="/pages/terms-and-conditions">
                    {" "}
                    <i className="fa fa-list-ol"></i>
                    <span>Terms and Conditions</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/pages/terms-and-conditions">
                    {" "}
                    <i className="fa fa-list-ol"></i>{" "}
                    <span>Terms and Conditions</span>
                  </Link>{" "}
                </li>
              )}
              {this.props.path_name === "/pages/covidantibody" ? (
                <li className="active">
                  {" "}
                  <Link to="/pages/covidantibody">
                    {" "}
                    <i className="fas fa-vial"></i>
                    <span>Covid Antibody</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/pages/covidantibody">
                    {" "}
                    <i className="fas fa-vial"></i> <span>Covid Antibody</span>
                  </Link>{" "}
                </li>
              )}

              <li
                className={innerRotate == "1" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="1" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-home sub-menu"
                    inner-data-id="1"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="1" onClick={this.innerHandlePlus}>
                    Home{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="1"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "1"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === "/home/know-who-we-are" ? (
                    <li className="active">
                      {" "}
                      <Link to="/home/know-who-we-are">
                        {" "}
                        <i className="fas fa-child"></i>{" "}
                        <span>Know Who We Are</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/home/know-who-we-are">
                        {" "}
                        <i className="fas fa-child"></i>{" "}
                        <span>Know Who We Are</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/home/sample-journey" ? (
                    <li className="active">
                      {" "}
                      <Link to="/home/sample-journey">
                        {" "}
                        <i className="fas fa-file-medical"></i>{" "}
                        <span>Patient Sample Journey</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/home/sample-journey">
                        {" "}
                        <i className="fas fa-file-medical"></i>{" "}
                        <span>Patient Sample Journey</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>
              <li
                className={innerRotate == "2" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="2" onClick={this.innerHandlePlus}>
                  <i
                    className="fa fa-address-book sub-menu"
                    inner-data-id="2"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="2" onClick={this.innerHandlePlus}>
                    Contact Us{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="2"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "2"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === "/contact-us/numbers" ? (
                    <li className="active">
                      {" "}
                      <Link to="/contact-us/numbers">
                        {" "}
                        <i className="fa fa-phone"></i> <span>Numbers</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/contact-us/numbers">
                        {" "}
                        <i className="fa fa-phone"></i> <span>Numbers</span>
                      </Link>{" "}
                    </li>
                  )}
                  {this.props.path_name === "/contact-us/office-addresses" ? (
                    <li className="active">
                      {" "}
                      <Link to="/contact-us/office-addresses">
                        {" "}
                        <i class="fa fa-building"></i>
                        <span>Office Addresses</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/contact-us/office-addresses">
                        {" "}
                        <i className="fa fa-building"></i>{" "}
                        <span>Office Addresses</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>

              <li
                className={innerRotate == "3" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="3" onClick={this.innerHandlePlus}>
                  <i
                    className="fa fa-heartbeat sub-menu sub-menu"
                    inner-data-id="3"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="3" onClick={this.innerHandlePlus}>
                    Covid 19{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="3"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "3"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === "/covid19/faq" ? (
                    <li className="active">
                      {" "}
                      <Link to="/covid19/faq">
                        {" "}
                        <i className="fas fa-book"></i> <span>FAQ</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/covid19/faq">
                        {" "}
                        <i className="fas fa-book"></i> <span>FAQ</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/covid19/speciality" ? (
                    <li className="active">
                      {" "}
                      <Link to="/covid19/speciality">
                        {" "}
                        <i className="fas fa-notes-medical"></i>{" "}
                        <span>Speciality</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/covid19/speciality">
                        {" "}
                        <i className="fas fa-notes-medical"></i>{" "}
                        <span>Speciality</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/covid19/ebook-upload" ? (
                    <li className="active">
                      {" "}
                      <Link to="/covid19/ebook-upload">
                        {" "}
                        <i className="fas fa-book-open"></i>{" "}
                        <span>E-Book Upload</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/covid19/ebook-upload">
                        {" "}
                        <i className="fas fa-book-open"></i>{" "}
                        <span>E-Book Upload</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/covid19/testing-center" ? (
                    <li className="active">
                      {" "}
                      <Link to="/covid19/testing-center">
                        {" "}
                        <i className="fas fa-microscope"></i>{" "}
                        <span>Testing Centers</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/covid19/testing-center">
                        {" "}
                        <i className="fas fa-microscope"></i>{" "}
                        <span>Testing Centers</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>
              {/* R & D PAGE MENU */}
              <li
                className={innerRotate == "45" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="45" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-coins sub-menu"
                    inner-data-id="45"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="45" onClick={this.innerHandlePlus}>
                    R &amp; D Page{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="45"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "45"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>
                <ul className="treeview-menu">
                  {this.props.path_name === "/rnd/categories" ? (
                    <li className="active">
                      {" "}
                      <Link to="/rnd/categories">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>Categories</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/rnd/categories">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>Categories</span>
                      </Link>{" "}
                    </li>
                  )}
                  {this.props.path_name === "/rnd/documents" ? (
                    <li className="active">
                      {" "}
                      <Link to="/rnd/documents">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Documents</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/rnd/documents">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Documents</span>
                      </Link>{" "}
                    </li>
                  )}
                  {this.props.path_name === "/rnd/partners" ? (
                    <li className="active">
                      {" "}
                      <Link to="/rnd/partners">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Partners</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/rnd/partners">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Partners</span>
                      </Link>{" "}
                    </li>
                  )}
                  {this.props.path_name === "/rnd/rnd_content_tab" ? (
                    <li className="active">
                      {" "}
                      <Link to="/rnd/rnd_content_tab">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Content Tab</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/rnd/rnd_content_tab">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Content Tab</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>
              {/* R & D PAGE MENU END */}

              <li
                className={innerRotate == "4" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="4" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-coins sub-menu"
                    inner-data-id="4"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="4" onClick={this.innerHandlePlus}>
                    Investors{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="4"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "4"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === "/investors/members" ? (
                    <li className="active">
                      {" "}
                      <Link to="/investors/members">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>Members</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/investors/members">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>Members</span>
                      </Link>{" "}
                    </li>
                  )}
                  {this.props.path_name === "/investors/memberstype" ? (
                    <li className="active">
                      {" "}
                      <Link to="/investors/memberstype">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Members Type</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/investors/memberstype">
                        {" "}
                        <i className="fas fa-portrait"></i>{" "}
                        <span>Members Type</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/investors/code-of-conduct" ? (
                    <li className="active">
                      {" "}
                      <Link to="/investors/code-of-conduct">
                        {" "}
                        <i className="fas fa-receipt"></i>{" "}
                        <span>Code Of Conduct</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/investors/code-of-conduct">
                        {" "}
                        <i className="fas fa-receipt"></i>{" "}
                        <span>Code Of Conduct</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/investors/documents" ? (
                    <li className="active">
                      {" "}
                      <Link to="/investors/documents">
                        {" "}
                        <i className="fas fa-file-alt"></i>{" "}
                        <span>Documents</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/investors/documents">
                        {" "}
                        <i className="fas fa-file-alt"></i>{" "}
                        <span>Documents</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>
              <li
                className={innerRotate == "5" ? "treeview active" : "treeview"}
              >
                <Link to="#" inner-data-id="5" onClick={this.innerHandlePlus}>
                  <i
                    className="fas fa-hiking sub-menu"
                    inner-data-id="5"
                    onClick={this.innerHandlePlus}
                  ></i>{" "}
                  <span inner-data-id="5" onClick={this.innerHandlePlus}>
                    About Us{" "}
                  </span>
                  <span className="pull-right-container">
                    <i
                      inner-data-id="5"
                      onClick={this.innerHandlePlus}
                      className={
                        innerRotate == "5"
                          ? "fa pull-right fa-minus"
                          : "fa pull-right fa-plus"
                      }
                    ></i>
                  </span>
                </Link>

                <ul className="treeview-menu">
                  {this.props.path_name === "/about-us/about-srl" ? (
                    <li className="active">
                      {" "}
                      <Link to="/about-us/about-srl">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>About SRL</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/about-us/about-srl">
                        {" "}
                        <i className="fas fa-chalkboard-teacher"></i>{" "}
                        <span>About SRL</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/about-us/why-us" ? (
                    <li className="active">
                      {" "}
                      <Link to="/about-us/why-us">
                        {" "}
                        <i className="fas fa-receipt"></i> <span>Why Us</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/about-us/why-us">
                        {" "}
                        <i className="fas fa-receipt"></i> <span>Why Us</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/about-us/values" ? (
                    <li className="active">
                      {" "}
                      <Link to="/about-us/values">
                        {" "}
                        <i className="fas fa-lightbulb"></i> <span>Values</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/about-us/values">
                        {" "}
                        <i className="fas fa-lightbulb"></i> <span>Values</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/about-us/key-members" ? (
                    <li className="active">
                      {" "}
                      <Link to="/about-us/key-members">
                        {" "}
                        <i className="fab fa-black-tie"></i>{" "}
                        <span>Key Members</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/about-us/key-members">
                        {" "}
                        <i className="fab fa-black-tie"></i>{" "}
                        <span>Key Members</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
                <ul className="treeview-menu">
                  {this.props.path_name === "/about-us/awards-accreditation" ? (
                    <li className="active">
                      {" "}
                      <Link to="/about-us/awards-accreditation">
                        {" "}
                        <i className="fas fa-award"></i>{" "}
                        <span>Awards & Accreditations</span>
                      </Link>{" "}
                    </li>
                  ) : (
                    <li>
                      {" "}
                      <Link to="/about-us/awards-accreditation">
                        {" "}
                        <i className="fas fa-award"></i>{" "}
                        <span>Awards & Accreditations</span>
                      </Link>{" "}
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </li>

          {this.props.path_name === "/lead-forms" ? (
            <li className="active">
              {" "}
              <Link to="/lead-forms">
                {" "}
                <i className="fa fa-magic" aria-hidden="true"></i>{" "}
                <span> Lead Form Responses </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/lead-forms">
                {" "}
                <i className="fa fa-magic" aria-hidden="true"></i>{" "}
                <span> Lead Form Responses </span>
              </Link>{" "}
            </li>
          )}
          {this.props.path_name === "/gallery" ? (
            <li className="active">
              {" "}
              <Link to="/gallery">
                {" "}
                <i className="fas fa-file-image" aria-hidden="true"></i>{" "}
                <span> Gallery </span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/gallery">
                {" "}
                <i className="fas fa-file-image" aria-hidden="true"></i>{" "}
                <span> Gallery </span>
              </Link>{" "}
            </li>
          )}
          <li className={rotate == "2" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="2" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="2"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="2" onClick={this.handlePlus}>
                Application{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="2"
                  onClick={this.handlePlus}
                  className={
                    rotate == "2"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/app/splash-schreen" ? (
                <li className="active">
                  {" "}
                  <Link to="/app/splash-schreen">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Splash Screen </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/app/splash-schreen">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Splash Screen </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/app/helptour" ? (
                <li className="active">
                  {" "}
                  <Link to="/app/helptour">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Help Tour </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/app/helptour">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Help Tour </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/app/application-banner" ? (
                <li className="active">
                  {" "}
                  <Link to="/app/application-banner">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Application Banner </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/app/application-banner">
                    {" "}
                    <i className="fas fa-file-medical"></i>{" "}
                    <span> Application Banner </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>
          <li className={rotate == "3" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="3" onClick={this.handlePlus}>
              <i
                className="fas fa-sort-amount-down sub-menu"
                data-id="3"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="3" onClick={this.handlePlus}>
                Ordering{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="3"
                  onClick={this.handlePlus}
                  className={
                    rotate == "3"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/ordering/banner" ? (
                <li className="active">
                  {" "}
                  <Link to="/ordering/banner">
                    {" "}
                    <i className="fas fa-image"></i> <span> Banner </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/ordering/banner">
                    {" "}
                    <i className="fas fa-image"></i> <span> Banner </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/ordering/speciality" ? (
                <li className="active">
                  {" "}
                  <Link to="/ordering/speciality">
                    {" "}
                    <i className="fas fa-sun"></i> <span> Speciality </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/ordering/speciality">
                    {" "}
                    <i className="fas fa-sun"></i> <span> Speciality </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/ordering/code-of-conduct" ? (
                <li className="active">
                  {" "}
                  <Link to="/ordering/code-of-conduct">
                    {" "}
                    <i className="fas fa-laptop-code"></i>{" "}
                    <span> Code of Conduct </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/ordering/code-of-conduct">
                    {" "}
                    <i className="fas fa-laptop-code"></i>{" "}
                    <span> Code of Conduct </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/ordering/faq" ? (
                <li className="active">
                  {" "}
                  <Link to="/ordering/faq">
                    {" "}
                    <i className="fas fa-question-circle"></i>{" "}
                    <span> FAQ </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/ordering/faq">
                    {" "}
                    <i className="fas fa-question-circle"></i>{" "}
                    <span> FAQ </span>
                  </Link>{" "}
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
