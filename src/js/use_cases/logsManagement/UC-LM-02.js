import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';

let body = JSON.parse(open('../../../resources/data/log_viewer_body.json'));

export function checkLogsTransformer() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

  let jSessionId;
  let res;

  group("Use Case: Verify that Logplane names match the ones specified in configuration", function () {
      // Step1 Login
      group("Log in as admin user", function () {
        jSessionId = soUser.login();
      });

      // Step2 Check Logplane names matches
      group("Check Logplane names are retrieved", function () {
         res = soUser.get_logplane_names_logViewer(jSessionId);
      });

      // Step3 Check Logplane names matches
      group("Check Logplane named oss-logs", function () {
        check(res, {
          "Logplanes named oss-logs is present": (r) => r.json(`#(=="oss-logs")`)
        });
      });

      // Step4 Check Logplane names matches
      group("Check Logplane named oss-audit-logs", function () {
        check(res, {
          "Logplanes named oss-audit-logs is present": (r) => r.json(`#(=="oss-audit-logs")`)
        });
      });

      // Step5 Log out
      group("Log out as admin user", function () {
        soUser.logout(jSessionId);
      });
    });
}
