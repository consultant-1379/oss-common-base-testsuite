import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class LogViewer {

  static getDSTTraces(jsessionId, service, operation, traceOn = true) {

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let dst_url = Constants.SO_URL + `/distributed-trace/viewer/api/traces?limit=20&lookback=1h&service=`+ service + '&operation=' + operation;
    let res = http.get(dst_url, params);

    let resCode = 200;

    check(res, {
      ["Get DST traces status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("TRACE ON = " + traceOn);
    console.log("Get DST traces: " + res.status);

    if (traceOn == "true") {
      check(res, {
        ["Traces should contain " + operation + " info"]: (r) => r.body.toString().includes(operation)
      });
    }
    else {
      check(res, {
        ["Traces should not contain " + operation + " info"]: (r) => !r.body.toString().includes(operation)
      });
    }
  }

  static getLogs(jsessionId, body, resCode = 200) {

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let url = Constants.GAS_URL + "/log/viewer/api/v2/sources/query";
    let res = http.post(url, JSON.stringify(body), params);

    if(res.status === 404){
      console.log("calling endpoint sources-query");
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query";
      res = http.post(new_url, JSON.stringify(body), params);
      if(res.status === 422){
        let body_str = JSON.stringify(body);
        body_str = body_str.replace("\"source\":", "\"sourceModel\":");
        res = http.post(new_url, body_str, params);
      }
    }
    if(res.status === 422){
      let body_str = JSON.stringify(body);
      body_str = body_str.replace("\"source\":", "\"sourceModel\":");
      res = http.post(url, body_str, params);
    }

    let query = body['source']['sources'][0]['query'];
    let target = body['source']['sources'][0]['target'];

    check(res, {
      ["Get Logs query: " + query + " target: " + target + " status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("query: " + query + " target: " + target + " Get logs result: " + res.status);

    return res;
  }

  static getStatusOverview(jsessionId) {
    let status_url = Constants.GAS_URL + '/log/viewer/#status-overview';

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let request = http.get(status_url, params);
    console.log('Get status overview result: ' + request.status);

    check(request, {
      "Get status overview status should be 200": (r) => r.status === 200
    });

    return request;
  }

  static downloadMetrics(jsessionId, payload) {

    let url = Constants.GAS_URL + '/log/viewer/api/v2/sources/download';
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let request = http.post(url, payload, params);

    if(request.status === 404){
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query/download";
      request = http.post(new_url, payload, params);
    }

    console.log('Metrics download result: ' + request.status);

    check(request, {
      "Metrics download": (r) => r.status === 200
    });

    return request;
  }
}
