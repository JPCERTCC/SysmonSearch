const util = require('util');
const sprintf = require('sprintf-js').sprintf;
const path = require('path');

const CONFIG_PATH = '../../../conf.js';
import {conf as config} from '../../../conf.js';

function padding(n, d, p) {
  p = p || '0';
  return (p.repeat(d) + n).slice(-d);
};

function create_rule_filename() {
  var date = new Date(Date.now());
  var year = padding(date.getFullYear(), 4, "0"),
      month = padding(date.getMonth()+1, 2, "0"),
      day = padding(date.getDate(), 2, "0"),
      hour = padding(date.getHours(), 2, "0"),
      min = padding(date.getMinutes(), 2, "0"),
      second = padding(date.getSeconds(), 2, "0"),
      millsec = padding(date.getMilliseconds(), 3, "0");
  var filename = sprintf(
    'rule-%1$s%2$s%3$s%4$s%5$s%6$s%7$s.json', year, month, day, hour, min, second, millsec
  );
  return filename;
};

function create_fullpath(savepath, filename) {
  var conf_dir = path.join(__dirname, path.dirname(CONFIG_PATH));
  console.log("savepath:", savepath, "/filename:", filename, "/basedir:", conf_dir);
  if (path.isAbsolute(savepath)) {
      return path.join(savepath, filename);
  } else {
      return path.join(conf_dir, savepath, filename);
  }
};

const saveAlert = function (params) {
  //console.log(util.inspect(params));
  var filename = create_rule_filename();
  var fullpath = create_fullpath(config.savepath, filename);
  console.log(fullpath);
  try {
    const fs = require('fs');
    fs.writeFileSync(fullpath, JSON.stringify(params, null, 2));
    console.log("#---------- save search criteria/success ----------");
    var res = {
      'status': 200,
      'result': sprintf('succeeded to save rules in "%1$s".', fullpath)
    };
    console.log(res);
    return res;
  } catch (e) {
    console.error("#---------- save search criteria/fail ----------");
    console.error(util.inspect(e));
    return e;
  }
}

const getAlert = async function (params) {
  var conf_dir = path.join(__dirname, path.dirname(CONFIG_PATH));
  var savepath = config.savepath;
  if (!path.isAbsolute(savepath)) savepath = path.join(conf_dir, savepath);
  console.log(`savepath: ${savepath}`);
  const fs = require('fs').promises;
  const result = await fs.readdir(savepath, async function(err, files){
    if (err){
      console.error("#---------- Acquisition of file list failed ----------");
      console.log(err);
      return;
    }
    const fileList = await files.filter(async function(file){
      return fs.statSync(create_fullpath(config.savepath,file)).isFile();
    })
    console.log("file list: " + fileList);
    return fileList;
  });
  return result;
}

const deleteAlert = async function (params) {
  var deleted = 0;
  if(params.filename == null || params.filename == ""){
    deleted = -1;
  } else {
    const basename = path.basename(params.filename);
    const filepath = create_fullpath(config.savepath, basename);

    const fs = require('fs').promises;
    deleted = await fs.unlink(filepath)
    .then(result=>{return 1})
    .catch(err => {return -1})
  }
  const result = {
    data: deleted
  }
  return result;

}

module.exports = {
  saveAlert,
  getAlert,
  deleteAlert
};
