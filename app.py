#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify       # Flask modules
import json
import bcrypt                                   # Bcrypt for hashing

import server.models as models
from server.models import User

app = Flask(__name__)


@app.route("/")
def root():
    return 'Hello world'


@app.route('/api/users', methods=['GET'])
def print_user():
    user = request.args['q']
    userd = {"username": user}
    return json.dumps(userd)


@app.route('/register', methods=['POST'])
def register_user():
    """
    Register a user with submitted username and password
    """
    username = request.form['username']
    plain_password = request.form['password']

    # Make sure everything is valid
    validation = json.loads(validate_user_data(username, plain_password))
    if not validation['success']:
        return jsonify(success=False,
                       message=validation['message'])

    # Check that user does not already exist
    if User.user_exists(username):
        return jsonify(success=False,
                       message='User {0} already exists'.format(username))

    # Create user and check that everything went ok
    password_hash = generate_hash(plain_password)
    created_user = User.create_user(username, password_hash)
    if created_user:
        return jsonify(success=True,
                       message='Successfully registered new user {0}'.format(username))
    else:
        return jsonify(success=False,
                       message='Unknown error occurred')


def generate_hash(plain_password):
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())


def validate_user_data(username, plain_password):
    """
    Validate the user data with regards to length, existence, and type
    """
    # Make sure everything is provided
    if not username or not plain_password:
        return json.dumps({'success': False,
                           'message': 'Password or username missing'})

    # Make sure they data are unicodes
    if not isinstance(username, str) or not isinstance(plain_password, str):
        return json.dumps({'success': False,
                           'message': 'Invalid username or password provided (must be string)'})

    # Password length check
    elif not len(plain_password) > 7:
        return json.dumps({'success': False,
                           'message': 'Password too short'})

    # Good.
    else:
        return json.dumps({'success': True,
                           'message': 'User data valid'})

if __name__ == '__main__':
    app.run()
