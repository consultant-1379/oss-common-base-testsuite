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
  let certName = "mycertificatefortest";

  group("Use Case 1: Create a new certificate", function() {
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

    //Step5 Create new certificate
    group("Create certificate", function() {
      Certificate.create(jSessionId, Constants.GAS_URL, certName);
    });

    //Step6 Logut OSSSecurityAdmin
    group("Logout as OSSSecurityAdmin user", function() {
      userOssSecurityAdmin.logout(jSessionId);
    });
  });

  group("Use Case 2: Remove a certificate", function() {
    let jSessionId;
    let certificates;

    //Step1 Login OSSSecurityAdmin
    group("Log in as OSSSecurityAdmin", function() {
      jSessionId = userOssSecurityAdmin.login();
    });

    //Step2 Get certificates
    group("Get certificates", function() {
      certificates = Certificate.getCertificates(jSessionId, Constants.GAS_URL);
    });

    if (certificates != null) {
      let certList = JSON.parse(certificates.body);
      for (let i = 0; i < certList.length; i++) {
	let cert = certList[i];
	if (cert.name == certName) {
          //Step3 Remove certificate
          group("Remove certificate", function() {
            Certificate.remove(jSessionId, certName, Constants.GAS_URL);
          });
	  break;
        }
      }
    }

    //Step4 Logut OSSSecurityAdmin
    group("Logout as OSSSecurityAdmin user", function() {
      userOssSecurityAdmin.logout(jSessionId);
    });

    //Step5 Login
    group("Log in as admin user", function() {
      jSessionId = soUser.login();
    });

    //Step6 Delete new user
    group("Delete new user", function() {
      userOssSecurityAdmin.delete(jSessionId);
    });

    //Step7 Logout
    group("Logout as admin user", function() {
      soUser.logout(jSessionId);
    });
  });
}


