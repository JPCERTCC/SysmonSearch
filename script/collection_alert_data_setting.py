#!/usr/bin/env python
# -*- coding: utf-8 -*-

ELASTICSEARCH_SERVER = "elasticsearch"
ELASTICSEARCH_PORT = 9200
ELASTICSEARCH_USER="elastic"
ELASTICSEARCH_PASS="changeme"

INDEX_NAME_ORG = "winlogbeat"
INDEX_NAME = "sysmon-search-alert"
MAX_GET_SIZE = 10000
RULE_FILE_DIRECTORY = "/root/script/rule_files/*"
WINLOGBEAT_YML = "/root/script/winlogbeat.yml"
#WINLOGBEAT_YML = "../sysmon_search_plugin/winlogbeat.yml"
