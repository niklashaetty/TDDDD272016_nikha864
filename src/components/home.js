import React, { Component } from 'react';
import '../css/header.css';
import '../css/home.css'
import Header from './header';
import SignupForm from './signupForm';

class Home extends Component {
	render() {
		return (
			<div>
				<Header/>
				<SignupForm />
			</div>
		);
	}
}
export default Home;