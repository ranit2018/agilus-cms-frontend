import React, { Component } from "react";
import { Link } from "react-router-dom";
// import { getSuperAdmin } from "../../../shared/helper";

class Sidebar extends Component {
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
      path === "/master-jobs/jobcategories" ||
      path === "/master-jobs/jobcategories"
    ) {
      this.setState({ shown: "5" });
    }

    // if (this.props.isLoggedIn === true) {
    //   const superAdmin = getSuperAdmin(localStorage.hr_token);
    //   if (superAdmin) {
    //     this.setState({ super_admin: 1 });
    //   } else {
    //     return null;
    //   }
    // }
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

          {/* ===================================== */}
          <li className={rotate == "5" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="5" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="5"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="5" onClick={this.handlePlus}>
                master jobs{" "}
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
              {this.props.path_name === "/master-jobs/jobcategories" ? (
                <li className="active">
                  {" "}
                  <Link to="/master-jobs/jobcategories">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Categories </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/master-jobs/jobcategories">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Categories </span>
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

export default Sidebar;
