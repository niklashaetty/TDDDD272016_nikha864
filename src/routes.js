import React from 'react';
import {Router, Route, browserHistory, IndexRoute } from 'react-router';
import Home from './components/home';
import Login from './components/login';

export default (
	<Router history={browserHistory}>
		<Route path="/" component={Home} />
		<Route path="/account" component={Login} />
	</Router>
);