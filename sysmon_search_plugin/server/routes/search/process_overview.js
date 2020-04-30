const process = require('./process');

async function make_process_infos(result, target_root, config) {
  // KEY: GUID
  // VALUE: EVENT DATA
  var info_array = {};
  var info_net_array = {};
  var info_create_file_array = {};
  var info_create_file_time_array = {};
 
  var hits = result.hits.hits;
  for (var index in hits) {
    var item = hits[index]._source;
    var _id = hits[index]._id;
    console.log("[make process info item] " + JSON.stringify(item));
    var winlog = item.winlog;
    var data = winlog.event_data;

    if (winlog.event_id==3){ //net_access
      if ((data.ProcessGuid in info_array) == false) {
        info_array[data.ProcessGuid] = [];
        info_create_file_array[data.ProcessGuid] = [];
        info_create_file_time_array[data.ProcessGuid] = [];
        info_net_array[data.ProcessGuid] = {};
      }
      if ((data.DestinationPort in info_net_array[data.ProcessGuid]) == false) {
        info_net_array[data.ProcessGuid][data.DestinationPort] = [];
      }
      if( info_net_array[data.ProcessGuid][data.DestinationPort].length == parseInt( config.max_object_num ) ) {
        var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'alert',
          _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_net_array[data.ProcessGuid][data.DestinationPort].push(tmp);
      }else if(info_net_array[data.ProcessGuid][data.DestinationPort].length < parseInt(config.max_object_num)){
        var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'normal',
          _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_net_array[data.ProcessGuid][data.DestinationPort].push(tmp);
      }
    } else if(winlog.event_id==2){ //create file time
      if ((data.ProcessGuid in info_array) == false) {
        info_array[data.ProcessGuid] = [];
        info_create_file_array[data.ProcessGuid] = [];
        info_create_file_time_array[data.ProcessGuid] = [];
        info_net_array[data.ProcessGuid] = {};
      }
      if (info_create_file_time_array[data.ProcessGuid].length == parseInt(config.max_object_num)) {
        var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'alert',
          _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_create_file_time_array[data.ProcessGuid].push(tmp);
      } else if(info_create_file_time_array[data.ProcessGuid].length < parseInt(config.max_object_num)) {
        var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'normal',
          _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_create_file_time_array[data.ProcessGuid].push(tmp);
      }
    } else if (winlog.event_id==11){
      if ((data.ProcessGuid in info_array) == false) {
          info_array[data.ProcessGuid] = [];
          info_create_file_array[data.ProcessGuid] = [];
          info_create_file_time_array[data.ProcessGuid] = [];
          info_net_array[data.ProcessGuid] = {};
      }

      if( info_create_file_array[data.ProcessGuid].length == parseInt( config.max_object_num ) ) {
        var tmp = {
            id: winlog.event_id,
            data: data,
            type: 'alert',
            _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_create_file_array[data.ProcessGuid].push(tmp);
      } else if( info_create_file_array[data.ProcessGuid].length < parseInt( config.max_object_num ) ) {
        var tmp = {
            id: winlog.event_id,
            data: data,
            type: 'normal',
            _id: _id
        };
        info_array[data.ProcessGuid].push(tmp);
        info_create_file_array[data.ProcessGuid].push(tmp);
      }

    } else if (winlog.event_id==22){//dns
      if ((data.ProcessGuid in info_array) == false) {
          info_array[data.ProcessGuid] = [];
          info_create_file_array[data.ProcessGuid] = [];
          info_create_file_time_array[data.ProcessGuid] = [];
          info_net_array[data.ProcessGuid] = {};
      }
      var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'normal',
          message: item.message,
          _id: _id
      };
      info_array[data.ProcessGuid].push(tmp);

    } else if (winlog.event_id!=8){
      if ((data.ProcessGuid in info_array) == false) {
          info_array[data.ProcessGuid] = [];
          info_create_file_array[data.ProcessGuid] = [];
          info_create_file_time_array[data.ProcessGuid] = [];
          info_net_array[data.ProcessGuid] = {};
      }
      var tmp = {
          id: winlog.event_id,
          data: data,
          type: 'normal',
          _id: _id
      };
      info_array[data.ProcessGuid].push(tmp);
    }else{
      if ((data.SourceProcessGuid in info_array) == false) {
        info_array[data.SourceProcessGuid] = [];
        info_create_file_array[data.SourceProcessGuid] = [];
        info_create_file_time_array[data.SourceProcessGuid] = [];
        info_net_array[data.SourceProcessGuid] = {};
      }
      var tmp = {
        id: winlog.event_id,
        data: data,
        type: 'normal',
        _id: _id
      };
      info_array[data.SourceProcessGuid].push(tmp);
    }
  }

  const addProcessInfo = async function (target) {
    console.log("[add process info] " + JSON.stringify(target, null, 2))
    if(target){
      if (target.current != null && target.current.guid != null && target.current.guid in info_array) {
        target.current['infos'] = info_array[target.current.guid];
      }
      console.log("[target child] " + JSON.stringify(target.child, null, 2))
      for (var index in target.child) {
        var item = target.child[index];
        //if(item) target = await add_process_info(item, info_array);
        await addProcessInfo(item);
      } 
    }
    console.log("[add process info result] " + JSON.stringify(target, null, 2))
    //return target;
  }

  await addProcessInfo(target_root);
  console.log("[make process info result] " + JSON.stringify(target_root, null, 2));
  return target_root;
}
            
async function sub_process_infos(sysmon, hostname, date, guid) {
  var host = {};
  host[sysmon.computer_name] = hostname;
  var processGuid = {};
  processGuid[sysmon.map["ProcessGuid"]] = guid;
  var sourceProcessGuid = {};
  sourceProcessGuid[sysmon.map["SourceProcessGuid"]] = guid;
  // Search Process Info
  // source process is create remote thread, or process is events
  var searchObj = {
    "size": 10000,
    "query": {
      "bool": {
        "must": [
          {"bool":
            {"must": [
                {"match": {"@timestamp": date}},
                {"match": host},
                {"match": sysmon.channel}
              ]
            }
          },{
          "bool": {
            "should": [{
              "bool": {
                "must": [{
                  "match": processGuid
                  //{"event_data.ProcessGuid.keyword": guid}
                },{
                  "terms": {[sysmon.event_id]: [11, 12, 13, 3, 2, 7, 19, 20, 21, 22]}
                  //"terms": {"winlog.event_id": [11, 12, 13, 3, 2, 7, 19, 20, 21]}
                }]
              }
            },{
              "bool": {
                "must": [{
                  "match": sourceProcessGuid
                  //{"event_data.SourceProcessGuid.keyword": guid}
                },{
                  "terms": {[sysmon.event_id]: [8]}
                  //"terms": {"winlog.event_id": [8]}
                }]
              }
            }]
          }
        }]
      }
    },
    "sort": [{"@timestamp": "asc"}]
  };
  console.log("[search sub process] " + JSON.stringify(searchObj, null, 2))
  const el_result = await sysmon.client.search({
    index: sysmon.index,
    // size: 1000,
    body: searchObj
  });
  return el_result;
}

async function search_target(el_result, guid) {
  /*
  el_result = {
    current: {
      guid:,
      infos:
    },
    child:[item]
  }
  */
  if (el_result.current != null && el_result.current.guid == guid) {
    return el_result;
  }
  for (var index in el_result.child) {
    var item = el_result.child[index];
    var tmp = await search_target(item, guid);
    if (tmp != null) return tmp;
  }
  return null;
}

async function process_overview(sysmon, hostname, date, guid) {
  var host = {};
  host[sysmon.computer_name] = hostname;
  var processGuid = {};
  processGuid[sysmon.map["ProcessGuid"]] = guid;
  // search pc's create_process which has guid on date
  var query = {
    "bool": {
      "must": [
      {
        "bool":{
          "must": [
            //{"match": {"winlog.event_id": 1}},
            {"match": {[sysmon.event_id]: 1}},
            {"match": host},
            {"match": sysmon.channel},
          ]
        }
      },{
        "bool": {
          "should": [{
            "bool": {
              "must": [
                {"match": processGuid}
              ]
            }
          },{
            "bool": {
              "must": [
                {"match": {"@timestamp": date}}
              ]
            }
          }]
        }
      }]
    }
  }
  var searchObj = {
    "size": 1000, "query": query, "sort": [{"@timestamp": "asc"}]
  };
  const el_result = await process(sysmon, hostname, date, searchObj);
  console.log("[search process overview] " + JSON.stringify(searchObj, null, 2));

  //return create_info(proc_result);

  //function create_info(el_result, guid) {
  // TARGET Process Chain( root )
  var guids = [];
  var target_root = null;
  for (var index in el_result) {
    var process_tree = el_result[index];
    target_root = await search_target(process_tree, guid);
    if (target_root != null) break;
  }

  // Child Process GUIDS
  guids = await get_guid(target_root, guids);
  console.log("[guids] " + guids)
  console.log("[target root] " + JSON.stringify(target_root, null, 2))

  const search_result = await sub_process_infos(sysmon, hostname, date, guid);
  const proc_info = await make_process_infos(search_result, target_root, sysmon.config);
  return proc_info;
}


async function get_guid(target, guids) {
  if (target != null && target.current != null && target.current.guid != null) {
    guids.push(target.current.guid);
    for (var index in target.child) {
      var item = target.child[index];
      guids = await get_guid(item, guids);
    }
  }
  return guids;
}

module.exports = process_overview;
