import React, { Component } from 'react';
import {browserHistory} from 'react-router';

// CSS
import '../css/dashboard.css';
import '../index.css';

// Components
import Header from './header';
/////////////////////////////////////////////////////////////////////////////

class Dashboard extends Component {
	render() {
		return (
		  <div>
		  <Header user={this.props.location.state.username} />
      <div className="dashboard_welcome">
				This is the dashboard of user: {this.props.location.state.username}
      </div>
      </div>
		);
	}
}

export default Dashboard;