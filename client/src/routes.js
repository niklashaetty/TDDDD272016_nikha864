/* Contains all routing logic */

import React from 'react';
import {Router, Route, browserHistory, IndexRoute} from 'react-router';

// Error components
import {NotFound} from './components/errorpages'

// Components
import Home from './components/home';
import Login from './components/login';
import Auth from './components/auth';
import Dashboard from './components/dashboard';
import CoursePlan from './components/courseplan';


class Routes extends React.Component {

    async redirectIfLoggedIn() {
        if (Auth.loggedIn()) {
            let username = await Auth.getUsername();
            browserHistory.push({
                pathname: '/dashboard',
                state: {username: username}
            });
        }
    }

    requireAuth() {
        if (!Auth.loggedIn()) {
            browserHistory.push('/')
        }
    }

    render() {
        return (
          <Router history={browserHistory}>
              <Route path="/" component={Home} onEnter={this.redirectIfLoggedIn}/>
              <Route path="/users/:id" component={Login}/>
              <Route path="/dashboard" components={Dashboard} onEnter={this.requireAuth}/>
              <Route path="/p/:plan_hash" components={CoursePlan} />
              <Route path="*" component={NotFound}/>
          </Router>
        );
    }
}

export default Routes;
