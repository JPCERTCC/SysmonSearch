#!/usr/bin/env python
# -*- coding: utf-8 -*-

import  os, sys, json, glob, datetime
import collection_alert_data_setting as setting
from elasticsearch import Elasticsearch
from elasticsearch import helpers

def rule_file_open():
    rule_files = {}
    try:
        for rule_file_name in glob.glob(setting.RULE_FILE_DIRECTORY):
            f = open(rule_file_name, 'r')
            base_file_name = os.path.basename(rule_file_name)
            json_rule = json.load(f)
            json_rule["file_name"] = base_file_name
            rule_files[base_file_name] = json_rule

        return rule_files
    except Exception as e:
        print "rule file open error. message=[%s]" % (e.message)
        sys.exit(1)

def make_query(detection_rule):
    search_items_and_date_query = []
    search_items_and_eventid_querys = []
    event_id_list = [1, 11, 12, 13, 3, 8, 2, 7]
    search_form_exist_flg = False

    for event_id in event_id_list:

        search_items = []
        if "patterns" in detection_rule:
            for pattern in detection_rule["patterns"]:
                search_form_exist_flg = True
                key = ""
                if event_id == 1:
                    if pattern["key"] == "ProcessName":
                        key = "event_data.Image.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "Hash":
                        key = "event_data.Hashes.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 11:
                    if pattern["key"] == "ProcessName":
                        key = "event_data.Image.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "FileName":
                        key = "event_data.TargetFilename.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id  in [12,13]:
                    if pattern["key"] == "ProcessName":
                        key = "event_data.Image.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "RegistryKey":
                        key = "event_data.TargetObject.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "RegistryValue":
                        key = "event_data.Details.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 3:
                    if pattern["key"] == "IpAddress":
#                         search_items.append({
#                             "bool": {
#                                 "should": [{
#                                     "multi_match": {
#                                         "query": pattern["value"].lower(),
#                                         "type": "cross_fields",
#                                         "fields": ["event_data.DestinationIp", "event_data.DestinationPort"],
#                                         "operator": "and"
#                                     }
#                                 },
#                                 {
#                                     "multi_match": {
#                                         "query": pattern["value"].lower(),
#                                         "type": "cross_fields",
#                                         "fields": ["event_data.DestinationIsIpv6", "event_data.DestinationPort"],
#                                         "operator": "and"
#                                     }
#                                 }]
#                             }
#                         })
                        search_items.append({
                            "bool": {
                                "should": [{
                                    "wildcard": {
                                        "event_data.DestinationIp.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                {
                                    "wildcard": {
                                        "event_data.DestinationIpv6.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                }]
                            }
                        })
                    elif pattern["key"] == "Port":
                        key = "event_data.DestinationPort.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "HostName":
                        key = "event_data.DestinationHostname.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 8:
                    if pattern["key"] == "ProcessName":
                        search_items.append({
                            "bool": {
                                "should": [{
                                    "wildcard": {
                                        "event_data.TargetImage.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                {
                                    "wildcard": {
                                        "event_data.SourceImage.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                }]
                            }
                        })
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 2:
                    if pattern["key"] == "ProcessName":
                        key = "event_data.Image.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 7:
                    if pattern["key"] == "ProcessName":
                        search_items.append({
                            "bool": {
                                "should": [{
                                    "wildcard": {
                                        "event_data.Image.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                {
                                    "wildcard": {
                                        "event_data.ImageLoaded.keyword": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                }]
                            }
                        })
                    elif pattern["key"] == "Hash":
                        key = "event_data.Hashes.keyword"
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break


        if len(search_items) != 0:
            search_items_query = {}
            if detection_rule["operator"].lower() == "and":
                search_items_query = {"bool" : {"must" : search_items}}
            elif detection_rule["operator"].lower() == "or":
                search_items_query = {"bool" : {"should" : search_items}}
            else:
                search_items_query = {"bool" : {"should" : search_items}}

            search_items_and_eventid_querys.append({
                "bool": {
                    "must": [
                        {
                            "match": {
                                "event_id": event_id
                            }
                        },
                        search_items_query
                    ]
                }
            })

    if len(search_items_and_eventid_querys) == 0 and search_form_exist_flg:
        search_items_and_eventid_querys = [{
            "match": {
                "event_id": 9999
            }
        }]

    search_items_and_date_query.append({
        "bool": {
            "should": search_items_and_eventid_querys
        }
    })

    if "start_time" in detection_rule or "end_time" in detection_rule:

        timestamp_range = {}
        if "start_time" in detection_rule:
            timestamp_range["gte"] = detection_rule["start_time"]

        if "end_time" in detection_rule:
            timestamp_range["lte"] = detection_rule["end_time"]

        search_items_and_date_query.append({
                  "range" : {
                      "@timestamp" : timestamp_range
                  }
              })

    searchObj = {
        "query": {
            "bool": {
                "must": search_items_and_date_query
            }
        }
    }

    return searchObj

def set_wildcard_value(search_items, key, value):
    match = {}
    match[key] = "*" + str_escape(value.lower()) + "*"
    search_items.append({
              "wildcard": match
          })

    return search_items

def str_escape(param):
    if param == None:
        return ""

    return param.translate({
        ord(u"\\") : u"\\\\",
        ord(u"\"") : u"\\\"",
        ord(u"\'") : u"\\\'"
    })

def search(client, query, get_size, search_after):
    query["size"] = get_size
    query["sort"] = [{"_id":"asc"}]
    query["_source"] = {"includes" : ["@timestamp", "event_id", "computer_name", "level", "record_number", "event_data"]}

    if search_after != None:
        query["search_after"] = search_after

    print "### SEARCH query=[%s] ######" % (json.dumps(query))
    response = client.search(
        index = setting.INDEX_NAME_ORG + "-*",
        body = query
    )

    return response

def registration(data, rule):
    print "##### STORE #####"

    actions = []
    for hit in data['hits']['hits']:

        new_obj = {
            "original_index" : "",
            "original_type" : "",
            "original_id" : "",
            "@timestamp" : "",
            "event_id" : "",
            "computer_name" : "",
            "level" : "",
            "record_number" : 0,
            "rule" : [rule],
            "event_data" : {}
        }

        new_index_name = hit['_index'].replace(setting.INDEX_NAME_ORG, setting.INDEX_NAME)

        # Create Index
        if client.indices.exists(index=new_index_name) == False:
            client.indices.create(index=new_index_name, ignore=400)

        duplicate_check = client.search(
            index = new_index_name,
            body = {
                "from": 0,
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "match": {
                                    "original_index.keyword": hit["_index"]
                                }
                            },
                            {
                                "match": {
                                    "original_type.keyword": hit["_type"]
                                }
                            },
                            {
                                "match": {
                                    "original_id.keyword": hit["_id"]
                                }
                            }
                        ]
                    }
                }
            }
        )

        total_size = duplicate_check['hits']['total']
        if total_size != 0:
            continue

        obj = hit["_source"]

        try :
            if hit.has_key("_index"): new_obj['original_index'] = hit['_index']
            if hit.has_key("_type"): new_obj['original_type'] = hit['_type']
            if hit.has_key("_id"): new_obj['original_id'] = hit['_id']
            if obj.has_key("@timestamp"): new_obj['@timestamp'] = obj['@timestamp']
            if obj.has_key("event_id"): new_obj['event_id'] = obj['event_id']
            if obj.has_key("computer_name"): new_obj['computer_name'] = obj['computer_name']
            if obj.has_key("level"): new_obj['level'] = obj['level']
            if obj.has_key("record_number"): new_obj['record_number'] = obj['record_number']
            if obj.has_key("event_data"): new_obj['event_data'] = obj['event_data']
#            print new_obj
#            client.index( index=new_index_name, doc_type="wineventlog", body=new_obj )
            actions.append({'_index': new_index_name, '_type': 'doc', '_source': new_obj})

        except Exception as e:
            print "failed in the save of data. index=[%s] data=[%s] message=[%s]" % (new_index_name, json.dumps(new_obj), e.message)
            sys.exit(1)

    helpers.bulk(client, actions)


print "##### collection alert data START #####"

client = Elasticsearch([setting.ELASTICSEARCH_SERVER],http_auth=('elastic','changeme'),port=9200);

rule_files = rule_file_open()

try :
    for file_name in rule_files:
        print "### Rule file [%s] ######" % (file_name)

        query = make_query(rule_files[file_name])

        total = search(client, query, 0, None)
        total_size = total['hits']['total']
        print "### Total size [%s] ######" % (total_size)

        if total_size > setting.MAX_GET_SIZE:
            roop_count = 0
            if total_size % setting.MAX_GET_SIZE == 0:
                roop_count = total_size / setting.MAX_GET_SIZE
            else:
                roop_count = total_size / setting.MAX_GET_SIZE + 1

            search_after = None
            for i in range(roop_count):
                response = search(client, query, setting.MAX_GET_SIZE, search_after)
                search_after = response['hits']['hits'][-1]['sort']
                insert_ids = registration(response, rule_files[file_name])
        else:
            response = search(client, query, setting.MAX_GET_SIZE, None)
            insert_ids = registration(response, rule_files[file_name])

except Exception as e:
    print "Failed to search or register data. message=[%s]" % (e.message)
    sys.exit(1)

print "##### collection alert data END #####"
