#!/usr/bin/python
"""
This module is the abstraction to the postgres database.
The database url must be specified in 'config.ini' or as an environment variable (i.e. on Heroku)
"""

import configparser
import psycopg2
import os
import datetime
import json

import jwt

TWO_HOURS = 7200


def load_config():
    """
    Load config.ini file
    """
    cfg_file = 'config.ini'
    cfg = configparser.ConfigParser()
    cfg.read(cfg_file)
    return cfg


def connect():
    """
    Decide here if you want to connect using environment var or config file.
    """
    # return connect_cfg()  # Using cfg file
    return connect_env()   # Using Env var


def connect_env():
    """
    Connect to a POSTGRES database. Database url as env variable DATABASE_URL.
    :return: A valid connection
    """
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    return conn


def connect_cfg():
    """
    Connect to a POSTGRES database using config.ini
    :return: A valid connection
    """
    cfg = load_config()
    db_url = cfg['database']['database_url']
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    return conn


class User:
    """
    The user of the application
    """

    def __init__(self, username, password_hash):
        self.username = username
        self.password_hash = password_hash

    def retrieve_hash(self):
        conn = connect()
        cur = conn.cursor()
        query = 'select password_hash from users where username=%'
        try:
            cur.execute(query, (self.username,))
            return cur.fetchone()[0]
        except Exception as e:
            print(e)
            return False

    @staticmethod
    def create_user(username, password_hash):
        """
        Add a new user to the database
        """
        conn = connect()
        cur = conn.cursor()
        query = 'insert into users(username, password_hash) values(%s, %s)'
        try:
            cur.execute(query, (username, password_hash))
            return True
        except Exception as e:
            print(e)
            return False

    def delete_user(self):
        """
        Delete a user from the database
        :return: Bool success
        """
        conn = connect()
        cur = conn.cursor()
        query = 'delete from users where username = %s'
        try:
            cur.execute(query, (self.username,))
            return True
        except Exception as e:
            print(e)
            return False

    def issue_token(self, expiration=TWO_HOURS):
        """
        Generate a token with timestamp and expiration.
        """
        secret_key = os.environ.get('SECRET_KEY')
        token = jwt.encode(
            {'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expiration),
             'username': self.username},
            secret_key)
        return token

    @staticmethod
    def get_user(username):
        """
        Retrieves the user information by username.
        :return: User object
        """
        conn = connect()
        cur = conn.cursor()
        query = 'select username, password_hash from users where username=%s'
        try:
            cur.execute(query, (username,))
            user_info = cur.fetchone()
            if not user_info:
                return None
            else:
                return User(user_info[0], bytes(user_info[1]))
        except Exception as e:
            print(e)
            return None

    @staticmethod
    def user_exists(username):
        """
        Check if a user exists in the database
        :return: Boolean user_exists
        """
        conn = connect()
        cur = conn.cursor()
        query = 'select exists(select 1 from users where username =%s)'

        try:
            cur.execute(query, (username,))
            return cur.fetchone()[0]
        except Exception as e:
            print(e)
            return None


def is_valid_token(jwt_encoded):
    """
    Decode a token and check its validity
    """

    secret_key = os.environ.get('SECRET_KEY')

    if jwt_encoded is not None:
        try:
            return jwt.decode(jwt_encoded, secret_key)

        # Token is not valid
        except Exception as e:
            print(e)
            return None


def get_courses():
    """
    Get a list of courses from the database
    :return: list of courses in json format.
    """
    conn = connect()
    cur = conn.cursor()
    query = 'select * from courses'
    courses_json = []
    try:
        cur.execute(query)
        courses = cur.fetchall()
    except Exception as e:
        print(e)
        return None

    for c in courses:
        c_json = {
            "code": c[0],
            "name": c[1],
            "block": c[2],
            "period": c[3],
            "level": c[4],
            "ects": c[5]
        }
        courses_json.append(c_json)
    return courses_json


def create_course(code, name, block, period, level, ects):
    """
    Create a course and add it to the database
    :param code: Course code    
    :param name: Course name
    :param block: Timetable group
    :param period: Period of course i.e "HT1/HT2" or "VT2"
    :param level: Level, "A", "G1", or "G2"
    :param ects: Credits in ects
    :return: Success status
    """

    conn = connect_cfg()
    cur = conn.cursor()
    query = 'insert into courses(code, name, block, period, level, ects) values(%s, %s, %s, %s, %s, %s)' \
            'on conflict do nothing'
    try:
        cur.execute(query, (code, name, block, period, level, ects))
        return True
    except Exception as e:
        print(e)
        return False


def fill_courses():
    """
    Help function to fill courses from a json file
    :return: 
    """
    with open('courses.json') as file:
        data = json.load(file)
        courses = data['courses']
        for course in courses:
            create_course(course['code'], course['name'], course['block'], course['period'], course['level'], course['ects'])

        print("Added {0} courses to the database".format(len(courses)))

