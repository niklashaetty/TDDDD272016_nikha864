#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify  # Flask modules
import json
import bcrypt  # Bcrypt for hashing

import server.models as models

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
    if models.User.user_exists(username):
        return jsonify(success=False,
                       message='User {0} already exists'.format(username))

    # Create user and check that everything went ok
    password_hash = generate_hash(plain_password)
    created_user = models.User.create_user(username, password_hash)
    if created_user:
        return jsonify(success=True,
                       message='Successfully registered new user {0}'.format(username))
    else:
        return jsonify(success=False,
                       message='Unknown database error occurred')


@app.route('/login', methods=['POST'])
def login_user():
    """
    Login a user with submitted username and password.
    If everything is ok, a token will be issued and returned.
    """
    username = request.form['username']
    plain_password = request.form['password']

    # Make sure everything is valid
    validation = json.loads(validate_user_data(username, plain_password))
    if not validation['success']:
        return jsonify(success=False,
                       message=validation['message'])
    user = models.User.get_user(username)

    # Check that user exists
    if not user:
        return jsonify(success=False,
                       message='Wrong username or password')

    # Check that password matches
    if not bcrypt.checkpw(plain_password.encode('utf-8'), user.password_hash):
        return jsonify(success=False,
                       message='Wrong username or password')

    # All good, issue token and add it to the database
    token = user.issue_token()
    return jsonify(success=True,
                   message='Successfully logged in user {0}'.format(user.username),
                   token=token.decode('utf-8'))


@app.route('/get_username', methods=['POST'])
def get_username():
    """
    Get username using a provided JSON Web Token
    """
    jwt = request.form['token']

    # Validate token
    decoded_jwt = models.is_valid_token(jwt)
    if decoded_jwt:
        username = decoded_jwt['username']
        return jsonify(success=True,
                       message='Successfully retrieved username',
                       username=username)

    # Token provided was not valid
    else:
        return jsonify(success=False,
                       message='Token is not valid')


# TODO: This is just a mockup, server should obviously send real data from the database later on.
@app.route('/get_plan_data', methods=['POST'])
def get_plan_data():
    """
    Get the meta data of a course plan

    """
    jwt = request.form['token']
    plan_hash = request.form['plan_hash']  # user plan hash to retrieve real data later on.

    # Validate token
    decoded_jwt = models.is_valid_token(jwt)
    if decoded_jwt:
        username = decoded_jwt['username']
        print('truefff')
        return jsonify(success=True,
                       message='Successfully retrieved plan meta data',
                       owner='test_owner',
                       username=username,
                       allow_edit=False)

    # Token provided was not valid
    else:
        return jsonify(success=False,
                       message='Token is not valid')


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

    # Make sure they data is str
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
