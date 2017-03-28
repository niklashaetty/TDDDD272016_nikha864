import React, {Component} from "react";


class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleSubmit = this.handleSubmit.bind(this);
  }



  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

	render() {
		return (
      <div className="signup_wrapper">
        <p className="headline"> Create an account</p>
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

export default SignupForm;