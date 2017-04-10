/* This is the header component which contains the header.
 * When logged in the user state should be set to user name,
 * in which case the user name will be displayed in the top right
 * corner with a link to its dashboard.*/

import React, {Component} from 'react';
import {Link} from 'react-router';
import logo from '../img/logo.svg';
import '../css/header.css';
import FontAwesome from 'react-fontawesome';

class Header extends Component {

    render() {
        let display = null;
        console.log('user: ' + this.props.user);
        // If we're logged in, show the username in the top right
        if (this.props.user) {
            display = <p className="menu_item">
                <Link to={{pathname: '/dashboard', state: {username: this.props.user}}}>
                    <FontAwesome name="user-o"/> {this.props.user}
                </Link>
            </p>;
        }

        return (
          <div className="header">
              <Link to='/'>
                  <img src={logo} className="logo" alt="logo"/>
                  <div className="logo_text"> Project Name</div>
              </Link>
              <div className="menu_right">
                  {display}
              </div>
          </div>
        );
    }
}

// Default properties for the header class
Header.defaultProps = {
    user: null
};

export default Header;