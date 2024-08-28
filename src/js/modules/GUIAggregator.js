import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class GUIAggregator {

  static getApps(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-meta/v1/apps";

    let res = http.get(url, params);

    check(res, {
        "Get Apps": (r) => r.status === 200
    });

    console.log("Get apps list result: " + res.status);
    return  res;
  }

  static getGroups(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-meta/v1/groups";

    let res = http.get(url, params);

    check(res, {
        "Get Groups": (r) => r.status === 200
    });

    console.log("Get groups list result: " + res.status);
    return  res;
  }

  static getComponents(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-meta/v1/components";

    let res = http.get(url, params);

    check(res, {
        "Get Components": (r) => r.status === 200
    });

    console.log("Get components list result: " + res.status);
    return  res;
  }

  static getImportMap(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-serve/v1/import-map";

    let res = http.get(url, params);

    check(res, {
        "Get Import Map": (r) => r.status === 200
    });

    console.log("Get import map result: " + res.status);
    return  res;
  }

  static getStaticAsset(jsessionId, staticAssetPath) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + staticAssetPath;
    console.log("Static asset URL: " + url);

    let res = http.get(url, params);

    check(res, {
        "Get Static Asset": (r) => r.status === 200
    });

    console.log("Get static asset result: " + res.status);
    return  res;
  }

  static getDocuments(jsessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*",
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let url = Constants.GAS_URL + "/help-meta/v1/documents";

    let res = http.get(url, params);

    check(res, {
      "Get Docs": (r) => r.status === 200
    });

    console.log("Get Docs List result: " + res.status);
    return  res;
  }
}
