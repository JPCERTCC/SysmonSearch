async function get_datas(el_result) {
  var results = [];
  var hits = el_result.hits.hits;
  for (var index in hits) {
    var hit = hits[index]._source;
    var winlog = hit.winlog;
    var data = hit.winlog.event_data;

    var tmp = {
        "number": winlog.record_id,
        "image": '',
        "guid": '',
        "date": '',
        "_id": hits[index]._id
    };

    if ("Image" in data) tmp["image"] = data.Image;
    if ("ProcessGuid" in data) tmp["guid"] = data.ProcessGuid;
    if ("UtcTime" in data) tmp["date"] = data.UtcTime;

    if (winlog.event_id == 1) {
        tmp['type'] = 'create_process';
        tmp['process'] = data.ParentImage;
        tmp['disp'] = data.CommandLine;
        tmp['info'] = {
            'CurrentDirectory': data.CurrentDirectory,
            'CommandLine': data.CommandLine,
            'Hashes': data.Hashes,
            'ParentProcessGuid': data.ParentProcessGuid,
            'ParentCommandLine': data.ParentCommandLine,
            'ProcessGuid': data.ProcessGuid,
            'Image': data.Image
        };
    } else if (winlog.event_id == 11) {
        tmp['type'] = 'create_file';
        tmp['process'] = data.Image;
        tmp['disp'] = data.TargetFilename;
        tmp['info'] = {
            'ProcessGuid': data.ProcessGuid,
            'TargetFilename': data.TargetFilename,
            'Image': data.Image
        };
    } else if ((winlog.event_id == 12) || (winlog.event_id == 13)) {
        tmp['type'] = 'registry';
        tmp['process'] = data.Image;
        tmp['disp'] = data.TargetObject;
        tmp['info'] = {
            'EventType': data.EventType,
            'ProcessGuid': data.ProcessGuid,
            'TargetObject': data.TargetObject,
            'Image': data.Image,
            'Details': data.Details
        };
    } else if (winlog.event_id == 3) {
        tmp['type'] = 'net';
        tmp['process'] = data.Image;
        tmp['disp'] = data.Protocol + ':' + data.DestinationIp + ':' + data.DestinationPort;
        tmp['info'] = {
            'SourceHostname': data.SourceHostname,
            'ProcessGuid': data.ProcessGuid,
            'SourceIsIpv6': data.SourceIsIpv6,
            'SourceIp': data.SourceIp,
            'DestinationPort:': data.DestinationPort,
            'DestinationHostname:': data.DestinationHostname,
            'DestinationIp': data.DestinationIp,
            'DestinationIsIpv6': data.DestinationIsIpv6
        };

    } else if (winlog.event_id == 8) {
        tmp['type'] = 'remote_thread';
        tmp['process'] = data.SourceImage;
        tmp['disp'] = data.TargetImage;
        tmp['info'] = {
            'SourceProcessGuid': data.SourceProcessGuid,
            'StartAddress': data.StartAddress,
            'TargetProcessGuid': data.TargetProcessGuid,
            'TargetImage': data.TargetImage,
            'SourceImage': data.SourceImage
        };
    } else if (winlog.event_id == 2) {
        tmp['type'] = 'file_create_time';
        tmp['process'] = data.Image;
        tmp['disp'] = data.TargetFilename;
        tmp['info'] = {
            'Image': data.Image,
            'CreationUtcTime': data.CreationUtcTime,
            'PreviousCreationUtcTime': data.PreviousCreationUtcTime
        };
    } else if (winlog.event_id == 7) {
        tmp['type'] = 'image_loaded';
        tmp['process'] = data.Image;
        tmp['disp'] = data.ImageLoaded;
        tmp['info'] = {
            'Image': data.Image,
            'ImageLoaded': data.ImageLoaded,
            'Hashes': data.Hashes
        };
    } else if (winlog.event_id == 19) {
        tmp['type'] = 'wmi';
        tmp['process'] = data.Name+":"+data.EventNamespace;
        tmp['disp'] = data.Query;
        tmp['info'] = {
            'User': data.User
        };
    } else if (winlog.event_id == 20) {
        tmp['type'] = 'wmi';
        tmp['process'] = data.Name;
        tmp['disp'] = data.Destination;
        tmp['info'] = {
            'User': data.User
        };
    } else if (winlog.event_id == 21) {
        tmp['type'] = 'wmi';
        tmp['process'] = data.Consumer;
        tmp['disp'] = data.Filter;
        tmp['info'] = {
            'User': data.User
        };

    } else if (winlog.event_id == 22) {
        tmp['type'] = 'dns';
        tmp['process'] = data.Image;
        tmp['disp'] = data.QueryName;
        tmp['info'] = {
            'QueryStatus': data.QueryStatus,
            'QueryResult': data.QueryResults,
        };

    } else {
        tmp['type'] = 'other';
        tmp['process'] = tmp["image"];
        tmp['disp'] = '';
        tmp['info'] = {};
    }
    results.push(tmp);
  }
  return results;
}

async function processDetail(sysmon, hostname, date, guid) {
  var host = {};
  host[sysmon.computer_name] = hostname;
  var pguid = {};
  pguid[sysmon.map["ProcessGuid"]] = guid;
  var spguid = {};
  spguid[sysmon.map["SourceProcessGuid"]] = guid;
  var event_ids = [11, 12, 13, 3, 2, 7, 19, 20, 21, 22];

  var searchObj = {
    "size": 10000,
    "query": {
      "bool": {
        "must": [
          {
            "bool":{
              "must": [
                {"match": host},
                {"match": sysmon.channel},
               ]
            }
          },
          {
            "bool": {
              "should": [
                {
                  "bool": {
                    "must": [
                        {"match": {"@timestamp": date}},
                        {"match": pguid},
                        {"terms": {[sysmon.event_id]: event_ids}}
                        //{"terms": {"winlog.event_id": event_ids}}
                    ]
                  }
                },
                {// or create thread's source = guid
                  "bool": {
                    "must": [
                        {"match": {"@timestamp": date}},
                        {"match": spguid},
                        {"terms": {[sysmon.event_id]: [8]}}
                        //{"terms": {"winlog.event_id": [8]}}
                    ]
                  }
                },
                {// or create process's id = guid
                  "bool": {
                    "must": [
                      {"match": pguid},
                      {"terms": {[sysmon.event_id]: [1]}}
                      //{"terms": {"winlog.event_id": [1]}}
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    "sort": [{"@timestamp": "asc"}]
  };

  const el_result = await sysmon.client.search({
    index: sysmon.index,
    // size: 1000,
    body: searchObj
  });

  const data = await get_datas(el_result);
  console.log(JSON.stringify(searchObj, null, 2) + " -> " + JSON.stringify(el_result));

  return data;
}

module.exports = processDetail;
