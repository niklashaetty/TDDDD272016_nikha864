import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'

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