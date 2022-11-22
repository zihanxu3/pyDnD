import os
import sys
# from app import app
import hashlib
import pymongo

DB_NAME = 'userdb'
USER_COLLECTION = "users"

client = pymongo.MongoClient(os.environ.get('COSMOS_CONNECTION_STRING'))

# Create database if it doesn't exist
db = client[DB_NAME]
if DB_NAME not in client.list_database_names():
    # Database with 400 RU throughput that can be shared across the DB's collections
    db.command({"customAction": "CreateDatabase", "offerThroughput": 400})
    print("Created db '{}' with shared throughput.\n".format(DB_NAME))
else:
    print("Using database: '{}'.\n".format(DB_NAME)) 

# Create collection if it doesn't exist
collection = db[USER_COLLECTION]
if USER_COLLECTION not in db.list_collection_names():
    # Creates a unsharded collection that uses the DBs shared throughput
    db.command({"customAction": "CreateCollection", "collection": USER_COLLECTION})
    print("Created collection '{}'.\n".format(USER_COLLECTION))

    indexes = [
        {"key": {"_id": 1}, "name": "_id_1", "unique": True},
        {"key": {"uid": 2}, "name": "_id_2", "unique": True},
    ]
    db.command(
        {
            "customAction": "UpdateCollection",
            "collection": USER_COLLECTION,
            "indexes": indexes,
        }
    )
    print("Indexes are: {}\n".format(sorted(collection.index_information())))
else:
    print("Using collection: '{}'.\n".format(USER_COLLECTION))

def createUser(firstName, lastName, email, password): 
    doc = collection.find_one({"email": email})
    if doc:
        print("User already exists!")
        return 1, {'uid': doc['uid'], 'firstName': doc['firstName'], 'lastName': doc['lastName'], 'email': doc['email']}
    user = {
        "uid": str(hashlib.md5((firstName + lastName + email + password).encode('utf-8')).hexdigest()),
        "email": email,
        "password": str(hashlib.md5(password.encode('utf-8')).hexdigest()),
        "firstName": firstName,
        "lastName": lastName,
    }
    result = collection.update_one(
        {"uid": user["uid"]}, {"$set": user}, upsert=True
    )
    print("Created with user with _id {}\n".format(result.upserted_id))
    doc = collection.find_one({"_id": result.upserted_id})
    return 0, {'uid': doc['uid'], 'firstName': doc['firstName'], 'lastName': doc['lastName'], 'email': doc['email']}

def authUser(email, password):
    doc = collection.find_one({"email": email, "password": str(hashlib.md5(password.encode('utf-8')).hexdigest())})
    if not doc:
        print("User Not Found!")
        return 1, {}
    print("Found a user with _id {}: {}\n".format(doc['uid'], doc))
    return 0, {'uid': doc['uid'], 'firstName': doc['firstName'], 'lastName': doc['lastName'], 'email': doc['email']}