import React, {Component, Fragment} from 'react';
import chrome from 'ui/chrome';

import {
  EuiLink,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';

const qs = require('query-string');
import {pieChart, segColor} from './pie_chart';
import {SysmonProcessList} from './ss_processlist';

export class SysmonSummary extends Component {
  constructor(props){
    super(props);
    /*
    const params = qs.parse(this.props.location.search)
    const host = this.props.host?this.props.host:params.host;
    const date = this.props.date?this.props.date:params.date;
    */
    this.state = {
      host: this.props.host,
      date: this.props.date,
      items:[],
      total:0,
      category:this.props.category,
      processList:null,
    };
    this.chartRef = React.createRef();
    this.top = chrome.addBasePath('/app/sysmon_search_r');
    this.stats = this.top + "/visualize&type=stats&date=" + this.props.date + "&host=" + this.props.host;
    this.process = this.top + "/visualize&type=process&date=" + this.props.date + "&host=" + this.props.host;

    this.setCategory = this.setCategory.bind(this);
    //this.summaryLegend = this.summaryLegend.bind(this);

  }

  componentDidMount(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/events');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        hostname: this.state.host,
        period: this.state.date,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(JSON.stringify(responseJson));
      var item = responseJson["count"];
      var freqData = item;
      pieChart(this.chartRef, freqData, false, 300);
      var items = [];
      var total = 0;
      for (let [key, value] of Object.entries(item)) {
        items.push({
          "type":key,
          "value":value,
        });
        total+=value;
      }
      this.setState({
        items:items,
        total:total,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  setCategory(category){
    const processList = (
      <SysmonProcessList
        host={this.state.host}
        date={this.state.date}
        category={category}
      />
    )
    this.setState({
      category:category,
      processList: processList,
    });
  }

  summaryLegend = (items, total, host, date) => {
    const setCategory = this.setCategory;
    return items.map(function(item, i){
      if (item.value<=0) return;
      let percentage = item.value / total * 100;
      let style= {
        width: "16px",
        height: "16px",
        float: "left",
        marginRight: "10px",
        background: item.value > 0?segColor(i):""
      };
      let processlist = "process_list?";
      processlist += "host=" + host;
      processlist += "&date=" + date;
      processlist += "&category=" + item.type;
      return(
      <tr key={item.type}>
        <td>
          <div className="square" style={style}>
          </div>
          <a onClick={()=>setCategory(item.type)}>{item.type}</a>
        </td>
        <td align="right">{item.value}</td>
        <td align="right">{percentage.toFixed(2)}%</td>
      </tr>
      );
    });
  }

  render() {
    console.log(this.state);

    return (

        <div id="summary" style={{maxWidth:"1280px",margin:"0 auto"}}>                                        

        <EuiTitle size="s">
          <h3>Event Summary: {this.state.host}@{this.state.date}</h3>
        </EuiTitle>

        <EuiPanel>

          <EuiText size="m">

          <EuiFlexGroup>

            <EuiFlexItem grow={false} style={{marginLeft:"auto"}}>
              <div id="piechart" ref={cr => this.chartRef = cr}></div>
            </EuiFlexItem>

            <EuiFlexItem grow={false} style={{marginRight:"auto"}}>
              <table className="legend">
                <thead><tr>
                  <th>Type</th>
                  <th style={{paddingLeft:"10px"}}>Count</th>
                  <th style={{paddingLeft:"10px"}}>Percentage</th>
                </tr></thead>
                <tbody>
                  {this.summaryLegend(
                    this.state.items,
                    this.state.total,
                    this.state.host,
                    this.state.date,
                  )}
                  <tr>
                    <td>Total</td>
                    <td align="right">{this.state.total}</td>
                  </tr>
                </tbody>
              </table>
            </EuiFlexItem>
          </EuiFlexGroup>

          </EuiText>

        </EuiPanel>

        {this.state.processList}

        </div>
    )
  }
};

