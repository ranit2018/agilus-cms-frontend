import React, { Component, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { createBrowserHistory } from 'history';

//import "./App.css";

const history = createBrowserHistory();

const AdminComponent = lazy(() => import('./routes/Admin'));

const HRComponent = lazy(() => import('./routes/HR'));

const WaitingComponent = (RefComponent) => {
    return (props) => (
        <Suspense fallback={<div>Loading...</div>}>
            <RefComponent {...props} />
        </Suspense>
    );
};

class App extends Component {
    render() {
        const currentLoginType = history.location.pathname.split('/')[1];
        const isAdmin = currentLoginType && currentLoginType.indexOf('admin') > -1;
        const isHR = currentLoginType && currentLoginType.indexOf('hr') > -1;

        if (isAdmin) {
            return (
                <div className='wrapper' style={{ height: 'auto' }}>
                    <Switch>
                        <Route path='/admin' component={WaitingComponent(AdminComponent)} />
                    </Switch>
                </div>
            );
        } else {
            return (
                <div className='wrapper' style={{ minHeight: 'auto' }}>
                    <Switch>
                        <Route path='/' component={WaitingComponent(HRComponent)} />
                    </Switch>
                </div>
            );
        }
    }
}
export default withRouter(App);
