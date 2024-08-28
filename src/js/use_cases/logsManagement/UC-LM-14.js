import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';

let body = JSON.parse(open('../../../resources/data/log_viewer_body.json'));

export function checkLogEnries(prefix, entriesPerPod, replicas) {

  let gasUser = new User(Constants.GAS_USER,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let jSessionId;

  group("Use Case: Verify Log Entries from Log Viewer", function () {

    // Step1 Login
    group("Log in as admin user", function () {
      jSessionId = gasUser.login();
    });

    // Step2 Check Logs are present
    group("Check Log Entries", function () {
      let start_date = new Date( Date.now() - 1000 * 3600); //1h ago
      let end_date = new Date( Date.now() ); //now

      body['source']['sources'][0]['query'] = prefix;
      body['options']['timeRange']['start'] = start_date.toISOString();
      body['options']['timeRange']['end'] = end_date.toISOString();

      let res = gasUser.get_logs_logViewer(jSessionId, body);
      console.log(JSON.stringify(res.body));

      let length = res.json(`#.#`);

      let count = Math.trunc(res.json(`#.#.count`));
      console.log("result count: " + count);

      let entriesExpected = entriesPerPod*replicas;  	    

      if (entriesExpected != 0) {	    
        check(count, {
          ["The number of log entries should be greater or equal to " + entriesExpected]: (count) => count >= entriesExpected,
        });
      }
    });

    // Step3 Log out
    group("Log out as admin user", function () {
      gasUser.logout(jSessionId);
    });
  });
}
