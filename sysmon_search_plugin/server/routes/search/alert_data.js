const Utils = require('./Utils');

async function alertData(sysmon, data) {
  var sort_item = {};
  sort_item[data.sort_item] = data.sort_order;
  //if(data.sort_item != "event_id")sort_item[data.sort_item + ".keyword"] = data.sort_order;
  //else sort_item[data.sort_item] = data.sort_order;
  
  var sort = [];
  sort.push(sort_item);

  var searchObj = {
    "size": 10000,
    "query": {
      "bool": {
        "must": [{
          "range": {"@timestamp": data.query}
        }]
      }
    },
    "aggs": {
      "unique_hosts": {
        "terms": {
          "field": "computer_name.keyword",
          "size" : 100000
        }
      },
      "tabledata": {
        "terms": {
          "field": "rule.file_name.keyword",
          "size" : 100000
        },
        "aggs": {
          "hosts": {
            "terms": {
              "field": "computer_name.keyword",
              "size" : 100000
            }
          }
        }
      }
    },
    "sort": sort,
    "_source": [
      "record_number",
      "event_id",
      "level",
      "computer_name",
      "event_data",
      "@timestamp",
      "rule",
      "original_id"
    ]
  };

  
  const el_result = await sysmon.client.search({
    index: 'sysmon-search-alert-*',
    // size: 1000,
    body: searchObj
  });
  //console.log(JSON.stringify(searchObj) + " => " + JSON.stringify(el_result));
  console.log(JSON.stringify(searchObj));

  var results = [];
  var results_count = 0;
  var unique_hosts = [];
  var tabledata = [];
  if (el_result !== null) {
    if (el_result.hits != null) {
      results_count = el_result.hits.total;
      var hits = el_result.hits.hits;
      for (var index in hits) {
        var hit = hits[index]._source;
        var description = Utils.eventid_to_type(hit.event_id);
        var tmp = {
          "number": hit.record_number,
          "utc_time": hit.event_data.UtcTime,
          "event_id": hit.event_id,
          "level": hit.level,
          "computer_name": hit.computer_name,
          "user_name": hit.event_data.User,
          "image": hit.event_data.Image,
          "date": hit["@timestamp"],
          "rule": hit.rule,
          "process_guid": hit.event_data.ProcessGuid,
          "description": description,
          "rule_name": hit.rule[0].file_name,
          "_id" : hit.original_id
        };
        if(hit.event_id == 8){
          tmp["process_guid"]=hit.event_data.SourceProcessGuid;
          tmp["image"]=hit.event_data.SourceImage;
        }
    
        results.push(tmp);
      }
    }
    if(el_result.aggregations != null){
      unique_hosts = el_result.aggregations.unique_hosts.buckets;
      tabledata = el_result.aggregations.tabledata.buckets;
    }
  }

  const response = {
    "total": results_count,
    "hits": results,
    "unique_hosts": unique_hosts,
    "table_data" : tabledata
  };
  return response;
}

module.exports = alertData;
