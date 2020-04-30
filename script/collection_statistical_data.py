#!/usr/bin/env python
# -*- coding: utf-8 -*-

import  sys
import  time
import  json
import collection_statistical_data_setting as setting
from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch import helpers

import yaml
fields = {}
with open(setting.WINLOGBEAT_YML) as file:
    yml = yaml.safe_load(file)
    fields = yml["fieldmappings"]

def check_date(date):
    try:
        datetime.strptime(date.replace('\r', ''), "%Y.%m.%d")
        return True
    except ValueError:
        return False

def search(client, index_name_org, get_size, search_after):
    print("### SEARCH index=[%s] size=[%d] search_after=[%s]" % (index_name_org, get_size, search_after))
    sys.stdout.flush()
    source = [
        "@timestamp",
        fields["EventID"],
        "log.level",
        fields["EventData"]
    ]
    #print(source)
    query = {
        "_source": {"includes": source},
        "size": get_size,
        "query": {
            #"match_all": {},
            "match": {
                "winlog.channel": "Microsoft-Windows-Sysmon/Operational"
            },
        },
        "sort": [{"_id":"asc"}]
    }

    if search_after != None:
        query["search_after"] = search_after

    response = client.search(
        index = index_name_org,
        body = query,
        request_timeout=900
    )

    return response

def registration(response, index_name_new, date_utc_str):
    print("### STORE [%s]" % (index_name_new))
    sys.stdout.flush()

    actions = []
    for hit in response['hits']['hits']:
        new_obj = {
            "original_index" : "",
            "original_type" : "",
            "original_id" : "",
            "@timestamp" : "",
            "statistics_data" : {
                "DestinationIp" : "",
                "DestinationPort" : "",
                "Image" : "",
                "EventType" : "",
                "event_id" : "",
                "level" : ""
            }
        }

        try :
            obj = hit["_source"]
            winlog = obj["winlog"]
            #print(winlog)
            data = winlog["event_data"]

            exclude_flg = False

            if obj['winlog']['event_id'] not in [1, 3, 12, 13]:
                exclude_flg= True

            #if exclude_flg == False and obj.has_key("event_data"):
            if exclude_flg == False and "event_data" in obj['winlog']:
              #if obj['winlog']['event_data'].has_key("DestinationIp"):
              if "DestinationIp" in obj['winlog']['event_data']:
                for value in setting.EXCLUDED_IPADDRESS:
                    if obj['winlog']['event_data']['DestinationIp'].startswith(value):
                        exclude_flg= True

            #if exclude_flg == False and obj.has_key("event_data") and obj['event_data'].has_key("DestinationIpv6"):
            if exclude_flg == False and "event_data" in obj['winlog']:
              #if obj['winlog']['event_data'].has_key("DestinationIpv6"):
              if "DestinationIpv6" in obj['winlog']['event_data']:
                for value in setting.EXCLUDED_IPADDRESS:
                    if obj['winlog']['event_data']['DestinationIpv6'].startswith(value):
                        exclude_flg= True

            #if exclude_flg == False and obj.has_key("event_data") and obj['event_data'].has_key("Image"):
            if exclude_flg == False and "event_data" in obj['winlog']:
              #if obj['winlog']['event_data'].has_key("Image"):
              if "Image" in obj['winlog']['event_data']:
                for value in setting.EXCLUDED_PROCESS:
                    if obj['winlog']['event_data']['Image'].startswith(value):
                        exclude_flg= True

            if exclude_flg:
                continue

            #if hit.has_key("_index"): new_obj['original_index'] = hit['_index']
            if "_index" in hit: new_obj['original_index'] = hit['_index']
            #if hit.has_key("_type"): new_obj['original_type'] = hit['_type']
            if "_type" in hit: new_obj['original_type'] = hit['_type']
            #if hit.has_key("_id"): new_obj['original_id'] = hit['_id']
            if "_id" in hit: new_obj['original_id'] = hit['_id']
                #new_obj['_id'] = hit['_id']
            #if obj.has_key("@timestamp"): new_obj['@timestamp'] = obj['@timestamp']
            if "@timestamp" in obj: new_obj['@timestamp'] = obj['@timestamp']
            #if obj.has_key("event_data"):
            if "event_data" in obj["winlog"]:
                #if obj['event_data'].has_key("DestinationIp"): new_obj['statistics_data']['DestinationIp'] = obj['event_data']['DestinationIp']
                if "DestinationIp" in data:
                    new_obj['statistics_data']['DestinationIp'] = data["DestinationIp"]
                if "DestinationPort" in data:
                    new_obj['statistics_data']['DestinationPort'] = data['DestinationPort']
                if "Image" in data: 
                    new_obj['statistics_data']['Image'] = data['Image']
                if "EventType" in data:
                    new_obj['statistics_data']['EventType'] = data['EventType']
            if "event_id" in winlog:
                new_obj['statistics_data']['event_id'] = winlog['event_id']
            if "level" in obj["log"]:
                new_obj['statistics_data']['level'] = obj['log']['level']
            print(new_obj)

            actions.append({
                '_id': new_obj['original_id'],
                '_index': index_name_new,
                '_type': 'doc',
                '_source': new_obj
                })

        except Exception as e:
            print("failed in the save of data. index=[%s] data=[%s] message=[%s]" % (index_name_new, json.dumps(new_obj), e.message))
            sys.exit(1)

    helpers.bulk(client, actions)

# main

print("##### collection statistical data START #####")
sys.stdout.flush()

args = sys.argv

date_str = ""
if len(args) == 1:
    date_str = datetime.now().strftime("%Y.%m.%d")
else:
    if check_date(args[1]) == False:
        print("The format of an input date is unjust. date=[%s]" % (args[1]))
        sys.exit(1)
    else:
        date_str = args[1]
print(date_str)
sys.stdout.flush()

#client = Elasticsearch([setting.ELASTICSEARCH_SERVER],http_auth=('elastic','changeme'),port=9200);
client = Elasticsearch(
        [setting.ELASTICSEARCH_SERVER],
        http_auth=(setting.ELASTICSEARCH_USER, setting.ELASTICSEARCH_PASS),
        port=setting.ELASTICSEARCH_PORT
    );

date_utc_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")

index_name_org = setting.INDEX_NAME_ORG + "-" + date_str + "-*"
index_name_new = setting.INDEX_NAME + "-" + date_str

if client.indices.exists(index=index_name_org):

    # Create Index
    print("### CREATE [%s]" % (index_name_new))
    sys.stdout.flush()
    client.indices.create(index=index_name_new, ignore=400)

    try :
        print("### GET TOTAL SIZE [%s]" % (index_name_org))
        start = time.time()
        sys.stdout.flush()
        total = search(client, index_name_org, 0, None)
        total_size = total['hits']['total']['value']
        print("### TOTAL SIZE [%d]" % (total_size))
        get_total_size_time = time.time() - start
        print("### TOTAL SIZE SEC [%d]" % (get_total_size_time))
        sys.stdout.flush()

        search_time = 0
        regist_time = 0
        i = 0
        if total_size > setting.MAX_GET_SIZE:
            roop_count = 0
            if total_size % setting.MAX_GET_SIZE == 0:
                roop_count = total_size / setting.MAX_GET_SIZE
            else:
                roop_count = total_size / setting.MAX_GET_SIZE + 1

            search_after = None
            for i in range(roop_count):
                start = time.time()
                response = search(client, index_name_org, setting.MAX_GET_SIZE, search_after)
                search_time += (time.time() - start)
                print("### SEARCH TOTAL SEC [%d] AVE(%f)" % (search_time, float(search_time)/float(i+1)))

                search_after = response['hits']['hits'][-1]['sort']
                start = time.time()
                registration(response, index_name_new, date_utc_str)
                regist_time += (time.time() - start)
                print("### REGIST TOTAL SEC [%d] AVE(%f)" % (regist_time, float(regist_time)/float(i+1)))
                print("### (%d/%d)" % (i+1,roop_count))
        else:
            response = search(client, index_name_org, setting.MAX_GET_SIZE, None)
            registration(response, index_name_new, date_utc_str)

        print("### TOTAL SIZE SEC [%d]" % (get_total_size_time))
        print("### SEARCH TOTAL SEC [%d] AVE(%f)" % (search_time, float(search_time)/float(i+1)))
        print("### REGIST TOTAL SEC [%d] AVE(%f)" % (regist_time, float(regist_time)/float(i+1)))

    except Exception as e:
        print("failed in the search of data. index=[%s] message=[%s]" % (index_name_org, e.message))
        sys.exit(1)

print("##### collection statistical data END #####")
