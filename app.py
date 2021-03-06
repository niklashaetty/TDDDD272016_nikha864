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


# Global constants:
MAX_SEMESTERS = 4
MAX_COURSES_PER_SEMESTER = 8
MAX_SAVED_PLANS = 10


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


@app.route('/get_courses', methods=['GET'])
def get_courses():
    """
    Get a list of courses in the database. Each course in a tuple.
    """
    courses = models.get_courses()
    if courses:
        return jsonify(success=True,
                       message='Successfully retrieved courses',
                       courses=courses)


@app.route('/get_plan', methods=['POST'])
def get_course_plan_route():
    plan_hash = request.form['plan_hash']
    return get_course_plan(plan_hash)


def get_course_plan(plan_hash):
    """
    Get a course plan with a provided hash
    """
    plan = mongodb.get_course_plan(plan_hash)
    if plan:
        return jsonify(success=True,
                       message='Successfully retrieved plan',
                       plan=plan)
    else:
        return jsonify(success=False,
                       message='No such plan')


@app.route('/get_plan_editor', methods=['POST'])
def get_course_plan_editor():
    """
    Get a course plan in editor mode, with a provided hash.
    In short, validate that the user owns said plan before sending the course plan.
    """
    plan_hash = request.form['plan_hash']
    jwt = request.form['token']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:

        # Validate that user owns plan
        if valid_token['username'] == mongodb.get_course_plan_owner(plan_hash):
            return get_course_plan(plan_hash)

        else:
            return jsonify(success=False,
                           message='You are not the owner of this course plan')

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
    if not name:
        name = "My course plan"

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


@app.route('/save_plan', methods=['POST'])
def save_plan():
    """
    Add a course plan to list of saved course plans.
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        owner = valid_token['username']
        saved_plans = models.get_saved_plans(owner)

        if len(saved_plans) < MAX_SAVED_PLANS:
            added_saved_plan = models.add_saved_plan(owner, identifier)

            # Check if plan was actually saved
            if added_saved_plan:
                return jsonify(success=True,
                               message='Successfully saved plan.')
            else:
                return jsonify(success=False,
                               message='Error: Unknown database error, please try again later.')
        else:
            return jsonify(success=False,
                           message='You may only save {0} plans'.format(MAX_SAVED_PLANS))

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/unsave_plan', methods=['POST'])
def unsave_plan():
    """
    Remove a course plan from list of saved course plans.
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        owner = valid_token['username']
        removed_saved_plan = models.remove_saved_plan(owner, identifier)

        # Check if plan was actually removed
        if removed_saved_plan:
            return jsonify(success=True,
                           message='Successfully unsaved plan.')
        else:
            return jsonify(success=False,
                           message='Error: Unknown database error, please try again later.')

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/get_saved_plans', methods=['POST'])
def get_saved_plans():
    """
    Get all saved course plans from user
    :return: Success status
    """
    jwt = request.form['token']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:
        owner = valid_token['username']
        saved_plans = models.get_saved_plans(owner)
        saved_plans_with_name = []
        for plan in saved_plans:
            if mongodb.plan_exists(plan):
                saved_plans_with_name.append({
                    'name': mongodb.get_course_plan_name(plan),
                    'identifier': plan
                })

            # Plan has been removed, un-save it.
            else:
                models.remove_saved_plan(owner, plan)

        return jsonify(success=True,
                       message='Successfully retrieved saved plans.',
                       saved_plans=saved_plans_with_name)
    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/add_semester', methods=['POST'])
def add_semester():
    """
    Add a semester to an existing course plan
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']
    semester_name = request.form['semester_name']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:

        # Check that plan exists
        if not mongodb.plan_exists(identifier):
            return jsonify(success=False,
                           message='No such plan exists')

        if mongodb.semester_exists(identifier, semester_name):
            return jsonify(success=False,
                           message='This time period is already in this course plan')

        # Verify that user owns plan
        if valid_token['username'] == mongodb.get_course_plan_owner(identifier):
            added_semester = mongodb.add_semester(identifier, semester_name)

            # Check if a plan was actually deleted
            if added_semester:
                return jsonify(success=True,
                               message='Semester successfully added')

            else:
                return jsonify(success=False,
                               message='This plan cannot have any more semesters')

        else:
            return jsonify(success=False,
                           message='You are not the owner of this course plan')

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/add_course', methods=['POST'])
def add_course():
    """
    Add a course to an existing semester
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']
    semester_name = request.form['semester_name']
    course = request.form['course']
    course = json.loads(course)

    # Logic to derive periods, i.e. go from 'VT1/VT2' to a list of ['period1','period2'].
    periods = course['period']
    second_period = 'period'+periods[6:] if periods[6:] else None
    periods = ['period'+periods[2:3], second_period]

    # Logic to derive blocks, i.e. go from '1/2' to a list of [1,2]
    blocks = course['block']
    second_block = blocks[2:] if blocks[2:] else None
    blocks = [blocks[:1], second_block]

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:

        # Check that plan exists
        if not mongodb.plan_exists(identifier):
            return jsonify(success=False,
                           message='Error: This plan does not exist')

        # Check that semester exists
        if not mongodb.semester_exists(identifier, semester_name):
            return jsonify(success=False,
                           message='Error: This such semester does not exist')

        # Check that the course runs in the given period
        if not course_runs_in_semester(course['period'], semester_name):
            return jsonify(success=False,
                           message='Error: This course does not run in this this semester')

        # Check that course is not already in plan:
        if mongodb.course_in_plan(identifier, semester_name, course['code']):
            return jsonify(success=False,
                           message='Error: This course is already in this semester')

        # Verify that user owns plan
        if valid_token['username'] == mongodb.get_course_plan_owner(identifier):

            if mongodb.get_course_count(identifier, semester_name) < MAX_COURSES_PER_SEMESTER:

                added_course = mongodb.add_course(identifier, periods, blocks, semester_name, course)
                if added_course:
                    return jsonify(success=True,
                                   message='Added course {0} to {1}.'.format(course['name'], semester_name))
                else:
                    return jsonify(success=False,
                                   message='Unknown error occurred. Please try again later.')

            else:
                return jsonify(success=False,
                               message='Error: This semester can not have any more courses.')

        else:
            return jsonify(success=False,
                           message='You are not the owner of this course plan')

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/delete_course', methods=['POST'])
def delete_course():
    """
    Delete a course from a given semester
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']
    semester_name = request.form['semester_name']
    course_code = request.form['course_code']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:

        # Check that plan exists
        if not mongodb.plan_exists(identifier):
            return jsonify(success=False,
                           message='No such plan exists')

        # Verify that user owns plan
        if valid_token['username'] == mongodb.get_course_plan_owner(identifier):
            deleted_course = mongodb.delete_course(identifier, semester_name, course_code)

            # Check if a course was actually deleted
            if deleted_course:
                return jsonify(success=True,
                               message='Course successfully removed')

            else:
                return jsonify(success=False,
                               message='Unknown error, no course was deleted. Please try again.')

        else:
            return jsonify(success=False,
                           message='You are not the owner of this course plan')

    else:
        return jsonify(success=False,
                       message='Token is not valid')


@app.route('/delete_semester', methods=['POST'])
def delete_semester():
    """
    Delete a semester from a given course plan
    :return: Success status
    """
    jwt = request.form['token']
    identifier = request.form['identifier']
    semester_name = request.form['semester_name']

    # Validate token
    valid_token = models.is_valid_token(jwt)
    if valid_token:

        # Check that plan exists
        if not mongodb.plan_exists(identifier):
            return jsonify(success=False,
                           message='No such plan exists')

        # Verify that user owns plan
        if valid_token['username'] == mongodb.get_course_plan_owner(identifier):
            deleted_semester = mongodb.delete_semester(identifier, semester_name)

            # Check if a semester was actually deleted
            if deleted_semester:
                return jsonify(success=True,
                               message='Semester successfully deleted')

            else:
                return jsonify(success=False,
                               message='No semesters were deleted')

        else:
            return jsonify(success=False,
                           message='You are not the owner of this course plan')

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


def course_runs_in_semester(course_period, semester_name):
    """
    Check if a course runs in given semester.
    Parse semester name and see if it matches with the semester of the course.
    :param: course_period: semester and period i.e "VT1" or "VT1/VT2"
    :return: Boolean course runs in semester
    """
    course_semester = course_period[:2]
    return course_semester in semester_name


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
