import { User } from '../../modules/User.js';
import { Certificate } from '../../modules/Certificate.js';
import * as Constants from '../../modules/Constants.js';
import { group, check } from "k6";

export function keyMgmt() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

  let ossSecurityAdminName = Constants.NEW_USER + "_" + new Date().getTime();

  let userOssSecurityAdmin = new User(ossSecurityAdminName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL,
                         ["System_SecurityAdministrator"]);

  let asymmetricKeyName = "asymmetrickKeyForTest";
  let keyRetrieved = false;

  group("Use Case: Manage asymmetric keys", function() {
    let jSessionId;

    //Step1 Login
    group("Log in as admin user", function() {
      jSessionId = soUser.login();
    });

    //Step2 Create new user
    group("Create a user with role System_SecurityAdministrator", function() {
      userOssSecurityAdmin.create(jSessionId, 200);
    });

    //Step3 Logout
    group("Logout as admin user", function() {
      soUser.logout(jSessionId);
    });

    //Step4 Login System_SecurityAdministrator
    group("Log in as System_SecurityAdministrator", function() {
      jSessionId = userOssSecurityAdmin.login();
    });

    //Step5 Create Asymmetric Key
    group("Create asymmetric Key", function() {
      Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, asymmetricKeyName);
    });

    //Step6 Get asymmetrickeys
    group("Get asymmetric keys", function () {
      let response = Certificate.asymmetrickeys(jSessionId, Constants.GAS_URL, 200);
      if (response.status === 200) {
        let keyList = JSON.parse(response.body);
	for(let i = 0; i < keyList.length; i++) {
          if (keyList[i].name == asymmetricKeyName) {
	    keyRetrieved = true;
	    break;
	  }
        }
      }
      check(keyRetrieved, {
        ["Asymmetric key correctly retrieved"]: (keyRetrieved) => (keyRetrieved === true)
      });
    });

    if (keyRetrieved) {
      //Step7 Remove asymmetric key
      group("Remove asymmetric key", function () {
        Certificate.removeAsymmetricKey(jSessionId, Constants.GAS_URL, asymmetricKeyName);
      });
    }

    //Step8 Logout System_SecurityAdministrator
    group("Logout as System_SecurityAdministrator user", function() {
      userOssSecurityAdmin.logout(jSessionId);
    });
  });
}


