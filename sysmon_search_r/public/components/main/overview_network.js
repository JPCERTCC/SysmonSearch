import React, { Component } from "react";
import Graph from "./react-graph-vis";
import imgProgram from "./images/program.png";
import imgNet from "./images/net.png";
import imgFile from "./images/file.png";
import imgCreateTime from "./images/file_create_time.png";
import imgLoaded from "./images/image_loaded.png";
import imgReg from "./images/reg.png";
import imgRegCategory from "./images/reg_category.png";
import imgThread from "./images/rthread.png";
import imgWmi from "./images/wmi.png";
import { splitByLength, search } from "./ss_utils";

import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

const defaultColor = {
  "background": "#97c2fc",
  "border": "#2b7ce9"
};

const edgeColor = {"color":"gray"};

function add_child_info(cur, graph, keyword, hash) {
  for (let index in cur.child) {
    var item = cur.child[index];
    var tmp_str_array = splitByLength(item.current.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_node = {
      "id": item.current.index,
      "label": tmp_label,
      "title": item.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
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
    }else{
       tmp_node["color"] = defaultColor;
       tmp_node["borderWidth"] = 1;
    }
    // push if node is not in array
    if(graph["nodes"].some(e => e.id === tmp_node["id"])) console.log(e.id);
    else graph["nodes"].push(tmp_node);

    var tmp_edge = {
      "from": cur.current.index,
      "to": item.current.index,
      "arrows": "to",
      "color": edgeColor,
      "length": 200
    };
    graph["edges"].push(tmp_edge);
    graph = add_child_info(item, graph, keyword, hash);
  }
  return graph;
}

function add_process_info(in_cur, graph, keyword, hash) {
  console.log(in_cur)
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
      "image": imgProgram,
      "guid": item.data.ProcessGuid,
      "eventid": 1,
      "_id": item._id,
      "message": null
    };

    tmp_node.id = now_id;
    if (item.id == 1) {
      tmp_node.image = imgProgram;
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
      tmp_node.image = imgFile;
      tmp_node.label = item.data.TargetFilename;
      tmp_node.title = item.data.TargetFilename;
      tmp_node.info = {
        'ProcessGuid': item.data.ProcessGuid,
        'TargetFilename': item.data.TargetFilename,
        'Image': item.data.Image
      };
      tmp_node.eventid = 11;
    } else if ((item.id == 12) || (item.id == 13)) {
      tmp_node.image = imgReg;
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
      tmp_node.image = imgNet;
      if (item.type === 'alert') {
        // Set Alert Image
        tmp_node.image = imgNet;
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
      tmp_node.image = imgThread;
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
      tmp_node.image = imgCreateTime;
      tmp_node.label = item.data.Image;
      tmp_node.title = item.data.Image;
      tmp_node.info = {
        'Image': item.data.Image,
        'CreationUtcTime': item.data.CreationUtcTime,
        'PreviousCreationUtcTime': item.data.PreviousCreationUtcTime
      };
      tmp_node.eventid = 2;
    } else if (item.id == 7) {
      tmp_node.image = imgLoaded;
      tmp_node.label = item.data.Image;
      tmp_node.title = item.data.Image;
      tmp_node.info = {
        'Image': item.data.Image,
        'ImageLoaded': item.data.ImageLoaded,
        'Hashes': item.data.Hashes
      };
      tmp_node.eventid = 7;
    } else if (item.id == 19) {
      tmp_node.image = imgWmi;
      tmp_node.label = item.data.Name+":"+item.data.EventNamespace;
      tmp_node.title = item.data.Name+":"+item.data.EventNamespace;
      tmp_node.info = {
        'User': item.data.User
      };
      tmp_node.eventid = 19;
    } else if (item.id == 20) {
      tmp_node.image = imgWmi;
      tmp_node.label = item.data.Name;
      tmp_node.title = item.data.Name;
      tmp_node.info = {
        'User': item.data.User
      };
      tmp_node.eventid = 20;
    } else if (item.id == 21) {
      tmp_node.image = imgWmi
      tmp_node.label = item.data.Consumer;
      tmp_node.title = item.data.Consumer;
      tmp_node.info = {
        'User': item.data.User
      };
      tmp_node.eventid = 21;
    } else if (item.id == 22) {
      tmp_node.image = imgNet;
      tmp_node.label = item.data.QueryName;
      tmp_node.title = item.data.QueryName;
      tmp_node.info = {
        "QueryStatus": item.data.QueryStatus,
        "QueryResults": item.data.QueryResults,
        "Image": item.data.Image,
        "ProcessGuid": item.data.ProcessGuid,
        "QueryName": item.data.QueryName,   
      };
      tmp_node.message = item.message;
      tmp_node.eventid = 22;
    }

    if (search(tmp_node.info, keyword, hash) || search(tmp_node.label, keyword, hash)) {
      tmp_node["color"] = {
        "background": "red",
        "border": "red"
      };
      tmp_node["borderWidth"] = 3;
    }else{
       tmp_node["color"] = defaultColor;
       tmp_node["borderWidth"] = 1;
    }
    if(graph["nodes"].some(e => e.id === tmp_node["id"])) console.log(e.id);
    else graph["nodes"].push(tmp_node);

    var tmp_edge = {
      "from": cur_id,
      "to": now_id,
      "arrows": "to",
      "color": edgeColor,
      "length": 200,
      "title": String(tmp_node.eventid)
    };
    graph["edges"].push(tmp_edge);

    now_id += 1;
  }

  for (let index in in_cur.child) {
    var item = in_cur.child[index];
    graph = add_process_info(item, graph, keyword, hash);
  }
  return graph;
};

function createNetwork(top, keyword, hash, firstflg) {
  console.log(top);
  var graph = {nodes:[], edges:[]};

  if(top.parent != null){
    var tmp_str_array = splitByLength(top.parent.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_parent_node = {
      "id": top.parent.index,
      "label": tmp_label,
      "title": top.parent.cmd,
      "shape": "circularImage",
      "image": imgProgram,
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
    }else{
       tmp_parent_node["color"] = defaultColor;
       tmp_parent_node["borderWidth"] = 1;
    }

    if(graph["nodes"].some(e => e.id === tmp_node["id"])) console.log(e.id);
    else graph["nodes"].push(tmp_parent_node);

    var tmp_edge = {
      "from": top.parent.index,
      "to": top.current.index,
      "arrows": "to",
      "color": edgeColor,
      "length": 200
    };
    graph["edges"].push(tmp_edge);
  }
  
  if(top.current != null){
    var tmp_str_array = splitByLength(top.current.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_node = {
      "id": top.current.index,
      "label": tmp_label,
      "title": top.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
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
    }else{
      tmp_node["color"] = defaultColor;
      tmp_node["borderWidth"] = 1;
    }
    if(graph["nodes"].some(e => e.id === tmp_node["id"])) console.log(e.id);
    else graph["nodes"].push(tmp_node);

    graph = add_child_info(top, graph, keyword, hash);
    graph = add_process_info(top, graph, keyword, hash);
  }

  return graph;

}

export class GraphOverView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      graph:{},
      options:{},
      events:null,
      network:null, 
      textarea:"",
      keyword:null, 
      hash:null, 
    }
    this.setNetwork = this.setNetwork.bind(this);
    this.setText = this.setText.bind(this);
  }

  setText(str){
    this.setState({textarea: str});
  }

  setNetwork(nw){
    const network = nw;
    const settxt = this.setText;
    const host = this.props.host;
    const date = this.props.date;

    /*
    network.once(
      "afterDrawing",
      function(){
        network.fit();
        setTimeout(function () {
          network.fit();
        }, 1000);
      }
    )
    */

    var events = {
      oncontext: function (ctx) {
        network.fit();
        ctx.event.preventDefault();
      },
      doubleClick: function(properties) {
        if (!properties.nodes.length) return;
        var node = network.body.data.nodes.get(properties.nodes[0]);
        console.log(node);
        if(node.guid != null && node.guid!="" && node.guid!="root"){
          var _id = "0";
          if(node._id != null) _id = node._id;
          var url = 'process_detail?host=' + host;
          url += '&date=' + date.substr(0, 10);
          url += '&guid=' + node.guid;
          url += "&_id=" + _id;
          //console.log(url);
          window.open(url, "_blank");
        }
      },
      click: function(properties) {
        if (!properties.nodes.length) return;
        var nodeid = network.getNodeAt(properties.pointer.DOM);
        if (nodeid) {
          network.selectNodes([nodeid], true);
          var node = network.body.data.nodes.get(nodeid);
          if (node && node.info) {
            const view_data_1 = [
              "CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"
            ];
            const view_data_11 = ["ProcessGuid"];
            const view_data_12 = ["EventType", "ProcessGuid"];
            const view_data_3 = [
              "SourceHostname", "ProcessGuid", "SourceIsIpv6", "SourceIp", "DestinationHostname"
            ];
            const view_data_8 = ["SourceProcessGuid", "StartAddress", "TargetProcessGuid"];
            const view_data_2 = ["CreationUtcTime", "PreviousCreationUtcTime"];
            const view_data_7 = ["Hashes"];
            const view_data_19 = ["User"];
            const view_data_20 = ["User"];
            const view_data_21 = ["User"];
            const view_data_22 = ["QueryStatus", "QueryResults", "QueryName"];
            var view_data = [];
            if (node.eventid == 1) view_data = view_data_1;
            else if (node.eventid == 11) view_data = view_data_11;
            else if (node.eventid == 12) view_data = view_data_12;
            else if (node.eventid == 3) view_data = view_data_3;
            else if (node.eventid == 8) view_data = view_data_8;
            else if (node.eventid == 2) view_data = view_data_2;
            else if (node.eventid == 7) view_data = view_data_7;
            else if (node.eventid == 19) view_data = view_data_19;
            else if (node.eventid == 20) view_data = view_data_20;
            else if (node.eventid == 21) view_data = view_data_21;
            else if (node.eventid == 22) view_data = view_data_22;
            var str = "Sysmon Event ID: "+ String(node.eventid);
            for (var key in node.info) {
              if (view_data.indexOf(key) >= 0) {
                if (str === "") str = key + ":" + node.info[key];
                else str = str + "\n" + key + ":" + node.info[key];
              }
            }
            if(node.message) str += "\n" + node.message;
            settxt(str);
          }
        }
      }
    }

    this.setState({network:nw, events:events})

  }

  render(){
    const graph = createNetwork(
      this.props.tops,
      this.props.keyword,
      this.props.hash,
      true,
    );
    //console.log(graph)

    let placeholder = "No Graph.";
    if(graph.edges.length>0&&graph.nodes.length>0){
       placeholder = "Click Node -> Show Information";
       placeholder += "\nDouble Click Node -> Open Process Details List";
       placeholder += "\nRight Click -> Zoom Out";
    }
    var options = {
      configure:{
        enabled: false,
        //filter: 'layout',
        //container: this.configureRef,
        showButton: true,
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'vertical',
          roundness: 0.4
        }
      },
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed'
        },
        improvedLayout:true
      },
      interaction: {
        navigationButtons: true,
        keyboard: true
      },
      width:"1200px",
      height:"600px",
      physics:false,
    };

    const layout = this.props.layout;
    if (layout == 'UD') {
      options['layout']['hierarchical']['direction'] = 'UD';
      options['edges']['smooth']['forceDirection'] = 'vertical';
    } else if (layout == 'LR') {
      options['layout']['hierarchical']['direction'] = 'LR';
      options['edges']['smooth']['forceDirection'] = 'horizontal';
    } else {
      options['layout']['hierarchical'] = false;
      options['edges']['smooth']['type'] = 'dynamic';
    }

    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <Graph 
              graph={graph}
              options={options}
              events={this.state.events}
              getNetwork={this.setNetwork}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{maxWidth:500}}>
            <div id="visConfig" ref={r => this.configureRef = r}></div>
          </EuiFlexItem>
        </EuiFlexGroup>
        <div>
          <textarea rows="7" cols="120" readOnly
            placeholder={placeholder}
            value={this.state.textarea}>
          </textarea>
        </div>
      </div>
    )
  }
}

