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
      }
      displayIcon = <FontAwesome name="check" style={{color:'green'}}/>

    }
    else {
      style = {
        display: 'block'
      }
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


  handleChange = (event) =>{
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  resetForm () {
    this.refs.reg_username.value = '';
    this.refs.reg_password.value = '';
    this.refs.reg_confirm_password.value = '';
  }

  async handleSubmit (event)  {
    event.preventDefault();
    let res = await this.search(this.state.username);
    let res2 = await this.register();
    console.log(res2.message);
    console.log(res.username);
    this.setState({hideResponse: false,
                  responseMessage: res2.message,
                  positiveResponse: res2.success});
    this.resetForm();
  }

  async search(query){
    const response = await fetch(`api/users?q=${query}`);
    return await response.json();

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