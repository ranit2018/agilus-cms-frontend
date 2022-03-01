import React, { Component, Fragment } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import SidebarAdmin from "../sidebaradmin/SidebarAdmin";

class Layout extends Component {
  componentDidMount() {
    document.body.classList.add("admin-skin-blue");
    document.body.classList.add("sidebar-mini");
    document.body.classList.add("fixed");
  }

  render() {
    const isLoggedIn = localStorage.getItem("admin_token") !== null ? true : false;

    const path_name = this.props.history.location.pathname;

    return (
      <Fragment>
        <Header isLoggedIn={isLoggedIn} />
        <SidebarAdmin isLoggedIn={isLoggedIn} path_name={path_name} />
        {this.props.children}
        <Footer isLoggedIn={isLoggedIn} />
      </Fragment>
    );
  }
}

export default Layout;
