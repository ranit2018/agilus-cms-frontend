import React, { Component, lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";
import { createBrowserHistory } from "history";


//import "./App.css";

const history = createBrowserHistory();

const AdminComponent = lazy(() =>
  import("./routes/Admin")
);

const WaitingComponent = (RefComponent) => {
  return (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <RefComponent {...props} />
    </Suspense>
  );
};

class App extends Component {
  render() {
    return  (
      <div className="wrapper" style={{ height: "auto" }}>
        <Switch>
          <Route path="/" component={WaitingComponent(AdminComponent)} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);