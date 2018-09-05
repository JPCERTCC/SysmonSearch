
var fs = require('fs');

const Sysmon_Search_Logic = require('./Sysmon_Search_Logic');

function get_test( hostname, date ) {
    var obj = new Sysmon_Search_Logic('localhost', 9200);

    var searchObj = {
        "size": 1000,
        "query": {
            "bool": {
                "must": [{
                    "match": { "computer_name": hostname, }
                },
                {
                    "match": { "event_id": 1 }
                },
                {
                    "match": { "@timestamp": date }
                } ] 
            }
        },
        "sort": [{"@timestamp":"asc"}],
        "_source": ["record_number", "event_data"]
    };

    function get_datas(el_result) {
        fs.writeFile('debug.json', JSON.stringify(el_result, null, '    '));
    }

    obj.search(searchObj, get_datas);
}

function test() {
    var datas = require('./debug.json');

    function make_process_list(el_result) {
        var hits = el_result.hits.hits;

        var process_array = {};
        var p_process_array = {};

        for (var index in hits) {
            var item = hits[index]._source;

            var key = item['event_data']['ProcessGuid'];
            var pkey = item['event_data']['ParentProcessGuid'];

            item['index'] = index + 1;
            item['key'] = key;
            item['pkey'] = pkey;

            var tmp = {
                "index": item.index,
                "key": item.key,
                "pkey": item.pkey,
                "number": item.record_number,
                "level": item.event_data.IntegrityLevel,
                "curdir": item.event_data.CurrentDirectory,
                "image": item.event_data.Image,
                "cmd": item.event_data.CommandLine,
                "guid": item.event_data.ProcessGuid,
                "date": item.event_data.UtcTime,
                "info":{
                    'CurrentDirectory':item.event_data.CurrentDirectory,
                    'CommandLine':item.event_data.CommandLine,
                    'Hashes':item.event_data.Hashes,
                    'ParentImage':item.event_data.ParentImage,
                    'ParentProcessGuid':item.event_data.ParentProcessGuid,
                    'ParentCommandLine':item.event_data.ParentCommandLine,
                    'ProcessGuid':item.event_data.ProcessGuid,
                    'Image':item.event_data.Image
                }
            };
            process_array[key] = tmp;
            if (pkey in p_process_array) {
                p_process_array[pkey].push(tmp);
            } else {
                p_process_array[pkey] = [];
                p_process_array[pkey].push(tmp);
            }
        }

        return [process_array, p_process_array]
    }

    function find_root_process(cur, list, p_list) {
        while( true ) {
            var tmp_key = cur['pkey'];

            var tmp = {
                "index": -1,
                "key": tmp_key,
                "pkey": "",
                "number": -1,
                "level": '',
                "curdir": '',
                "image":cur.info.ParentImage,
                "guid": cur.info.ParentProcessGuid,
                "date": '',
                "info":{
                    'CurrentDirectory':'',
                    'CommandLine':cur.info.ParentCommandLine,
                    'ProcessGuid':cur.info.ParentProcessGuid,
                    'Hashes':'',
                    'ParentProcessGuid':'',
                    'ParentCommandLine':'',
                    'Image':cur.info.ParentImage
                }
            };

            if (tmp_key in p_list) {
                if (tmp in list) {
                    cur = list[tmp_key];
                } else {
                    return tmp;
                }
            } else {
                return tmp;
            }
        }
    }

    function make_process_tree(cur, list, p_list) {
        if(cur.current !=null && cur.current.key !=null){
            var key = cur.current.key;
            delete list[key];

            for (var index in p_list[key]) {
                var tmp = {
                    'current': p_list[key][index],
                    'parent': cur.current,
                    'child': []
                }
                cur.child.push(tmp);
                make_process_tree(tmp, list, p_list);
            }
        }
    }

    [process_array, p_process_array] = make_process_list(datas);

    var process_tree = [];
    for (var index in process_array) {
        console.log( "================================" );
        console.log( index );
        var item = process_array[index];
        var tmp = find_root_process(item, process_array, p_process_array);

        var root = {
            'current': tmp,
            'parent': null,
            'child': []
        }
        make_process_tree(root, process_array, p_process_array);
        process_tree.push( root );
    }
    console.log( "================================" );
    console.log( JSON.stringify(process_tree, null, '    ') );

//    console.log( "================================" );
//    for (var index in process_array) {
//        console.log( index );
//    }

    //console.log( "process_array" );
    //console.log( process_array );
    //console.log( "p_process_array" );
    //console.log( p_process_array );
}

if (require.main === module) {
    function debug(result) {
        console.log("################################");
        console.log(JSON.stringify(result, null, '\t'));
    };

    //get_test('practice7test', '2018-02-14');
    //test();

    var obj = new Sysmon_Search_Logic('localhost', 9200);
    //obj.events("practice7test", debug);
    //obj.process_list("practice7test", "net", "2018-02-14", debug);
    //obj.process("practice7test", "2018-02-14", debug);
    //obj.process_overview("practice7test", "2017-11-14", "{B9BDBBFE-7304-5A0A-0000-00107E7F0500}", debug);
    //obj.child_process("practice7test", "2017-11-14", "{B9BDBBFE-7304-5A0A-0000-00107E7F0500}", debug);
    obj.process_start_end("practice7test", "2018-02-14", "1518570000000", "1518580859000", null, debug);
}
