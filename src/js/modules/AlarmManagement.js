import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export class AlarmManagement {

  static getScrapePools(jSessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jSessionId,
      },
    };

    let scrape_url = Constants.GAS_URL + `/metrics/viewer/api/v1/targets?state=active`;
    let res = http.get(scrape_url, params);

    check(res, {
      "Get scrape pools status should be 200": (r) => r.status === 200
    });

    if (res.status === 200) {
      let pools = JSON.parse(res.body);

      let allPoolsUp = true;
      for (let i = 0; i < pools.data.activeTargets.length; i++) {
        let target = pools.data.activeTargets[i];
	if (!target.discoveredLabels.__address__.startsWith(':')) {
	  if (target.health != "up") {
	    console.log(`TARGET ${target.health}: ` + target.scrapePool);
	    if (target.labels.pod_name != undefined) {
              console.log("POD NAME: " + target.labels.pod_name);
            }
	    else if (target.discoveredLabels.__meta_kubernetes_pod_name != undefined) {
	      console.log("POD NAME: " + target.discoveredLabels.__meta_kubernetes_pod_name);
            }
	    allPoolsUp = false;
	  }
	}
	else {
	  console.log(`WARNING: wrong address format ${target.discoveredLabels.__address__}`);
          if (target.labels.pod_name != undefined) {
            console.log("POD NAME: " + target.labels.pod_name);
          }
          else if (target.discoveredLabels.__meta_kubernetes_pod_name != undefined) {
            console.log("POD NAME: " + target.discoveredLabels.__meta_kubernetes_pod_name);
          }
	}
      }

      check(allPoolsUp, {
        "All scrape pools should be up": (r) => r === true
      });
    }
  }

  static getAlarms(jSessionId, payload) {

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jSessionId,
      },
    };

    let alarm_url = Constants.GAS_URL + `/log/viewer/api/v2/sources-query/download?filetype=csv`;

    let res = http.post(alarm_url, payload, params);

    console.log("Get alarms result: " + res.status);	  

    if (res.status === 404){
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query/download";
      res = http.post(new_url, payload, params);
    } 

    let resCode = 200;

    check(res, {
      ["Get alarms status should be " + resCode]: (r) => r.status === resCode
    });

    return res;
  }
}
