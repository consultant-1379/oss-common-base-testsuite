import { User } from '../../modules/User.js';
import { Certificate } from '../../modules/Certificate.js';
import * as Constants from '../../modules/Constants.js';
import { group, check } from "k6";

export function certM() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

  let ossSecurityAdminName = Constants.NEW_USER + "_" + new Date().getTime();

  let userOssSecurityAdmin = new User(ossSecurityAdminName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL,
                         ["OSSSecurityAdmin"]);

  group("Use Case 1: NEGATIVE TEST - Get trusted certificates when microservice is down", function() {
    let jSessionId;

    //Step1 Login
    group("Log in as admin user", function() {
      jSessionId = soUser.login();
    });

    //Step2 Create new user
    group("Create a user with role OSSSecurityAdmin", function() {
      userOssSecurityAdmin.create(jSessionId, 200);
    });

    //Step3 Logout
    group("Logout as admin user", function() {
      soUser.logout(jSessionId);
    });

    //Step4 Login OSSSecurityAdmin
    group("Log in as OSSSecurityAdmin", function() {
      jSessionId = userOssSecurityAdmin.login();
    });

    //Step5 Get certificates
    group("Get certificates", function() {
      Certificate.getCertificates(jSessionId, Constants.GAS_URL, 503);
    });

    //Step6 Logut OSSSecurityAdmin
    group("Logout as OSSSecurityAdmin user", function() {
      userOssSecurityAdmin.logout(jSessionId);
    });

    //Step7 Login
    group("Log in as admin user", function() {
      jSessionId = soUser.login();
    });

    //Step8 Delete new user
    group("Delete new user", function() {
      userOssSecurityAdmin.delete(jSessionId);
    });

    //Step9 Logout
    group("Logout as admin user", function() {
      soUser.logout(jSessionId);
    });
  });
}
