import { User } from '../../modules/User.js';
import { Certificate } from '../../modules/Certificate.js';
import * as Constants from '../../modules/Constants.js';
import { group } from "k6";

export function certM() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

  let ossPortalAdminName = Constants.NEW_USER + "_" + new Date().getTime();

  let userOssPortalAdmin = new User(ossPortalAdminName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL,
                         ["OSSPortalAdmin"]);

  group("Use Case1: OSSPortalAdmin [security viewer] able to get trusted certificates lists including their content", function() {
    let jSessionID;

    // Step1 Login
    group("Log in as admin user", function() {
        jSessionID = soUser.login()
    });

    // Step2 Create new user
    group("Create a user with role OSSPortalAdmin", function() {
      userOssPortalAdmin.create(jSessionID, 200);
    });

    //Step3 Logout
    group("Logout as admin user", function() {
        soUser.logout(jSessionID);
    });

    //Step4 Login
    group("Log in as OSSPortalAdmin", function() {
        jSessionID = userOssPortalAdmin.login();
    });

    //Step5 Attempt to get certificates
    group("Get certificates from OSSPortalAdmin", function() {
        Certificate.getCertificates(jSessionID, Constants.GAS_URL, 200);
    });

      // Step6 Logout
    group("Logout as OSSPortalAdmin user", function () {
      userOssPortalAdmin.logout(jSessionID);
    });

    // Step7 Login
    group("Log in as admin user", function () {
      jSessionID = soUser.login();
    });

    // Step8 Delete new user
    group("Delete new user", function () {
      userOssPortalAdmin.delete(jSessionID);
    });

    // Step9 Logout
    group("Logout as admin user", function () {
      soUser.logout(jSessionID);
    });
  });

}

