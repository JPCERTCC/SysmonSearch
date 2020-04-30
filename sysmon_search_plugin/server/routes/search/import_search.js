const request = require('request');
import {conf as config} from '../../../conf.js';
const sprintf = require('sprintf-js').sprintf;

async function doRequest(options) {
  return new Promise(function (resolve, reject) {
    request(options, function (err, res, body) {
      if (!err && res.statusCode == 200) resolve(res.body);
      else reject(err);
    });
  });
}

async function importSearchKeywords(params) {
  console.log(params);
  //var url = 'http://localhost:56020' + params.part_url;
  var url = 'http://' + config.import_server_url + ':' + config.import_server_port + params.part_url;
  var formData = {
    file: {
      value: new Buffer.from(params.contents),
      options: {
        filename: params.filename,
        contentType: params.contenttype
      }
    }
  };
  console.log("#---------- request to STIX/IoC analyze server ----------");
  const req_str = sprintf(
    '{ url: \'%1$s\', formData: { file: { value: <...>, options: { filename: \'%2$s\', contentType: \'%3$s\' }  } } }',
    url, params.filename, params.contenttype
  );
  console.log(req_str);
  const requestOptions = {
    url: url,
    method: "POST",
    formData: formData,
    json: true
  };
  const result = await doRequest(requestOptions);
/*
  const result = await request.post({
      url: url, formData: formData
    }, 
    function(error, response) {
      console.log("#---------- response from STIX/IoC analyze server ----------");
      if (error) {
        console.error(util.inspect(error));
        return;
      } else {
        var res = {
          'status': response.statusCode,
          'message': response.statusMessage,
          'data': response.body
        };
        console.log(res);
        return res;
      }
    }
  );
*/
  console.log("#---------- response from STIX/IoC analyze server ----------");
  console.log(JSON.stringify(result));
  return result;
}

module.exports = importSearchKeywords;
