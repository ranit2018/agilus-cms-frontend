import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../components/hr/login/Login';
import AdminPageNotFound from '../components/404/AdminPageNotFound';

import Dashboard from '../components/hr/dashboard/Dashboard';

import JobCategories from '../components/hr/master-jobs/job-categories/JobCategories';
import Roles from '../components/hr/master-jobs/roles/Roles';
import JobSkills from '../components/hr/master-jobs/job-skills/JobSkills';
import JobLocation from '../components/hr/master-jobs/job-location/JobLocation';
import Jobs from '../components/hr/jobs/Jobs';
import Addjob from '../components/hr/jobs/AddJobs';
import EditJob from '../components/hr/jobs/EditJobs';
import AppliedJobs from '../components/hr/applied-jobs/AppliedJobs';
import RegisteredUsers from '../components/hr/registered-users/RegisteredUsers';
import JobExperience from '../components/hr/master-jobs/experience/Experience';
import JobTravelNeeded from '../components/hr/master-jobs/travel-needed/TravelNeeded';

import '../assets/css/all.css';
import '../assets/css/admin-style.css';
import '../assets/css/admin-skin-blue.css';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

// Private Route for inner component
const PrivateRoute = ({ component: RefComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem('hr_token') ? (
        <RefComponent {...props} />
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

class HR extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute
          path="/hr/dashboard"
          component={Dashboard}
          handler="Dashboard"
        />
        <PrivateRoute
          path="/hr/master-jobs/job-categories"
          component={JobCategories}
        />

        {/* ===job roles==== */}
        <PrivateRoute path="/hr/master-jobs/job-roles" component={Roles} />

        {/* ===job skills==== */}
        <PrivateRoute path="/hr/master-jobs/job-skills" component={JobSkills} />

        {/* ===job location==== */}
        <PrivateRoute
          path="/hr/master-jobs/job-location"
          component={JobLocation}
        />

        {/* ===jobs==== */}
        <PrivateRoute path="/hr/jobs" component={Jobs} />
        <PrivateRoute path="/hr/add-job" component={Addjob} />
        <PrivateRoute path="/hr/edit-job/:id" component={EditJob} />

        {/* ====Applied jobs====*/}
        <PrivateRoute path="/hr/appliedjobs" component={AppliedJobs} />

        {/*====registered users====*/}
        <PrivateRoute path="/hr/registered-users" component={RegisteredUsers} />
        {/* ===job experience=== */}
        <PrivateRoute
          path="/hr/master-jobs/job-experience"
          component={JobExperience}
        />
        {/* ===job travel needed */}
        <PrivateRoute
          path="/hr/master-jobs/job-travel-needed"
          component={JobTravelNeeded}
        />

        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default HR;
