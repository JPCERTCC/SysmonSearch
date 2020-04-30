async function alertHost(sysmon, data) {
  var uniqueHostObj = {
    "size": 0,
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
      }
    }
  };

  const el_result = await sysmon.client.search({
    index: 'sysmon-search-alert-*',
    // size: 1000,
    body: uniqueHostObj
  };

  var unique_hosts = [];
  if(el_result.aggregations != null)unique_hosts = el_result.aggregations.unique_hosts.buckets;
  return unique_hosts;
}

module.exports = alertHost;
