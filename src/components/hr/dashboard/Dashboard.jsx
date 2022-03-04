import React, { Component } from 'react';
import Layout from '../layout/Layout';
import whitelogo from '../../../assets/images/logo-white.svg';


class Dashboard extends Component {

  state = {
    isLoading: true
  }

  componentDidMount(){
    this.setState({ isLoading:false });
  }

  render() {

    if (this.state.isLoading) {
      return (
        <>
          <div className="loderOuter">
            <div className="loading_reddy_outer">
              <div className="loading_reddy" >
                <img src={whitelogo}  alt="logo" />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <Layout {...this.props}>
          <div className="content-wrapper">
            <section className="content-header">
              <h1>
                Dashboard
                    <small>Hello this is HR dashboard</small>
              </h1>
            </section>
          </div>
        </Layout>
      );
    }
  }
}

export default Dashboard;
