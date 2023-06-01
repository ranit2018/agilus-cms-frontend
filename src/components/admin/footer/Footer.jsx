import React, { Component } from 'react';
import dateFormat from "dateformat";

class Footer extends Component {
 
  render() {

    if( this.props.isLoggedIn === false) return null;

    return (
      <footer className="main-footer">
            Copyright {dateFormat(new Date(), "yyyy")}. Agilus Diagnostics. All rights reserved.
      </footer>
    );
    
  }
}

export default Footer;
