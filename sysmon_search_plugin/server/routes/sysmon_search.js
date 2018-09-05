import {conf as config} from '../../conf.js';
export default function (server) {

  const Sysmon_Search_Logic = require('./Sysmon_Search_Logic');
  var sysmon_search_obj = new Sysmon_Search_Logic(config.elasticsearch_url, config.elasticsearch_port);

  server.route({
    path: '/api/sysmon-search-plugin/hosts',
    method: 'POST',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.payload;
      sysmon_search_obj.hosts(params, callback );
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/events',
    method: 'POST',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.payload;
      sysmon_search_obj.events(params, callback );
      //reply(params);
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/event/{host}/{date}',
    method: 'GET',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.params;
      sysmon_search_obj.event(params.host, params.date, callback );
      //reply(params);
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_list/{host}/{eventtype}/{date}',
    method: 'GET',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.params;
      sysmon_search_obj.process_list(params.host, params.eventtype, params.date, null, callback );
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process/{host}/{date}',
    method: 'GET',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.params;
      var query = req.query;
      if ((query.start_time == null) || (query.end_time == null)) {
        sysmon_search_obj.process(params.host, params.date, null, callback );
      } else {
        sysmon_search_obj.process_start_end(params.host, params.date, query.start_time, query.end_time, null, callback );
      }
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_overview/{host}/{date}/{guid}',
    method: 'GET',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.params;
      sysmon_search_obj.process_overview(params.host, params.date, params.guid, callback );
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/process_detail/{host}/{date}/{guid}',
    method: 'GET',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.params;
      sysmon_search_obj.process_detail(params.host, params.date, params.guid, callback );
    }
  });

  server.route({
	    path: '/api/sysmon-search-plugin/dashboard',
	    method: 'POST',
	    handler(req, reply) {
	      function callback( result ) {
	        reply(result);
	      }
	      var params = req.payload;
	      sysmon_search_obj.dashboard(params, callback );
	    }
	  });


  server.route({
    path: '/api/sysmon-search-plugin/sm_search',
    method: 'POST',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.payload;
      sysmon_search_obj.sm_search( params, callback );
    }
  });

  server.route({
    path: '/api/sysmon-search-plugin/sm_unique_hosts',
    method: 'POST',
    handler(req, reply) {
      function callback( result ) {
        reply(result);
      }
      var params = req.payload;
      sysmon_search_obj.sm_unique_hosts( params, callback );
    }
  });

  server.route({
	    path: '/api/sysmon-search-plugin/alert_data',
	    method: 'POST',
	    handler(req, reply) {
	      function callback( result ) {
	        reply(result);
	      }
	      var params = req.payload;
	      sysmon_search_obj.alert_data(params, callback );
	    }
	  });

  server.route({
	    path: '/api/sysmon-search-plugin/alert_host',
	    method: 'POST',
	    handler(req, reply) {
	      function callback( result ) {
	        reply(result);
	      }
	      var params = req.payload;
	      sysmon_search_obj.alert_host(params, callback );
	    }
	  });

  server.route({
      path: '/api/sysmon-search-plugin/import_search_keywords',
      method: 'POST',
      handler(request, reply) {
          function callback(result) {
              const util = require('util');
              if (util.isError(result)) {
                  const Boom = require('boom');
                  var error = Boom.badRequest(util.inspect(result)); // 400
                  reply(error);
              } else {
                  reply(result);
              }
          }
          var params = request.payload;
          sysmon_search_obj.import_search_keywords(params, callback);
      }
  });

  server.route({
      path: '/api/sysmon-search-plugin/save_alert_rules',
      method: 'POST',
      handler(request, reply) {
          function callback(result) {
              const util = require('util');
              if (util.isError(result)) {
                  const Boom = require('boom');
                  var error = Boom.serverUnavailable(util.inspect(result)); // 503
                  reply(error);
              } else {
                  reply(result);
              }
          }
          var params = request.payload;
          sysmon_search_obj.save_alert_rules(params, callback);
      }
  });

  server.route({
      path: '/api/sysmon-search-plugin/get_alert_rule_file_list',
      method: 'GET',
      handler(req, reply) {
          function callback( result ) {
              reply(result);
          }
          var params = req.params;
          sysmon_search_obj.get_alert_rule_file_list( params, callback );
     }
  });

  server.route({
      path: '/api/sysmon-search-plugin/delete_alert_rule_file',
      method: 'POST',
      handler(req, reply) {
      function callback( result ) {
          reply(result);
      }
      var params = req.payload;
      sysmon_search_obj.delete_alert_rule_file(params, callback );
    }
  });

}

