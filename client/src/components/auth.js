/*
  This module handle all authentication logic on the client side.
 */

module.exports = {
    getToken () {
    return localStorage.token;
  },

  loggedIn(){
      return !!localStorage.token
  },


  logOut(){
    delete localStorage.token
  },

  /*
  Ask the server for the username using token in local storage.
  Naturally, it will also validate the token.
   */
  async getUsername(){
    let token = this.getToken();
    console.log('token is: ' + token);
    let payload = new FormData();
    payload.append("token", token);
    let response = await fetch('/get_username', {
      method: 'post',
      body: payload
    });

    let response2 = await response.json();
    console.log('response: ' + response2.success + ' -- username: ' + response2.username);
    // Return username is token was valid.
    if(response2.success){
      return response2.username;
    }

    // If token is invalid, we might as well remove it.
    else{
      this.logOut();
    }
  }
};


