import { User } from '../../modules/User.js';
import { Certificate } from '../../modules/Certificate.js';
import * as Constants from '../../modules/Constants.js';
import { group } from "k6";


export function certM() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

  let newName = Constants.NEW_USER + "_" + new Date().getTime();

  let userLogViewer = new User(newName,
                          Constants.GAS_USER_PWD,
                          Constants.TENANT_NAME,
                          Constants.GAS_URL,
                          ["LogViewer"]);

  group("Use Case : NEGATIVE TEST - Get asymmetric-keys and trusted certificates when logged in as LogViewer user", function () {
    let jSessionId;

    // Step1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step2 Create new user
    group("Create a user with role LogViewer", function () {
      userLogViewer.create(jSessionId, 200);
    });

    // Step3 Logout
    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });

    // Step4 Login
    group("Log in as LogViewer user", function () {
      jSessionId = userLogViewer.login();
    })

    // Step5 Attempt to get asymmetrickeys
    group("Get asymmetrickeys from LogViewer", function () {
      Certificate.asymmetrickeys(jSessionId, Constants.GAS_URL, 403);
    });

    // Step6 Attempt to get certificates
    group("Get certificates from LogViewer", function () {
      Certificate.getCertificates(jSessionId, Constants.GAS_URL, 403);
    });

    // Step7 Logout
    group("Logout as LogViewer user", function () {
      userLogViewer.logout(jSessionId);
    });

    // Step8 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step9 Delete new user
    group("Delete new user", function () {
      userLogViewer.delete(jSessionId);
    });

    // Step10 Logout
    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });
}

