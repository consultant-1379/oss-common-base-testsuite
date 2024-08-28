import { group } from 'k6';
import { User } from '../../modules/User.js';
import { LogViewer } from '../../modules/LogViewer.js';
import * as Constants from '../../modules/Constants.js';
import { checkLogsSize } from '../../modules/Utils.js';

export function checkCNOM() {

let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

let body =
  {
    "source": {
      "sourceType": "aggregation",
      "method": "array",
      "sources":
      [
        {
          "sourceType": "elasticDateHistogramAggregation",
          "query": "(*)",
          "target": "*",
          "timeFilterField": "timestamp",
        },
      ],
    },
    "options": {
      "timeRange": {
        "start": 86400000,
      }
    },
  };

group("Use Case: Get logs", function () {

    let jsessionId;

    // Step1 Login
    group("Log in as admin user", function () {
      jsessionId = soUser.login();
    });

    // Step2 Get critical Logs
    group("Get Critical logs", function () {
      body['source']['sources'][0]['query']="(*) AND severity:Critical";
      let res = LogViewer.getLogs(jsessionId, body);
      checkLogsSize(res, `#.#`);
    });

    // Step3 Get info Logs
    group("Get Info logs", function () {
      body['source']['sources'][0]['query']="(*) AND severity:Warning&Info";
      let res = LogViewer.getLogs(jsessionId, body);
      checkLogsSize(res, `#.#`);
    });

    // Step4 Get all severity Logs
    group("Get all severity logs", function () {
      body['source']['sources'][0]['query']="(*)";
      let res = LogViewer.getLogs(jsessionId, body);
      checkLogsSize(res, `#.#`);
    });

    // Step5 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });
  });
}


