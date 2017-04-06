#!/usr/bin/python
"""
This module is the abstraction to the postgres database.
The database url must be specified in 'config.ini' or as an environment variable (i.e. on Heroku)
"""

import configparser
import psycopg2
import os


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
    return connect_cfg()
#   return connect_env()


def connect_env():
    """
    Connect to a POSTGRES database. Database url as env variable DATABASE_URL.
    :return: A valid connection
    """
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    return conn


def connect_cfg():
    """
    Connect to a POSTGRES database using config.ini
    :return: A valid connection
    """
    cfg = load_config()
    db_url = cfg['database']['database_url']
    conn = psycopg2.connect(db_url)
    return conn


def add_user(username, password_hash):
    """
    Add a new user to the database
    """
    conn = connect()
    cur = conn.cursor()
    query = 'insert into users(username, password_hash) values(%s, %s)'
    try:
        cur.execute(query, (username, password_hash))
        cur.commit()
    except Exception as e:
        print(e)
        return False


def add_logged_in_user(username, token):
    """
    Add a user to the logged in
    """
    conn = connect()
    cur = conn.cursor()
    query = 'insert into logged_in_users(username, token) values(%s, %s)'
    try:
        cur.execute(query, (username, token))
        cur.commit()
        return True
    except Exception as e:
        print(e)
        return False


def user_exists(username):
    """
    Check if a user exists in the database
    :return: Boolean user_exists
    """
    conn = connect()
    cur = conn.cursor()
    query = 'select exists(select 1 from users where username =%s '

    try:
        cur.execute(query, (username))
        return cur.fetch_one
    except Exception as e:
        print(e)
        return None




