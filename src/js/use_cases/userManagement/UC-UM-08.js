import { group } from 'k6';
import { User } from '../../modules/User.js';
import { check } from 'k6';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export function deleteTenant(result) {

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

  group("Check Logging Stack test result", function () {
    console.log("RESULT = " + result);
    check(result, {
      "Logging Stack test result should be 200": (result) => result == 200
    },
    // We are intrested just to the Loggin Stack check and not in create, delete or login checks so in options file we have removed
    // "thresholds": {"checks": ["rate>0.99"]} and we have added a tag just for Check Logging Stack
    // So Use Case will fail only if Check Logging Stack fails
    {logginStackTag: 'logging stack'});
  });

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Use Case: Delete new User", function () {
    let response;
    group("Delete new User", function () {

      response =  newUser.delete(jSessionId);
    });
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}
