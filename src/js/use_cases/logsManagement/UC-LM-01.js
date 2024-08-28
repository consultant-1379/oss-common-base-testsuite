import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';

let body = JSON.parse(open('../../../resources/data/log_viewer_body.json'));

export function checkLogsHousekeeping() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

  let jSessionId;

 /*  group("Use Case: Verify that Logs are not deleted before retention time", function () {
      // Step1 Login
      group("Log in as admin user", function () {
        jSessionId = soUser.login();
      });

      // Step2 Check Logs are deleted
      group("Check Logs older then retention time have been deleted", function () {
        let start_date = new Date( Date.now() - 1000 * 1800 ); //30min ago
        //let start_date = new Date( Date.now() - 1000 * 180 ); //3min ago
        //let end_date = new Date( Date.now() - 1000 * 120 ); //2min ago
        let end_date = new Date( Date.now() - 1000 * 900 ); //15min ago
        body['source']['sources'][0]['target'] = "eo*";
        body['options']['timeRange']['start'] = start_date.toISOString();
        body['options']['timeRange']['end'] = end_date.toISOString();
        let res = soUser.get_logs_logViewer(jSessionId, body);
        check(res, {
          "Logs empty": (r) => res.json(`#.#`) == 0 //#.# gives the number of items (length) of nested array
        });
      });

      // Step3 Log out
      group("Log out as admin user", function () {
        soUser.logout(jSessionId);
      });
    }); */

    group("Use Case: Verify that Logs are present before retention time is reached", function () {

      // Step1 Login
      group("Log in as admin user", function () {
        jSessionId = soUser.login();
      });

      // Step2 Check Logs are present
      group("Check Logs are present when retention time is not reached", function () {
        let start_date = new Date( Date.now() - 1000 * 3600); //1h ago
        let end_date = new Date( Date.now() ); //now
        //body['source']['sources'][0]['target'] = "eo*";
        body['source']['sources'][0]['target'] = "oss-logs*";
        body['options']['timeRange']['start'] = start_date.toISOString();
        body['options']['timeRange']['end'] = end_date.toISOString();

        let res = soUser.get_logs_logViewer(jSessionId, body);
        console.log(JSON.stringify(res.body));

        let length = res.json(`#.#`);

        if (length < 1){
          console.log("retrieving another attempt");
          sleep(10);
          res = soUser.get_logs_logViewer(jSessionId, body);
          console.log(JSON.stringify(res.body));
          length = res.json(`#.#`);
        }

        let count = Math.trunc(res.json(`#.#.count`));
        let logplaneName = res.json(`#.#.fieldValue`);
        console.log("result #.# length: " + length);
        console.log("result count: " + count);
        console.log("logplanename: " + logplaneName);

        check(res, {
          "Logs not empty": (r) => length > 0,
          "Logs entries count not empty": (r) => count > 0,
          "Logplanes named oss-logs is present": (r) => logplaneName == "oss-logs"
        });

      });

      // Step3 Log out
      group("Log out as admin user", function () {
        soUser.logout(jSessionId);
      });
    });
}
