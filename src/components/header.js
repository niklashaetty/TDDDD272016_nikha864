import React, { Component } from 'react'
import {Link } from 'react-router';
import logo from '../img/logo.svg'
import '../css/header.css'
import FontAwesome from 'react-fontawesome'


class Header extends Component {
	render() {
		return (
			<div className="header">
				<img src={logo} className="App-logo" alt="logo" />
				<div className="logo_text"> Project Name</div>
				<div className="menu_right">
					<p className="menu_item"><Link to="/login" ><FontAwesome name="user-o"/> Login</Link></p>
				</div>
			</div>
		);
	}
}

export default Header;