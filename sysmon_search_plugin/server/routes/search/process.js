const Utils = require('./Utils');
const processList = require("./process_list");

async function make_process_tree(cur, list, p_list) {
  if (cur.current != null && cur.current.key != null) {
    var key = cur.current.key;
    delete list[key];

    for (var index in p_list[key]) {
      var tmp = {
        'current': p_list[key][index],
        'parent': cur.current,
        'child': []
      }
      tmp = await make_process_tree(tmp, list, p_list);
      cur.child.push(tmp);
    }
  }
  return cur;
}

async function find_root_process(cur, list, p_list, index) {
  while (true) {
    var tmp_key = cur['pkey'];
    var info = {
      'CurrentDirectory': '',
      'CommandLine': cur.info.ParentCommandLine,
      'ProcessGuid': cur.info.ParentProcessGuid,
      'Hashes': '',
      'ParentProcessGuid': '',
      'ParentCommandLine': '',
      'Net': {},
      'Image': cur.info.ParentImage
    };
    var tmp = {
      "index": index,
      "key": tmp_key,
      "pkey": "",
      "number": -1,
      "level": '',
      "curdir": '',
      "image": cur.info.ParentImage,
      "guid": cur.info.ParentProcessGuid,
      "date": '',
      "info": info,
      "_id": cur._id
    };

    if (tmp_key in p_list) {
      if (tmp_key in list) {
        cur = list[tmp_key];
      } else {
       return tmp;
      }
    } else {
      return tmp;
    }
  }
}

async function get_datas(process_array, p_process_array) {
  //async function get_datas(process_list) {
  //var tmp = make_process_list(datas);

  //var process_array = process_list[0];
  //var p_process_array = process_list[1];

  var info = {
    'CurrentDirectory': '',
    'CommandLine': "root",
    'ProcessGuid': "root",
    'Hashes': '',
    'ParentProcessGuid': '',
    'ParentCommandLine': '',
    'Net': {},
    'Image': "root"
  }
  var system_root_obj = {
    "index": 1,
    "key": "root",
    "pkey": "",
    "number": -1,
    "level": '',
    "curdir": '',
    "image": "root",
    "guid": "root",
    "date": '',
    "info": info,
  };
  var system_root = {
    'current': system_root_obj,
    'parent': null,
    'child': []// store root
  };
  //console.log("[system root] " + JSON.stringify(system_root, null, 2))
  var process_tree = [];

  var index = 2;
  for (var key_index in process_array) {
    var item = process_array[key_index];
    var tmp = await find_root_process(
      item, process_array, p_process_array, index
    );
    var root = {
      'current': tmp,
      'parent': null,
      'child': []
    }
    //console.log("[find root process result] " + JSON.stringify(root, null, 2))

    root = await make_process_tree(root, process_array, p_process_array);
    system_root.child.push( root );

    index += 1;
  }

  process_tree.push(system_root);

  return process_tree;
}

async function make_process_list(el_result, networkInfo) {
  var hits = el_result.hits.hits;
  //console.log("hits: " + JSON.stringify(hits));
  var process_array = {};
  var p_process_array = {};

  for (let index in hits) {
    var item = hits[index]._source;
    var data = item.winlog.event_data;
    //console.log(data);

    var key = data.ProcessGuid;
    var pkey = data.ParentProcessGuid;

    var net_info = {};
    if( key in networkInfo ) {
      var tmp_net_info = networkInfo[ key ];
      for (let tmp_port in tmp_net_info) {
        net_info[tmp_port] = tmp_net_info[tmp_port].length;
      }
    }

    
    var info = {
      'CurrentDirectory': data.CurrentDirectory,
      'CommandLine': data.CommandLine,
      'Hashes': data.Hashes,
      'ParentImage': data.ParentImage,
      'ParentProcessGuid': data.ParentProcessGuid,
      'ParentCommandLine': data.ParentCommandLine,
      'ProcessGuid': data.ProcessGuid,
      'Net': net_info,
      'Image': data.Image
    };

    item['index'] = (index + 1)*10000;
    item['key'] = key;
    item['pkey'] = pkey;

    var tmp = {
       "index": item.index,
       "key": item.key,
       "pkey": item.pkey,
       "number": item.winlog.record_id,
       "level": data.IntegrityLevel,
       "curdir": data.CurrentDirectory,
       "image": data.Image,
       "cmd": data.CommandLine,
       "guid": data.ProcessGuid,
       "date": data.UtcTime,
       "info": info,
       "_id": hits[index]._id
     };
     process_array[key] = tmp;
     if (pkey in p_process_array) {
       p_process_array[pkey].push(tmp);
     } else {
       p_process_array[pkey] = [];
       p_process_array[pkey].push(tmp);
     }
  }

  
  //return [process_array, p_process_array]

  const process_tree = await get_datas(process_array, p_process_array)
  return process_tree;
}

async function process(sysmon, hostname, date, searchObj) {
  var source = [
    sysmon.map["RecordID"],
    sysmon.map["EventData"],
    sysmon.map["EventID"],
  ];
  var host = {};
  host[sysmon.computer_name] = hostname;
  var event_id = {};
  event_id[sysmon.event_id] = 1;
  var netSearchObj = null;

  if(searchObj == null){ // not called from process overview
    var date_dict = null;
    if (date.length === 23) {
      date_dict = Utils.get_range_datetime(date);
    } else if (sysmon.start_time && sysmon.end_time){
      date_dict = Utils.get_range_datetime3(sysmon.start_time, sysmon.end_time);
    }
    //console.log("[date dict]" + date_dict);
    if(date_dict){
      var range = {
        "@timestamp": {
         "gte": date_dict["start_date"], "lte": date_dict["end_date"]
        }
      };
      searchObj = {
        "size": 10000,
        "query": {
          "bool": {
            "must": [
              {"match": host},
              {"match": event_id},
              {"match": sysmon.channel},
              {
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data"]
        "_source": source
      };
      var netevent_id = {};
      netevent_id[sysmon.event_id] = [3];
      netSearchObj = {
        "size": 10000,
        "query": {
          "bool": {
            "must": [
              {"match": host},
              {"match": sysmon.channel},
              {"terms": netevent_id},
              {
                //"range": {"@timestamp": { "gte": date_dict["start_date"], "lte": date_dict["end_date"] }}
                "range": range
              }
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data", "event_id"]
        "_source": source
      };

    } else { //!date_dict
      searchObj = {
        "size": 10000,
        "query": {
          "bool": {
            "must": [
              {"match": host},
              {"match": sysmon.channel},
              {
                "match": event_id
                //{"winlog.event_id": 1}
              },
              {"match": {"@timestamp": date}}
            ]
          }
        },
        "sort": [{"@timestamp": "asc"}],
        //"_source": ["record_number", "event_data"]
        "_source": source
      };
    }
  }

  console.log("[net search] " + JSON.stringify(netSearchObj, null, 2));
  // if called from process overview, netSearchObj=null
  const netDatas = await processList(
    sysmon, hostname, "net_access", date, netSearchObj
  )
  //console.log("[process list netDatas] "  + JSON.stringify(netDatas));

  var networkInfo = {
    //guid: {port:[ip]}
  };
  //function get_net_datas(datas) {
  if(netDatas){
    for( let index in netDatas ) {
      var item = netDatas[ index ];
      //console.log("item: " + JSON.stringify(item));
      if( (item.guid in networkInfo) == false ) {
        networkInfo[ item.guid ] = {};
      }
      if( (item.port in networkInfo[ item.guid ]) == false ) {
        networkInfo[ item.guid ][ item.port ] = [];
      }
      if ( (item.ip in networkInfo[ item.guid ][ item.port ]) == false ) {
        networkInfo[ item.guid ][ item.port ].push( item.ip );
      }
    }
    console.log("[networkInfo] " + JSON.stringify(networkInfo, null, 2));

    console.log("[process search] " + JSON.stringify(searchObj, null, 2));
    const el_result = await sysmon.client.search({
      index: sysmon.index,
      // size: 1000,
      body: searchObj
    });

    //console.log(JSON.stringify(el_result, null, 2));

     //const process_list = await make_process_list(el_result, networkInfo);
     const process_tree = await make_process_list(el_result, networkInfo);
    //console.log("process_list: " + JSON.stringify(process_list));
    //const process_tree = await get_datas(process_list);

    //console.log("[process_tree] " + JSON.stringify(process_tree, null, 2));
    return process_tree;
  }
  return;
}

module.exports = process;
