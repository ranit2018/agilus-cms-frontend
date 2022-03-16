import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { getSuperAdmin } from "../../../shared/helper";

class Sidebar extends Component {
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
    var path = this.props.path_name; // console.log(path);

    if (
      path === '/hr/master-jobs/job-categories' ||
      path === '/hr/master-jobs/job-roles' ||
      path === '/hr/master-jobs/job-skills' ||
      path === '/hr/master-jobs/job-location'
    ) {
      this.setState({ shown: '5' });
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

  getHRMenu = () => {
    const rotate = this.state.shown;
    const innerRotate = this.state.innerShown;
    return (
      <section className="sidebar">
        <ul className="sidebar-menu">
          {this.props.path_name === '/hr/dashboard' ? (
            <li className="active">
              {' '}
              <Link to="/hr/dashboard">
                {' '}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/hr/dashboard">
                {' '}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{' '}
            </li>
          )}
          {/*====jobs======*/}
          {this.props.path_name === '/hr/jobs' ? (
            <li className="active">
              {' '}
              <Link to="/hr/jobs">
                {' '}
                <i className="fa fa-building"></i> <span> Jobs </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/hr/jobs">
                {' '}
                <i className="fa fa-building"></i> <span> Jobs </span>
              </Link>{' '}
            </li>
          )}
          {/* ===================================== */}
          <li className={rotate == '5' ? 'treeview active' : 'treeview'}>
            <Link to="#" data-id="5" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="5"
                onClick={this.handlePlus}
              ></i>{' '}
              <span data-id="5" onClick={this.handlePlus}>
                master jobs{' '}
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
              {this.props.path_name === '/hr/master-jobs/job-categories' ? (
                <li className="active">
                  {' '}
                  <Link to="/hr/master-jobs/job-categories">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Categories </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/hr/master-jobs/job-categories">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Categories </span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/hr/master-jobs/job-roles' ? (
                <li className="active">
                  {' '}
                  <Link to="/hr/master-jobs/job-roles">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Roles </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/hr/master-jobs/job-roles">
                    {' '}
                    <i className="fas fa-compress"></i> <span> Roles </span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/hr/master-jobs/job-skills' ? (
                <li className="active">
                  {' '}
                  <Link to="/hr/master-jobs/job-skills">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Job Skills </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/hr/master-jobs/job-skills">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Job Skills </span>
                  </Link>{' '}
                </li>
              )}
              {this.props.path_name === '/hr/master-jobs/job-location' ? (
                <li className="active">
                  {' '}
                  <Link to="/hr/master-jobs/job-location">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Job Location </span>
                  </Link>{' '}
                </li>
              ) : (
                <li>
                  {' '}
                  <Link to="/hr/master-jobs/job-location">
                    {' '}
                    <i className="fas fa-compress"></i>{' '}
                    <span> Job Location </span>
                  </Link>{' '}
                </li>
              )}
            </ul>
          </li>
          {/*====applied jobs======*/}
          {this.props.path_name === '/hr/appliedjobs' ? (
            <li className="active">
              {' '}
              <Link to="/hr/appliedjobs">
                {' '}
                <i className="fab fa-black-tie"></i> <span> Applied Jobs </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/hr/appliedjobs">
                {' '}
                <i className="fab fa-black-tie"></i> <span> Applied Jobs </span>
              </Link>{' '}
            </li>
          )}
          {/*====registers users======*/}
          {this.props.path_name === '/hr/registered-users' ? (
            <li className="active">
              {' '}
              <Link to="/hr/registered-users">
                {' '}
                <i className="fa fa-users"></i> <span> Registered Users </span>
              </Link>{' '}
            </li>
          ) : (
            <li>
              {' '}
              <Link to="/hr/registered-users">
                {' '}
                <i className="fa fa-users"></i> <span> Registered Users </span>
              </Link>{' '}
            </li>
          )}
        </ul>
      </section>
    );
  };

  render() {
    if (this.props.isLoggedIn === false) return null;
    return <aside className="main-sidebar">{this.getHRMenu()}</aside>;
  }
}

export default Sidebar;
