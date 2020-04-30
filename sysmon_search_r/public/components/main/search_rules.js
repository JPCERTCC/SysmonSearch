import chrome from 'ui/chrome';

function is_key_exist(key, keywords) {
  return (key in keywords && keywords[key] !== "undefined" && keywords[key] !== null);
};

function get_search_key_name(num) {
  const option_array = [
    '',
    'IpAddress', 
    'Port', 
    'HostName', 
    'ProcessName', 
    'FileName', 
    'RegistryKey', 
    'RegistryValue', 
    'Hash' 
  ];
  var num_obj = Number(num);
  if (num_obj === Number.NaN || num_obj <= 0 || num_obj >= option_array.length) return '';
  return option_array[num_obj];
};

function save_rules (keywords) {
  var rules = {};
  if (typeof keywords !== "undefined") {
    rules.operator = '';
    if (is_key_exist("search_conjunction", keywords)
      && (keywords.search_conjunction === 1
      || keywords.search_conjunction === 2)) {
      rules.operator = (keywords.search_conjunction === 1) ? 'AND' : 'OR';
    }

    rules.patterns = [];

    const search_key_prefix = "search_item_";
    const search_val_prefix = "search_value_";

    for (var keyname in keywords) {
      if (keyname.substr(0, search_key_prefix.length) == search_key_prefix
        && is_key_exist(keyname, keywords)) {
        var num = keyname.substr(search_key_prefix.length);
        var valname = search_val_prefix + num;
        if (is_key_exist(valname, keywords)) {
          var rule = {
            key:   get_search_key_name(keywords[keyname]),
            value: keywords[valname]
          };
          rules.patterns.push(rule);
        }
      }
    }

  } else {
    alert("Invalid rule.");
    return ;
  }

  console.log(rules);
  if(rules.patterns.length===0){
    alert("Pattern is empty.");
    return;
  }
  const api = chrome.addBasePath('/api/sysmon-search-plugin/save_alert_rules');
  fetch(api, {
    method:"POST",
    headers: {
      'kbn-xsrf': 'true',
      'Content-Type': 'application/json',
    },
    body:JSON.stringify(rules)
  })
  .then((response) => response.json())
  .then((responseJson) => {
      console.log(JSON.stringify(responseJson));
      if(responseJson.result) alert(responseJson.result);
      else alert("Save failed. Please check console.");
  });
};

module.exports = {
  saveRules: save_rules
};
