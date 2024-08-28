import http from "k6/http";
import { group, sleep, check } from "k6";
import { User } from "../../modules/User.js";
import { Dashboard } from "../../modules/Dashboard.js";
import * as Constants from "../../modules/Constants.js";

export function CheckTestDashboard(dashboardName) {
  let gasUser = new User(Constants.GAS_USER,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let dashboardIds = [];
  let queries;

  group("Use Case: Checking dynamically configured dashboard", function () {
    let jSessionId;

    //Step1 Login
    group("Login as gas user", function () {
      jSessionId = gasUser.login();
    });

    //Step2 Verify list of dashboards is not empty
    group("Verify List of Dashboards is not Empty", function () {
      dashboardIds = Dashboard.verifyListOfDashboardNotEmpty(jSessionId);
    });

    //Step3 Verify custom dashboard  
    group("Check if custom dashboard is in list", function () {
      check(dashboardIds, {
        "Dashboard list should include custom dashboard": (r) => r.includes(dashboardName) 
      });
    });

    // Step4 Logout
    group("Logout as gas user", function () {
      gasUser.logout(jSessionId);
    });
  });
}


