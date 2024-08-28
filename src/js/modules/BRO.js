import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class BRO {

  static getBroHealthCheck(jsessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*",
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let url = Constants.GAS_URL + "/backup-restore/v1/health";

    let res = http.get(url, params);

    check(res, {
      "Get BRO Healthcheck should be 200": (r) => r.status === 200
    });

    console.log("Get BRO Healthcheck result: " + res.status + " with response body: " + res.body);
    return  res;
  }
}
