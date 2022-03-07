import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../components/admin/login/Login';
import AdminPageNotFound from '../components/404/AdminPageNotFound';

import Dashboard from '../components/hr/dashboard/Dashboard';

import JobCategories from '../components/admin/hr/master-jobs/job-categories/JobCategories';
import AddJobCategories from '../components/admin/hr/master-jobs/job-categories/AddJobCategories';

import Roles from '../components/hr/master-jobs/roles/Roles';
import AddRoles from '../components/hr/master-jobs/roles/AddRoles';
import JobSkills from '../components/hr/master-jobs/job-skills/JobSkills';
import AddJobSkill from '../components/hr/master-jobs/job-skills/AddJobSkill';

import '../assets/css/all.css';
import '../assets/css/admin-style.css';
import '../assets/css/admin-skin-blue.css';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';


// Private Route for inner component
const PrivateRoute = ({ component: RefComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem('admin_token') ? (
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
        <PrivateRoute
          path="/hr/master-jobs/add-job-category"
          component={AddJobCategories}
        />
        {/* ===job roles==== */}

        <PrivateRoute path="/hr/master-jobs/job-roles" component={Roles} />

        <PrivateRoute
          path="/hr/master-jobs/add-job-roles"
          component={AddRoles}
        />

        {/* ===job skills==== */}

        <PrivateRoute path="/hr/master-jobs/job-skills" component={JobSkills} />

        <PrivateRoute
          path="/hr/master-jobs/add-job-skills"
          component={AddJobSkill}
        /> 

        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default HR;
