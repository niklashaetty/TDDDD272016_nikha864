import React from 'react';
import {Router, Route, browserHistory, IndexRoute } from 'react-router';

// Error components
import {NotFound} from './components/errorpages'

// Components
import Home from './components/home';
import Login from './components/login';


export default (
	<Router history={browserHistory}>
		<Route path="/" component={Home} />
		<Route path="/users/:id" component={Login} />
		<Route path="*" component={NotFound} />
	</Router>
);