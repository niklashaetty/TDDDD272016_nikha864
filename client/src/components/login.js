import React, {Component} from 'react'

class Login extends Component {
    render() {
        return (
          <p className="login">
              This is the page of user: {this.props.params.id}
          </p>
        );
    }
}

export default Login;