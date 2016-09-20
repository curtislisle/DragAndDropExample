import bson.json_util
import pymongo
import json
from bson import ObjectId
from pymongo import Connection
import string
import tangelo
import time
import csv



def run():
    # Create an empty response object.
    response = {}
    collectionNames = []

   # look through the collections in the ivaan database and return the name of all collections
   # that match the naming profile for tables.  This is matching to see if the collection name
   # begins with "table_cardiac" since it is only returning cardiac studies from the IVAaN database

    connection = Connection('localhost', 27017)
    db = connection['ivaan']
    # get a list of all collections (excluding system collections)
    collection_list = db.collection_names(False)
    for coll in collection_list:
        # if it is a table, then add it to the response
        if (str(coll[:14]) =='table_cardiac_'):
            print "found table:", coll
            # don't return the prefix in the project name. Users don't have to know the
            # cardiac project collection names are prepended
            collectionNames.append(coll[14:])

    connection.close()

	# if no projects found at all, return a default name
    if len(collectionNames)==0:
		collectionNames.append("default")
		
    # Pack the results into the response object, and return it.
    response['result'] = collectionNames

    # Return the response object.
    tangelo.log(str(response))
    return bson.json_util.dumps(response)
