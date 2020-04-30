import React, {Component} from 'react';
import moment from 'moment';
import chrome from 'ui/chrome'

import imgProgram from "./images/program.png"
import imgNet from "./images/net.png"

import {
  EuiTitle,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
} from '@elastic/eui';

const qs = require('query-string');

import {GraphView} from './process_network';

export class SysmonProcess extends Component {
  constructor(props){
    super(props);
    var host, date;
    if(this.props.location){
      const params = qs.parse(this.props.location.search);
      host = params.host;
      date = params.date;
    }
    if(this.props.host) host = this.props.host;
    if(this.props.date) date = this.props.date;

    var startDate= moment(date, 'YYYY-MM-DD').startOf('day');
    var endDate = moment(date, 'YYYY-MM-DD').startOf('day').add(1, 'hours');
    if (date.length===23){
      startDate = moment(date, 'YYYY-MM-DD HH:mm:ss.SSS').add(-1, 'hours');
      endDate = moment(date, 'YYYY-MM-DD HH:mm:ss.SSS').add(1, 'hours');
    }

    this.state = {
      host: host,
      date: date,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      graph:{},
      events:null,
      network:null,
      textarea:"",
      layout: "UD",
      //startDate: moment(date, 'YYYY-MM-DD').startOf('day'),
      //endDate: moment(date, 'YYYY-MM-DD').startOf('day').add(1, 'hours'),
      startDate: startDate,
      endDate: endDate,
    };

    this.layouts =[
      {value:"LR", text:"Left to Right"},
      {value:"UD", text:"Up to Down"},
      {value:"default", text:"Default"},
    ]

    this.top = chrome.addBasePath('/app/sysmon_search_r');

    this.stats = this.top + "/visualize&type=stats&date=" + this.props.date + "&host=" + this.props.host;
    this.summary = this.top + "/visualize&type=summary&date=" + this.props.date + "&host=" + this.props.host;

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);

  }

  componentDidMount(){ this.getProcess() };

  clickSearch(){ this.getProcess() };

  //getProcess(){
  getProcess(date){
    var start_time = this.state.startDate;
    var end_time = this.state.endDate;
    if(date){
      if(date.start) start_time = date.start;
      if(date.end) end_time = date.end;
    }
    var api = chrome.addBasePath("/api/sysmon-search-plugin/process");
    api += "/" + this.state.host
    api += "/" + this.state.date;
    api += "?start_time=" + start_time + "&end_time=" + end_time;
    fetch(api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        tops:responseJson,
        startDate:start_time,
        endDate:end_time,
      });
      console.log(JSON.stringify(responseJson));
    }) 
    .catch((error) =>{
      console.error(error);
    });
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

  handleChangeStart(date) {
    this.getProcess({start:date});
  }

  handleChangeEnd(date) {
    this.getProcess({end:date});
  }

  render() {
    console.log(this.state)
    //const minDate= moment(this.state.date, 'YYYY-MM-DD').startOf('day');
    //const maxDate= moment(this.state.date, 'YYYY-MM-DD').endOf('day');

    return (
      <div id="correlation" style={{maxWidth:"1280px",margin:"0 auto"}}>

        <EuiTitle size="s">
          <h3>Event Correlation: {this.state.host}</h3>
        </EuiTitle>

        <EuiPanel>

          <EuiFlexGroup>

            <EuiFlexItem>
              <EuiFormRow label="Layout">
                <EuiSelect 
                  name="layout"
                  value={this.state.layout}
                  options={this.layouts}
                  onChange={this.handleChangeLayout} />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label="Keyword">
                <EuiFieldText
                  name="keyword"
                  onChange={this.handleChange} />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFormRow label="Hash">
                <EuiFieldText
                  name="hash"
                  onChange={this.handleChangeHash} />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup >

          <EuiFlexGroup >
            <EuiFlexItem>
            <EuiFormRow label="Date">
              <EuiDatePickerRange style={{ minWidth: 500 }}
                startDateControl={
                  <EuiDatePicker
                    selected={this.state.startDate}
                    onChange={this.handleChangeStart}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    isInvalid={this.state.startDate > this.state.endDate}
                    aria-label="Start date"
                    showTimeSelect
                    timeFormat="HH:mm"
                  />
                }
                endDateControl={
                  <EuiDatePicker
                    selected={this.state.endDate}
                    onChange={this.handleChangeEnd}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    isInvalid={this.state.startDate > this.state.endDate}
                    aria-label="End date"
                    showTimeSelect
                    timeFormat="HH:mm"
                  />
                }
              />
            </EuiFormRow>
            </EuiFlexItem>

          </EuiFlexGroup >

          <GraphView
            tops={this.state.tops}
            host={this.state.host}
            date={this.state.date}
            keyword={this.state.keyword}
            hash={this.state.hash}
            layout={this.state.layout}

          />

          <EuiSpacer />

        </EuiPanel>
      </div>
    )
  }

};

