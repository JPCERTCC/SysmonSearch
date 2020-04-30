import React, {Component, Fragment} from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';
import {saveRules} from './search_rules';

import {
  EuiInMemoryTable,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiFilePicker,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiLink,
} from '@elastic/eui';

export class SysmonSearch extends Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      inputFields: [{item:"", value:""}],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      conjunction:2,//OR
      pageIndex: 0,
      pageSize: 100,
      showPerPageOptions: true,
      file: null,
      fileSuffix: null,
    };

    this.columns = [
      {
        field: 'utc', name: 'UtcTime', width:"20%", sortable:true,
        render: (utc, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/stats');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD");
          return (
            <Fragment>
              {utc}
            </Fragment>
          )
        }
      },
      {
        field: 'pc', name: 'Hostname', width:"20%", sortable:true,
        render: (pc, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD HH:mm:ss.SSS");
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
        field: 'user', name: 'User', width:"10%", sortable:true
      },
      {
        field: 'event', name: 'Event ID', width:"10%", sortable:true
      },
      {
        field: 'description', name: 'Description', width:"10%", sortable:true,
        render: (descr, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process_list');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD HH:mm:ss.SSS")
          link += "&category=" + descr;
          if(descr=="other") return(<Fragment>{descr}</Fragment>)
          else return (<EuiLink href={link} >{descr}</EuiLink>)
        }
      },
      {
        field: 'image', name: 'image', width:"30%", sortable:true,
        render: (image, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD");
          link += "&guid=" + item.guid;
          return (
            <Fragment>
              <EuiButtonIcon target="_blank"
                iconType="graphApp"
                href={link}
                aria-label="Overview Graph"
              />
              {image}
            </Fragment>
          )
        }
      },
    ];
    this.options = [
      {value:0, text:"-"},
      {value:1, text:"IpAddress"},
      {value:2, text:"Port"},
      {value:3, text:"Hostname"},
      {value:4, text:"ProcessName"},
      {value:5, text:"FileName"},
      {value:6, text:"RegistryKey"},
      {value:7, text:"RegistryValue"},
      {value:8, text:"Hash"},
    ];
    this.dict = {}
    for (let index in this.options){
      let key = this.options[index].text;
      let value = this.options[index].value;
      this.dict[key] = value;
    }

    this.conjunctions = [
      {value:1, text:"AND"}, {value:2, text:"OR"}
    ]
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeConjunction = this.handleChangeConjunction.bind(this);
    this.handleAddFields = this.handleAddFields.bind(this);
    this.handleRemoveFields = this.handleRemoveFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setFile = this.setFile.bind(this);
    this.clickLoadIoc = this.clickLoadIoc.bind(this);
    this.callAnalyzeServer = this.callAnalyzeServer.bind(this);
  }

  setFile(result, suffix){
    console.log(result);
    this.setState({
      file: result,
      fileSuffix: suffix
    });
  }

  loadFile(file){
    if(file.length !== 1)return;
    const setFile = this.setFile; 
    const path = require('path');
    const suffix = path.extname(file[0].name);
    console.log(file, suffix)
    var reader = new FileReader();
    reader.onload = function(){
      if(reader.result) setFile(reader.result, suffix);
    }
    reader.readAsText(file[0]);
  }

  callAnalyzeServer(url, file, contenttype) {
    const optionsDict = this.dict;
    if (confirm("Are you sure?")) {
      const params = {
        contents: file,
        filename: "hoge",
        contenttype: contenttype,
        part_url: url
      };
      console.log("params:", params);
      const api = chrome.addBasePath('/api/sysmon-search-plugin/import_search_keywords');
      fetch(api, { method:"POST",
        headers: {
          'kbn-xsrf': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      }).then((response) => response.json())
      .then((responseJson) => {
        console.log(JSON.stringify(responseJson));
        function is_value_exist(dict, key) {
          return (key in dict && dict.key !== "undefined" && dict.key !== null);
        };
        const json_data = responseJson;
        if (is_value_exist(json_data, "fields")
          && Array.isArray(json_data.fields)
          && json_data.fields.length > 0
        ) {
          const patterns = json_data["fields"];
          var inputFields = [];
          for(let index in patterns){
            const field = {
              item: optionsDict[patterns[index].key],
              value: patterns[index].value,
            } 
            inputFields.push(field);
          }
          console.log(inputFields)
          this.setState({
            inputFields:inputFields,
          });   
        } else {
          alert("No Search Criteria");
        }
      })
    }
  }

  clickLoadIoc(){
    const file = this.state.file;
    const suffix = this.state.fileSuffix;
    if (suffix === ".xml") {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(file, "application/xml");
        console.log(doc);
        if (doc.getElementsByTagName("parsererror").length > 0) {
          console.log(doc.getElementsByTagName("parsererror")[0]);
          alert("Invalid File.");
          return;
        }
        const rootTagName = doc.firstChild.localName;
        var url = "";
        if (rootTagName === "STIX_Package") {// STIXv1
          url = "/convert/stix/v1";
          this.callAnalyzeServer(url, file, "application/xml");
        } else if (rootTagName === "ioc") {// IoC
          url = "/convert/ioc";
          this.callAnalyzeServer(url, file, "application/xml");
        } else {
          alert("Invalid File.");
          return;
        }
      } catch (e) {
        console.log(e);
        alert("Invalid File.");
        return;
      } 
    } else if (suffix === ".json") { // STIXv2
      const url = "/convert/stix/v2";
      this.callAnalyzeServer(url, file, "application/json");
    } else {
      alert("Invalid File.");
      return;
    }
  }

  clickLoad(){
    if(this.state.file===null){
      alert("Please select a valid rule file.");
      return;
    }

    const file = JSON.parse(this.state.file);
    if((file.operator==="AND"||file.operator==="OR")&&file.patterns){
      ;
    } else {
      console.log("Invalid file.");
      return;
    }

    const conjunction = (file.operator==='AND')?1:2;
    var inputFields = [];
    const optionsDict = this.dict;
    for(let index in file.patterns){
      const field = {
        item: optionsDict[file.patterns[index].key],
        value: file.patterns[index].value,
      } 
      inputFields.push(field);
    }
    this.setState({
      inputFields:inputFields,
      conjunction:conjunction,
    });
  }

  clickSave(){
    const res = confirm("Are you sure?");
    if(res===false)return;
    console.log(this.state);
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
      search_conjunction: Number(this.state.conjunction),
    };
    const inputs = this.state.inputFields;
    for (let index in inputs) {
      if (inputs[index].item && inputs[index].value){
        let id = index + 1;
        let searchItem = "search_item_" + Number(id).toString();
        data[searchItem] = inputs[index].item;
        let searchValue = "search_value_" + Number(id).toString();
        data[searchValue] = inputs[index].value;
      }
    }
    console.log(data);
    saveRules(data);
  }

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
      search_conjunction: Number(this.state.conjunction),
    };
    const inputs = this.state.inputFields;
    for (let index in inputs) {
      if (inputs[index].item && inputs[index].value){
        let id = Number(index) + 1;
        let searchItem = "search_item_" + Number(id).toString();
        data[searchItem] = inputs[index].item;
        let searchValue = "search_value_" + Number(id).toString();
        data[searchValue] = inputs[index].value;
      }
    }
    console.log(data);
    fetch(api, {method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      var items = [];
      responseJson.hits.map(res => {
        let item = {
          utc: res.utc_time,
          event: res.event_id,
          pc: res.computer_name,
          user: res.user_name,
          image: res.image,
          description: res.description,
          guid: res.process_guid,
        };
        items.push(item);
      });
      this.setState({
        items:items,
        total:responseJson.total,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  handleChangeStart(date) {
    this.setState({ startDate:date });
  }

  handleChangeEnd(date) {
    this.setState({ endDate: date });
  }

  handleChangeConjunction = event => {
    this.setState({ conjunction: event.target.value });
  }

  handleAddFields = () => {
    const values = [...this.state.inputFields];
    values.push({ item: '', value: '' });
    this.setState({inputFields:values});
  };

  handleRemoveFields = index => {
    const values = [...this.state.inputFields];
    values.splice(index, 1);
    this.setState({inputFields:values});
  };

  handleInputChange = (index, event) => {
    const values = [...this.state.inputFields];
    if (event.target.name === "item") {
      values[index].item = event.target.value;
    } else {
      values[index].value = event.target.value;
    }
    this.setState({inputFields:values});
  };

  render(){
    const { pageIndex, pageSize } = this.state;
    const start = pageIndex * pageSize;
    const pageOfItems = this.state.items.slice(start, pageSize);
    const totalItemCount = this.state.total;

    const sorting = {
      sort: {
        field: "utc",
        direction: "asc",
      }
    };

    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

    const utc = 0;
    const total = (this.state.total.relation==='gte')?"Total: Over":"Total:";
    return (
      <EuiPanel>
        <EuiFlexItem>
          <EuiFormRow display="columnCompressed" label="Date" >
            <EuiDatePickerRange style={{minWidth:500}}
              startDateControl={
                <EuiDatePicker compressed
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
                <EuiDatePicker compressed
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
        <EuiSpacer size="m" />

        {this.state.inputFields.map((inputField, index) => (
          <EuiFlexGroup key={`input-${index}`}>
            <EuiFlexItem grow={false}>
              <EuiFormRow
                display="columnCompressed"
                label="Field" >
                <EuiSelect 
                  name="item"
                  compressed
                  value={inputField.item}
                  options={this.options}
                  onChange={event => this.handleInputChange(index, event)}
                />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem style={{maxWidth:400}}>
              <EuiFieldText name="value" compressed
                value={inputField.value}
                onChange={event => this.handleInputChange(index, event)}
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton size="s" iconType="arrowLeft"
                onClick={() => this.handleRemoveFields(index)}
              >DEL</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup >
        ))}
  
        <EuiSpacer size="m" />

        <EuiFlexGroup >

          <EuiFlexItem grow={true} style={{maxWidth:300}}>
            <EuiFormRow display="columnCompressed" label="Conjunction" >
              <EuiSelect name="conjunction" compressed 
                value={this.state.conjunction}
                options={this.conjunctions}
                onChange={this.handleChangeConjunction}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton size="s" iconType="arrowUp"
              onClick={() => this.handleAddFields()}
            >ADD</EuiButton>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickSave() }
            >Save as detection rule</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickLoad() }
            >Load rule file</EuiButton>
          </EuiFlexItem >
          <EuiFlexItem grow={false}>
            <EuiFilePicker compressed
              display="default"
              initialPromptText="Select rule or IOC file"
              onChange={file => {
                this.loadFile(file);
              }}
            />
          </EuiFlexItem >
          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickLoadIoc() }
            >Load IOC file</EuiButton>
          </EuiFlexItem >
        </EuiFlexGroup >

        <EuiSpacer size="m" />

        <EuiFlexGroup >
          <EuiFlexItem grow={false}>
            <EuiButton fill 
              iconType="search"
              onClick={ () => this.clickSearch() }
            >Search</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem >
            <EuiText><h3>{total} {this.state.total.value}</h3></EuiText>
          </EuiFlexItem >
        </EuiFlexGroup >

        <EuiSpacer size="m"/>

        <EuiInMemoryTable		
          items={this.state.items}
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
        />

      </EuiPanel>
    );
  
  }

};
