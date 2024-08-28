import { group } from 'k6';
import { User } from '../../modules/User.js';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export function createTenant() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  let newUserName = "new_user_for_test";
  let newUser = new User(newUserName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  // We are intrested just to the Loggin Stack check and not in create, delete or login checks so in options file we have removed
  // "thresholds": {"checks": ["rate>0.99"]}
  // so even if the following checks are failing Use Case will not fail
  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Use Case: Create new User", function () {
    let response;
    group("Create new User", function () {
      response =  newUser.create(jSessionId);
    });
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}
