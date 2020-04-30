async function dashBoard(sysmon, data) {
  var searchObj = {
    "size": 0,
    "query": {
        "bool": {
            "must": [
              {"range":{"@timestamp": data.query}}
            ]
        }
    },
    "aggs": {
        "by_image_asc": {
            "terms": {
                "field": "statistics_data.Image.keyword",
                "order" : { "_count" : "asc" },
                "size": 100
            }
        },
        "by_image_desc": {
            "terms": {
                "field": "statistics_data.Image.keyword",
                "order" : { "_count" : "desc" },
                "size": 100
            }
        },
        "by_DestinationIp_asc": {
            "terms": {
                "field": "statistics_data.DestinationIp.keyword",
                "order" : { "_count" : "asc" },
                "size": 100
            }
        },
        "by_DestinationIp_desc": {
            "terms": {
                "field": "statistics_data.DestinationIp.keyword",
                "order" : { "_count" : "desc" },
                "size": 100
            }
        },
        "by_eventtype": {
            "terms": {
                "field": "statistics_data.EventType.keyword",
                "order" : { "_count" : "asc" },
                "size": 100
            }
        },
        "by_DestinationPort": {
            "terms": {
                "field": "statistics_data.DestinationPort.keyword",
                "order" : { "_count" : "asc" },
                "size": 100
            }
        }
    }
  };

  //const el_result = this.search_statistical(searchObj);
  const el_result = await sysmon.client.search({
    index: 'sysmon-search-statistics-*',
    // size: 1000,
    body: searchObj
  });
    
  var results = {};
  var keys=[
    "by_image_asc","by_image_desc","by_DestinationIp_asc","by_DestinationIp_desc","by_eventtype","by_DestinationPort"
  ];
  for (var key in keys) {
    if(el_result.aggregations != null && keys[key] in el_result["aggregations"]){
        results[keys[key]] = el_result["aggregations"][keys[key]]["buckets"];
    }else{
        results[keys[key]] = [];
    }
  }

  if(el_result.hits!=null) results["total"] = el_result["hits"]["total"];
  
  return results;
}

module.exports = dashBoard;