async function events(sysmon, hostname, date) {
  var timestamp = {
    "range" : {"@timestamp": date}
  }
  if (typeof date === "string"){
    timestamp = {
      "match" : {"@timestamp": date}
    }
  }
  var host = {};
  host[sysmon.computer_name] = hostname;
  var searchObj = {
    "size": 0,
    "query": {
      "bool": {
        "must": [
          {"match": host},
          {"match": sysmon.channel},
          timestamp
        ]
      }
    },
    "aggs": {
      "group_by": {
        "date_histogram": {
          "field": "@timestamp",
          "interval": "1d",
          "format": "yyyy-MM-dd"
         },
         "aggs": {
           "event_id": {
             "terms": {
               "field": sysmon.event_id,
               "size" : 100000
             }
           }
         }
       }
     }
  };

  const el_result = await sysmon.client.search({
    index: sysmon.index,
    // size: 1000,
    body: searchObj
  });

  if (el_result){
    console.log(el_result);
    //var results = [];
    var hits = el_result.aggregations.group_by.buckets;
    var category = [
           "create_process",
           "file_create_time",
           "net_access",
           //"process_terminated",
           //"driver_loaded",
           "image_loaded",
           "remote_thread",
           //"raw_access_read",
           //"process_access",
           "create_file",
           "registry",
           //"pipe",
           "wmi",
           "dns",
           //"error",
           "other" 
    ];
    var results = {"items":[], "groups":category};
    for (var index in hits) {
      var item = hits[index];
      var cnt = {};
      for(var i in category){cnt[category[i]] = 0;}
      for (var i in item['event_id']['buckets']) {
        var event = item['event_id']['buckets'][i];
        if (event['key'] == 1) {
          cnt["create_process"] += event['doc_count'];
        } else if (event['key'] == 2) {
          cnt["file_create_time"] += event['doc_count'];
        } else if (event['key'] == 3) {
          cnt["net_access"] += event['doc_count'];
        //} else if (event['key'] == 5) {
        //  cnt["process_terminated"] += event['doc_count'];
        //} else if (event['key'] == 6) {
        //  cnt["driver_loaded"] += event['doc_count'];
        } else if (event['key'] == 7) {
          cnt["image_loaded"] += event['doc_count'];
        } else if (event['key'] == 8) {
          cnt["remote_thread"] += event['doc_count'];
        //} else if (event['key'] == 9) {
        //  cnt["raw_access_read"] += event['doc_count'];
        //} else if (event['key'] == 10) {
        //  cnt["process_access"] += event['doc_count'];
        } else if (event['key'] == 11) {
          cnt["create_file"] += event['doc_count'];
        } else if (event['key'] == 12 || event['key'] == 13 || event['key' == 14]) {
          cnt["registry"] += event['doc_count'];
        //} else if (event['key'] == 17 || event['key'] == 18) {
        //  cnt["pipe"] += event['doc_count'];
        } else if (event['key'] == 19 || event['key'] == 20 || event['key'] == 21) {
          cnt["wmi"] += event['doc_count'];
        } else if (event['key'] == 22) {
          cnt["dns"] += event['doc_count'];
        //} else if (event['key'] == 255) {
        //  cnt["error"] += event['doc_count'];
        } else {
          cnt["other"] += event['doc_count'];
        }

      }

      if (typeof date === "string"){
        // return piechart data
        var data = {"count":cnt};
        return data;
      }else{
        results["count"] = cnt;
      }

      let gid = 0;
      for (let [key, value] of Object.entries(cnt)) {
        var tmp = {
          "group": gid,
          "x":item['key_as_string'],
          "y": value,
          "label":{
            "content":key,
            "yOffset":20
          }
        };
        results["items"].push(tmp);
        gid++;
      }

    }
    // return 2dgraph data
    return results;
  }
  return;
}

module.exports = events;
