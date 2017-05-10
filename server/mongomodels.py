"""
This module is the mongodb database abstraction
Make sure these database credentials are stored as environment vars:
    MONGODB_URI: Link to mongodb server w/ authentication
    DATABASE_NAME: name of the database
    DATABASE_COLLECTION: the collection used.
"""

from pymongo import MongoClient
import os

# Global variables
MAX_SEMESTERS = 4


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
    :param name: name of the course plan
    :param advanced_ects: Total advanced ects points
    :param total_ects: Total ects points
    :param semesters: List of semesters in json format, like this:
        {
            "schedule_conflict": True,
            "ects": 30,
            "advanced_ects": 18,
            "period1": [
                {
                    "points": "6*",
                    "level": "A",
                    "name": "Testcourse 101",
                    "block": 1,
                    "code": "TDDD01"
                }
            ],
            "period2": [
                {
                    "points": "6",
                    "level": "G2",
                    "name": "Testcourse name is a bit long",
                    "block": 1,
                    "code": "TDDD04"
                }
            ],
            "semester": "VT 2016"
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


def add_semester(plan_hash, semester_name):
    """
    Add a new and empty semester to and existing plan in the database.
    :param plan_hash: Unique plan identifier
    :param semester_name: name of the semester.
    :return: Boolean success
    """
    collection = get_collection()

    semesters = get_semesters(plan_hash)
    if len(semesters) >= MAX_SEMESTERS:
        return False
    else:

        # Empty semester template
        new_semester = {
            "schedule_conflict": False,
            "ects": 0,
            "advanced_ects": 0,
            "period1": [],
            "period2": [],
            "semester": semester_name
        }
        semesters.append(new_semester)
        collection.update({'plan_hash': plan_hash},
                          {'$set': {'semesters': semesters}})
        return True


def get_course_plan_owner(plan_hash):
    """
    Return owner of a course plan with provided hash.
    :param plan_hash: Unique plan identifier
    :return: owner
    """
    collection = get_collection()
    plan = collection.find_one({'plan_hash': plan_hash}, {'_id': 0, 'owner': 1})
    return plan['owner']


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


def get_semesters(plan_hash):
    """
    Get all semesters with a provided plan_hash
    :param plan_hash: Unique plan identifier
    :return: List of semesters.
    """
    collection = get_collection()
    res = collection.find_one({'plan_hash': plan_hash}, {'semesters': 1, '_id': 0})
    return res['semesters']


def plan_exists(identifier):
    """
    Check if a course plan exists
    :param identifier: Unique plan identifier
    :return: Boolean plan_exists
    """
    collection = get_collection()
    result = collection.find({'plan_hash': identifier})
    return result.count() > 0


def semester_exists(identifier, semester_name):
    """
    Check if a semester exists in a given course plan, based on semester_name
    :param identifier: Unique plan identifier
    :param semester_name: name of semester, i.e. Spring (VT) 2017
    :return: Boolean semester_exists
    """
    semesters = get_semesters(identifier)
    for s in semesters:
        if s['semester'] == semester_name:
            return True

    return False


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


def delete_semester(identifier, semester_name):
    """
    Delete a semester from a given course plan
    :param identifier: identifier of a plan
    :param semester_name: name of semester, unique for this plan.
    :return: Boolean success.             
    """

    collection = get_collection()
    semesters = get_semesters(identifier)
    removed = False

    for s in semesters:

        if s['semester'] == semester_name:
            semesters.remove(s)
            removed = True
            break

    if removed:
        collection.update({'plan_hash': identifier},
                          {'$set': {'semesters': semesters}})
        return True

    else:
        return False
