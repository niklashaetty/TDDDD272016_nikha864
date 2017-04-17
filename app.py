#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
from flask import Flask, request, jsonify  # Flask modules
import json
import bcrypt  # Bcrypt for hashing
from flask_cors import CORS, cross_origin
import random

import server.models as models
import server.mongomodels as mongodb
app = Flask(__name__)
CORS(app)


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


@app.route('/delete_user', methods=['POST'])
def delete_user():
    """
    Delete a user.
    """
    jwt = request.form['token']

    # Validate token
    decoded_jwt = models.is_valid_token(jwt)
    if decoded_jwt:
        username = decoded_jwt['username']
        user = models.User.get_user(username)
        user_deleted = user.delete_user()
        if user_deleted:
            mongodb.delete_all_course_plans(username)  # Delete all course plans of deleted user
            return jsonify(success=True,
                           message='Successfully deleted user')
        else:
            return jsonify(success=False,
                           message='Unknown database error')

    return jsonify(success=False,
                   message='Session is not valid')


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
        return jsonify(success=True,
                       message='Successfully retrieved plan meta data',
                       owner='test_owner',
                       username=username,
                       allow_edit=False)

    # Token provided was not valid
    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/get_plan', methods=['POST'])
def get_course_plan():
    """
    Get a course plan with a provided hash
    :return: 
    """
    jwt = request.form['token']
    plan_hash = request.form['plan_hash']  # user plan hash to retrieve real data later on.

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        plan = mongodb.get_course_plan(plan_hash)
        if plan:
            return jsonify(success=True,
                           message='Successfully retrieved plan',
                           plan=plan)
        else:
            return jsonify(success=False,
                           message='No such plan')

    # Token provided was not valid
    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/create_plan', methods=['POST'])
def create_course_plan():
    """
    Create a course plan and return a unique hash identifier to the plan.
    :return: Status and if successful, a unique identifier.
    """

    jwt = request.form['token']
    name = request.form['name']

    # Set max plans here
    max_plans = 10

    # Validate token and add create new, empty course plan.
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        owner = valid_token['username']
        identifier = generate_identifier()

        # You can only have 10 plans
        if len(mongodb.get_all_plans(owner)) >= max_plans:
            return jsonify(success=False,
                           message='You cannot have more than {0} plans'.format(max_plans))

        # Try adding a plan to the db
        added_course_plan = mongodb.add_course_plan(identifier,
                                                    name,
                                                    owner,
                                                    total_ects=0,
                                                    advanced_ects=0,
                                                    semesters=[])

        # Check that everything went ok
        if added_course_plan:
            return jsonify(success=True,
                           message='Course plan successfully created',
                           identifier=identifier)

        else:
            return jsonify(success=False,
                           message='Unknown database error')

    # Token provided was not valid
    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/delete_plan', methods=['POST'])
def delete_course_plan():
    """
    Delete a course plan 
    :return: Status and if successful, a unique identifier.
    """

    jwt = request.form['token']
    identifier = request.form['identifier']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        owner = valid_token['username']
        deleted_course_plan = mongodb.delete_course_plan(identifier, owner)

        # Check if a plan was actually deleted
        if deleted_course_plan:
            return jsonify(success=True,
                           message='Course plan successfully deleted')

        else:
            return jsonify(success=False,
                           message='No such plan exists')

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/get_all_plans', methods=['POST'])
def get_all_plans():
    jwt = request.form['token']

    # Validate token and return meta data from course plans
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        username = valid_token['username']
        course_plans = mongodb.get_all_plans(username)

        return jsonify(success=True,
                       message='Successfully retrieved all course plans for {0}'.format(username),
                       course_plans=course_plans)

    else:
        return jsonify(success=False,
                       message='Token is not valid')


def generate_hash(plain_password):
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())


def generate_identifier():
    """
    Generate a random string of 8 characters.
    :return: 
    """
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chars = []
    for i in range(8):
        chars.append(random.choice(alphabet))

    return "".join(chars)


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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
