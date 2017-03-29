import React, { Component } from 'react'
import {Link } from 'react-router';
import logo from '../img/logo.svg'
import '../css/header.css'
import FontAwesome from 'react-fontawesome'


class Header extends Component {
		constructor(props) {
		super(props);
		this.state = {user: null};
	}

	render() {
		let display = null;
		console.log(this.state.user);
		if(this.state.user){
			display = <p className="menu_item"><Link to='/:id' ><FontAwesome name="user-o"/> {this.state.user}</Link></p>;
		}

		return (
			<div className="header">
				<img src={logo} className="App-logo" alt="logo" />
				<div className="logo_text"> Project Name</div>
				<div className="menu_right">
					{display}
				</div>
			</div>
		);
	}
}

export default Header;