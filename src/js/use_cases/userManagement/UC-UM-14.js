import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';

export function checkLoginCookies() {

    let soUser = new User(Constants.GAS_USER,
                          Constants.GAS_USER_PWD,
                          Constants.TENANT_NAME,
                          Constants.GAS_URL);

    let jSessionId;

    group("Use Case 1: Verify that 'userName' cookie is properly set after login operation", function () {
        // Step1 Login
        group("Log in as admin user", function () {
          jSessionId = soUser.login();
        });

        // Step2 Check cookies
        group("Check userName cookie after login", function () {
          soUser.login_cookies(jSessionId);
        });
      });

    group("Use Case 2: Verify that 'userName' cookie and session are cleared after logout operation", function () {
        // Step1 Check cookies deletion
        group("Check userName cookie and session after logout", function () {
          soUser.logout_cookies(jSessionId);
        });
    });
}
