/* Components related to the home page such as the register and login forms */

import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import '../css/header.css';
import '../css/home.css';
import '../index.css';
import Header from './header';
import Auth from './auth';

// Material UI
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

// Inline styles for inputs
const styles = {

    textField: {
        width: 340,
        marginTop: -15,
        paddingLeft: 20,
    },
    inputText: {
        color: '#595959'
    }

};

// Show the result of a form, i.e feedback from registration
class FormResult extends React.Component {
    render() {
        let style;
        let displayIcon;
        if (this.props.hidden) {
            style = {
                display: 'none'
            }
        }
        else if (this.props.positive) {
            style = {
                display: 'inline-flex'
            };
            displayIcon = <FontIcon className="material-icons" style={{fontSize: '18px', color: 'green'}} >done</FontIcon>

        }
        else {
            style = {
                display: 'inline-flex'
            };
            displayIcon = <FontIcon className="material-icons" style={{fontSize: '18px', color: '#ED4337'}} >error</FontIcon>
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
        this.state = {
            hidden: false,
            username: '',
            password: '',
            confirmPassword: '',
            hideResponse: true,
            responseMessage: '',
            positiveResponse: null
        };
    }

    // Reset form. if fullReset is false, only passwords will be reset.
    resetForm(fullReset) {
        if (fullReset) {
            this.setState({
                username: '',
                password: '',
                confirmPassword: ''
            });
        }
        else {
            this.setState({
                password: '',
                confirmPassword: ''
            });
        }
    }

    // Validate a submission on client side. If fail, set states so that responseMessage will be shown.
    validSubmission = () => {
        if (this.state.password.length < 8) {
            this.setState({
                responseMessage: 'Password must be at least 8 characters',
                positiveResponse: false,
                hideResponse: false
            });
            return false;
        }
        else if (this.state.password !== this.state.confirmPassword) {
            this.setState({
                responseMessage: 'Password do not match',
                positiveResponse: false,
                hideResponse: false
            });
            return false;
        }
        else {
            return true;
        }
    };

    // Handle the submission of a form
    async handleSubmit(event) {
        event.preventDefault();

        if (this.validSubmission()) {
            let response = await this.register();
            this.setState({
                hideResponse: false,
                responseMessage: response.message,
                positiveResponse: response.success
            });
            this.resetForm(true);
        }
        else {
            this.resetForm(false);   // Reset only passwords when clientside validation fails.
        }
    }

    // Send register request to server
    async register() {
        let payload = new FormData();
        payload.append("username", this.state.username);
        payload.append("password", this.state.password);
        const response = await fetch('https://tddd27-nikha864-backend.herokuapp.com/register', {
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
                      <TextField
                        onChange={e => this.setState({username: e.target.value})}
                        value={this.state.username}
                        style={styles.textField}
                        required
                        inputStyle={styles.inputText}
                        floatingLabelText="Username"
                      />
                  </div>

                  <div className="input_form">
                      <TextField
                        onChange={e => this.setState({password: e.target.value})}
                        value={this.state.password}
                        type="password"
                        required
                        style={styles.textField}
                        inputStyle={styles.inputText}
                        floatingLabelText="Password"
                      />
                  </div>
                  <div className="input_form">
                      <TextField
                        onChange={e => this.setState({confirmPassword: e.target.value})}
                        value={this.state.confirmPassword}
                        type="password"
                        required
                        style={styles.textField}
                        inputStyle={styles.inputText}
                        floatingLabelText="Confirm password"
                      />
                  </div>
                  <button className="submit">Submit</button>
              </form>
              <FormResult hidden={this.state.hideResponse} positive={this.state.positiveResponse}
                          message={this.state.responseMessage}/>
          </div>
        );
    }
}

// Login form on home page
class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            hidden: false,
            username: '',
            password: '',
            hideResponse: true,
            responseMessage: '',
            positiveResponse: null,
            authorized: false
        };
    }

    // Reset form.
    resetForm() {
        this.setState({
            password: '',
        });
    }

    // Validate a submission on client side. If fail, set states so that responseMessage will be shown.
    validSubmission = () => {
        if (this.state.password.length < 7) {
            this.setState({
                responseMessage: 'Password must be at least 8 characters',
                positiveResponse: false,
                hideResponse: false
            });
            return false;
        }
        else {
            return true;
        }
    };

    // Handle the submission of a form
    async handleSubmit(event) {
        event.preventDefault();

        // Client-side validation
        if (this.validSubmission()) {
            let loginResponse = await this.loginRequest();

            // Server accepted loginRequest. Store token and push client to dashboard.
            if (loginResponse.success) {
                console.log('loggin in: ' + this.state.username + '\n' + 'token is: ' + loginResponse.token);
                Auth.login(loginResponse.token);
                browserHistory.push({
                    pathname: '/dashboard',
                    state: {username: this.state.username}
                });
            }

            // Rejected, show error
            else {
                this.setState({
                    hideResponse: false,
                    responseMessage: loginResponse.message,
                    positiveResponse: loginResponse.success
                });
                this.resetForm(true);
            }
        }

        // Reset only passwords when clientside validation fails for better user experience.
        else {
            this.resetForm(false);
        }
    }

    // Send loginRequest request to server
    async loginRequest() {
        let payload = new FormData();
        payload.append("username", this.state.username);
        payload.append("password", this.state.password);
        const response = await fetch('https://tddd27-nikha864-backend.herokuapp.com/login', {
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
                      <TextField
                        onChange={e => this.setState({username: e.target.value})}
                        value={this.state.username}
                        style={styles.textField}
                        required
                        inputStyle={styles.inputText}
                        floatingLabelText="Username"
                      />
                  </div>
                  <div className="input_form">
                      <TextField
                        onChange={e => this.setState({password: e.target.value})}
                        value={this.state.password}
                        type="password"
                        required
                        style={styles.textField}
                        inputStyle={styles.inputText}
                        floatingLabelText="Password"
                      />
                  </div>
                  <button className="submit">Submit</button>
              </form>
              <FormResult hidden={this.state.hideResponse} positive={this.state.positiveResponse}
                          message={this.state.responseMessage}/>
          </div>
        );
    }
}

// Home class
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSignup: true,
        };
    }

    // Handle swap of login/create account
    handleSwap = () => {
        this.setState({showSignup: !this.state.showSignup});
    };

    render() {
        let display = null;

        // Show either register or login form
        if (this.state.showSignup) {
            display = <RegisterForm />
        }
        else {
            display = <LoginForm />
        }
        return (
          <div>
              <Header />
              <div className="signup_wrapper">
                  <div className="headline_wrapper">
                      <p className={this.state.showSignup ? "headline_active" : "headline_inactive"}
                         onClick={this.handleSwap}>
                          Create an account</p>
                      <p className={this.state.showSignup ? "headline_inactive" : "headline_active"}
                         onClick={this.handleSwap}>
                          Login</p>
                  </div>
                  {display}
              </div>
          </div>
        );
    }
}

export default Home;