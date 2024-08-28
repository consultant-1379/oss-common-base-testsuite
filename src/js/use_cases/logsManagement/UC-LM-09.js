import { group } from 'k6';
import { User } from '../../modules/User.js';
import { LogViewer } from '../../modules/LogViewer.js';
import * as Constants from '../../modules/Constants.js';
import { checkLogsSize } from '../../modules/Utils.js';


export function LogViewer_System_Application_OperatorRole() {

  let gasUser = new User(Constants.GAS_USER,
                    Constants.GAS_USER_PWD,
                    Constants.TENANT_NAME,
                    Constants.GAS_URL);

  let LogViewer_System_Application_OperatorRoleName = Constants.NEW_USER + "_" + new Date().getTime();

  let userLogViewer_System_Application_OperatorRole = new User(LogViewer_System_Application_OperatorRoleName,
                                                      Constants.GAS_USER_PWD,
                                                      Constants.TENANT_NAME,
                                                      Constants.GAS_URL,
                                                      ["LogViewer_System_Application_Operator"]);

  let body=
    {
      "source": {
        "sourceType": "aggregation",
        "method": "array",
        "sources": [{
          "sourceType": "elasticRequestBodySearch",
          "query": "(*)",
          "target": "*",
          "sortOrder": "desc",
        }],
      },
      "options": {
        "timeRange": {
          "start": 86400000,
        },
        "pagination": {
          "currentPage": 1,
          "numEntries": 20,
          "sortMode": "desc",
          "sortAttr": "timestamp",
          "filter": "",
          "filterLabel": ""
        }
      },
    }

  group("Use Case: LogViewer_System_Application_Operator role able to retrieve EIAP log-planes but NOT -app log-planes", function() {
    let gas_jSessionId;
    let jSessionId;

    //Step1 Login as Admin user
    group("Login as Admin user and Get session ID", function() {
      gas_jSessionId = gasUser.login();
    });

    //Step2 Create new user with LogViewer_System_Application_Operator Role
    group("Create a user with role LogViewer_System_Application_OperatorRole", function() {
      userLogViewer_System_Application_OperatorRole.create(gas_jSessionId, 200);
    });

    //Step3 Login as LogViewer_System_Application_OperatorRole user
    group("Log in as LogViewer_System_Application_OperatorRole", function() {
      jSessionId = userLogViewer_System_Application_OperatorRole.login();
    });

    //Step4 Get logs of the EIAP log-planes via CNOM API endpoint
    group("Get EIAP log-plane logs", function () {
      body['source']['sources'][0]['target']="oss-audit-logs*,oss-debug-logs*,oss-logs*";
      let res = LogViewer.getLogs(jSessionId, body);
      checkLogsSize(res, `#.pageData.#`);
    });

    //Step5 Get logs of the R-app log-planes via CNOM API endpoint
    group("Get R-app log-planes should fail with access denied", function () {
      body['source']['sources'][0]['target']="rapps-logs*";
      LogViewer.getLogs(jSessionId, body, 500);
    });

    //Step6 Delete LogViewer_System_Application_OperatorRole user
    group("Delete LogViewer_System_Application_OperatorRole user", function() {
      userLogViewer_System_Application_OperatorRole.delete(gas_jSessionId);
    });

    //Step7 Logout from Admin user
    group("Logout as admin user", function() {
      gasUser.logout(gas_jSessionId);
    });
  });

}
