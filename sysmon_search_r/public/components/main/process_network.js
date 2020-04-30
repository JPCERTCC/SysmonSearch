import React, {Component, Fragment} from "react";
import Graph from "./react-graph-vis";
import chrome from 'ui/chrome';

import imgProgram from "./images/program.png"
import imgNet from "./images/net.png"
import {
   EuiFlexGroup,
   EuiFlexItem,
   EuiText
 } from '@elastic/eui';

import { search, local_search, splitByLength } from './ss_utils';

import "./network.css";

const defaultColor = {
  "background": "#97c2fc",
  "border": "#2b7ce9"
};

const edgeColor = {"color": "gray"};
const netEdgeColor = {"color": "skyblue"};

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
      "info": item.current.info
    };
    if (search(item.current.info, keyword, hash)) {
    //|| (firstflg == true && $route.current.params.guid == item.current.guid)) {
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
      "from": cur.current.index,
      "to": item.current.index,
      "arrows": "to",
      "color": edgeColor,
      "length": 200
    };
    graph["edges"].push(tmp_edge);

    //console.log(JSON.stringify(item.current.info.Net));
    for( let n_key in item.current.info.Net ) {
      var n_item = item.current.info.Net[ n_key ];
      var n_index = item.current.index+"-"+n_key;
      var tmp_node = {
        "id": n_index,
        "label": n_key+":"+n_item,
        "title": n_key+":"+n_item,
        "shape": "circularImage",
        "image": imgNet,
        "guid": item.current.guid,
        "info": item.current.info
      };
      //if( n_item > 100) {}
      if(graph["nodes"].some(e => e.id === tmp_node["id"])) console.log(e.id);
      graph["nodes"].push(tmp_node);

      var tmp_edge = {
        "from": item.current.index,
        "to": n_index,
        "arrows": "to",
        "color": netEdgeColor,
        "length": 200
      };
      graph["edges"].push(tmp_edge);
    }
    graph = add_child_info(item, graph, keyword, hash);
  }
  return graph;
}

function createNetwork(tops, keyword, hash, firstflg) {
  var graph = {nodes:[], edges:[]}
  if(!tops) return graph;
  for( let index in tops ) {
    var top = tops[index];
    var tmp_node = {
      "id": top.current.index,
      "label": top.current.image,
      "title": top.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": top.current.guid,
      "info": top.current.info
    };
    if (search(top.current.info, keyword, hash)) {
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
  }
  return graph;
}


export class GraphView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      graph:{},
      options:{},
      events:null,
      network:null, 
      textarea:"",
      first:true
    }

    this.setNetwork = this.setNetwork.bind(this);
    this.setText = this.setText.bind(this);

  }

  setText(str){
    this.setState({
      textarea:str
    });
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
          var url = chrome.addBasePath("/app/sysmon_search_r/process_overview");
          url += '?host=' + host;
          url += '&date=' + date.substr(0, 10);
          url += '&guid=' + node.guid;
          window.open(url, "_blank");
        }
      },
      click: function(properties) {
        if (!properties.nodes.length) return;
        //var node = network.body.data.nodes.get(properties.nodes[0]);
        var nodeid = network.getNodeAt(properties.pointer.DOM);
        if (nodeid) {
          network.selectNodes([nodeid], true);
          var node = network.body.data.nodes.get(nodeid);

          if (node && node.info) {
            const view_data_1 = [
              "CurrentDirectory",
              "CommandLine",
              "Hashes",
              "ParentProcessGuid",
              "ParentCommandLine",
              "ProcessGuid"
            ];
            var str = "";
            for (var key in node.info) {
              if (view_data_1.indexOf(key) >= 0) {
                if (str === "") str = key + ":" + node.info[key];
                else str = str + "\n" + key + ":" + node.info[key];
              }
            }
          }
          settxt(str);
        }
      }
    }
    this.setState({network:nw, events:events});
  }

  render(){

    const graph = createNetwork(
      this.props.tops,
      this.props.keyword,
      this.props.hash,
      true,
    );

    var options = {
      configure:{enabled:false},
      interaction: {
        navigationButtons: true,
        keyboard: true
      },
      nodes: {
        shapeProperties: {
          interpolation: false
        }
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
          direction: "UD",
          sortMethod:"directed"
        }
      },
      physics:false,
      height: "600px",
      width: "1200px",
      autoResize: true,
    }

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

    let placeholder = "No Graph.";
    if(graph.edges.length>0&&graph.nodes.length>0){
       placeholder = "Click Node -> Show Information";
       placeholder += "\nDouble Click Node -> Open Process Details List";
       placeholder += "\nRight Click -> Zoom Out";
    }

    console.log(graph);
 
    return (
      <Fragment>
        <EuiText>nodes:{graph.nodes.length} / edges:{graph.edges.length}</EuiText>
        <Graph
          graph={graph}
          options={options}
          events={this.state.events}
          getNetwork={this.setNetwork}
        />
        <textarea rows="7" cols="120" readOnly
          placeholder={placeholder}
          value={this.state.textarea}>
        </textarea>
      </Fragment>
    )
  }

}

