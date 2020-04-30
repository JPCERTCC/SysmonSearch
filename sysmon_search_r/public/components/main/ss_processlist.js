import React from 'react';
import chrome from 'ui/chrome';

const qs = require('query-string');
import { local_search } from './ss_utils';
import {
  EuiInMemoryTable,
  EuiLink,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlexRow,
  EuiFormRow,
  EuiFieldText,
  EuiSelect
} from '@elastic/eui';

export class SysmonProcessList extends React.Component {
  constructor(props){
    super(props);
    //console.log(this.props)
    var host, date, category;
    if(this.props.location){
      const params = qs.parse(this.props.location.search);
      host = params.host;
      date = params.date;
      category = params.category;
    }
    if (this.props.host) host = this.props.host;
    if (this.props.date) date = this.props.date;
    if (this.props.category) category = this.props.category;
    this.state = {
      host: host,
      date: date,
      category: category,
      //host: this.props.host,
      //date: this.props.date,
      //category: this.props.category,
      items:[],
      sortField: 'date',
      sortDirection: 'asc',
      pageIndex: 0,
      pageSize: 100,
      showPerPageOptions: true,
      total:0,
      keyword:null,
      hash:null,
      filteredItems:[],
    };

    this.columns = [
    {
      field: 'number',
      name: 'Number',
      sortable: true,
      width:"10%",
    },
    {
      field: 'date',
      name: 'UtcTime',
      sortable: true,
      width:"20%",
    },
    {
      field: 'type',
      name: 'Type',
      width:"10%",
      sortable: true,
    },
    { field: 'process',
      name: 'Process',
      width:"30%",
      sortable: true,
    },
    {
      field: 'disp',
      name: 'Related',
      width:"30%",
      sortable: true,
      render: (disp, item) => (
        <EuiLink target="_blank" href={item.link} >{disp}</EuiLink>
      )
    },
    ];

    this.categoryOptions = [
      {value:"create_process", text:"create_process"},
      {value:"dns", text:"dns"}
    ]

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeHash = this.handleChangeHash.bind(this);
    this.handleChangeCategory = this.handleChangeCategory.bind(this);
    this.filterList = this.filterList.bind(this);
    this.getItems = this.getItems.bind(this);
    this.clickSearch = this.clickSearch.bind(this);

    this.top = chrome.addBasePath('/app/sysmon_search_r');
  }

  handleChange (event) {
    const keyword = event.target.value;
    const items = this.filterList(this.state.items, keyword, this.state.hash);
    this.setState({
      filteredItems: items,
      keyword: keyword,
    });
  }

  handleChangeHash (event) {
    const hash = event.target.value;
    const items = this.filterList(this.state.items, this.state.keyword, hash);
    this.setState({
      filteredItems: items,
      hash: hash,
    });
  }

  filterList(localdata, keyword, hash) {
    var search_data = [];
    var tmp_data = [];
    //var localdata = this.state.items
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
    return search_data;
    /*
    this.setState({
      items:search_data
    });
    */
  };

  componentDidMount(){
    this.getItems();
  }

  componentDidUpdate(prevProps) {
    let update = false;
    if (this.props.category !== prevProps.category) update = true;
    if (this.props.date !== prevProps.date) update = true;
    if (update) this.getItems(this.props.category, this.props.date);
  }

  clickSearch(){
    this.getItems();
  }

  getItems(category, date){
    if (!category) category = this.state.category
    if (!date) date = this.state.date
    let api = chrome.addBasePath('/api/sysmon-search-plugin/process_list');
    api += '/' + this.state.host;
    //api += '/' + this.state.category;
    api += '/' + category;
    //api += '/' + this.state.date;
    api += '/' + date;
    console.log(api)
    const items = fetch(api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        var items = [];
        responseJson.map(res => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
          link += "?host=" + this.state.host;
          link += "&date=" + this.state.date;
          let guid = res.guid?res.guid:res.info.SourceProcessGuid;
          link += "&guid=" + guid;
          let item = {
            number: res.number,
            date: res.date,
            type: res.type,
            process: res.process,
            disp: res.disp,
            info: res.info,
            link: link,
          };
          items.push(item);
        });
        this.setState({
          category:category,
          date:date,
          items:items,
          total:items.length,
          keyword:null,
          hash:null,
          filteredItems:[],
        });
    })
    .catch((error) =>{
      console.error(error);
    });
    return items;
  }

  handleChangeCategory = event => {
    const category = event.target.value;
    //this.setState({ category: category });
    this.getItems(category);
  }

  render(){
    if(!this.state.category){
      console.log("no category")
      return(<div></div>);
    } else {
      console.log(this.state.category)
    }
    const sorting = {
      sort: {
        field: this.state.sortField,
        direction: this.state.sortDirection,
      },
    };

    const { pageIndex, pageSize } = this.state;
    const start = pageIndex * pageSize;
    const pageOfItems = this.state.items.slice(start, pageSize);
    const totalItemCount = this.state.total;
    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

    console.log(this.state)
    var items = this.state.items;
    if (this.state.filteredItems.length>0) items = this.state.filteredItems;
    const total = items.length;

    return (
      <div id="processlist" style={{maxWidth:"1280px",margin:"0 auto"}}>
        <EuiTitle size="s">
          <h3>{this.state.category} on {this.state.host}@{this.state.date}</h3>
        </EuiTitle>

        <EuiPanel>

          <EuiFlexGroup >
            <EuiFlexItem>
              <EuiFormRow label="Keyword">
              <EuiFieldText compressed
              name="keyword"
              onChange={this.handleChange} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Hash">
              <EuiFieldText compressed
              name="hash"
              onChange={this.handleChangeHash} />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText ><h2>Total: {total}</h2></EuiText>
            </EuiFlexItem>
          </EuiFlexGroup >

          <EuiInMemoryTable
              items={items}
              columns={this.columns}
              sorting={sorting}
              pagination={pagination}
            />
        </EuiPanel>
      </div>
    );
  }
};
