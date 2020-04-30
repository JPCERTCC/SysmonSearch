//const Utils = require('./Utils');
async function getEventIdFromType(type){
  if (type === 'create_process') return [1];
  else if (type === 'file_create_time') return [2];
  else if (type === 'net_access') return [3];
  else if (type === 'process_terminated') return [5];
  else if (type === 'driver_loaded') return [6];
  else if (type === 'image_loaded') return [7];
  else if (type === 'remote_thread') return [8];
  else if (type === 'raw_access_read') return [9];
  else if (type === 'process_access') return [10];
  else if (type === 'create_file') return [11];
  else if (type === 'registry') return [12,13,14];
  else if (type === 'pipe') return [17,18];
  else if (type === 'wmi') return [19,20,21];
  else if (type === 'dns') return [22];
  else if (type === 'error') return [255];
  else return [];
}

async function getTypeFromEventId(id){
  if (id == 1) return 'create_process';
  else if (id == 2) return 'file_create_time';
  else if (id == 3) return 'net_access';
  else if (id == 5) return 'process_terminated';
  else if (id == 6) return 'driver_loaded';
  else if (id == 7) return 'image_loaded';
  else if (id == 8) return 'remote_thread';
  else if (id == 9) return 'raw_access_read';
  else if (id == 10) return 'process_access';
  else if (id == 11) return 'create_file';
  else if ([12,13,14].includes(id)) return 'registry';
  else if ([17,18].includes(id)) return 'pipe';
  else if ([19,20,21].includes(id)) return 'wmi';
  else if (id == 22) return 'dns';
  else if (id == 255) return 'error';
  else return;
}

async function date_to_text(date) {
  var y = await padding(date.getUTCFullYear(), 4, "0"),
      m = await padding(date.getUTCMonth()+1, 2, "0"),
      d = await padding(date.getUTCDate(), 2, "0"),
      h = await padding(date.getUTCHours(), 2, "0"),
      min = await padding(date.getUTCMinutes(), 2, "0"),
      s = await padding(date.getUTCSeconds(), 2, "0"),
      millsec = await padding(date.getUTCMilliseconds(), 3, "0");

  return [y, m, d].join('-') + 'T' + [h, min, s].join(':') + 'Z';
}

async  function padding(n, d, p) {
  p = p || '0';
  return (p.repeat(d) + n).slice(-d);
}

async function getRangeDatetime(date) {
  var date_str = date.substr(0, 10)+"T"+date.substr(11, 12)+"Z";
  var base_date = new Date(date_str);
  var start_date = new Date(base_date.getTime());
  var end_date = new Date(base_date.getTime());
  //start_date.setHours(start_date.getHours() - Number(config.refine_time_range));
  //end_date.setHours(end_date.getHours() + Number(config.refine_time_range));
  start_date.setHours(start_date.getHours() - 1);
  end_date.setHours(end_date.getHours() + 1);
  var start_date_str = await date_to_text(start_date);
  var end_date_str = await date_to_text(end_date);

  return {"start_date": start_date_str, "end_date": end_date_str};
}


async function processList(sysmon, hostname, eventtype, date, searchObj) {
  var host = {};
  host[sysmon.computer_name] = hostname;
  var event_id = {};
  var source = [
    "@timestamp",
    sysmon.map["RecordID"],
    sysmon.map["EventData"],
    sysmon.map["EventID"]
  ];
  if(searchObj==null){
    if (date.length === 23) {
      event_id[sysmon.event_id] = [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21, 22];
      //var date_dict = Utils.get_range_datetime(date);
      var date_dict = await getRangeDatetime(date);
      var query = {
        "bool": {
          "must": [
            {"match": host},
            {"match": sysmon.channel},
            {
              "terms": event_id
              //{"winlog.event_id": [1, 11, 12, 13, 3, 8, 2, 7, 19, 20, 21],}
            },{
              "range": {
                "@timestamp": {
                  "gte": date_dict["start_date"], 
                  "lte": date_dict["end_date"]
                }
              }
            }
          ]
        }
      };
      searchObj = {
        "size": 10000,
        "query": query,
        "sort": [{"@timestamp": "asc"}],
        "_source": source
      };
    } else if(eventtype){
      //const event_id = await getEventIdFromType(eventtype);
      event_id[sysmon.event_id] = await getEventIdFromType(eventtype);
      var query = {
        "bool": {
          "must": [
            {"match": host},
            {"match": sysmon.channel},
            {"terms": event_id},
            {"match": {"@timestamp": date}}
          ]
        }
      }
      searchObj = {
        "size": 10000,
        "query": query,
        "sort": [{"@timestamp": "asc"}],
        "_source": source,
      };
    }
  }

  const el_result = await sysmon.client.search({
    index: sysmon.index,
    //size: 1000,
    body: searchObj
  });
  console.log("[process list search] " + JSON.stringify(searchObj, null, 2));
  //console.log("el_result: " + JSON.stringify(el_result))
  if (el_result) {
    var hits = el_result.hits.hits;

    var results = [];

    for (var index in hits) {
      var hit = hits[index]._source;
      //console.log("hit: " + JSON.stringify(hit));
      let winlog = hit.winlog;
      let data = winlog.event_data;
      // results.push( hit );
      var tmp = {
        "number": winlog.record_id,
        "image": data.Image,
        "guid": data.ProcessGuid,
        "date": data.UtcTime,
        "_id": hits[index]._id
      };
      // results.push(hit.event_data);
      //tmp['type'] = Utils.eventid_to_decription(hit.winlog.event_id);
      //tmp['type'] = await eventid_to_type(winlog.event_id);
      tmp['type'] = await getTypeFromEventId(winlog.event_id);

      switch (tmp['type']) {
        case 'create_process':
          tmp['process'] = data.ParentImage;
          tmp['disp'] = data.CommandLine;
          tmp['info'] = {
            'CurrentDirectory': data.CurrentDirectory,
            'CommandLine': data.CommandLine,
            'Hashes': data.Hashes,
            'ParentProcessGuid': data.ParentProcessGuid,
            'ParentCommandLine': data.ParentCommandLine,
            'ProcessGuid': data.ProcessGuid
          };
          break;
        case 'create_file':
          tmp['process'] = data.Image;
          tmp['disp'] = data.TargetFilename;
          tmp['info'] = {
            'ProcessGuid': data.ProcessGuid
          };
          break;
        case 'registry':
          tmp['process'] = data.Image;
          tmp['disp'] = data.TargetObject;
          tmp['info'] = {
            'EventType': data.EventType,
            'ProcessGuid': data.ProcessGuid
          };
          break;
        case 'net_access':
          tmp['process'] = data.Image;
          tmp['disp'] = data.Protocol + ':' + data.DestinationIp + ':' + data.DestinationPort;
          tmp['ip'] = data.DestinationIp;
          tmp['port'] = data.DestinationPort;
          tmp['info'] = {
            'SourceHostname': data.SourceHostname,
            'ProcessGuid': data.ProcessGuid,
            'SourceIsIpv6': data.SourceIsIpv6,
            'SourceIp': data.SourceIp,
            'DestinationHostname': data.DestinationHostname
          };
          break;
        case 'remote_thread':
          tmp['process'] = data.SourceImage;
          tmp['disp'] = data.TargetImage;
          tmp['info'] = {
            'SourceProcessGuid': data.SourceProcessGuid,
            'StartAddress': data.StartAddress,
            'TargetProcessGuid': data.TargetProcessGuid
          };
          break;
        case 'file_create_time':
          tmp['process'] = data.Image;
          tmp['disp'] = data.TargetFilename;
          tmp['info'] = {
            'CreationUtcTime': data.CreationUtcTime,
            'PreviousCreationUtcTime': data.PreviousCreationUtcTime
          };
          break;
        case 'image_loaded':
          tmp['process'] = data.Image;
          tmp['disp'] = data.ImageLoaded;
          tmp['info'] = {
            'Hashes': data.Hashes
          };
          break;

        case 'process_access':
          tmp['process'] = data.SourceImage;
          tmp['disp'] = data.TargetImage;
          tmp['info'] = {
            'SourceProcessGuid': data.SourceProcessGuid,
            'CallTrace': data.CallTrace,
            'TargetProcessGuid': data.TargetProcessGuid
          };
          break;

        case 'dns':
          tmp['process'] = data.Image;
          tmp['disp'] = data.QueryName;
          tmp['info'] = {
            'ProcessGuid': data.ProcessGuid,
            'QueryStatus': data.QueryStatus,
            'QueryResults': data.QueryResults
          };
          break;
  
        case 'wmi':
          if (hit.winlog.event_id == 19) {
            tmp['process'] = data.Name+":"+ data.EventNamespace;
            tmp['disp'] =  data.Query;
          }else if(hit.winlog.event_id == 20){
            tmp['process'] =  data.Name;
            tmp['disp'] =  data.Destination;
          }else if(hit.winlog.event_id == 21){
            tmp['process'] = data.Consumer;
            tmp['disp'] = data.Filter;
          }

          tmp['info'] = {
            'User': data.User
          };
          break;
      }
      results.push(tmp);
    }

    //console.log("[process list results] " + JSON.stringify(results))
    return results;
  }
  return;
}

module.exports = processList;
