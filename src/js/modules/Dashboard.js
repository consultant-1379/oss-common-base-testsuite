import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class Dashboard {

  static verifyListOfDashboardNotEmpty(jsessionId) {
    const dashboardIds = [];

    let status_url = Constants.GAS_URL + "/log/viewer/api/v2/dashboards";

    let params = {
      headers: {
        "Content-Type": "application/json",
        Cookie: "JSESSIONID=" + jsessionId
      }
    };

    let res = http.get(status_url, params);

    check(res, {
      "Get all dashboards status should be 200": (r) => r.status === 200
    });

    console.log("Get All Dashboards result: " + res.status);
    console.log("Get All Dashboards response body: " + res.body);

    const body = JSON.parse(res.body);

    for (let i = 0; i < body.length; i++) {
      dashboardIds.push(body[i]._id);
    };

    check(dashboardIds, {
      "List of Dashboard should not be empty": dash => dash.length > 0
    });

    return dashboardIds;
  }

  static extractQueriesDefinedInDashboard(jsessionId, dashboardIds) {
    let allQueries = new Map();

    for (let dashboard in dashboardIds) {
      let status_url = Constants.GAS_URL + "/log/viewer/api/v2/dashboards/" + dashboardIds[dashboard] + "?full=true";
      let params = {
        headers: {
          "Content-Type": "application/json",
          Cookie: "JSESSIONID=" + jsessionId
        }
      };

      let res = http.get(status_url, params);

      check(res, {
        "Get dashboard status should be 200": (r) => r.status === 200
      });

      console.log("Get Dashboard " + dashboardIds[dashboard] + " result: " + res.status);
      console.log("Get Dashboard " + dashboardIds[dashboard] + " response body: " + res.body);

      const queries = new Map();

      const body = JSON.parse(res.body);

      for (let i = 0; i < body.tiles.length; i++) {
        let widget = body.tiles[i].widget;
        const innerqueries = [];
        for (let j = 0; j < widget.sources.length; j++) {
          let source = widget.sources[j].source;
          if (source.query) {
            innerqueries.push(source.query);
          }
        }
        queries.set(widget.title, innerqueries);
      }
      allQueries.set(dashboardIds[dashboard], queries);
    }

    return allQueries;
  }

  static verifyQueriesDefinedInDashboard(jsessionId, queries) {
    queries.forEach(function(value, key) {
      value.forEach(function(innerValue, innerkey) {
        for (let i = 0; i < innerValue.length; i++) {
          const queryWithEscapeCodesAndReplacedTimePeriod = encodeURIComponent(innerValue[i].replace("$timePeriod", "5m"));
          let status_url = Constants.GAS_URL + '/metrics/viewer/api/v1/query?query=' + queryWithEscapeCodesAndReplacedTimePeriod;

          let params = {
            headers: {
              'Content-Type': 'application/json',
              'Cookie': 'JSESSIONID=' + jsessionId,
            },
          };

          let res = http.get(status_url, params);

          console.log("Get Query " + queryWithEscapeCodesAndReplacedTimePeriod + " result: " + res.status);
          console.log("Get Query " + queryWithEscapeCodesAndReplacedTimePeriod + " response body: " + res.body);

          let body = JSON.parse(res.body);
          if (body.data.result.length == 0) {
            console.log(`WARNING: ${innerkey} in dashboard ${key} has no data`);
          }

          check(res, {
            "Query status should be 200": (r) => r.status === 200
          });
        }
      })
    })	  
  }
}
