import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../components/admin/login/Login';
import AdminPageNotFound from '../components/404/AdminPageNotFound';

import Dashboard from '../components/hr/dashboard/Dashboard';

import JobCategories from '../components/admin/hr/master-jobs/job-categories/JobCategories';
import AddJobCategories from '../components/admin/hr/master-jobs/job-categories/AddJobCategories';
import EditJobCategory from '../components/admin/hr/master-jobs/job-categories/EditJobCategory';

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
          path="/hr/master-jobs/jobcategories"
          component={JobCategories}
        />
        <PrivateRoute
          path="/hr/master-jobs/addjobcategory"
          component={AddJobCategories}
        />
        <PrivateRoute
          path="/hr/master-jobs/editjobcategory/:id"
          component={EditJobCategory}
        />

        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default HR;
