/* This is the header component which contains the header.
 * When logged in the user state should be set to user name,
 * in which case the user name will be displayed in the top right
 * corner with a link to its dashboard.*/

import React, { Component } from 'react';
import {Link } from 'react-router';
import logo from '../img/logo.svg';
import '../css/header.css';
import FontAwesome from 'react-fontawesome';

class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {user: null};
	}

	render() {
		let display = null;
		if(this.state.user){
			display = <p className="menu_item"><Link to='/:id/dashboard' ><FontAwesome name="user-o"/> {this.state.user}</Link></p>;
		}

		return (
			<div className="header">
				<Link to ='/users/tjena'>
					<img src={logo} className="logo" alt="logo" />
					<div className="logo_text"> Project Name</div>
				</Link>
				<div className="menu_right">
					{display}
				</div>
			</div>
		);
	}
}

export default Header;