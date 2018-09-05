import moment from 'moment';
import {
    uiModules
} from 'ui/modules';
import uiRoutes from 'ui/routes';
import {conf as config} from '../conf.js';

// -------------------------------------------------------
// Common
import 'ui/autoload/styles';
import './less/main.less';
import * as vis_network from './dist/vis-network.min.js';
import * as vis_graph from './dist/vis-timeline-graph2d.min.js';
import './dist/vis-network.min.css';
import './dist/vis-timeline-graph2d.min.css';

import './css/common.css';
// import './dist/d3.v3.min.js';
import './dist/visual.css';
import './dist/jquery-3.3.1.min.js';
// -------------------------------------------------------

// -------------------------------------------------------
// Sample HTML
import hostsHTML from './templates/hosts.html';
import eventHTML from './templates/event.html';
import host_statisticHTML from './templates/host_statistic.html';
import process_listHTML from './templates/process_list.html';
import PTreeHTML from './templates/process_tree.html';
import POverviewHTML from './templates/overview.html';
import PDetailHTML from './templates/detail.html';
import alertHTML from './templates/alert.html';
import searchHTML from './templates/search.html';
import dashboardHTML from './templates/dashboard.html';
// -------------------------------------------------------

// -------------------------------------------------------
var gLocal_jp = require( "./assets/i18n/locale-ja.json" );
var gLocal_en = require( "./assets/i18n/locale-en.json" );
var gLangData = gLocal_en;
// -------------------------------------------------------

uiRoutes.enable();
uiRoutes
    .when('/', {
        template: hostsHTML,
        controller: 'hostsController',
        controllerAs: 'ctrl'
    })
    .when('/hosts', {
        template: hostsHTML,
        controller: 'hostsController',
        controllerAs: 'ctrl'
    })
    .when('/host_statistic/:hostname/:date', {
        template: host_statisticHTML,
        controller: 'host_statisticController',
        controllerAs: 'ctrl'
    })
    .when('/event/:hostname/:date', {
        template: eventHTML,
        controller: 'eventController',
        controllerAs: 'ctrl'
    })
    .when('/process_list/:hostname/:eventtype/:date/:_id', {
        template: process_listHTML,
        controller: 'process_listController',
        controllerAs: 'ctrl'
    })
    .when('/process/:hostname/:date/:guid?', {
        template: PTreeHTML,
        controller: 'processController',
        controllerAs: 'ctrl'
    })
    .when('/process_overview/:hostname/:date/:guid', {
        template: POverviewHTML,
        controller: 'process_overviewController',
        controllerAs: 'ctrl'
    })
    .when('/process_detail/:hostname/:date/:guid/:_id', {
        template: PDetailHTML,
        controller: 'process_detailController',
        controllerAs: 'ctrl'
    })
    .when('/alert', {
        template: alertHTML,
        controller: 'alertController',
        controllerAs: 'ctrl'
    })
    .when('/search', {
        template: searchHTML,
        controller: 'searchController',
        controllerAs: 'ctrl'
    })
    .when('/dashboard', {
        template: dashboardHTML,
        controller: 'dashboardController',
        controllerAs: 'ctrl'
    })

// -------------------------------------------------------
//
uiModules
    .get('app/sysmon_search_visual/hosts', [])
    .controller('hostsController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        this.keywords = default_date_range({});
        $http.post('../api/sysmon-search-plugin/hosts', this.keywords).then((response) => {
            this.daily_hosts = response.data;
        });

        this.onkeyup = function(keywords) {

            if (typeof keywords !== "undefined") {
                if (("start_date" in keywords === false || typeof keywords.start_date === "undefined" || keywords.start_date === null) &&
                    ("end_date" in keywords === false || typeof keywords.end_date === "undefined" || keywords.end_date === null)) {

                    keywords = default_date_range(keywords);

                } else {
                    if ("start_date" in keywords && typeof keywords.start_date !== "undefined" && keywords.start_date !== null) {
                        keywords.fm_start_date = formatDate2(new Date(keywords.start_date));
                    } else {
                        delete keywords["fm_start_date"];
                    }
                    if ("end_date" in keywords && typeof keywords.end_date !== "undefined" && keywords.end_date !== null) {
                        var dt = new Date(keywords.end_date);
                        dt.setDate(dt.getDate() + 1);
                        keywords.fm_end_date = formatDate2(dt);
                    } else {
                        delete keywords["fm_end_date"];
                    }
                }
            } else {
                keywords = default_date_range({});
            }

            $http.post('../api/sysmon-search-plugin/hosts', keywords).then((response) => {
                this.daily_hosts = response.data;
            });
        };
    })

function default_date_range(keywords) {
    var st_dt = new Date();
    getPastDate(st_dt,1,"month")
    keywords.fm_start_date = formatDate2(st_dt);
    keywords.fm_end_date = formatDate2(new Date());
    return keywords;
}

uiModules
    .get('app/sysmon_search_visual/host_statistic', [])
    .controller('host_statisticController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        var data = {};
        data.hostname = $route.current.params.hostname;
        var date = $route.current.params.date;
        var year = Number(date.substring(0, 4));
        var month = Number(date.substring(5, 7)) - 1;
        var day = Number(date.substring(8, 10));
        var date1 = getDateBeggining(new Date(year, month, day));
        var date2 = getDateBeggining(getFutureDate(new Date(year, month, day), 1, "month"));
        data.period = getDateQueryFromDate(date1, date2);
        $http.post('../api/sysmon-search-plugin/events', data).then((response) => {
            this.hostname = $route.current.params.hostname;
            var items = [];
            for (var index in response.data) {
                var item = response.data[index];
                var g1 = {
                    "group": 0,
                    "x": item.date,
                    "y": item.result.create_process,
                    "label": "create_process"
                };
                var g2 = {
                    "group": 1,
                    "x": item.date,
                    "y": item.result.create_file,
                    "label": "create_file"
                };
                var g3 = {
                    "group": 2,
                    "x": item.date,
                    "y": item.result.registory,
                    "label": "registory"
                };
                var g4 = {
                    "group": 3,
                    "x": item.date,
                    "y": item.result.net,
                    "label": "net"
                };
                var g5 = {
                    "group": 4,
                    "x": item.date,
                    "y": item.result.remote_thread,
                    "label": "remote_thread"
                };
                var g6 = {
                    "group": 5,
                    "x": item.date,
                    "y": item.result.file_create_time,
                    "label": "file_create_time"
                };
                var g7 = {
                    "group": 6,
                    "x": item.date,
                    "y": item.result.image_loaded,
                    "label": "image_loaded"
                };
                var g8 = {
                    "group": 7,
                    "x": item.date,
                    "y": item.result.wmi,
                    "label": "wmi"
                };
                var g9 = {
                    "group": 8,
                    "x": item.date,
                    "y": item.result.other,
                    "label": "other"
                };
                items.push(g1);
                items.push(g2);
                items.push(g3);
                items.push(g4);
                items.push(g5);
                items.push(g6);
                items.push(g7);
                items.push(g8);
                items.push(g9);
            }
            // console.log( items );

            var container = document.getElementById('visualization');
            var groups = new vis_graph.DataSet();
            groups.add({
                id: 0,
                content: "create process"
            })
            groups.add({
                id: 1,
                content: "file access"
            })
            groups.add({
                id: 2,
                content: "registory access"
            })
            groups.add({
                id: 3,
                content: "network access"
            })
            groups.add({
                id: 4,
                content: "remote thread"
            })
            groups.add({
                id: 5,
                content: "file create time"
            })
            groups.add({
                id: 6,
                content: "image loaded"
            })
            groups.add({
                id: 7,
                content: "wmi"
            })
            groups.add({
                id: 8,
                content: "other"
            })

            var options = {
                style: 'bar',
                stack: true,
                barChart: {
                    width: 40,
                    align: 'center'
                }, // align: left, center, right
                drawPoints: false,
                dataAxis: {
                    icons: true
                },
                //legend: {
                //    enabled: true
                //},
                start: getViewFormat(getPastDate(date1, 1, "day"), 2),
                end: getViewFormat(date2, 2),
                orientation: 'top',
                moveable: false,
                zoomable: false
            };

            var graph2d = new vis_graph.Graph2d(container, items, groups, options);

            function get_category_name_from_groupId(groupId) {
                var category = '';
                switch (groupId) {
                    case 0:
                        category = 'create_process';
                        break;
                    case 1:
                        category = 'create_file';
                        break;
                    case 2:
                        category = 'registory';
                        break;
                    case 3:
                        category = 'net';
                        break;
                    case 4:
                        category = 'remote_thread';
                        break;
                    case 5:
                        category = 'file_create_time';
                        break;
                    case 6:
                        category = 'image_loaded';
                        break;
                    case 7:
                        category = 'wmi';
                        break;
                        // case 8:
                        // category = 'other';
                        // break;
                    default:
                        break;
                }
                return category;
            }

            function get_category_name(date_str, event) {
                var y = event.value[0];
                var linegraph = graph2d.linegraph;
                var groups = linegraph.groups;

                var bar_items = [];
                var bar_height = 0;
                var ids = linegraph.itemsData.getIds();

                for (var i = 0; i < ids.length; i++) {
                    var height = 0;
                    var item = linegraph.itemsData._getItem(ids[i]);

                    if (item.x !== date_str) {
                        continue;
                    }
                    bar_height = bar_height + item.y;
                    bar_items.push({
                        height: item.y,
                        groupId: item.group
                    });
                }

                var cur_top = bar_height;
                var groupId = -1;
                for (var i = 0; i < bar_items.length; i++) {
                    var item = bar_items[i];
                    if (item.height == 0) {
                        continue;
                    }
                    var cur_bottom = cur_top - item.height;

                    if (cur_bottom <= bar_height - y && bar_height - y <= cur_top) {
                        groupId = item.groupId;
                        // alert("groupId:"+groupId);
                        break;
                    }
                    cur_top = cur_bottom;
                }
                var category_name = '';
                if (groupId != -1) {
                    category_name = get_category_name_from_groupId(groupId);
                }
                return category_name;
            }

            graph2d.on("click", function(params) {});
            graph2d.on("doubleClick", function(event) {
                var click_date = event.time;
                var click_date_str = getViewFormat(click_date, "2");

                // http://localhost:5601/app/sysmon_search_visual#/process_list/practiceseven02/2017-11-10?_g=()

                var category = get_category_name(click_date_str, event);
                if (category == '') return;
                var url = 'sysmon_search_visual#/process_list/' + $route.current.params.hostname + '/' + category + '/' + click_date_str + '/0';
                console.log(url);
                window.open(url, "_blank");
            });
        });
    })

uiModules
    .get('app/sysmon_search_visual/event', [])
    .controller('eventController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        $scope.display = function(type) {
            if (type == 'other') return false;
            return true;
        }

        var url = '../api/sysmon-search-plugin/event/' + $route.current.params.hostname + '/' + $route.current.params.date;
        $http.get(url).then((response) => {
            this.hostname = $route.current.params.hostname;
            this.date = $route.current.params.date;
            var items = [];
            for (var index in response.data) {
                var item = response.data[index];
                // console.log( item );
                var g1 = {
                    "type": "create_process",
                    "value": item.result.create_process
                };
                var g2 = {
                    "type": "create_file",
                    "value": item.result.create_file
                };
                var g3 = {
                    "type": "registory",
                    "value": item.result.registory
                };
                var g4 = {
                    "type": "net",
                    "value": item.result.net
                };
                var g5 = {
                    "type": "remote_thread",
                    "value": item.result.remote_thread
                };
                var g6 = {
                    "type": "file_create_time",
                    "value": item.result.file_create_time
                };
                var g7 = {
                    "type": "image_loaded",
                    "value": item.result.image_loaded
                };
                var g8 = {
                    "type": "wmi",
                    "value": item.result.wmi
                };
                var g9 = {
                    "type": "other",
                    "value": item.result.other
                };
                items.push(g1);
                items.push(g2);
                items.push(g3);
                items.push(g4);
                items.push(g5);
                items.push(g6);
                items.push(g7);
                items.push(g8);
                items.push(g9);
            }

            if (response.data.length == 0) {
                var g1 = {
                    "type": "create_process",
                    "value": 0
                };
                var g2 = {
                    "type": "create_file",
                    "value": 0
                };
                var g3 = {
                    "type": "registory",
                    "value": 0
                };
                var g4 = {
                    "type": "net",
                    "value": 0
                };
                var g5 = {
                    "type": "remote_thread",
                    "value": 0
                };
                var g6 = {
                    "type": "file_create_time",
                    "value": 0
                };
                var g7 = {
                    "type": "image_loaded",
                    "value": 0
                };
                var g8 = {
                    "type": "wmi",
                    "value": 0
                };
                var g9 = {
                    "type": "other",
                    "value": 0
                };
                items.push(g1);
                items.push(g2);
                items.push(g3);
                items.push(g4);
                items.push(g5);
                items.push(g6);
                items.push(g7);
                items.push(g8);
                items.push(g9);
            }

            this.data = items;
            if (item && item.result) {
                if (item.result.create_process != 0) {
                    this.btnflg = true;
                } else {
                    this.btnflg = false;
                }
                var freqData = {
                    "create_process": item.result.create_process,
                    "create_file": item.result.create_file,
                    "registory": item.result.registory,
                    "net": item.result.net,
                    "remote_thread": item.result.remote_thread,
                    "file_create_time": item.result.file_create_time,
                    "image_loaded": item.result.image_loaded,
                    "wmi": item.result.wmi,
                    "other": item.result.other
                };
                pie_chart('#piechart', freqData, false, 300);
            }
        });
    })

uiModules
    .get('app/sysmon_search_visual/process_list', [])
    .controller('process_listController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;
        var url = '../api/sysmon-search-plugin/process_list/' + $route.current.params.hostname + '/' + $route.current.params.eventtype + '/' + $route.current.params.date;
        var localdata;
        $http.get(url).then((response) => {
            this.hostname = $route.current.params.hostname;

            if ($route.current.params.date.length === 23) {
                var range_datetime = get_range_datetime($route.current.params.date);
                this.date = range_datetime["start_date"] + "～" + range_datetime["end_date"];
            } else {
                this.date = $route.current.params.date;
            }

            this.data = response.data;
            localdata = response.data;
        });

        this.onkeyup = function(keyword, hash) {
            var search_data = [];
            var tmp_data = [];
            if (keyword != null && keyword !== "") {
                for (var index in localdata) {
                    if (local_search(localdata[index], keyword)) {
                        tmp_data.push(localdata[index]);
                    }
                }
            } else {
                tmp_data = localdata;
            }
            if (hash != null && hash !== "") {
                for (var index in tmp_data) {
                    if (tmp_data[index]["info"] != null && tmp_data[index]["info"]["Hashes"] != null) {
                        if (tmp_data[index]["info"]["Hashes"].indexOf(hash) != -1) {
                            search_data.push(tmp_data[index]);
                        }
                    }
                }
            } else {
                search_data = tmp_data;
            }
            $scope.ctrl.data = search_data;
        };

        this.isTarget = function(id){
            if($route.current.params._id == id){
                return true;
            }else{
                return false;
            }
        }

    })

uiModules
    .get('app/sysmon_search_visual/process', [])
    .controller('processController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        $scope.submit = function() {
            var start_str = $route.current.params.date+"T00:00:00";
            var end_str = $route.current.params.date+"T23:59:59";

            var start_data_obj = new Date(start_str);
            var end_data_obj = new Date(end_str);

            start_data_obj.setHours(this.start_time.getHours());
            start_data_obj.setMinutes(this.start_time.getMinutes());
            end_data_obj.setHours(this.end_time.getHours());
            end_data_obj.setMinutes(this.end_time.getMinutes());

            var start_utc = start_data_obj.getTime();
            var end_utc = end_data_obj.getTime();
			
            var url = '../api/sysmon-search-plugin/process/' + $route.current.params.hostname + '/' + $route.current.params.date;
            url += '?';
            url += 'start_time='+start_utc;
            url += '&';
            url += 'end_time='+end_utc;
            $http.get(url).then((response) => {
                var top = response.data;
                create_network(top, null, null, true);
            });
        };

        var url = '../api/sysmon-search-plugin/process/' + $route.current.params.hostname + '/' + $route.current.params.date;
        var localdata;
        $http.get(url).then((response) => {
            this.hostname = $route.current.params.hostname;

            if ($route.current.params.date.length === 23) {
                var range_datetime = get_range_datetime($route.current.params.date);
                this.date = range_datetime["start_date"] + "～" + range_datetime["end_date"];
            } else {
                this.date = $route.current.params.date;
            }

            var top = response.data;
            localdata = response.data;
            create_network(top, null, null, true);
        });

        function create_network(tops, keyword, hash, firstflg) {
            function sub_create_network(top, keyword, hash) {
                function add_child_info(cur) {
                    function splitByLength(str, length) {
                        var resultArr = [];
                        if (!str || !length || length < 1) {
                            return resultArr;
                        }
                        var index = 0;
                        var start = index;
                        var end = start + length;
                        while (start < str.length) {
                            resultArr[index] = str.substring(start, end);
                            index++;
                            start = end;
                            end = start + length;
                        }
                        return resultArr;
                    }

                    for (var index in cur.child) {
                        var item = cur.child[index];
                        var tmp_str_array = splitByLength(item.current.image, 10);
                        var tmp_label = tmp_str_array.join('\n');

                        var tmp_node = {
                            "id": item.current.index,

                            "label": tmp_label,
                            "title": item.current.cmd,

                            "shape": "circularImage",
                            "image": "../plugins/sysmon_search_visual/images/program.png",

                            //              "info": item.current
                            //              "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                            "guid": item.current.guid,
                            "info": item.current.info
                        };
                        if (search(item.current.info, keyword, hash) || (firstflg == true && $route.current.params.guid == item.current.guid)) {
                            tmp_node["color"] = {
                                "background": "red",
                                "border": "red"
                            };
                            tmp_node["borderWidth"] = 3;
                        }
                        // console.log( tmp_node );
                        nodes.push(tmp_node);

                        var tmp_edge = {
                            "from": cur.current.index,
                            "to": item.current.index,

                            "arrows": "to",
                            "color": {
                                "color": "lightgray"
                            },
                            "length": 200
                        };
                        // console.log( tmp_edge );
                        edges.push(tmp_edge);

                        for( var n_key in item.current.info.Net ) {
                            var n_item = item.current.info.Net[ n_key ];
                            var n_index = item.current.index+"-"+n_key;
                            var tmp_node = {
                                "id": n_index,

                                "label": n_key+":"+n_item,
                                "title": n_key+":"+n_item,

                                "shape": "circularImage",
                                "image": "../plugins/sysmon_search_visual/images/net.png",

                                "guid": item.current.guid,
                                "info": item.current.info
                            };
                            if( n_item > 100) {
                            }
                            nodes.push(tmp_node);

                            var tmp_edge = {
                                "from": item.current.index,
                                "to": n_index,

                                "arrows": "to",
                                "color": {
                                    "color": "lightgray"
                                },
                                "length": 200
                            };
                            edges.push(tmp_edge);
                        }

                        add_child_info(item);
                    }
                }
                var tmp_node = {
                    "id": top.current.index,

                    "label": top.current.image,
                    "title": top.current.cmd,

                    "shape": "circularImage",
                    "image": "../plugins/sysmon_search_visual/images/program.png",

                    //          "info": top.current
                    //          "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                    "guid": top.current.guid,
                    "info": top.current.info
                };
                if (search(top.current.info, keyword, hash)) {
                    tmp_node["color"] = {
                        "background": "red",
                        "border": "red"
                    };
                    tmp_node["borderWidth"] = 3;
                }
                nodes.push(tmp_node);
                add_child_info(top);
            }

            // Display
            function sub_disp_network() {
                /*
                  var nodes = [
                    {
                      "id": 1,
                      "image": "../plugins/visual/images/program.png",
                      "info": "{\"path\": \"?\", \"image\": \"System\", \"guid\": \"{0079005F-0073-0074-6500-6D0000000000}\", \"pid\": \"4\", \"recode_number\": 33400}",
                      "label": "System",
                      "shape": "circularImage",
                      "title": "?",
                      "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                    },

                  var edges = [
                    {
                      "arrows": "to",
                      "color": {
                        "color": "lightgray"
                      },
                      "from": 1,
                      "length": 200,
                      "to": 2
                    },

                */
                var container = document.getElementById('mynetwork');
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    nodes: {
                        size: 25
                    },
                    edges: {
                        width: 2,
                        shadow: false,
                        smooth: {
                            type: 'continuous',
                            roundness: 0
                        }
                    }
                };
                // console.log( data );

                var network = new vis_network.Network(container, data, options);

                network.on("oncontext", function(properties) {
                    var nodeid = network.getNodeAt(properties.pointer.DOM);
                    if (nodeid) {
                        network.selectNodes([nodeid], true);
                        var node = this.body.data.nodes.get(nodeid);
                        if (node && node.info) {
                            const veiw_data_1 = ["CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"];
                            var str = "";
                            var alert_str = "";
                            for (var key in node.info) {
                                if (veiw_data_1.indexOf(key) >= 0) {
                                    if (str === "") {
                                        str = key + ":" + node.info[key];
                                        alert_str = new_line(key + ":" + node.info[key]);
                                    } else {
                                        str = str + "\n" + key + ":" + node.info[key];
                                        alert_str = alert_str + "\n" + new_line(key + ":" + node.info[key]);
                                    }
                                }
                            }
                            $("#text").val(str);
                            alert(alert_str);
                        }
                    }
                });

                network.on("doubleClick", function(properties) {
                    if (!properties.nodes.length) return;

                    var node = this.body.data.nodes.get(properties.nodes[0]);
                    console.log(node);
                    if(node.guid != null && node.guid!="" && node.guid!="root"){
                        var url = 'sysmon_search_visual#/process_overview/' + $route.current.params.hostname + '/' + $route.current.params.date.substr(0, 10) + '/' + node.guid;
                        console.log(url);
                        window.open(url, "_blank");
                    }

                });
            }

            var nodes = [];
            var edges = [];
            // Create Data
            for( var index in tops ) {
                var top = tops[index];
                sub_create_network(top, keyword, hash);
            }
            // Display
            sub_disp_network();
        }

        this.onkeyup = function(keyword, hash) {
            create_network(localdata, keyword, hash, false);
        };

        function search(data, keyword, hash) {
            var flg1 = 1;
            var flg2 = 1;
            if (keyword != null && keyword !== "") {
                if (local_search(data, keyword)) {
                    flg1 = 2;
                }
            } else {
                flg1 = 3;
            }

            if (hash != null && hash !== "") {
                if (data["Hashes"] != null) {
                    if (data["Hashes"].indexOf(hash) != -1) {
                        flg2 = 2;
                    }
                }
            } else {
                flg2 = 3;
            }

            if ((flg1 == 2 && flg2 == 2) || (flg1 == 2 && flg2 == 3) || (flg1 == 3 && flg2 == 2)) {
                return true;
            } else {
                return false;
            }

        }

    })

uiModules
    .get('app/sysmon_search_visual/process_overview', [])
    .controller('process_overviewController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        var url = '../api/sysmon-search-plugin/process_overview/' + $route.current.params.hostname + '/' + $route.current.params.date + '/' + $route.current.params.guid;
        console.log(url);

        var localdata;

        $http.get(url).then((response) => {
            this.hostname = $route.current.params.hostname;
            this.date = $route.current.params.date;
            var top = response.data;
            localdata = response.data;
            if(top && top != ""){
                create_network(top, null, null, true);
            }else{
                this.message = $scope.lang["DETAIL_MESSAGE"];
            }
        });

        function create_network(top, keyword, hash, firstflg) {
            function splitByLength(str, length) {
                var resultArr = [];
                if (!str || !length || length < 1) {
                    return resultArr;
                }
                var index = 0;
                var start = index;
                var end = start + length;
                while (start < str.length) {
                    resultArr[index] = str.substring(start, end);
                    index++;
                    start = end;
                    end = start + length;
                }
                return resultArr;
            }

            function add_child_info(cur) {
                function splitByLength(str, length) {
                    var resultArr = [];
                    if (!str || !length || length < 1) {
                        return resultArr;
                    }
                    var index = 0;
                    var start = index;
                    var end = start + length;
                    while (start < str.length) {
                        resultArr[index] = str.substring(start, end);
                        index++;
                        start = end;
                        end = start + length;
                    }
                    return resultArr;
                }

                for (var index in cur.child) {
                    var item = cur.child[index];
                    var tmp_str_array = splitByLength(item.current.image, 10);
                    var tmp_label = tmp_str_array.join('\n');

                    var tmp_node = {
                        "id": item.current.index,

                        "label": tmp_label,
                        "title": item.current.cmd,

                        "shape": "circularImage",
                        "image": "../plugins/sysmon_search_visual/images/program.png",

                        //            "info": item.current
                        //            "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                        "guid": item.current.guid,
                        "info": item.current.info,
                        "eventid": 1,
                        "_id": item.current._id
                    };


                    if (search(item.current.info, keyword, hash)) {
                        tmp_node["color"] = {
                            "background": "red",
                            "border": "red"
                        };
                        tmp_node["borderWidth"] = 3;
                    }

                    nodes.push(tmp_node);

                    var tmp_edge = {
                        "from": cur.current.index,
                        "to": item.current.index,

                        "arrows": "to",
                        "color": {
                            "color": "lightgray"
                        },
                        "length": 200
                    };
                    edges.push(tmp_edge);

                    add_child_info(item);
                }
            }

            var nodes = [];
            var edges = [];

            if(top.parent != null){
                var tmp_str_array = splitByLength(top.parent.image, 10);
                var tmp_label = tmp_str_array.join('\n');

                var tmp_parent_node = {
                    "id": top.parent.index,

                    "label": tmp_label,
                    "title": top.parent.cmd,

                    "shape": "circularImage",
                    "image": "../plugins/sysmon_search_visual/images/program.png",

                    //        "info": top.current
                    //        "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                    "guid": top.parent.guid,
                    "info": top.parent.info,
                    "eventid": 1,
                    "_id": top.parent._id
                };
                if (search(top.parent.info, keyword, hash)) {
                    tmp_parent_node["color"] = {
                        "background": "red",
                        "border": "red"
                    };
                    tmp_parent_node["borderWidth"] = 3;
                }
                nodes.push(tmp_parent_node);

                var tmp_edge = {
                    "from": top.parent.index,
                    "to": top.current.index,

                    "arrows": "to",
                    "color": {
                        "color": "lightgray"
                    },
                    "length": 200
                };
                edges.push(tmp_edge);
            }

            var tmp_str_array = splitByLength(top.current.image, 10);
            var tmp_label = tmp_str_array.join('\n');

            var tmp_node = {
                "id": top.current.index,

                "label": tmp_label,
                "title": top.current.cmd,

                "shape": "circularImage",
                "image": "../plugins/sysmon_search_visual/images/program.png",

                //        "info": top.current
                //        "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                "guid": top.current.guid,
                "info": top.current.info,
                "eventid": 1,
                "_id":  top.current._id
            };

            if (search(top.current.info, keyword, hash) || firstflg) {
                tmp_node["color"] = {
                    "background": "red",
                    "border": "red"
                };
                tmp_node["borderWidth"] = 3;
            }
            nodes.push(tmp_node);

            add_child_info(top);

            function add_process_info(in_cur) {
                var cur = in_cur.current;
                var cur_id = cur.index;
                var now_id = cur.index * 10000 + 1;
                for (var index in cur.infos) {
                    var item = cur.infos[index];
                    var tmp_node = {
                        "id": now_id,

                        "label": item.data.Image,
                        "title": item.data.Image,

                        "shape": "circularImage",
                        "image": "../plugins/sysmon_search_visual/images/program.png",

                        //            "info": item.current
                        //            "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                        "guid": item.data.ProcessGuid,
                        "eventid": 1,
                        "_id": item._id
                    };

                    // event_id = 1: Create Process
                    // event_id = 11: Create File
                    // event_id = 12 or 13 or 14: Registory
                    // event_id = 3: Net Access
                    // event_id = 8: RemoteThread
                    tmp_node.id = now_id;
                    if (item.id == 1) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/program.png";
                        tmp_node.info = {
                            'CurrentDirectory': item.data.CurrentDirectory,
                            'CommandLine': item.data.CommandLine,
                            'Hashes': item.data.Hashes,
                            'ParentProcessGuid': item.data.ParentProcessGuid,
                            'ParentCommandLine': item.data.ParentCommandLine,
                            'ProcessGuid': item.data.ProcessGuid,
                            'Image': item.data.Image
                        };
                        tmp_node.eventid = 1;
                    } else if (item.id == 11) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/file.png";
                        tmp_node.label = item.data.TargetFilename;
                        tmp_node.title = item.data.TargetFilename;
                        tmp_node.info = {
                            'ProcessGuid': item.data.ProcessGuid,
                            'TargetFilename': item.data.TargetFilename,
                            'Image': item.data.Image
                        };
                        tmp_node.eventid = 11;
                    } else if ((item.id == 12) || (item.id == 13)) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/reg.png";
                        tmp_node.label = item.data.TargetObject;
                        tmp_node.title = item.data.TargetObject;
                        tmp_node.info = {
                            'EventType': item.data.EventType,
                            'ProcessGuid': item.data.ProcessGuid,
                            'TargetObject': item.data.TargetObject,
                            'Image': item.data.Image,
                            'Details': item.data.Details
                        };
                        tmp_node.eventid = 12;
                    } else if (item.id == 3) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/net.png";
                        if (item.type === 'alert') {
                            // Set Alert Image
                            tmp_node.image = "../plugins/sysmon_search_visual/images/net.png";
                        }
                        if (item.data.DestinationHostname === undefined) {
                            tmp_node.label = item.data.DestinationIp;
                        } else {
                            tmp_node.label = item.data.DestinationHostname;
                        }
                        tmp_node.title = item.data.DestinationIp+":"+item.data.DestinationPort;
                        tmp_node.info = {
                            'SourceHostname': item.data.SourceHostname,
                            'ProcessGuid': item.data.ProcessGuid,
                            'SourceIsIpv6': item.data.SourceIsIpv6,
                            'SourceIp': item.data.SourceIp,
                            'DestinationPort:': item.data.DestinationPort,
                            'DestinationHostname:': item.data.DestinationHostname,
                            'DestinationIp': item.data.DestinationIp,
                            'DestinationIsIpv6': item.data.DestinationIsIpv6,
                            'Protocol': item.data.Protocol
                        };
                        tmp_node.eventid = 3;
                    } else if (item.id == 8) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/rthread.png";
                        tmp_node.label = item.data.TargetImage;
                        tmp_node.title = item.data.TargetImage;
                        tmp_node.info = {
                            'SourceProcessGuid': item.data.SourceProcessGuid,
                            'StartAddress': item.data.StartAddress,
                            'TargetProcessGuid': item.data.TargetProcessGuid,
                            'TargetImage': item.data.TargetImage,
                            'SourceImage': item.data.SourceImage
                        };
                        tmp_node.eventid = 8;
                        tmp_node.guid = item.data.SourceProcessGuid;
                    } else if (item.id == 2) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/file_create_time.png";
                        tmp_node.label = item.data.Image;
                        tmp_node.title = item.data.Image;
                        tmp_node.info = {
                            'Image': item.data.Image,
                            'CreationUtcTime': item.data.CreationUtcTime,
                            'PreviousCreationUtcTime': item.data.PreviousCreationUtcTime
                        };
                        tmp_node.eventid = 2;
                    } else if (item.id == 7) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/image_loaded.png";
                        tmp_node.label = item.data.Image;
                        tmp_node.title = item.data.Image;
                        tmp_node.info = {
                            'Image': item.data.Image,
                            'ImageLoaded': item.data.ImageLoaded,
                            'Hashes': item.data.Hashes
                        };
                        tmp_node.eventid = 7;
                    } else if (item.id == 19) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Name+":"+item.data.EventNamespace;
                        tmp_node.title = item.data.Name+":"+item.data.EventNamespace;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 19;
                    } else if (item.id == 20) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Name;
                        tmp_node.title = item.data.Name;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 20;
                    } else if (item.id == 21) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Consumer;
                        tmp_node.title = item.data.Consumer;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 21;
                    }

                    if (search(tmp_node.info, keyword, hash) || search(tmp_node.label, keyword, hash)) {
                        tmp_node["color"] = {
                            "background": "red",
                            "border": "red"
                        };
                        tmp_node["borderWidth"] = 3;
                    }

                    nodes.push(tmp_node);

                    var tmp_edge = {
                        "from": cur_id,
                        "to": now_id,

                        "arrows": "to",
                        "color": {
                            "color": "lightgray"
                        },
                        "length": 200
                    };
                    edges.push(tmp_edge);

                    now_id += 1;
                }

                for (var index in in_cur.child) {
                    var item = in_cur.child[index];
                    add_process_info(item);
                }
            };
            add_process_info(top);
            /*
              var nodes = [
                {
                  "id": 1,
                  "image": "../plugins/visual/images/program.png",
                  "info": "{\"path\": \"?\", \"image\": \"System\", \"guid\": \"{0079005F-0073-0074-6500-6D0000000000}\", \"pid\": \"4\", \"recode_number\": 33400}",
                  "label": "System",
                  "shape": "circularImage",
                  "title": "?",
                  "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                },

              var edges = [
                {
                  "arrows": "to",
                  "color": {
                    "color": "lightgray"
                  },
                  "from": 1,
                  "length": 200,
                  "to": 2
                },

            */
            var container = document.getElementById('mynetwork');
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
                nodes: {
                    size: 25
                },
                edges: {
                    width: 2,
                    shadow: false,
                    smooth: {
                        type: 'continuous',
                        roundness: 0
                    }
                },
                layout: {
                    hierarchical: {
                        direction: 'LR',
                        sortMethod: 'directed'
                    }
                }
            };
            // console.log( data );
            var network = new vis_network.Network(container, data, options);

            network.on("oncontext", function(properties) {
                var nodeid = network.getNodeAt(properties.pointer.DOM);

                if (nodeid) {
                    network.selectNodes([nodeid], true);
                    var node = this.body.data.nodes.get(nodeid);
                    if (node && node.info) {
                        console.log(node);
                        const veiw_data_1 = ["CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"];
                        const veiw_data_11 = ["ProcessGuid"];
                        const veiw_data_12 = ["EventType", "ProcessGuid"];
                        const veiw_data_3 = ["SourceHostname", "ProcessGuid", "SourceIsIpv6", "SourceIp", "DestinationHostname"];
                        const veiw_data_8 = ["SourceProcessGuid", "StartAddress", "TargetProcessGuid"];
                        const veiw_data_2 = ["CreationUtcTime", "PreviousCreationUtcTime"];
                        const veiw_data_7 = ["Hashes"];
                        const veiw_data_19 = ["User"];
                        const veiw_data_20 = ["User"];
                        const veiw_data_21 = ["User"];
                        var view_data = [];
                        if (node.eventid == 1) {
                            view_data = veiw_data_1;
                        } else if (node.eventid == 11) {
                            view_data = veiw_data_11;
                        } else if (node.eventid == 12) {
                            view_data = veiw_data_12;
                        } else if (node.eventid == 3) {
                            view_data = veiw_data_3;
                        } else if (node.eventid == 8) {
                            view_data = veiw_data_8;
                        } else if (node.eventid == 2) {
                            view_data = veiw_data_2;
                        } else if (node.eventid == 7) {
                            view_data = veiw_data_7;
                        } else if (node.eventid == 19) {
                            view_data = veiw_data_19;
                        } else if (node.eventid == 20) {
                            view_data = veiw_data_20;
                        } else if (node.eventid == 21) {
                            view_data = veiw_data_21;
                        }
                        var str = "";
                        var alert_str = "";
                        for (var key in node.info) {
                            if (view_data.indexOf(key) >= 0) {
                                if (str === "") {
                                    str = key + ":" + node.info[key];
                                    alert_str = new_line(key + ":" + node.info[key]);
                                } else {
                                    str = str + "\n" + key + ":" + node.info[key];
                                    alert_str = alert_str + "\n" + new_line(key + ":" + node.info[key]);
                                }
                            }
                        }
                        $("#text").val(str);
                        alert(alert_str);
                    }
                }
            });

            network.on("doubleClick", function(properties) {
                if (!properties.nodes.length) return;

                var node = this.body.data.nodes.get(properties.nodes[0]);
                if (node.guid != null && node.guid!="" && node.guid!="root") {
                    var _id = "0";
                    if(node._id != null){
                        _id = node._id;
                    }
                    var url = 'sysmon_search_visual#/process_detail/' + $route.current.params.hostname + '/' + $route.current.params.date + '/' + node.guid + '/' + _id;
                    window.open(url, "_blank");
                }
            });
        }

        this.onkeyup = function(keyword, hash) {
            if(top && top != ""){
                create_network(localdata, keyword, hash, false);
            }
        };

        function search(data, keyword, hash) {
            var flg1 = 1;
            var flg2 = 1;
            if (keyword != null && keyword !== "") {
                if (local_search(data, keyword)) {
                    flg1 = 2;
                }
            } else {
                flg1 = 3;
            }

            if (hash != null && hash !== "") {
                if (data["Hashes"] != null) {
                    if (data["Hashes"].indexOf(hash) != -1) {
                        flg2 = 2;
                    }
                }
            } else {
                flg2 = 3;
            }

            if ((flg1 == 2 && flg2 == 2) || (flg1 == 2 && flg2 == 3) || (flg1 == 3 && flg2 == 2)) {
                return true;
            } else {
                return false;
            }

        }


    })

uiModules
    .get('app/sysmon_search_visual/process_detail', [])
    .controller('process_detailController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        var url = '../api/sysmon-search-plugin/process_detail/' + $route.current.params.hostname + '/' + $route.current.params.date + '/' + $route.current.params.guid;

        var localdata;
        $http.get(url).then((response) => {
            this.hostname = $route.current.params.hostname;
            this.date = $route.current.params.date;
            this.data = response.data;
            if (response.data.length > 0 && response.data[0].process != null) {
                this.image = response.data[0].process
            }
            localdata = response.data;
        });

        this.onkeyup = function(keyword, hash) {
            var search_data = [];
            var tmp_data = [];
            if (keyword != null && keyword !== "") {
                for (var index in localdata) {
                    if (local_search(localdata[index], keyword)) {
                        tmp_data.push(localdata[index]);
                    }
                }
            } else {
                tmp_data = localdata;
            }
            if (hash != null && hash !== "") {
                for (var index in tmp_data) {
                    if (tmp_data[index]["info"] != null && tmp_data[index]["info"]["Hashes"] != null) {
                        if (tmp_data[index]["info"]["Hashes"].indexOf(hash) != -1) {
                            search_data.push(tmp_data[index]);
                        }
                    }
                }
            } else {
                search_data = tmp_data;
            }
            $scope.ctrl.data = search_data;
        };

        this.isTarget = function(id){
            if($route.current.params._id == id){
                return true;
            }else{
                return false;
            }
        }

    })

uiModules
    .get('app/sysmon_search_visual/alert', [])
    .controller('alertController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        var self = this;
        var period_list = [];
        const day_interval = 1;
        const options_num = 10;
        var now = new Date();

        self.rules = [];

        period_list.push(getOptiion(new Date(), 1, "month"));

        var startdate = getStartDate(new Date(), 1);
        period_list.push(getOptiion(startdate, 1, "day"));
        for (var i = 0; i < (options_num - 1); i++) {
            period_list.push(getOptiion(now, day_interval, "day"));
        }

        $scope.period_list = period_list;
        $scope.period = period_list[0];
        var data = {};
        data.query = getDateQuery($scope.period);
        this.event_id = '▼';
        data.sort_item = 'event_id';
        data.sort_order = 'asc';
        search(data);

        function search(data) {
            $http.post('../api/sysmon-search-plugin/alert_data', data).then((response) => {
                var tabledatas = [];
                var tabledata_r = response.data.table_data;
                var search_data = response.data.hits;
                var unique_host_data = response.data.unique_hosts;
                var top = {
                    "rulename": $scope.lang["ALERT_TABLE_ALL"],
                    "hit": response.data.total,
                    "unique_hosts": response.data.unique_hosts.length
                }
                tabledatas.push(top);
                for(var i in tabledata_r){
                    var tabledata ={};
                    tabledata.rulename = tabledata_r[i].key;
                    tabledata.hit = tabledata_r[i].doc_count;
                    tabledata.unique_hosts = tabledata_r[i].hosts.buckets.length;
                    tabledatas.push(tabledata);
                }

                var rules = [];
                for (var i = 0; i < search_data.length; i++) {
                    for (var j = 0; j < search_data[i].rule.length; j++) {
                        var flg = true;
                        if (rules.length == 0) {
                            rules.push(search_data[i].rule[j]);
                            flg = false;
                        } else {
                            for (var k = 0; k < rules.length; k++) {
                                if (search_data[i].rule[j]["file_name"] == rules[k]["file_name"]) {
                                    flg = false;
                                    break;
                                }
                            }
                        }
                        if (flg) {
                            rules.push(search_data[i].rule[j]);
                        }
                    }
                }

                $http.get('../api/sysmon-search-plugin/get_alert_rule_file_list').then((response) => {
                    var file_list = response.data;
                    var rules_arr = [];
                    var rules_list = {};
                    for (var i = 0; i < rules.length; i++) {
                        var rule_str;
                        var rule_str_f;
                        rule_str = $scope.lang["ALERT_RULE_NAME"]+"：" + rules[i].file_name;
                        var operator = "OR";
                        if (rules[i].operator) {
                            operator = rules[i].operator
                        }
                        rule_str = rule_str + " | "+$scope.lang["ALERT_RULE"]+"：" + operator;
                        rule_str_f = $scope.lang["ALERT_RULE"]+"：" + operator;
                        if (rules[i].start_time != null || rules[i].end_time != null) {
                            var start_time = "";
                            var end_time = ""
                            if (rules[i].start_time) {
                                start_time = rules[i].start_time;
                            }
                            if (rules[i].end_time) {
                                end_time = rules[i].end_time;
                            }
                            rule_str = rule_str + " | "+$scope.lang["ALERT_PERIOD"]+"：" + start_time + "～" + end_time;
                            rule_str_f = rule_str_f + " | "+$scope.lang["ALERT_PERIOD"]+"：" + start_time + "～" + end_time;
                        }
                        for (var j = 0; j < rules[i].patterns.length; j++) {
                            rule_str = rule_str + " | " + rules[i].patterns[j]["key"] + "：" + rules[i].patterns[j]["value"];
                            rule_str_f = rule_str_f + " | " + rules[i].patterns[j]["key"] + "：" + rules[i].patterns[j]["value"];
                        }
                        var rule = {};
                        rule.value = rule_str;
                        if(file_list.indexOf(rules[i].file_name) >= 0){
                            rule.filename = rules[i].file_name;
                        }
                        rules_arr.push(rule);
                        rules_list[rules[i].file_name] = rule_str_f;
                    }
                    self.table_data = tabledatas
                    self.rules = rules_arr;
                    self.rules_list = rules_list;
                    self.search_data = search_data;
                    self.unique_host_data = unique_host_data;
                });
            });
        }

        this.onChange = function() {
            var data = {};
            data.query = getDateQuery($scope.period);
            search(data);
        };

        this.getRuleInfo = function(rulename) {
            if(self.rules_list != null && rulename in self.rules_list){
                return self.rules_list[rulename];
            }else{
                return "";
            }
        };

        this.hostsort = function(key) {
            var order = "asc";
            var tmp_data = self.unique_host_data;

            if (self[key] === '▼') {
                order = "desc";
                arraySort(tmp_data, key, "desc");
                self.unique_host_data = tmp_data;
            } else {
                arraySort(tmp_data, key, "asc");
                self.unique_host_data = tmp_data;
            }
            orderMarkSetForHost(self, key, order);
        }

        this.sort = function(period, keywords, sort_item) {
            var old_sort_item = keywords.sort_item;
            keywords.sort_item = sort_item;

            if (old_sort_item !== sort_item) {
                keywords.sort_order = 'asc';
            } else {
                if (keywords.sort_order === 'asc') {
                    keywords.sort_order = 'desc';
                } else {
                    keywords.sort_order = 'asc';
                }
            }

            data.query = getDateQuery($scope.period);
            data.sort_item = keywords.sort_item;
            data.sort_order = keywords.sort_order;
            orderMarkSet(self, keywords.sort_item, keywords.sort_order);
            search(data);
        };

        this.delFile = function(filename) {
            var data = {};
            if (confirm($scope.lang["ALERT_MSG_CONFIRM_RULE_FILE"].replace("$1",filename))) {
                data.filename = filename;
                $http.post('../api/sysmon-search-plugin/delete_alert_rule_file', data).then((response) => {
                    var code = response.data;
                    if(code == 1){
                        alert($scope.lang["ALERT_MSG_SUCCEEDED_DELETE"].replace("$1",filename));
                        for(var i in self.rules){
                            if(self.rules[i].filename == filename){
                                delete self.rules[i].filename;
                                break;
                            }
                        }
                    }else{
                        alert($scope.lang["ALERT_MSG_FAILED_DELETE"].replace("$1",filename));
                    }
                });
            }

        };
    })

uiModules
    .get('app/sysmon_search_visual/search', [])

    .directive('fileModel', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('change', function() {
                    scope.ctrl.import_stixioc(element[0].files[0]);
                    $("#file-import").val("");
                });
            }
        };
    })

    .controller('searchController', function($compile, $scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        $scope.conjunctionList = [{
                "id": 1,
                "name": "AND"
            },
            {
                "id": 2,
                "name": "OR"
            }
        ];
        var form_count = 2;
        // $scope["keywords.search_conjunction"] = $scope.conjunctionList[0].id;

        var search_keyword = null;

        this.search = function(keywords) {
            if (typeof keywords !== "undefined") {
                if ("start_date" in keywords && typeof keywords.start_date !== "undefined" && keywords.start_date !== null &&
                    $("input[name='start_time']").val() !== "undefined" && $("input[name='start_time']").val() !== null && $("input[name='start_time']").val() !== "") {

//                    keywords.fm_start_date = formatDate(new Date(keywords.start_date), new Date(keywords.start_time));
                    keywords.fm_start_date = formatDate(new Date(keywords.start_date), $("input[name='start_time']").val());
                } else {
                    delete keywords["fm_start_date"];
                }
                if ("end_date" in keywords && typeof keywords.end_date !== "undefined" && keywords.end_date !== null &&
                    $("input[name='end_time']").val() !== "undefined" && $("input[name='end_time']").val() !== null && $("input[name='end_time']").val() !== "") {

//                    keywords.fm_end_date = formatDate(new Date(keywords.end_date), new Date(keywords.end_time));
                    keywords.fm_end_date = formatDate(new Date(keywords.end_date), $("input[name='end_time']").val());
                } else {
                    delete keywords["fm_end_date"];
                }
            } else {
                keywords = {};
            }

            keywords.sort_item = 'event_id';
            keywords.sort_order = 'asc';

            var tmp = {};
            for(var key in keywords){
                tmp[key] = keywords[key];
            }
            search_keyword = tmp;

            $http.post('../api/sysmon-search-plugin/sm_search', keywords).then((response) => {
                this.search_data = response.data.hits;
                this.total = response.data.total;
                orderMarkSet(this, keywords.sort_item, keywords.sort_order);

                $http.post('../api/sysmon-search-plugin/sm_unique_hosts', keywords).then((response) => {
                    this.unique_host_count = response.data.length;
                    console.log(response.data);
                });
            });
        };

        this.import = function() {
            $("#file-import").click();
        };

        this.import_stixioc = function(file) {
            const msg_confirm_import = $scope.lang["SEARCH_MSG_CONFIRM_IMPORT"];
            const msg_invalid_file = $scope.lang["SEARCH_MSG_INVALID_FILE"];
            const msg_no_search_criteria = $scope.lang["SEARCH_MSG_NO_SEARCH_CRITERIA"];
            const msg_failed_import_process = $scope.lang["SEARCH_MSG_FAILED_IMPORT"];

            function set_search_criteria(fields) {
                $("#search_item_area > div[id^='search_group_']").each(function() {
                    var id = $(this).attr("id").substring(13);

                    if (id != 1) {
                        $("#search_item_area > div#search_group_" + id).remove();
                    }
                    delete $scope.keywords["search_item_" + id];
                    delete $scope.keywords["search_value_" + id];
                });

                const sel_option_map = {
                    'IpAddress': '1', 
                    'Port': '2', 
                    'HostName': '3', 
                    'ProcessName': '4', 
                    'FileName': '5', 
                    'RegistryKey': '6', 
                    'RegistryValue': '7', 
                    'Hash': '8', 
                };

                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    var sel_val = sel_option_map[field.key];

                    var new_index = 1;
                    if (i != 0) {
                        new_index = form_count;
                        if (i == 1) {
                            var add_id = 1;
                        } else {
                            var add_id = new_index - 1;
                        }
                        add_search_criteria(add_id, new_index);
                        form_count++;
                    }

                    $scope.keywords["search_item_" + new_index] = sel_val;
                    $scope.keywords["search_value_" + new_index] = field.value;
                }
            }

            function call_analyze_server(url, file, contenttype) {
                if (confirm(msg_confirm_import)) {
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = function(err) {
                        var contents = "";
                        var views = new Uint8Array(reader.result);
                        var length = reader.result.byteLength;
                        for (var i = 0; i < length; i++) {
                            contents += String.fromCharCode(views[i]);
                        }

                        var params = {
                            contents: unescape(encodeURIComponent(contents)),
                            filename: file.name,
                            contenttype: contenttype,
                            part_url: url
                        };
                        //console.log("params:", params);

                        $http.post("../api/sysmon-search-plugin/import_search_keywords", params)
                            .then(function successCallback(response) {
                                const util = require('util');
//                                console.log(util.inspect(response));
                                function is_value_exist(dict, key) {
                                    return (key in dict && dict.key !== "undefined" && dict.key !== null);
                                };

                                var res = response.data;
                                if (is_value_exist(res, "data")) {
                                    var json_data = JSON.parse(res.data);
                                    if (res.status !== 200) {
                                        console.log(util.inspect(json_data));
                                        alert(msg_failed_import_process);
                                    } else if (is_value_exist(json_data, "fields") &&
                                        Array.isArray(json_data.fields) && json_data.fields.length > 0) {
                                        set_search_criteria(json_data.fields);
                                    } else {
                                        alert(msg_no_search_criteria);
                                    }
                                }
                            }, function errorCallback(response) {
                                const util = require('util');
                                console.log(util.inspect(response));
                                alert(msg_failed_import_process);
                            });
                    }
/*
                    var dummy_results = [
                        { "key": "IpAddress", "value": "10.0.0.1" },
                        { "key": "IpAddress", "value": "10.0.0.2" },
                        { "key": "IpAddress", "value": "10.0.0.3" },
                        { "key": "Hash", "value": "0123456789abcdef0123456789abcdef" },
                        { "key": "Hash", "value": "00112233445566778899aabbccddeeff" },
                        { "key": "HostName", "value": "foo.acme.com" },
                        { "key": "Port", "value": "80" },
                        { "key": "ProcessName", "value": "explorer.exe" },
                        { "key": "FileName", "value": "win.ini" },
                        { "key": "RegistryKey", "value": "HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services\MRxCls\ImagePath" },
                        { "key": "RegistryValue", "value": "mrxnet.sys" }
                    ];
                    set_search_criteria(dummy_results);
 */
                }
            }

            if (file === undefined) {
                return;
            }

            //
            var path = require('path');
            var suffix = path.extname(file.name);
            if (suffix === ".xml") {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function(event) {
                    try {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(event.target.result, "application/xml");
                        //console.log(doc);

                        if (doc.getElementsByTagName("parsererror").length > 0) {
                            console.log(doc.getElementsByTagName("parsererror")[0]);
                            alert(msg_invalid_file);
                            return;
                        }
                        var rootTagName = doc.firstChild.localName;
                        var url = "";
                        if (rootTagName === "STIX_Package") {
                            // STIXv1
                            url = "/convert/stix/v1";
                            call_analyze_server(url, file, "application/xml");
                        } else if (rootTagName === "ioc") {
                            // IoC
                            url = "/convert/ioc";
                            call_analyze_server(url, file, "application/xml");
                        } else {
                            alert(msg_invalid_file);
                            return;
                        }
                    } catch (e) {
                        console.log(e);
                        alert(msg_invalid_file);
                        return;
                    }
                };
            } else if (suffix === ".json") {
                // STIXv2
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function(event) {
                    try {
                        JSON.parse(event.target.result);

                        var url = "/convert/stix/v2";
                        call_analyze_server(url, file, "application/json");
                    } catch (e) {
                        console.log(e);
                        alert(msg_invalid_file);
                        return;
                    }
                }
            } else {
                alert(msg_invalid_file);
                return;
            }

        };

        this.save_rules = function (keywords) {
            const msg_confirm_save = $scope.lang["SEARCH_MSG_CONFIRM_SAVE_RULES"];
            const msg_no_rule = $scope.lang["SEARCH_MSG_NO_RULE"];
            const msg_succeeded_to_save = $scope.lang["SEARCH_MSG_SUCCEEDED_SAVE"];
            const msg_failed_to_save = $scope.lang["SEARCH_MSG_FAILED_SAVE"];

            var rules = {};
            if (typeof keywords !== "undefined") {
/*
                if (is_key_exist("start_date") && is_key_exist("start_time")) {
                    rules.start_time = formatDate(new Date(keywords.start_date), new Date(keywords.start_time));
                }
                if (is_key_exist("end_date") && is_key_exist("end_time")) {
                    rules.end_time = formatDate(new Date(keywords.end_date), new Date(keywords.end_time));
                }
*/
                rules.operator = '';
                if (is_key_exist("search_conjunction") && (keywords.search_conjunction === 1 || keywords.search_conjunction === 2)) {
                    rules.operator = (keywords.search_conjunction === 1) ? 'AND' : 'OR';
                }
                rules.patterns = [];

                const search_key_prefix = "search_item_";
                const search_val_prefix = "search_value_";

                function is_key_exist(key) {
                    return (key in keywords && keywords[key] !== "undefined" && keywords[key] !== null);
                };

                function get_search_key_name(num) {
                    const sel_option_array = [
                        '',
                        'IpAddress', 
                        'Port', 
                        'HostName', 
                        'ProcessName', 
                        'FileName', 
                        'RegistryKey', 
                        'RegistryValue', 
                        'Hash' 
                    ];
                    var num_obj = Number(num);
                    if (num_obj === Number.NaN || num_obj <= 0 || num_obj >= sel_option_array.length) return '';
                    return sel_option_array[num_obj];
                };

                for (var keyname in keywords) {
                    if (keyname.substr(0, search_key_prefix.length) == search_key_prefix && is_key_exist(keyname)) {
                        var num = keyname.substr(search_key_prefix.length);
                        var valname = search_val_prefix+num;
                        if (is_key_exist(valname)) {
                            var rule = {
                                key:   get_search_key_name(keywords[keyname]),
                                value: keywords[valname]
                            };
                            rules.patterns.push(rule);
                        }
                    }
                }

            } else {
                alert(msg_no_rule);
                return ;
            }

            if (confirm(msg_confirm_save)) {
                $http.post( '../api/sysmon-search-plugin/save_alert_rules', rules )
                    .then(function successCallback(response) {
                        const util = require('util');
                        console.log(util.inspect(response.data));
                        alert(msg_succeeded_to_save);
                    },
                    function errorCallback(response) {
                        const util = require('util');
                        console.log(util.inspect(response.data));
                        alert(msg_failed_to_save);
                    });
            }
        };
        this.sort = function(sort_item) {
            if(search_keyword){
                var keywords = search_keyword;

                var old_sort_item = keywords.sort_item;
                keywords.sort_item = sort_item;

                if (old_sort_item !== sort_item) {
                    keywords.sort_order = 'asc';
                } else {
                    if (keywords.sort_order === 'asc') {
                        keywords.sort_order = 'desc';
                    } else {
                        keywords.sort_order = 'asc';
                    }
                }

                $http.post('../api/sysmon-search-plugin/sm_search', keywords).then((response) => {
                    this.search_data = response.data.hits;
                    this.total = response.data.total;
                    orderMarkSet(this, keywords.sort_item, keywords.sort_order);
                });
            }

        };

        this.st_dt_chg = function(keywords) {
            if ("start_time" in keywords == false || typeof keywords.start_time === "undefined") {
//                keywords.start_time = new Date("1970-01-01 00:00:00");
                $("input[name='start_time']").val("00:00");
            }
        };

        this.ed_dt_chg = function(keywords) {
            if ("end_time" in keywords == false || typeof keywords.end_time === "undefined") {
//                keywords.end_time = new Date("1970-01-01 23:59:00");
                $("input[name='end_time']").val("23:59");
            }
        };

        function add_search_criteria(add_id, new_index) {
            $("#search_item_area > div#search_group_" + add_id).after('' +
                '                <div class="conditions_w373 clearfix" id="search_group_' + new_index + '">\n' +
                '                <form class="flt_l" style="margin-right: 5px;">\n' +
                '                  <select name="search_item_' + new_index + '" ng-model="keywords.search_item_' + new_index + '">\n' +
                '                    <option value=""></option>\n' +
                '                    <option value="1">'+$scope.lang["SEARCH_PULLDOWN_IPADDRESS"]+'</option>\n' +
                '                    <option value="2">'+$scope.lang["SEARCH_PULLDOWN_PORT"]+'</option>\n' +
                '                    <option value="3">'+$scope.lang["SEARCH_PULLDOWN_HOST"]+'</option>\n' +
                '                    <option value="4">'+$scope.lang["SEARCH_PULLDOWN_PROCESS"]+'</option>\n' +
                '                    <option value="5">'+$scope.lang["SEARCH_PULLDOWN_FILE"]+'</option>\n' +
                '                    <option value="6">'+$scope.lang["SEARCH_PULLDOWN_KEY"]+'</option>\n' +
                '                    <option value="7">'+$scope.lang["SEARCH_PULLDOWN_VALUE"]+'</option>\n' +
                '                    <option value="8">'+$scope.lang["SEARCH_PULLDOWN_HASH"]+'</option>\n' +
                '                  </select>\n' +
                '                </form>\n' +
                '                <input name="search_value_' + new_index + '" type="text" class="flt_l" style="margin-right: 5px;" ng-model="keywords.search_value_' + new_index + '">\n' +
                '                <span class="flt_r">\n' +
                '                  <a href="" class="addButton" id="add_button_' + new_index + '" ng-click="ctrl.add_field(' + new_index + ')">'+$scope.lang["SEARCH_CRITERIA_ADD_BUTTON"]+'</a>\n' +
                '                  <a href="" class="addButton delButton" id="del_button_' + new_index + '" ng-click="ctrl.del_field(' + new_index + ', keywords)">'+$scope.lang["SEARCH_CRITERIA_DEL_BUTTON"]+'</a>\n' +
                '                </span>\n' +
                '                </div>\n');

            $compile($("#search_item_area > div#search_group_" + new_index).contents())($scope);
        };

        this.add_field = function(add_id){
            var new_index = form_count;
            add_search_criteria(add_id, new_index);
            form_count++;
        }

        this.del_field = function(del_id, keywords) {
            $("#search_item_area > div#search_group_" + del_id).remove();
            delete $scope.keywords["search_item_" + del_id];
            delete $scope.keywords["search_value_" + del_id];
        }
    })

uiModules
    .get('app/sysmon_search_visual/dashboard', [])
    .controller('dashboardController', function($scope, $route, $http, $interval) {
        // Set Language Data
        $scope.lang = gLangData;

        var url = ''

        var self = this;
        var period_list = [];
        var keywords = {};
        const day_interval = 1;
        const options_num = 10;
        var now = new Date();

        period_list.push(getOptiion(new Date(), 1, "month"));

        var startdate = getStartDate(new Date(), 1);
        period_list.push(getOptiion(startdate, 1, "day"));
        for (var i = 0; i < (options_num - 1); i++) {
            period_list.push(getOptiion(now, day_interval, "day"));
        }

        $scope.period_list = period_list;
        $scope.period = period_list[0];
        var data = {};
        data.query = getDateQuery($scope.period);
        make_chart(data);

        function make_chart(data) {
            $http.post("../api/sysmon-search-plugin/dashboard", data).then((response) => {
                var visdata = {};
                var histkey = ["by_DestinationIp_asc","by_DestinationIp_desc","by_image_asc","by_image_desc"];
                const LAVEL_KEY = "key";
                const VALUE_KEY = "doc_count";
                const COUNT = 10;
                for (var key in response.data) {
                    if (histkey.indexOf(key) >= 0) {
                        visdata[key] = response.data[key];
                    } else {
                        var piedatas = {}
                        for (var piedatakey in response.data[key]) {
                            if(response.data[key][piedatakey][LAVEL_KEY]!=""){
                                piedatas[response.data[key][piedatakey][LAVEL_KEY]] = response.data[key][piedatakey][VALUE_KEY];
                            }
                        }
                        visdata[key] = piedatas;
                    }
                }

                self.total = response.data["total"];

                make_histset("#bar1",visdata["by_DestinationIp_desc"],visdata["by_DestinationIp_asc"],COUNT,LAVEL_KEY,VALUE_KEY,false,$scope.lang);
                make_histset("#bar2",visdata["by_image_desc"],visdata["by_image_asc"],COUNT,LAVEL_KEY,VALUE_KEY,true,$scope.lang);
                pie_chart('#pie1', visdata["by_DestinationPort"], true, 220);
                pie_chart('#pie2', visdata["by_eventtype"], true, 220);
            });
        }

        this.onChange = function() {
            var data = {};
            data.query = getDateQuery($scope.period);
            make_chart(data);
        };



    })

function crear_graph(id) {
    d3.select(id).selectAll("svg").remove();
    d3.select(id).selectAll("table").remove();
}

function make_histset(id, desc_data_p, asc_data_p, count, labelkey, valuekey, process_flg, lang) {
    crear_graph(id);
    var desc_data = getViewData(desc_data_p,count,labelkey,valuekey);
    var asc_data = getViewData(asc_data_p,count,labelkey,valuekey);
    var max_desc = d3.max(desc_data, function(d) {
        return d[1];
    })
    var max_asc = d3.max(asc_data, function(d) {
        return d[1];
    })
    histoGram(id, desc_data, max_desc, lang["STATISTICS_DESCEND"].replace("$1",count), process_flg);
    histoGram(id, asc_data, max_asc, lang["STATISTICS_ASCEND"].replace("$1",count), process_flg);
}

function pie_chart(id, fData, legFlg, r) {
    function segColor(c) {
        var color = ["#87CEFA", "#FFDEAD", "#7B68EE", "#8FBC8F", "#FF3366", "#33FFFF","#666699","#00FA9A","#FF00FF"];
        var pointer = c % 9;
        return color[pointer];
    }

    function pieChart(pD) {
        var pC = {},
            pieDim = {
                w: r,
                h: r
            };
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        var pie = d3.layout.pie().sort(null).value(function(d) {
            return d.freq;
        });

        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) {
                this._current = d;
            })
            .style("fill", function(d, i) {
                return segColor(i);
            })

        return pC;
    }

    function legend(lD) {
        var leg = {};

        var legend = d3.select(id).append("table").attr('class', 'legend');

        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
            .attr("fill", function(d, i) {
                return segColor(i);
            });

        tr.append("td").text(function(d) {
            return d.type;
        });

        tr.append("td").attr("class", 'legendFreq')
            .text(function(d) {
                return d3.format(",")(d.freq);
            });

        tr.append("td").attr("class", 'legendPerc')
            .text(function(d) {
                return getLegend(d, lD);
            });

        function getLegend(d, aD) {
            return d3.format("%")(d.freq / d3.sum(aD.map(function(v) {
                return v.freq;
            })));
        }

        return leg;
    }

    var keys = [];
    var keys = Object.keys(fData);

    var tF = keys.map(function(d) {
        return {
            type: d,
            freq: fData[d]
        };
    });

    crear_graph(id);

    var pC = pieChart(tF);
    if (legFlg) {
        var leg = legend(tF);
    }
}

function histoGram(id, fD, max, title, process_flg) {
    if (max < 10) {
        max = 10;
    }
    var hG = {},
        hGDim = {
            t: 20,
            r: 150,
            b: 20,
            l: 0
        };
    hGDim.w = 320 - hGDim.l - hGDim.r,
        hGDim.h = 220 - hGDim.t - hGDim.b;

    var hGsvg = d3.select(id).append("svg")
        .attr("width", hGDim.w + hGDim.l + hGDim.r + 20)
        .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
        .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

    var x = d3.scale.linear().range([0, hGDim.w])
        .domain([0, max]);

    hGsvg.append("g").attr("class", "x axis")
        .attr("transform", "translate(" + hGDim.r + "," + hGDim.h + ")")
        .call(d3.svg.axis().scale(x).orient("bottom").ticks(4));

    var y = d3.scale.ordinal().rangeRoundBands([0, hGDim.h], 0.1)
        .domain(fD.map(function(d) {
            return d[0];
        }));

    var bars = hGsvg.selectAll(".bar").data(fD).enter()
        .append("g").attr("class", "bar");

    bars.append("rect")
        .attr("x", function(d) {
            return hGDim.r;
        })
        .attr("y", function(d) {
            return y(d[0]);
        })
        .attr("height", y.rangeBand())
        .attr("width", function(d) {
            return x(d[1]);
        })
        .attr('fill', 'steelblue')

    bars.append("text").text(function(d) {
            if (process_flg) {
                var label = String(d[0]).split('\\').pop()
                if (label.length > 15) {
                    return label.substr(0, 15) + "…";
                } else {
                    return label;
                }
            } else {
                return d[0];
            }
        })
        .attr("y", function(d) {
            return y(d[0]) + y.rangeBand() / 2;
        })
        .attr("x", function(d) {
            return 10;
        })
        .attr("text-anchor", "left");

    bars.append("text").text(title)
        .attr("y", function(d) {
            return 0;
        })
        .attr("x", function(d) {
            return 10;
        })
        .attr("text-anchor", "left");


    return hG;
}

function arraySort(data, key, order) {
    data.sort(function(a, b) {
        var a1 = a[key];
        var b1 = b[key];
        if (a1 < b1) {
            if (order == "asc") {
                return -1;
            } else {
                return 1;
            }
        } else if (a1 > b1) {
            if (order == "asc") {
                return 1;
            } else {
                return -1;
            }
        }
        return 0;
    });
}

function getViewData(data, count, labelkey, valuekey) {
    var sdata = [];

    for (var i = 0; i < count; i++) {
        if (data[i] != null) {
            if(data[i][labelkey]==""){
                count++;
            }else{
                sdata.push(data[i]);
            }
        } else {
            var dummyname = "";
            for (var j = 0; j < i; j++) {
                dummyname = dummyname + " ";
            }
            var dummy = {};
            dummy[labelkey] = dummyname;
            dummy[valuekey] = 0;
            sdata.push(dummy);
        }
    }
    return sdata.map(function(d) {
        return [d[labelkey], d[valuekey]];
    });
}

function local_search(data, keyword) {

    for (var key in data) {
        if (Array.isArray(data[key])) {
            if (local_search(data[key], keyword)) {
                return true;
            }
        } else if (data[key] instanceof Object) {
            if (local_search(data[key], keyword)) {
                return true;
            }
        } else {
            if (String(data[key]).indexOf(keyword) != -1) {
                return true;
            }
        }
    }
    return false;
}

function formatDate(date, time) {
    var d = ("0" + date.getDate()).slice(-2);
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
//    var h = ("0" + time.getHours()).slice(-2);
//    var min = ("0" + time.getMinutes()).slice(-2);
//    return y + '-' + m + '-' + d + 'T' + h + ':' + min + ':00Z';
    return y + '-' + m + '-' + d + 'T' + time + ':00Z';
}

function formatDate2(date) {
    var d = ("0" + date.getDate()).slice(-2);
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
    return y + '-' + m + '-' + d + 'T00:00:00Z';
}

function get_range_datetime(date) {
    var date_str = date.substr(0, 10)+"T"+date.substr(11, 12)+"Z";
    var base_date = new Date(date_str);
    var start_date = new Date(base_date.getTime());
    var end_date = new Date(base_date.getTime());
    start_date.setHours(start_date.getHours() - Number(config.refine_time_range));
    end_date.setHours(end_date.getHours() + Number(config.refine_time_range));
    var start_date_str = date_to_text(start_date);
    var end_date_str = date_to_text(end_date);

    return {"start_date": start_date_str, "end_date": end_date_str};
}

function date_to_text(date) {
    var y = padding(date.getUTCFullYear(), 4, "0"),
        m = padding(date.getUTCMonth()+1, 2, "0"),
        d = padding(date.getUTCDate(), 2, "0"),
        h = padding(date.getUTCHours(), 2, "0"),
        min = padding(date.getUTCMinutes(), 2, "0"),
        s = padding(date.getUTCSeconds(), 2, "0"),
        millsec = padding(date.getUTCMilliseconds(), 3, "0");

    return [y, m, d].join('-') + 'T' + [h, min, s].join(':') + 'Z';
}

function padding(n, d, p) {
    p = p || '0';
    return (p.repeat(d) + n).slice(-d);
}

function orderMarkSet(page, item, order) {
    page.utc_time = "";
    page.event_id = "";
    page.level = "";
    page.event_record_id = "";
    page.computer_name = "";
    page.user_name = "";
    page.image = "";
    page.rulename = "";

    var order_mark = "";
    if (order === 'asc') {
        order_mark = "▼";
    } else if (order === 'desc') {
        order_mark = "▲";
    }

    if (item === 'event_data.UtcTime.keyword') {
        page.utc_time = order_mark;
    } else if (item === 'event_id') {
        page.event_id = order_mark;
    } else if (item === 'level.keyword') {
        page.level = order_mark;
    } else if (item === 'event_record_id.keyword') {
        page.event_record_id = order_mark;
    } else if (item === 'computer_name.keyword') {
        page.computer_name = order_mark;
    } else if (item === 'event_data.User.keyword') {
        page.user_name = order_mark;
    } else if (item === 'event_data.Image.keyword') {
        page.image = order_mark;
    } else if (item === 'rule.file_name.keyword') {
        page.rulename = order_mark;
    }
}

function orderMarkSetForHost(page, item, order) {
    page.key = "";
    page.doc_count = "";

    var order_mark = "";
    if (order == "asc") {
        order_mark = "▼";
    } else if (order === "desc") {
        order_mark = "▲";
    }

    if (item === 'key') {
        page.key = order_mark;
    } else if (item === 'doc_count') {
        page.doc_count = order_mark;
    }
}

function getOptiion(lt_date, interval, type) {
    var str_lt = getViewFormat(lt_date, 1);
    var gte_date = getPastDate(lt_date, interval, type)
    var str_gte = getViewFormat(gte_date, 1);
    return str_gte + "～" + str_lt;
}

function padding(n, d, p) {
    p = p || '0';
    return (p.repeat(d) + n).slice(-d);
};

function getViewFormat(date, type) {
    if (type == 1) {
        return padding(date.getFullYear(), 4, "0") + "/" + padding(date.getMonth() + 1, 2, "0") + "/" + padding(date.getDate(), 2, "0") + "/00:00:00";
    } else {
        return padding(date.getFullYear(), 4, "0") + "-" + padding(date.getMonth() + 1, 2, "0") + "-" + padding(date.getDate(), 2, "0");
    }

}

function getStartDate(now, interval) {
    now.setDate(now.getDate() + interval);
    return now;
}

function getPastDate(date, interval, type) {
    if (type == "month") {
        var month = date.getMonth();
        date.setMonth(date.getMonth() - interval);
        var diff = month-date.getMonth();
        if(diff<0){
            diff = diff + 12;
        }
        if(diff!=interval){
            date.setDate(1);
            date.setDate(date.getDate() - 1);
        }
    } else {
        date.setDate(date.getDate() - interval);
    }
    return date;
}

function getFutureDate(date, interval, type) {
    if (type == "month") {
        var month = date.getMonth();
        date.setMonth(date.getMonth() + interval);
        var diff = date.getMonth()-month;
        if(diff<0){
            diff = diff + 12;
        }
        if(diff!=interval){
            date.setDate(1);
            date.setDate(date.getDate() - 1);
        }
    } else {
        date.setDate(date.getDate() + interval);
    }
    return date;
}

function getDateQuery(str) {
    var query = {};
    if (str.length >= 38) {
        query["gte"] = str.substring(0, 4) + "-" + str.substring(5, 7) + "-" + str.substring(8, 10) + "T00:00:00.000Z";
        query["lt"] = str.substring(20, 24) + "-" + str.substring(25, 27) + "-" + str.substring(28, 30) + "T00:00:00.000Z";
    }
    return query;
}

function getDateQueryFromDate(date1, date2) {
    var query = {};
    query["gte"] = padding(date1.getFullYear(), 4, "0") + "-" + padding(date1.getMonth() + 1, 2, "0") + "-" + padding(date1.getDate(), 2, "0") + "T00:00:00.000Z";
    query["lt"] = padding(date2.getFullYear(), 4, "0") + "-" + padding(date2.getMonth() + 1, 2, "0") + "-" + padding(date2.getDate(), 2, "0") + "T00:00:00.000Z";
    return query;
}

function getDateBeggining(date) {
    date.setDate(1);
    return date;
}

function insertStr(str, index, insert) {
    return str.slice(0, index) + insert + str.slice(index, str.length);
}

function new_line(str){
    const len = 44;
    var num = str.length / len | 0;
    if(str.length % len == 0){
        num = num-1;
    }

    for(var i=num;i>0;i--){
        str = insertStr(str,len*i,"\n");
    }

    return str;
}


// -------------------------------------------------------
