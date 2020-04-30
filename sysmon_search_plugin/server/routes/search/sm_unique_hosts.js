const makeQuery = require('./make_query');

async function sm_unique_hosts(sysmon, params) {
  var query = await makeQuery(params, sysmon.map);
  query.push({"match":sysmon.channel});
  var uniqueHostObj = {
    //"size": 0,
    "query": {
      "bool": {"must": query}
    },
    "aggs": {
      "unique_hosts": {
        "terms": {
          //"field": sysmon.computer_name + ".keyword"
          "field": sysmon.computer_name
        }
      }
    }
  };
  console.log("[search unique host] " + JSON.stringify(uniqueHostObj, null, 2))
  const el_result = await sysmon.client.search({
    index: sysmon.index,
    // size: 1000,
    body: uniqueHostObj
  });

  //console.log(JSON.stringify(el_result));
  if (el_result) {
    var unique_hosts = el_result.aggregations.unique_hosts.buckets;
    return unique_hosts;
  }
  return;
}

module.exports = sm_unique_hosts;
