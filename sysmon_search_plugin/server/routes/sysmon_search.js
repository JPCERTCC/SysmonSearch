import {conf} from '../../conf.js';
import elasticsearch from 'elasticsearch';
const yaml = require('js-yaml');
const fs   = require('fs');

class SysmonSearch {
  //constructor(host, port) {
  constructor(host, port, user, password) {
    this.client = new elasticsearch.Client({
      //log: 'trace',
      //host: host + ':' + port,
      host: `${user}:${password}@${host}:${port}`
    });
    var doc = yaml.safeLoad(fs.readFileSync(__dirname + '/../../winlogbeat.yml', 'utf8'));
    this.channel = doc["logsources"]["windows-sysmon"]["conditions"];
    this.map = doc["fieldmappings"];
    this.computer_name = doc["fieldmappings"]["ComputerName"];
    this.event_id = doc["fieldmappings"]["EventID"];
    this.index = doc["defaultindex"];
    this.start_time = null;
    this.end_time = null;
    this.config = conf;
  }
}

var sysmon_search = new SysmonSearch(
  conf.elasticsearch_url,
  conf.elasticsearch_port,
  conf.elasticsearch_user,
  conf.elasticsearch_password,
);

export default function (server) {

  // Event List
  server.route({
    path: '/api/sysmon-search-plugin/hosts',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("hosts params: " + JSON.stringify(params));
      const searchHosts = require('./search/hosts');
      //const result = await searchHosts(client, params);
      const result = await searchHosts(sysmon_search, params);
      //const result = await sysmon_search_obj.hosts(params);
      console.log("hosts result: " + JSON.stringify(result));
      return result;
    }
  });

  // 2dgraph
  server.route({
    path: '/api/sysmon-search-plugin/events',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("events params: " + JSON.stringify(params));
      const searchEvents = require('./search/events');
      //const result = await searchEvents(client, params.hostname, params.period);
      const result = await searchEvents(sysmon_search, params.hostname, params.period);
      //const result = await sysmon_search_obj.events(params);
      console.log("events result: " + JSON.stringify(result));
      return result;
    }
  });

  // piechart
  server.route({
    path: '/api/sysmon-search-plugin/event/{host}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("event params: " + JSON.stringify(params));
      const searchEvents = require('./search/events');
      //const result = await searchEvents(client, params.host, params.date);
      const result = await searchEvents(sysmon_search, params.host, params.date);
      //const result = await sysmon_search_obj.event(params.host, params.date);
      console.log("event result: " + JSON.stringify(result));
      return result;
    }
  });

  // process list
  server.route({
    path: '/api/sysmon-search-plugin/process_list/{host}/{eventtype}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("process_list params: " + JSON.stringify(params));
      const searchProcessList = require('./search/process_list');
      //const result = await searchProcessList(client, params.host, params.eventtype, params.date, null);
      const result = await searchProcessList(sysmon_search, params.host, params.eventtype, params.date, null);
      //const result = await sysmon_search_obj.process_list(params.host, params.eventtype, params.date, null);
      console.log("process_list result: " + JSON.stringify(result));
      return result;
    }
  });

  // correlation
  server.route({
    path: '/api/sysmon-search-plugin/process/{host}/{date}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      var query = req.query;
      console.log("process query: " + JSON.stringify(query));
      if (query.start_time) sysmon_search.start_time = query.start_time;
      if (query.end_time)   sysmon_search.end_time = query.end_time;

      const searchProcess = require('./search/process');
      const result = await searchProcess(sysmon_search, params.host, params.date, null);
      //const result = await sysmon_search_obj.process(params.host, params.date, null);
      return result;
      //} else {
        //const result = await sysmon_search_obj.process_start_end(params.host, params.date, query.start_time, query.end_time, null);
      //}
    }
  });

  // relevant event data
  server.route({
    path: '/api/sysmon-search-plugin/process_overview/{host}/{date}/{guid}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("process overview params: " + JSON.stringify(params));
      const searchProcessOverview = require('./search/process_overview');
      const result = await searchProcessOverview(sysmon_search, params.host, params.date, params.guid);
      //const result = await sysmon_search_obj.process_overview(params.host, params.date, params.guid);
      console.log("process overview result: " + JSON.stringify(result, null, 2));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_detail/{host}/{date}/{guid}',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      console.log("process detail params: " + JSON.stringify(params));
      const searchProcessDetail = require('./search/process_detail');
      const result = await searchProcessDetail(sysmon_search, params.host, params.date, params.guid);
      //const result = await sysmon_search_obj.process_detail(params.host, params.date, params.guid);
      console.log("process detail result: " + JSON.stringify(result));
      return result;    
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/dashboard',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("dashboard params: " + JSON.stringify(params));
      const dashboard = require('./search/dashboard');
      const result = await dashboard(sysmon_search, params);
      //const result = await sysmon_search_obj.dashboard(params);
      console.log("dashboard result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/sm_search',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("sm_search params: " +JSON.stringify(params));
      //const result = await sysmon_search_obj.sm_search(params);
      const smSearch = require('./search/sm_search');
      const result = await smSearch(sysmon_search, params);
      //console.log("sm_search result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/sm_unique_hosts',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("sm_unique_hosts params: " +JSON.stringify(params));
      const smUniqueHosts = require('./search/sm_unique_hosts');
      const result = await smUniqueHosts(sysmon_search, params);
      //const result = await sysmon_search_obj.sm_unique_hosts(params);
      console.log("sm_unique_hosts: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/alert_data',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("alert_data params: " + JSON.stringify(params));
      const alertData = require('./search/alert_data');
      const result = await alertData(sysmon_search, params);
      //const result = await sysmon_search_obj.alert_data(params);
      console.log("alert_data result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/alert_host',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      console.log("alert_host params: " + JSON.stringify(params));
      const alertHost = require('./search/alert_host');
      const result = await alertHost(params);
      //const result = await sysmon_search_obj.alert_host(params);
      console.log("alert_host result: " + JSON.stringify(result));
      return result;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/import_search_keywords',
    method: 'POST',
    async handler(request) {
      var params = request.payload;
      const importSearch = require('./search/import_search');
      const result = await importSearch(params);
      //const result = await sysmon_search_obj.import_search_keywords(params);
      if (result) {
        const util = require('util');
        if (util.isError(result)) {
          const Boom = require('boom');
          var error = Boom.badRequest(util.inspect(result)); // 400
          return error;
        } else {
          return result;
        }
      }
      return;
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/save_alert_rules',
    method: 'POST',
    handler(request) {
      var params = request.payload;
      const {saveAlert} = require('./search/alert_rule');
      const result = saveAlert(params);
      //const result = sysmon_search_obj.save_alert_rules(params);
      const util = require('util');
      if (util.isError(result)) {
        const Boom = require('boom');
        var error = Boom.serverUnavailable(util.inspect(result)); // 503
        return error;
      } else {
        return result;
      }
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/get_alert_rule_file_list',
    method: 'GET',
    async handler(req) {
      var params = req.params;
      //console.log(`get_alert params: ${params}`);
      console.log("get_alert params: "+ JSON.stringify(params));
      const {getAlert} = require('./search/alert_rule');
      const result = await getAlert(params);
      //const result = await sysmon_search_obj.get_alert_rule_file_list(params);
      console.log("get_alert result: " + JSON.stringify(result));
      return result?result:{};
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/delete_alert_rule_file',
    method: 'POST',
    async handler(req) {
      var params = req.payload;
      const {deleteAlert} = require('./search/alert_rule');
      const result = await deleteAlert(params);
      //const result = await sysmon_search_obj.delete_alert_rule_file(params);
      console.log("delete_alert result: "+ JSON.stringify(result));
      return result;
    }
  });

}
