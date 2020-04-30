import React, { Component, Fragment } from 'react';

import {
  EuiTabbedContent,
} from '@elastic/eui';

import { SysmonSummary } from "./ss_summary";
import { SysmonStats } from "./ss_stats";
import { SysmonProcess } from "./ss_process";
import { SysmonSearchTabs } from "./ss_tabs";

const qs = require('query-string');

export class SysmonVisualize extends Component {
  constructor(props) {
    super(props);
    const params = qs.parse(this.props.location.search);
    this.tabIndex = 1;
    if (params.type==="stats")this.tabIndex = 2;
    else if (params.type==="process")this.tabIndex = 3;
    this.state = {
      host: params.host,
      date: params.date,
      type: params.type,
    }

    this.tabs = [
      {
        id: 'top',
        name: 'Top',
        content: (
          <SysmonSearchTabs/>
        ),
      },
      {
        id: 'summary',
        name: 'Summary',
        content: (
          <SysmonSummary host={params.host} date={params.date}/>
        ),
      },
      {
        id: 'stats',
        name: 'Stats',
        content: (
          <SysmonStats host={params.host} date={params.date}/>
        ),
      },
      {
        id: 'process',
        name: 'Process',
        content: (
          <SysmonProcess host={params.host} date={params.date}/>
        ),
      },
    ];
  }

  render() {
    return (
      <EuiTabbedContent
        tabs={this.tabs}
        initialSelectedTab={this.tabs[this.tabIndex]}
      />
    );
  }
}

