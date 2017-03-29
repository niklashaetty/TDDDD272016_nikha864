import React, { Component } from 'react';
import '../css/header.css';
import '../css/home.css'
import Header from './header';
//import RegisterForm from './registerForm';
//import LoginForm from './loginForm';

class RegisterForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {hidden: false};
	}


	handleSubmit(event) {
		alert('A name was submitted: ' + this.state.value);
		event.preventDefault();
	}

	render() {
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<div className="input_form">
						<input
							type="text"
							required
							placeholder="Username"
						/>
					</div>
					<div className="input_form">
						<input
							type="password"
							required
							placeholder="Password"
						/>
					</div>
					<div className="input_form">
						<input
							type="password"
							required
							placeholder="Confirm password"
						/>
					</div>
					<button className="submit">Submit</button>
				</form>
			</div>
		);
	}
}

class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {hidden: true};
	}


	handleSubmit(event) {
		alert('A name was submitted: ' + this.state.value);
		event.preventDefault();
	}

	render() {
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<div className="input_form">
						<input
							type="text"
							required
							placeholder="Username"
						/>
					</div>
					<div className="input_form">
						<input
							type="password"
							required
							placeholder="Password"
						/>
					</div>
					<button className="submit">Submit</button>
				</form>
			</div>
		);
	}
}

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {showSignup: true};
	}

	handleSwap = () =>{
		console.log("test");
		this.setState({showSignup : !this.state.showSignup});
	}

	render() {
		let display = null;
		const showSignup = this.state.showSignup;
		console.log(showSignup);
		if(showSignup){
			display = <RegisterForm />
		}
		else{
			display = <LoginForm />
		}
		return (
			<div>
				<Header />
				<div className="signup_wrapper">
					<div className="headline_wrapper">
						<p className={this.state.showSignup ? "headline_active" : "headline_inactive"} onClick={this.handleSwap}> Create an account</p>
						<p className={this.state.showSignup ? "headline_inactive" : "headline_active"} onClick={this.handleSwap}> Login</p>
					</div>
					{display}
				</div>
			</div>
		);
	}
}

export default Home;