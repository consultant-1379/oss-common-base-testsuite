import http from 'k6/http';
import { group } from 'k6';
import { User } from '../../modules/User.js';
import { LogViewer } from '../../modules/LogViewer.js';
import * as Constants from '../../modules/Constants.js';

export function checkStatus() {

    let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

    group("Use Case 1: Test status-overview", function () {

    let jSessionId;

   // Step-1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

   // Step-2 Get status-overview
    group("Get status-overview", function () {
      LogViewer.getStatusOverview(jSessionId, Constants.GAS_URL, 200);
    });

   // Step-3 Logout
    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });
}
