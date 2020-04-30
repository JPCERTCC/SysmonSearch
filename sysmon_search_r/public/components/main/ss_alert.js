import React, { Component, Fragment } from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiInMemoryTable,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiButtonIcon,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

export class SysmonAlert extends Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      unique_hosts:[],
      counts:[],
      rules:[],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      keyword:"",
      //sortField: 'date',
      //sortDirection: 'asc',
      totalItemCount: 0,
      pageIndex: 0,
      pageSize: 100,
      ruleFiles: [],
    };
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
  }

  handleChangeStart(date) {
    this.getAlerts({start:date});
  }

  handleChangeEnd(date) {
    this.getAlerts({end:date});
  }

  componentDidMount(){ this.getAlerts() };

  getAlerts(date) {
    var query = {
      gte: this.state.startDate,
      lt: this.state.endDate,
    }
    if(date){
      if(date.start) query.gte = date.start;
      if(date.end) query.lt = date.end;
    }
    const data = {
      query: query,
      sort_item: "event_id",
      sort_order: "asc",
    }

    const getRule = async function(){
      return fetch(
        chrome.addBasePath('/api/sysmon-search-plugin/get_alert_rule_file_list'),
        {method: "GET"}
      )
      .then(response => response.json())
      .then(function(response){
        return response;
      })
    }

    const api = chrome.addBasePath('/api/sysmon-search-plugin/alert_data');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
    })
    .then((response) => response.json())
    .then(async (responseJson) => {
      console.log(responseJson);

      const ruleFiles = await getRule();
      //console.log(ruleFiles)

      var rules = [];
      for (let index in responseJson.hits){
        const rule = responseJson.hits[index].rule;
        for (let number in rule){ // push rule if not in array
          if (rules.some(r => r.filename === rule[number].filename)) {
            ;
          }else{
            rules.push(rule[number]);
          }
        }
      }
      this.setState({
        items: responseJson.hits,
        total: responseJson.total,
        unique_hosts: responseJson.unique_hosts,
        counts: responseJson.table_data,
        rules: rules,
        startDate: query.gte,
        endDate: query.lt,
        ruleFiles: ruleFiles,
      });
    })
  }

  delFile(filename) {
    const data = { filename: filename };
    const api = chrome.addBasePath('/api/sysmon-search-plugin/delete_alert_rule_file');
    const res = confirm(`{filename} will be removed. Are you sure?`);
    if (!res) return;
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.log(responseJson);
      const response = responseJson;
      var code = response.data;
      if(code == 1){
        alert("Delete Succeeded");
      }else{
        alert("Delete Failed");
      }
    });
  
  };

  render(){

    const columns = [
      {
        field: 'utc_time',
        sortable: true,
        name: 'UtcTime',
        render: (date, item) => (
          <Fragment>
            {date}
          </Fragment>
        )
      },
      {
        field: 'event_id',
        sortable: true,
        name: 'EventId',
        render: (event, item) => {
          var link = chrome.addBasePath('/app/sysmon_search_r/process_list');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.utc_time).format("YYYY-MM-DD HH:mm:ss.SSS");
          link += "&category=" + item.description;
          return (
            <Fragment>
            <EuiButtonIcon target="_blank"
              iconType="list"
              href={link}
              aria-label="Process List"
            />{event} - {item.description}
            </Fragment>
          )
        }
      },
      {
        field: 'computer_name',
        name: 'Computer',
        sortable: true,
        render: (pc, item) => {
          //console.log(item)
          var link = chrome.addBasePath('/app/sysmon_search_r/process');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.utc_time).format("YYYY-MM-DD HH:mm:ss.SSS");
          link += "&guid=" + item.process_guid;
          return (
            <Fragment>
              <EuiButtonIcon target="_blank"
                iconType="graphApp"
                href={link}
                aria-label="Process Graph"
              />{pc}
            </Fragment>
          )
        }
      },
      {
        field: 'image',
        sortable: true,
        name: 'Process',
        render: (process, item) => {
          var link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.date).format("YYYY-MM-DD");
          link += "&guid=" + item.process_guid;
          return (            
            <Fragment>
              <EuiButtonIcon target="_blank"
                iconType="graphApp"
                href={link}
                aria-label="Process Graph"
              />{process}
            </Fragment>
          )
        }
      },
      {
        field: 'rule_name',
        sortable: true,
        name: 'RuleName',
      }
    ];

    const sorting = {
      sort: {
        field: "utc_time",
        direction: "asc",
      },
    };
    const { pageIndex, pageSize, totalItemCount } = this.state;
    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };
    
    const hostColumns = [
      {field: "key", name: "Computer"},
      {field: "doc_count", name: "Number of Matches"},
    ];

    const ruleColumns = [
      {
        field: "file_name",
        name: "Rule File",
        width: "30%",
        render: (rule, item) => {
          if (this.state.ruleFiles.length > 0){
            const files = this.state.ruleFiles;
            if(files.includes(rule)){
            return (
              <Fragment>{rule}
              <EuiButtonIcon
                iconType="trash"
                onClick={()=>this.delFile(rule)}
                aria-label="delete"
              />
              </Fragment>
            )
            }
          }
          return (<Fragment>{rule}</Fragment>);
        }
      },
      {
        field: "patterns",
        name: "Patterns",
        width: "50%",
        render: (patterns, item) => {
          const raw = item.rawRule;
          return(
            <Fragment>
              <EuiButtonIcon
                iconType="inspect"
                onClick={()=>alert(JSON.stringify(raw, null, 2))}
                aria-label="delete"
              />
              {patterns}
            </Fragment>
          )
        }
      },
      {field: "records", name: "Records", width: "10%"},
      {field: "unique_hosts", name: "Unique Hosts", width: "10%"},
    ];

    var rules = [];
    for(let index in this.state.rules){
      
      const rule = this.state.rules[index];
      var records, unique_hosts;
      var patterns ="";
      for (let number in rule.patterns){
        patterns += rule.patterns[number].key
        patterns += " : " + rule.patterns[number].value;
        if (number < (rule.patterns.length - 1)){
          patterns += " " + rule.operator + " ";
        }
      }
      for(let number in this.state.counts){
        const count = this.state.counts[number];
        if(rule.file_name===count.key){
          records = count.doc_count
          unique_hosts = count.hosts.buckets.length
        }
      }
      rules.push({
        file_name: rule.file_name,
        patterns:patterns,
        records: records,
        unique_hosts: unique_hosts,
        rawRule: rule,
      })
    }

    const utc = 0;
    return (
      <EuiPanel>
        <EuiFlexGroup >
          <EuiFlexItem style={{ minWidth: 500 }}>
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
                    utcOffset={utc}
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
                    utcOffset={utc}
                  />
                }
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup >

        <EuiSpacer/>

        <h2>Matched Rules</h2>

        <EuiInMemoryTable
          items={rules}
          columns={ruleColumns}
        />

        <EuiSpacer/>

        <h2>Matched Hosts</h2>

        <EuiInMemoryTable
          items={this.state.unique_hosts}
          columns={hostColumns}
        />

        <EuiSpacer/>

        <h2>Matched Records</h2>

        <EuiInMemoryTable
          items={this.state.items}
          columns={columns}
          sorting={sorting}
          pagination={pagination}
        />

      </EuiPanel>
    );
  }
};
