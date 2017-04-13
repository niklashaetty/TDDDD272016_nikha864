"""
This module is the mongodb database abstraction
Make sure these database credentials are stored as environment vars:
    MONGODB_URI: Link to mongodb server w/ authentication
    DATABASE_NAME: name of the database
    DATABASE_COLLECTION: the collection used.
"""

from pymongo import MongoClient
import os


def get_collection():
    """
    Get a collection from the database and return it
    """
    uri = os.environ.get('MONGODB_URL')
    database = os.environ.get('MONGODB_DATABASE_NAME')
    collection = os.environ.get('MONGODB_DATABASE_COLLECTION')
    client = MongoClient(uri)
    db = client[database]
    collection = db[collection]
    return collection


def add_course_plan(plan_hash, name, owner, total_ects, advanced_ects, semesters):
    """
    Add a new course plan to the database
    :param plan_hash: Unique hash that identifies the course
    :param owner: owner of the course plan
    :param total_ects: Total ects points
    :param semesters: List of semesters in json format, like this:
        {
            "semester": "2016HT",
            "period1" : {
                "block1": ["TDDD02"],
                "block2": ["TDDD03", "TDDD04"],
                "block3": ["TDDD05"],
                "block4": []
            },
            "period2": {
                "block1": ["TDDD02"],
                "block2": ["TDDD03", "TDDD04"],
                "block3": ["TDDD05"],
                "block4": []
            }
        }
    """
    collection = get_collection()

    cmd = {
        'plan_hash': plan_hash,
        'name': name,
        'owner': owner,
        'semesters': semesters,
        'ects': total_ects,
        'advanced_ects': advanced_ects
    }

    collection.insert(cmd)


def get_course_plan(plan_hash):
    """
    Find and get a course plan with provided hash.
    :param plan_hash: Unique plan identifier
    :return: Plan in json format, or None is no such plan exists
    """
    collection = get_collection()
    course_plan = collection.find_one({'plan_hash': plan_hash}, {'_id': 0})
    return course_plan
