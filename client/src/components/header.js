/** This is the header component which contains the header.
 * When logged in the user state should be set to user name,
 * in which case the user name will be displayed in the top right
 * corner with a link to its dashboard.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';
import logo from '../img/logo.svg';

// CSS
import '../css/header.css';
import FontAwesome from 'react-fontawesome';

// Material UI
import FontIcon from 'material-ui/FontIcon';

class Header extends Component {
    render() {
        let display = null;

        // If we're logged in, show the username in the top right
        if (this.props.user) {
            display =
              <div className="menu_right">
                  <p className="menu_item">
                      <Link to={{pathname: '/dashboard', state: {username: this.props.user}}}>
                          <FontAwesome name="home"/> {this.props.user}
                      </Link>
                  </p>
              </div>;

        }
        else{
            display =
              <div className="menu_right">
                  <p className="menu_item">
                      <Link to={{pathname: '/'}}>
                          <FontAwesome name="home"/> Login
                      </Link>
                  </p>
              </div>;
        }

        return (
          <div className="header">
              <Link to={{pathname: '/dashboard', state: {username: this.props.user}}}>
                  <img src={logo} className="logo" alt="logo"/>
                  <div className="logo_text"> Master course planner</div>
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