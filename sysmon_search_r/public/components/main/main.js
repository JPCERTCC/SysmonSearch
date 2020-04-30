import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import { SysmonSearchTabs } from './ss_tabs';
import { SysmonSummary } from './ss_summary';
import { SysmonStats } from './ss_stats';
import { SysmonProcess } from './ss_process';
import { SysmonProcessList } from './ss_processlist';
import { SysmonOverView } from './ss_overview';
import { SysmonDetail } from './ss_detail';
import { SysmonVisualize } from './ss_visualize';

export class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/app/sysmon_search_r" component={SysmonSearchTabs} />
          <Route exact path="/app/sysmon_search_r/visualize" component={SysmonVisualize} />
          <Route exact path="/app/sysmon_search_r/event" component={SysmonSummary} />
          <Route exact path="/app/sysmon_search_r/stats" component={SysmonStats} />
          <Route exact path="/app/sysmon_search_r/process" component={SysmonProcess} />
          <Route exact path="/app/sysmon_search_r/process_list" component={SysmonProcessList} />
          <Route exact path="/app/sysmon_search_r/process_overview" component={SysmonOverView} />
          <Route exact path="/app/sysmon_search_r/process_detail" component={SysmonDetail} />
        </Switch>
      </Router>
    );
  }

}
