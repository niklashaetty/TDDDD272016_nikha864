#!/usr/bin/python
"""
This module is the abstraction to the postgres database.
The database url must be specified in 'config.ini' or as an environment variable (i.e. on Heroku)
"""

import configparser
import psycopg2
import os

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)


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

    TWO_HOURS = 7200

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
        Generate a token with timestamp
        """
        cfg = load_config()
        secret_key = cfg['keys']['secret_key']
        s = Serializer(secret_key, expires_in=expiration)
        token = s.dumps({'username': self.username})
        print('issuing token:', token)
        return token

        # s.loads(token, max_age=3600)

    @staticmethod
    def get_user(username):
        """
        Retrieves the user with the provided email.
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


class Token:

    def __init__(self, username, token):
        self.username = username
        self.token = token

    def add_token_to_database(self):
        """
        Add a token to the database
        """
        conn = connect()
        cur = conn.cursor()
        query = 'insert into tokens(username, token) values(%s, %s)'
        try:
            cur.execute(query, (self.username, self.token))
            return True
        except Exception as e:
            print(e)
            return False

    def is_valid_token(self, max_age):
        """
        Check if a token exists and is valid
        :param max_age: in seconds
        :return: 
        """
        # Load serializer
        cfg = load_config()
        secret_key = cfg['keys']['secret_key']
        s = TimedSerializer(secret_key)

        # Query to database
        conn = connect()
        cur = conn.cursor()
        query = 'select token from tokens' \
                'where username=%s and token=%s'
        cur.execute(query, (self.username, self.token))
        token = cur.fetch_one()

        # Token exists
        if token is not None:
            try:
                return s.loads(token, max_age=max_age)

            # Token is not valid
            except Exception as e:
                print(e)
                return None



