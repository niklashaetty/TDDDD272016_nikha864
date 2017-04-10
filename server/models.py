#!/usr/bin/python
"""
This module is the abstraction to the postgres database.
The database url must be specified in 'config.ini' or as an environment variable (i.e. on Heroku)
"""

import configparser
import psycopg2
import os
import datetime

import jwt



from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

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
    return connect_cfg()   # Using cfg file
#   return connect_env()   # Using Env var


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
            cur.execute(query, (self.username, ))
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

    def issue_token(self, expiration=TWO_HOURS):
        """
        Generate a token with timestamp and expiration.
        """
        cfg = load_config()
        secret_key = cfg['keys']['secret_key']
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
            cur.execute(query, (username, ))
            return cur.fetchone()[0]
        except Exception as e:
            print(e)
            return None


def is_valid_token(jwt_encoded):
    """
    Decode a token and check its validity
    """

    # Load config
    cfg = load_config()
    secret_key = cfg['keys']['secret_key']

    if jwt_encoded is not None:
        try:
            return jwt.decode(jwt_encoded, secret_key)

        # Token is not valid
        except Exception as e:
            print(e)
            return None

