#!/usr/bin/python
"""
This module is the abstraction to the postgres database.
The database url must be specified in 'config.ini' or as an environment variable (i.e. on Heroku)
"""

import configparser
import psycopg2
import os

from itsdangerous import TimedSerializer


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

    def issue_token(self):
        """
        Generate a token with timestamp
        """
        cfg = load_config()
        secret_key = cfg['keys']['secret_key']
        s = TimedSerializer(secret_key)
        token = s.dumps({'username': self.username})
        return token

        # s.loads(token, max_age=3600)

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


def is_valid_token(username, token, max_age):
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
    cur.execute(query, (username, token))
    token = cur.fetch_one()

    # Token exists
    if token is not None:
        try:
            return s.loads(token, max_age=max_age)

        # Token is not valid
        except Exception as e:
            print(e)
            return None


def add_token(username, token):
    """
    Add a token to the database
    """
    conn = connect()
    cur = conn.cursor()
    query = 'insert into tokens(username, token) values(%s, %s)'
    try:
        cur.execute(query, (username, token))
        return True
    except Exception as e:
        print(e)
        return False




