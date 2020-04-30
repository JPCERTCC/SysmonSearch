#!/bin/sh

mkdir -v -p logs rule_files es/es-data
chmod -R 777 logs rule_files es/es-data
cp -v ../sysmon_search_plugin/winlogbeat.yml stixioc-import-server
docker-compose build stixioc-import-server
cd ../sysmon_search_r && npm install
