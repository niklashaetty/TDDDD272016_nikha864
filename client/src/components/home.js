/* Components related to the home page such as the register and login forms */

import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import '../css/header.css';
import '../css/home.css';
import '../index.css';
import Header from './header';

// Show the result of a form, i.e feedback from registration
class FormResult extends React.Component {
  render() {
    let style;
    let displayIcon;
    if(this.props.hidden){
      style = {
        display: 'none'
      }
    }
    else if(this.props.positive){
      style = {
        display: 'block'
      };
      displayIcon = <FontAwesome name="check" style={{color:'green'}}/>

    }
    else {
      style = {
        display: 'block'
      };
      displayIcon = <FontAwesome style={{color: '#ED4337'}} name="exclamation-circle"/>
    }
    return (
      <div className="feedback_wrapper" style={style}>
        {displayIcon} {this.props.message}
      </div>
    );
  }
}

// Register form on home page
class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {hidden: false,
      username: '',
      password: '',
      confirmPassword: '',
      hideResponse: true,
      responseMessage: '',
      positiveResponse: null
    };
  }

  // Update values when writing in a form
  handleChange = (event) =>{
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  // Reset form. if fullReset is false, only passwords will be reset.
  resetForm(fullReset) {
    if(fullReset) {
      this.refs.reg_username.value = '';
    }
    this.refs.reg_password.value = '';
    this.refs.reg_confirm_password.value = '';
  }

  // Validate a submission on client side. If fail, set states so that responseMessage will be shown.
  validSubmission = () => {
    if(this.state.password.length < 7){
      this.setState({responseMessage: 'Password must be at least 8 characters',
                     positiveResponse: false,
                     hideResponse: false});
      return false;
    }
    else if(this.state.password !== this.state.confirmPassword){
      this.setState({responseMessage: 'Password do not match',
                     positiveResponse: false,
                     hideResponse: false});
      return false;
    }
    else{
      return true;
    }
  }

  // Handle the submission of a form
  async handleSubmit (event)  {
    event.preventDefault();

    if(this.validSubmission()){
      let response = await this.register();
      this.setState({hideResponse: false,
                  responseMessage: response.message,
                  positiveResponse: response.success});
      this.resetForm(true);
    }
    else {
      this.resetForm(false);   // Reset only passwords when clientside validation fails.
    }
  }

  // Send register request to server
  async register(){
    let payload = new FormData();
    payload.append("username", this.state.username);
    payload.append("password", this.state.password);
    const response = await fetch('/register', {
      method: 'post',
      body: payload
    });
    return await response.json();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <div className="input_form">
            <input
              ref="reg_username"
              type="text"
              name="username"
              required
              placeholder="Username"
            />
          </div>
          <div className="input_form">
            <input
              ref="reg_password"
              type="password"
              name="password"
              required
              placeholder="Password"
            />
          </div>
          <div className="input_form">
            <input
              ref="reg_confirm_password"
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm password"
            />
          </div>
          <button className="submit">Submit</button>
        </form>
        <FormResult hidden={this.state.hideResponse} positive={this.state.positiveResponse} message={this.state.responseMessage}/>
      </div>
    );
  }
}

// Login form on home page
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {hidden: false,
      username: '',
      password: '',
      hideResponse: true,
      responseMessage: '',
      positiveResponse: null
    };
  }

      // Update values when writing in a form
  handleChange = (event) =>{
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value

    });
  }

  // Reset form. if fullReset is false, only passwords will be reset.
  resetForm(fullReset) {
    if(fullReset) {
      this.refs.login_username.value = '';
    }
    this.refs.login_password.value = '';
  }

  // Validate a submission on client side. If fail, set states so that responseMessage will be shown.
  validSubmission = () => {
    if(this.state.password.length < 7){
      this.setState({responseMessage: 'Password must be at least 8 characters',
                     positiveResponse: false,
                     hideResponse: false});
      return false;
    }
    else{
      return true;
    }
  }

// Handle the submission of a form
  async handleSubmit (event)  {
    event.preventDefault();

    if(this.validSubmission()){
      let response = await this.login();
      this.setState({hideResponse: false,
                  responseMessage: response.message,
                  positiveResponse: response.success});
      localStorage.setItem('token', response.token);
      this.resetForm(true);
    }
    else {
      this.resetForm(false);   // Reset only passwords when clientside validation fails.
    }
  }

  // Send login request to server
  async login(){
    let payload = new FormData();
    payload.append("username", this.state.username);
    payload.append("password", this.state.password);
    const response = await fetch('/login', {
      method: 'post',
      body: payload
    });
    return await response.json();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <div className="input_form">
            <input
              ref="login_username"
              type="text"
              name="username"
              required
              placeholder="Username"
            />
          </div>
          <div className="input_form">
            <input
              ref="login_password"
              type="password"
              name="password"
              required
              placeholder="Password"
            />
          </div>
          <button className="submit">Submit</button>
        </form>
        <FormResult hidden={this.state.hideResponse} positive={this.state.positiveResponse} message={this.state.responseMessage}/>
      </div>
    );
  }
}

// Render home page when not logged in
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {showSignup: true};
  }

  handleSwap = () =>{
    this.setState({showSignup : !this.state.showSignup});
  }

  render() {
    let display = null;
    const showSignup = this.state.showSignup;
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