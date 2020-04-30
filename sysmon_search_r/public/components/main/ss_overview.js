import React, { Component } from 'react';
import chrome from 'ui/chrome'

import {
  EuiTitle,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
} from '@elastic/eui';

const qs = require('query-string');
import {GraphOverView} from './overview_network';

export class SysmonOverView extends Component {
  constructor(props){
    super(props);
    const params = qs.parse(this.props.location.search);
    this.api = chrome.addBasePath("/api/sysmon-search-plugin/process_overview");
    this.api += "/" + params.host;
    this.api += "/" + params.date;
    this.api += "/" + params.guid;
    this.state = {
      host: params.host,
      date: params.date,
      guid: params.guid,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      graph:{},
      events:null,
      network:null,
      textarea:"",
      layout: "LR",
    };

    this.layouts =[
      {value:"LR", text:"Left to Right"},
      {value:"UD", text:"Up to Down"},
      {value:"default", text:"Default"},
    ]

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);

  }

  handleChange (event) {
    this.setState({
      keyword: event.target.value
    });
  }

  handleChangeHash (event) {
    this.setState({
      hash: event.target.value
    });
  }

  handleChangeLayout = event => {
    this.setState({ layout: event.target.value });
  }

  componentDidMount(){ this.getProcess(); }

  clickSearch(){ this.getProcess(); }

  getProcess(){
    fetch(this.api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson) this.setState({tops:responseJson});
      console.log(JSON.stringify(responseJson));
    }) 
    .catch((error) =>{
      console.error(error);
    });
  }

  render() {
    //console.log(this.state)

    return (
      <div id="correlation" style={{maxWidth:"1280px",margin:"0 auto"}}>
        <EuiTitle size="s">
          <h3>{this.state.guid} on {this.state.host}@{this.state.date}</h3>
        </EuiTitle>
        <EuiPanel>
          <EuiFlexGroup >
            <EuiFlexItem >
              <EuiFormRow display="columnCompressed" label="Layout">
                <EuiSelect name="layout" compressed
                  value={this.state.layout}
                  options={this.layouts}
                  onChange={this.handleChangeLayout}
                />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label="Keyword" display="columnCompressed">
                <EuiFieldText compressed
                  name="keyword"
                  onChange={this.handleChange} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow display="columnCompressed" label="Hash">
                <EuiFieldText name="hash" compressed
                  onChange={this.handleChangeHash} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
            </EuiFlexItem>
          </EuiFlexGroup >

          <GraphOverView
            tops={this.state.tops}
            host={this.state.host}
            date={this.state.date}
            keyword={this.state.keyword}
            hash={this.state.hash}
            layout={this.state.layout}
          />
        </EuiPanel>
      </div>
    )
  }
};
