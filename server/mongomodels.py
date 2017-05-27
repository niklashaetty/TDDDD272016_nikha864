"""
This module is the mongodb database abstraction
Make sure these database credentials are stored as environment vars:
    MONGODB_URI: Link to mongodb server w/ authentication
    DATABASE_NAME: name of the database
    DATABASE_COLLECTION: the collection used.
"""

from pymongo import MongoClient
import json
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


def add_semester(identifier, semester_name):
    """
    Add a new and empty semester to and existing plan in the database.
    :param identifier: Unique plan identifier
    :param semester_name: name of the semester.
    :return: Boolean success
    """
    collection = get_collection()

    semesters = get_semesters(identifier)
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
        collection.update({'plan_hash': identifier},
                          {'$set': {'semesters': semesters}})
        return True


def add_course(identifier, periods, blocks, semester_name, course):
    """
    Add a new course to a given plan by taking out all the semesters, 
    editing what we need to edit, then add the semesters back into the database.
    :param identifier: Unique plan identifier
    :param periods: List of periods, i.e. ['period1', 'period2'], or if only one period it will
    look like this: ['period2', None]
    :param blocks: List of blocks, i.e. ['1', '2'], or if only one period it will
    look like this: ['2', None]
    :param semester_name: Name of semester that the course is added to.
    :param course: Course object in form of dict.
    :return: 
    """

    collection = get_collection()
    semesters = get_semesters(identifier)

    # Look for correct semester, temporarily remove from list.
    # Save index so we can put the semester back in the same place
    # Duplicate code from get_semester() to avoid another database call (this should be faster, but uglier)
    correct_semester = None
    old_index = 0
    for s in semesters:
        if s['semester'] == semester_name:
            correct_semester = s
            semesters.remove(s)
            break
        old_index += 1

    # Not found, should never happen though since backend already checked.
    if not correct_semester:
        return False

    old_first_period = correct_semester[periods[0]]
    new_course = {
        "points": course['ects'],
        "level": course['level'],
        "name": course['name'],
        "block": blocks[0],
        "code": course['code']
    }
    old_first_period.append(new_course)
    correct_semester[periods[0]] = old_first_period

    # If period two exists, we'll add the course to that period too.
    if periods[1]:
        print(blocks[1])
        old_second_period = correct_semester['period2']
        new_course = {
            "points": course['ects'],
            "level": course['level'],
            "name": course['name'],
            "block": blocks[1],
            "code": course['code']
        }
        old_second_period.append(new_course)
        correct_semester[periods[1]] = old_second_period

    # Done editing, add the edited semester back to the list of all semesters and update the db.
    semesters.insert(old_index, correct_semester)
    try:
        collection.update({'plan_hash': identifier},
                          {'$set': {'semesters': semesters}})
        update_schedule_conflicts(identifier)
        update_course_credits(identifier)
        return True

    except Exception as e:
        print(e)
        return False


def course_in_plan(identifier, semester_name, course_code):
    """
    Loop through courses of a given semester to find if code is in there.
    :param identifier: 
    :param semester_name: 
    :param course_code: 
    :return: 
    """
    semester = get_semester(identifier, semester_name)

    for c in semester['period1']:
        if c['code'] == course_code:
            return True

    for c in semester['period2']:
        if c['code'] == course_code:
            return True
    return False


def get_course_plan_owner(identifier):
    """
    Return owner of a course plan with provided hash.
    :param identifier: Unique plan identifier
    :return: owner
    """
    collection = get_collection()
    plan = collection.find_one({'plan_hash': identifier}, {'_id': 0, 'owner': 1})
    return plan['owner']


def get_course_plan(identifier):
    """
    Find and get a course plan with provided hash.
    :param identifier: Unique plan identifier
    :return: Plan in json format, or None is no such plan exists
    """
    collection = get_collection()
    course_plan = collection.find_one({'plan_hash': identifier}, {'_id': 0})
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


def get_semesters(identifier):
    """
    Get all semesters with a provided plan_hash
    :param identifier: Unique plan identifier
    :return: List of semesters.
    """
    collection = get_collection()
    res = collection.find_one({'plan_hash': identifier}, {'semesters': 1, '_id': 0})
    return res['semesters']


def get_course_count(identifier, semester_name):
    """
    Get the amount of courses in a given semester
    :param identifier: Unique plan identifier
    :param semester_name: Name of semester
    :return: Integer count
    """
    semester = get_semester(identifier, semester_name)
    return len(semester['period1']) + len(semester['period2'])


def get_semester(identifier, semester_name):
    """
    Get a semester with a provided identifier and name
    :param identifier: Unique plan identifier
    :param semester_name: name of semester
    :return: Correct semester.
    """
    semesters = get_semesters(identifier)
    for s in semesters:
        if s['semester'] == semester_name:
            return s

    return None


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

    # Find and delete correct semester
    for s in semesters:
        if s['semester'] == semester_name:
            semesters.remove(s)
            removed = True
            break

    if removed:
        collection.update({'plan_hash': identifier},
                          {'$set': {'semesters': semesters}})
        update_schedule_conflicts(identifier)
        update_course_credits(identifier)
        return True

    else:
        return False


def delete_course(identifier, semester_name, course_code):
    """
    Delete a course from a given semester
    :param identifier: identifier of a plan
    :param semester_name: name of semester, unique for this plan.
    :param course_code: course code, i.e TDDD37
    :return: Boolean success.             
    """

    collection = get_collection()
    semesters = get_semesters(identifier)

    # Look for correct semester, temporarily remove from list.
    # Save index so we can put the semester back in the same place
    # Duplicate code from get_semester() to avoid another database call (this should be faster, but uglier)
    correct_semester = None
    old_index = 0
    for s in semesters:
        if s['semester'] == semester_name:
            correct_semester = s
            semesters.remove(s)
            break
        old_index += 1

    # Not found, should never happen though since backend already checked.
    if not correct_semester:
        return False

    # Pick out periods
    course_deleted = False
    first_period = correct_semester['period1']
    second_period = correct_semester['period2']

    # Check if course exist in period, if so delete

    for course in first_period:
        if course['code'] == course_code:
            first_period.remove(course)
            course_deleted = True
            break

    for course in second_period:
        if course['code'] == course_code:
            second_period.remove(course)
            course_deleted = True
            break

    # Add periods back to semester
    correct_semester['period1'] = first_period
    correct_semester['period2'] = second_period

    # Add semester back to list of semesters
    semesters.insert(old_index, correct_semester)

    # Add it all to the database again.
    try:
        collection.update({'plan_hash': identifier},
                          {'$set': {'semesters': semesters}})
        update_schedule_conflicts(identifier)
        update_course_credits(identifier)
        return course_deleted

    except Exception as e:
        print(e)
        return False


def update_schedule_conflicts(identifier):
    """
    This brilliant (patent pending) code updates schedule conflicts in the entire plan.
    It does this by looping through each semester to look for conflicts, and updates the document to reflect the
    new status.
    """
    collection = get_collection()
    semesters = get_semesters(identifier)

    global_conflict = False
    index = 0
    for s in semesters:
        blockp1 = [0, 0, 0, 0]
        blockp2 = [0, 0, 0, 0]
        semester_conflict = False

        # Check period 1
        for c in s['period1']:
            blockp1[int(c['block'])-1] += 1
        if any(b > 1 for b in blockp1):  # !conflict!
            semester_conflict = True
            global_conflict = True

        # Check period 2
        for c in s['period2']:
            blockp2[int(c['block'])-1] += 1
        if any(b > 1 for b in blockp2):  # !conflict!
            semester_conflict = True
            global_conflict = True

        # If given semester contains conflicts, update status here
        nestled_str = 'semesters.' + str(index) + '.schedule_conflict'  # something like 'semesters.0.schedule_conflict'
        collection.update({'plan_hash': identifier},
                          {'$set': {nestled_str: semester_conflict}})
        index += 1

    # Set global conflict
    collection.update({'plan_hash': identifier},
                      {'$set': {'schedule_conflict': global_conflict}})


def update_course_credits(identifier):
    """
    This piece of art updates course credits in the entire plan.
    It does this by looping through each semester to add credits, then setting the correct value both globally and
    in each semester.
    """

    collection = get_collection()
    semesters = get_semesters(identifier)

    global_ects = 0
    global_advanced_ects = 0
    index = 0
    for s in semesters:
        semester_ects = 0
        semester_advanced_ects = 0

        # Count period 1
        for c in s['period1']:
            course_ects = int(c['points'][0])
            semester_ects += course_ects
            if c['level'] == 'A':
                semester_advanced_ects += course_ects

        # Count period 2
        for c in s['period2']:

            # If star, "6*", course has already been counted since it runs through both periods. We skip these here.
            if not len(c['points']) > 1:
                course_ects = int(c['points'][0])
                semester_ects += course_ects
                if c['level'] == 'A':
                    semester_advanced_ects += course_ects

        # Update semester credits
        nestled_ects = 'semesters.' + str(index) + '.ects'  # something like 'semesters.0.ects'
        nestled_advanced_ects = 'semesters.' + str(index) + '.advanced_ects'
        collection.update({'plan_hash': identifier},
                          {'$set': {nestled_ects: semester_ects,
                                    nestled_advanced_ects: semester_advanced_ects}})

        # Add semester credits to global
        global_ects += semester_ects
        global_advanced_ects += semester_advanced_ects

        index += 1

    # Set global credits
    collection.update({'plan_hash': identifier},
                      {'$set': {'ects': global_ects,
                                'advanced_ects': global_advanced_ects}})







