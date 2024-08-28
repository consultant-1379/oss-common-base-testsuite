import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { LogViewer } from '../../modules/LogViewer.js';
import * as Constants from '../../modules/Constants.js';

let body = JSON.parse(open('../../../resources/data/log_viewer_body.json'));

export function checkDSTTraces(traceOn, service, operation) {

  let gasUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

  let jSessionId;
  let res;

  group("Use Case: Verify DST traces", function () {
      // Step1 Login
      group("Log in as gas user", function () {
        jSessionId = gasUser.login();
      });

      // Step3 Check DST traces 
      group("Check DST traces", function () {
        LogViewer.getDSTTraces(jSessionId, service, operation, traceOn);
      });

      // Step3 Log out
      group("Log out as gas user", function () {
        gasUser.logout(jSessionId);
      });
    });
}

