import http from "k6/http";
import { group, sleep, check } from "k6";
import { User } from "../../modules/User.js";
import { Dashboard } from "../../modules/Dashboard.js";
import * as Constants from "../../modules/Constants.js";

let baseDashboards = JSON.parse(open('../../../resources/data/base_dashboards.json')).dashboards;

export function CheckDashboardExistance_VerifyQueriesDefinedInTheDashboard() {
  let gasUser = new User(Constants.GAS_USER,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let baseDashboardIds = [];
  let allDashboardIds = [];
  let queries;

  for (let i = 0; i < baseDashboards.length; i++) {
    baseDashboardIds.push(baseDashboards[i].id);
  }

  group("Use Case 1: Checking Dashboards", function () {
    let jSessionId;

    //Step1 Login
    group("Login as gas user", function () {
      jSessionId = gasUser.login();
    });

    //Step2 Verify list of dashboards is not empty
    group("Verify List of Dashboards is not Empty", function () {
      allDashboardIds = Dashboard.verifyListOfDashboardNotEmpty(jSessionId);
    });

    //Step3 Check on dashboards
    group("Verify all Base Dashboards are in list", function () {
      check(allDashboardIds, {
        "Dashboard list should include all base dashboards": (r) => baseDashboardIds.every(v => r.includes(v)) == true
      });
    });

    // Step4 Logout
    group("Logout as gas user", function () {
      gasUser.logout(jSessionId);
    });
  });

  group("Use Case 2: Verifying the queries defined in base dashboards", function () {
    let jSessionId;

    // Step1 Login
    group("Login as gas user", function () {
      jSessionId = gasUser.login();
    });

    //Step2 Extract & verify the queries
    group("Extract and verify the queries", function () {
      queries = (Dashboard.extractQueriesDefinedInDashboard(jSessionId, baseDashboardIds));
      Dashboard.verifyQueriesDefinedInDashboard(jSessionId, queries);
    });

    // Step3 Logout
    group("Logout as gas user", function () {
      gasUser.logout(jSessionId);
    });
  });
}


