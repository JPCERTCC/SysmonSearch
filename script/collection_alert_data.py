#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, sys, json, glob, datetime, yaml
import collection_alert_data_setting as setting
from elasticsearch import Elasticsearch
from elasticsearch import helpers

import yaml
fields = {}
with open(setting.WINLOGBEAT_YML) as file:
    yml = yaml.safe_load(file)
    fields = yml["fieldmappings"]

def rule_file_open():
    rule_files = {}
    try:
        for rule_file_name in glob.glob(setting.RULE_FILE_DIRECTORY):
            with open(rule_file_name, 'r') as f:
                json_rule = json.load(f)
                base_file_name = os.path.basename(rule_file_name)
                json_rule["file_name"] = base_file_name
                rule_files[base_file_name] = json_rule
    except Exception as e:
        print("rule file open error. message=[%s]" % (e.message))
        sys.exit(1)
    return rule_files

def make_query(detection_rule):
    search_items_and_date_query = []
    search_items_and_eventid_querys = []
    event_id_list = [1, 11, 12, 13, 3, 8, 2, 7]
    search_form_exist_flg = False

    for event_id in event_id_list:
        search_items = []
        if "patterns" in detection_rule:
            for pattern in detection_rule["patterns"]:
                #print(pattern)
                search_form_exist_flg = True
                key = ""
                if event_id == 1:
                    if pattern["key"] == "ProcessName":
                        #key = "event_data.Image.keyword"
                        key = fields["ProcessName"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "Hash":
                        #key = "event_data.Hashes.keyword"
                        key = fields["Hashes"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id == 11:
                    if pattern["key"] == "ProcessName":
                        #key = "event_data.Image.keyword"
                        key = fields["ProcessName"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "FileName":
                        #key = "event_data.TargetFilename.keyword"
                        key = fields["TargetFilename"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    else:
                        if detection_rule["operator"].lower() == "and":
                            search_items = []
                            break
                elif event_id  in [12,13]:
                    if pattern["key"] == "ProcessName":
                        #key = "event_data.Image.keyword"
                        key = fields["Image"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "RegistryKey":
                        #key = "event_data.TargetObject.keyword"
                        key = fields["TargetObject"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "RegistryValue":
                        #key = "event_data.Details.keyword"
                        key = fields["Details"]
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
                                        "winlog.event_data.DestinationIp": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                #{
                                #    "wildcard": {
                                #        "winlog.event_data.DestinationIpv6": "*" + str_escape(pattern["value"].lower()) + "*"
                                #    }
                                #}
                                ]
                            }
                        })
                    elif pattern["key"] == "Port":
                        #key = "event_data.DestinationPort.keyword"
                        key = fields["DestinationPort"]
                        search_items = set_wildcard_value(search_items, key, pattern["value"])
                    elif pattern["key"] == "HostName":
                        #key = "event_data.DestinationHostname.keyword"
                        key = fields["DestinationHostname"]
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
                                        "winlog.event_data.TargetImage": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                {
                                    "wildcard": {
                                        "winlog.event_data.SourceImage": "*" + str_escape(pattern["value"].lower()) + "*"
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
                        #key = "event_data.Image.keyword"
                        key = fields["Image"]
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
                                        "winlog.event_data.Image": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                },
                                {
                                    "wildcard": {
                                        "winlog.event_data.ImageLoaded": "*" + str_escape(pattern["value"].lower()) + "*"
                                    }
                                }]
                            }
                        })
                    elif pattern["key"] == "Hash":
                        #key = "event_data.Hashes.keyword"
                        key = fields["Hashes"]
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
                                "winlog.event_id": event_id,
                            },
                            "match": {
                                "winlog.channel": "Microsoft-Windows-Sysmon/Operational"
                            },
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
    #query["_source"] = {"includes" : ["@timestamp", "event_id", "computer_name", "level", "record_number", "event_data"]}
    query["_source"] = {
        "includes" : [
            "@timestamp",
            "winlog.event_id",
            "winlog.computer_name",
            "log.level",
            "winlog.record_id",
            "winlog.event_data"
        ]
    }

    if search_after != None:
        query["search_after"] = search_after

    print("### SEARCH index=[%s] get_size=[%s] offset=[%s] query=[%s]" % (
      setting.INDEX_NAME_ORG + "-*",
      get_size,
      search_after,
      json.dumps(query, indent=2)
    ))
    response = client.search(
        index = setting.INDEX_NAME_ORG + "-*",
        body = query
    )

    return response

def registration(data, rule):
    print("##### STORE #####")

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

        total_size = duplicate_check['hits']['total']['value']
        if total_size != 0:
            continue

        obj = hit["_source"]
        #print(obj)
        try :
            if "_index" in hit: new_obj['original_index'] = hit['_index']
            if "_type" in hit: new_obj['original_type'] = hit['_type']
            if "_id" in hit: new_obj['original_id'] = hit['_id']
            if "@timestamp" in obj: new_obj['@timestamp'] = obj['@timestamp']
            if "event_id" in obj['winlog']: new_obj['event_id'] = obj['winlog']['event_id']
            if "computer_name" in obj['winlog']: new_obj['computer_name'] = obj['winlog']['computer_name']
            if "level" in obj['log']: new_obj['level'] = obj['log']['level']
            if "record_id" in obj['winlog']: new_obj['record_number'] = obj['winlog']['record_id']
            if "event_data" in obj['winlog']: new_obj['event_data'] = obj['winlog']['event_data']

#            print new_obj
#            client.index( index=new_index_name, doc_type="wineventlog", body=new_obj )
            actions.append({'_index': new_index_name, '_type': 'doc', '_source': new_obj})

        except Exception as e:
            print("failed in the save of data. index=[%s] data=[%s] message=[%s]" % (new_index_name, json.dumps(new_obj), e.message))
            sys.exit(1)

    helpers.bulk(client, actions)


print("##### collection alert data START #####")

client = Elasticsearch(
      [setting.ELASTICSEARCH_SERVER],
      http_auth=(setting.ELASTICSEARCH_USER, setting.ELASTICSEARCH_PASS),
      port=setting.ELASTICSEARCH_PORT
    )
#client = Elasticsearch([setting.ELASTICSEARCH_SERVER],port=9200);

rule_files = rule_file_open()

try :
    for file_name in rule_files:
        print("### Rule file [%s] ######" % (file_name))

        query = make_query(rule_files[file_name])

        total = search(client, query, 0, None)
        total_size = total['hits']['total']['value']
        print("### Total size [%s] / Max get size [%s] ######" % (
          total_size, setting.MAX_GET_SIZE
        ))

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
    print("Failed to search or register data. message=[%s]" % (e.message))
    sys.exit(1)

print("##### collection alert data END #####")
