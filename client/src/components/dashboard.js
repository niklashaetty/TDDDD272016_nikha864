import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

// CSS
import '../css/dashboard.css';
import '../index.css';

// Components
import Header from './header';
import Auth from './auth';
/////////////////////////////////////////////////////////////////////////////

class Dashboard extends Component {
    render() {
        return (
          <div className="wrapper">
              <Header user={this.props.location.state.username}/>
              <div className="dashboard_wrapper">
                  <div className="dashboard_left">
                      <div className="dashboard_headline">Course plans</div>
                      <div className="dashboard_big">
                      </div>

                      <div className="whitespace"> </div>

                      <div className="dashboard_headline">Favourites</div>
                      <div className="dashboard_big">
                      </div>
                  </div>

                  <div className="dashboard_right">
                      <div className="dashboard_headline">Dashboard</div>
                      <div className="dashboard_small">
                          <Link to={{pathname: '/'}}>
                          <p onClick={() => {Auth.logOut()}} className="logout"><FontAwesome name="sign-out"/>Log out</p>
                          </Link>
                      </div>
                  </div>

              </div>
          </div>
        );
    }
}

export default Dashboard;