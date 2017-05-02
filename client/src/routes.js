/**
 *  Contains all routing logic
 *  Note! using React-router v3 and not v4
 *  */

import React from 'react';
import {Router, Route, browserHistory} from 'react-router';

// Error components
import {NotFound} from './components/errorpages'

// Components
import Home from './components/home';
import Auth from './components/auth';
import Dashboard from './components/dashboard';
import CoursePlan from './components/courseplan';
import CoursePlanEditor from './components/editor';


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
              <Route path="/dashboard" components={Dashboard} onEnter={this.requireAuth}/>
              <Route path="/p/:plan_hash" components={CoursePlan} />
              <Route path="/p/:plan_hash/edit" components={CoursePlanEditor} />
              <Route path="/NOT_FOUND/" component={NotFound} />
              <Route path="*" component={NotFound}/>
          </Router>
        );
    }
}

export default Routes;
