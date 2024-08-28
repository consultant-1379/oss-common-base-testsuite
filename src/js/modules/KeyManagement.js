import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class KeyManagement {

  static storeCredentials(jSessionId) {
    let url = Constants.GAS_URL + `/v1/configuration/credentials`;

    let payload = JSON.stringify({
      "credentialKey": "my-service/test-store",
      "credentialValue": Constants.GAS_USER_PWD
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jSessionId,
      },
    };

    let request = http.post(url, payload, params);
    console.log("Response "  + JSON.stringify(request.body));
    console.log("Store credentials "  + request.status);

    let resCode = 201;

    check(request, {
      ['Credential store status should be ' + resCode]: (r) => r.status === resCode,
    });

    const elem = request.json();
    let credentialReference = elem['credentialReference'];

    return credentialReference;
  }

  static deleteCredentials(jSessionId, credentialReference) {
    let url = Constants.GAS_URL + `/v1/configuration/credentials?credentialReference=${credentialReference}`;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jSessionId,
      },
    };

    let request = http.del(url, null, params);
    console.log("Delete credentials "  + request.status);

    let resCode = 204;
    check(request, {
      ['Delete credentials status should be ' + resCode]: (r) => r.status === resCode,
    });
  }

  static updateCredentials(jSessionId, credentialReference) {
    let url = Constants.GAS_URL + `/v1/configuration/credentials?credentialReference=${credentialReference}`;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jSessionId,
      },
    };

    let payload = JSON.stringify({
      "credentialValue": "Ericsson998$!!"
    });

    let request = http.put(url, payload, params);
    console.log("Update credentials "  + request.status);

    let resCode = 204;
    check(request, {
      ['Update credentials status should be ' + resCode]: (r) => r.status === resCode,
    });
  }
}

