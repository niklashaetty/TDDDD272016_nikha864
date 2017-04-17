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

    try:
        collection.insert(cmd)
        return True

    except Exception as e:
        print(e)
        return False


def get_course_plan(plan_hash):
    """
    Find and get a course plan with provided hash.
    :param plan_hash: Unique plan identifier
    :return: Plan in json format, or None is no such plan exists
    """
    collection = get_collection()
    course_plan = collection.find_one({'plan_hash': plan_hash}, {'_id': 0})
    return course_plan


def get_all_plans(owner):
    """
    Query the database and get all plans owner by user.
    :param owner: a username
    :return: list of plan metadata containing name, plan_hash.                     
    """

    collection = get_collection()
    cursor = collection.find({'owner': owner}, {'plan_hash': 1, 'name': 1, '_id': 0})

    course_plans = []
    for plan in cursor:
        course_plans.append(plan)

    return course_plans


def delete_course_plan(identifier, owner):
    """
    Delete a course plan from the database identifier and owner.
    
    :param identifier: identifier of a plan
    :param owner: owner of the course plan
    :return: Boolean success.             
    """

    collection = get_collection()
    result = collection.delete_many({'plan_hash': identifier, 'owner': owner})

    return result.deleted_count > 0


def delete_all_course_plans(owner):
    """
    Delete all course plans of a owner. Tread carefully...
    :param owner: poor guy getting all his plans deleted.
    :return: Boolean success.             
    """
    collection = get_collection()
    result = collection.delete_many({'owner': owner})
    return result.deleted_count > 0
