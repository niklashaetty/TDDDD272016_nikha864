/**
 This module handle all authentication logic on the client side.
*/

module.exports = {
    getToken () {
        return localStorage.getItem('token');
    },

    loggedIn(){
        return (localStorage.getItem('token') !== null);
    },


    logOut(){
        localStorage.removeItem('token');
    },

    login(jwt){
        localStorage.setItem('token', jwt);

    },

    /*
     Ask the server for the username using token in local storage.
     Naturally, it will also validate the token.
     */
    async getUsername(){
        let token = this.getToken();
        let payload = new FormData();
        payload.append("token", token);
        let response = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_username', {
            method: 'post',
            body: payload
        });

        let response2 = await response.json();

        // Return username is token was valid.
        if (response2.success) {
            return response2.username;
        }

        // If token is invalid, we might as well remove it.
        else {
            this.logOut();
        }
    }
};


