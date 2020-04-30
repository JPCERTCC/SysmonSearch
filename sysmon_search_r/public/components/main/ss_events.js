import React, { Component, Fragment } from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiInMemoryTable,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiIcon,
  EuiButtonIcon,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

import { SysmonStats } from './ss_stats';

export class SysmonEvents extends Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      keyword:"",
      //sortField: 'date',
      //sortDirection: 'asc',
      totalItemCount: 0,
      pageIndex: 0,
      pageSize: 100,
    };
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){ this.getEvents() };
  
  clickSearch(){ this.getEvents() };

  getEvents(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/hosts');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        fm_start_date: this.state.startDate,
        fm_end_date: this.state.endDate,
        keyword: this.state.keyword,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
        var items = [];
        responseJson.map(res => {
          res.result.map(r  => {
            var appPath = chrome.addBasePath('/app/sysmon_search_r/');
            let params = "?host=" + r.key + "&date=" + res.date;
            let item = {
              date: res.date,
              pc: r.key,
              count: r.doc_count,
              event: appPath + "event" + params,
              stats: appPath + "stats" + params,
              process: appPath + "process" + params,
              visualize: appPath + "visualize" + params,
            };
            items.push(item);
          });
        });
        this.setState({
          items: items,
          totalItemCount: items.length,
        });
        //console.log(JSON.stringify(items));
    })
    .catch((error) =>{
      console.error(error);
    });
  }


  handleChangeStart(date) {
    this.setState({
      startDate: date,
    });
  }

  handleChangeEnd(date) {
    this.setState({
      endDate: date,
    });
  }

  handleChange (event) {
    //console.log(event.target)
    this.setState({
      keyword: event.target.value
    });
  }

  render(){

    const columns = [
      {
        field: 'date',
        sortable: true,
        name: 'Date (UTC+0)',
        render: (date, item) => (
          <Fragment>
            {date}
          </Fragment>
        )
      },
      {
        field: 'pc',
        name: 'Hostname',
        sortable: true,
        render: (pc, item) => (
          <Fragment>
            {pc}
          </Fragment>
        )
      },
      {
        field: 'count',
        name: 'Count',
        sortable: true,
        render: (count, item) => (
          <Fragment>
            {count}
          </Fragment>
        )
      },
      {
        field: 'visualize',
        name: 'Visualize',
        render: (visualize, item) => {
         const summary = visualize + "&type=summary";
         const stats = visualize + "&type=stats";
         const process = visualize + "&type=process";
         return (
          <Fragment>
            <EuiButtonIcon
              href={summary}
              iconType="visPie"
              aria-label="Event Pie Chart"
            />
            <EuiButtonIcon
              href={stats} 
              iconType="visBarVerticalStacked"
              aria-label="Event Stats"
            />
            <EuiButtonIcon
              href={process} 
              iconType="graphApp"
              aria-label="Process Graph"
            />
          </Fragment>
          )
        }
      }
    ];

    //const { sortField, sortDirection } = this.state;
    const sorting = {
      sort: {
        field: "date",
        direction: "desc",
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

    //const utc = 0;
    const dateLabel = "Date (UTC" + moment().format("Z") + ")";
    return (
      <EuiPanel>
        <EuiFlexGroup >
          <EuiFlexItem  style={{ minWidth: 500 }}>
            <EuiFormRow label={dateLabel}>
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
                  />
                }
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Hostname">
              <EuiFieldText
                name="keyword"
                onChange={this.handleChange}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow hasEmptyLabelSpace display="center">
              <EuiButton
                onClick={ () => this.clickSearch() }
                iconType="search"
              >Search</EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup >
        <EuiSpacer />
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
