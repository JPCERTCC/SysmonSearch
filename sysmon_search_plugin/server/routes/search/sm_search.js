const Utils = require('./Utils');
const makeQuery = require('./make_query');

function set_wildcard_value(search_items, key, params, num) {
  var match = {};
  if ("search_value_" + num in params
      && typeof params["search_value_" + num] !== "undefined") {
    match[key] = "*" + str_escape(params["search_value_" + num].toLowerCase()) + "*";
    search_items.push({"wildcard": match});
  }
  return search_items;
}

function str_escape(str) {
    if(str == null || typeof str === "undefined") return "";
    var entityMap = {
        "\\" : "\\\\",
        "\"" : "\\\"",
        "\'" : "\\\'"
    };
    return String(str).replace(/[\\\"\']/g, function(s) {
        return entityMap[s];
    });
}

async function smSearch(sysmon, params) {
  const search_items_and_date_query = await makeQuery(params, sysmon.map);
  search_items_and_date_query.push({"match":sysmon.channel});

  var sort_item = {};
  sort_item[params.sort_item] = params.sort_order;

  //if(params.sort_item != "winlog.event_id") sort_item[params.sort_item + ".keyword"] = params.sort_order;
  //else sort_item[params.sort_item] = params.sort_order;
  
  var sort = [];
  sort.push(sort_item);

  var searchObj = {
    "size": 10000,
    "query": {
      "bool": {"must": search_items_and_date_query}
    },
    "sort": sort,
    //"_source": ["record_number", "event_id", "level", "event_record_id", "computer_name", "user", "event_data", "@timestamp"]
    "_source": ["winlog", "log", "@timestamp"]
  };

  console.log("[smSearch] " + JSON.stringify(searchObj, null, 2));

  const el_result = await sysmon.client.search({
    index: sysmon.index,
    // size: 1000,
    body: searchObj
  });
  //console.log(JSON.stringify(el_result));

  var results = [];
  var results_count = 0;
  //if (el_result !== null) {
  if ("hits" in el_result) {
    results_count = el_result.hits.total;
    var hits = el_result.hits.hits;
    //console.log(JSON.stringify(hits));
    for (let index in hits) {
      var hit = hits[index]._source;
      var description = Utils.eventid_to_type(hit.winlog.event_id);
      var tmp = {
        "number": hit.winlog.record_id,
        "utc_time": hit.winlog.event_data.UtcTime,
        "event_id": hit.winlog.event_id,
        "level": hit.log.level,
        "computer_name": hit.winlog.computer_name,
        "user_name": hit.winlog.user?hit.winlog.user.name:"",
        "image": hit.winlog.event_data.Image,
        "date": hit["@timestamp"],
        "process_guid": hit.winlog.event_data.ProcessGuid,
        "description" : description,
        "task": hit.winlog.task,
        "_id" : hits[index]._id
      };
      if(hit.winlog.event_id == 8){
        tmp["process_guid"] = hit.winlog.event_data.SourceProcessGuid;
        tmp["image"] = hit.winlog.event_data.SourceImage;
      }
      results.push(tmp);
    }
  }
  //console.log(results);
  const res = {"total": results_count, "hits": results};
  
  return res;
}

module.exports = smSearch;
