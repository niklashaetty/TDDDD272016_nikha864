import React, { Component } from 'react'
import logo from '../img/logo.svg'
import '../css/home.css'
import FontAwesome from 'react-fontawesome'


class Home extends Component {
	render() {
		return (
			<div className="header">
				<img src={logo} className="App-logo" alt="logo" />
				<div className="logo_text"> Fan va coolt</div>
				<div className="menu_right">
					<a className="menu_item"><FontAwesome name="user-o"/> {this.username}</a>
				</div>
			</div>
		);
	}
}

export default Home;