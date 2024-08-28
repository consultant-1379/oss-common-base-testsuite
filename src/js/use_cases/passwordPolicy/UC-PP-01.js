import http from "k6/http";
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';
import { group, check, sleep } from "k6";
import { Trend } from 'k6/metrics';
import { create_user } from '../../modules/Utils.js';

export const getPwdPolicyAPIDuration = new Trend('Get_Password_Policy_API_Duration')
export const setPwdPolicyAPIDuration = new Trend('Set_Password_Policy_API_Duration')
export const deletePwdPolicyAPIDuration = new Trend('Delete_Password_Policy_API_Duration')
export const resetPasswordAPIDuration = new Trend('Reset_Password_API_Duration')

const MAX_USERS = 10;

function getNewUser(name) {
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

let gasUser = new User(Constants.GAS_USER,
                       Constants.GAS_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

const USER_NAME = "user_client_passpolicy_" + new Date().getTime() + "_";

export function setupEnv() {
  let jSessionId;
  let userArray = [];

  group("Log in as admin user", function () {
    jSessionId = gasUser.login();
  });

  for (let i = 1; i < MAX_USERS; i++) {
    let user = getNewUser(USER_NAME + i);
    let newUser = create_user(user);
    newUser.create(jSessionId);
    //LOGIN of concurrent users
    newUser.login();
    userArray[i] = newUser;
  }

  return { jSessionId: jSessionId, userArray: userArray };
}

export function teardownEnv(data) {
  let jSessionId = data.jSessionId;
  let userArray = data.userArray;

  for (let i = 1; i < MAX_USERS; i++) {
    let user = Object.assign(new User(), userArray[i]);
    user.delete(jSessionId);
  }

  group("Logout as admin user", function () {
    gasUser.logout(jSessionId);
  });
}

export function passwordPolicyEnv(data) {

  let newUser = new User(Constants.NEW_USER,
                       Constants.NEW_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

  let minLength = 12
  let upperCase = 1
  let lowerCase = 1
  let pwdHistory = 8
  let userId;
  let jSessionId = data.jSessionId;

  group("Use Case 1: Setting password policies for a tenant", function () {

    // Step1 Configure password policies
    group("Configure password policies for the tenant", function () {
      let request = gasUser.setPasswordPolicy(jSessionId, upperCase, lowerCase, minLength);
      setPwdPolicyAPIDuration.add(request.timings.duration);
    });

    // Step2 Verify password policies
    group("Verify that password policies retrieved are the same as the configured", function () {
      let request = gasUser.getPasswordPolicy();
      getPwdPolicyAPIDuration.add(request.timings.duration);

      let splitString = request.body.toString().split(/,|;|:| /);
      splitString.forEach(function(elem){
        if (elem.includes('length')) {
          let len = elem.split('(')[1].slice(0, -1);
          check(len, {
            ["minimum length should be " + minLength]: (len) => len === minLength.toString()
          });
        }
        if (elem.includes('upperCase')) {
          let upCase = elem.split('(')[1].slice(0, -1);
          check(upCase, {
            ["upperCase should be " + upperCase]: (upCase) => upCase === upperCase.toString()
          });
        }
        if (elem.includes('lowerCase')) {
          let lowCase = elem.split('(')[1].slice(0, -1);
          check(lowCase, {
            ["upperCase should be " + lowerCase]: (lowCase) => lowCase === lowerCase.toString()
          });
        }
      })
    });
  });

  group("Use Case 2: Verify password policies in user creation for a tenant; positive", function () {

    // Step1 Configure password policies
    group("Configure password policies for the tenant", function () {
      let request = gasUser.setPasswordPolicy(jSessionId, upperCase, lowerCase, minLength);
      setPwdPolicyAPIDuration.add(request.timings.duration);
    });

    // Step2 Create new user
    group("Create a new user “app-user” with password according to password policies previously configured", function () {
      newUser.create(jSessionId);
      sleep(2);
    });

    // Step3 Delete new user
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });
  });

  group("Use Case 3: Verify password policies in user creation for a tenant; negative", function () {

    // Step1 Configure password policies
    group("Configure password policies for the tenant", function () {
      let request = gasUser.setPasswordPolicy(jSessionId, upperCase, lowerCase, minLength);
      setPwdPolicyAPIDuration.add(request.timings.duration);
    });

    // Step2 Create new user
    group("Create a new user “app-user” with password discording to password policies previously configured", function () {
      newUser.setPassword("ericsson");
      newUser.create(jSessionId, 400);
    });
  });

  group("Use Case 4: delete password policies for the user app-user", function () {

    // Step1 Configure password policies
    group("Delete password policies: Minimum Length, Uppercase Characters, Lowercase Characters", function () {
      let request = gasUser.setPasswordPolicy(jSessionId);
      deletePwdPolicyAPIDuration.add(request.timings.duration);
    });

    // Step2 Create new user
    group("Create a new user app-user with password not according to password policies", function () {
      newUser.setPassword("ericsson1!");
      newUser.create(jSessionId);
    });

    // Step3 Delete new user
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });
  });

  group("Use Case 5: Verify password policies during change password", function () {

    // Step1 Create new user
    group("Create a new user app-user", function () {
      newUser.create(jSessionId);
      sleep(1);
    });

    // Step2 Change password policies
    group("Modify password policy: Minimum Length for the tenant", function () {
      let request = gasUser.setPasswordPolicy(jSessionId, upperCase, lowerCase, minLength);
      setPwdPolicyAPIDuration.add(request.timings.duration);
    });

    // Step3 Change password to user app-user
    group("Modify password for user app-user discording to passwd policy previously configured", function () {
      userId = newUser.getUserId(jSessionId);
      newUser.setPassword("Ericsson3!");
      let request = newUser.changePassword(jSessionId, userId, 400);
      //resetPasswordAPIDuration.add(request.timings.duration);
    });

    newUser.setPassword("Newericsson123!");

    // Step4 Delete new user
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });
  });

  group("Use Case 6: The system MUST prohibit the re-use of a password", function () {

    let firstPwd = newUser.getPassword();

    // Step1 Disable BFP
    group("Disable BFP", function () {
      let bfProtection = new BFProtection(Constants.GAS_URL, Constants.TENANT_NAME);
      bfProtection.setBruteForceProtected(false);
      bfProtection.setBFProtection(jSessionId);
    });

    // Step2 Create new user
    group("Create a new user app-user", function () {
      newUser.create(jSessionId);
    });

    // Step3 Configure password policies
    group("Configure password policies for the tenant", function () {
      let request = gasUser.setPasswordPolicy(jSessionId, upperCase, lowerCase, minLength, pwdHistory);
      setPwdPolicyAPIDuration.add(request.timings.duration);
    });

    userId = newUser.getUserId(jSessionId);
    // Step4 Change password to user app-user
    for (var i = 0; i < pwdHistory; i++) {
      let groupName = `Set a new password for user app-user: ${i}`;
      group(groupName, function () {
        let newPassword = `Perseverance${i}!`;
        newUser.setPassword(newPassword);
        let request = newUser.changePassword(jSessionId, userId);
        //resetPasswordAPIDuration.add(request.timings.duration);
      });

      let resCode = 400;
      if (i == pwdHistory-1) {
        resCode = 204;
       }

      groupName = `Try to set the original password to user app-user: ${i}`;
      // Step5 Reset password
      group(groupName, function () {
        newUser.setPassword(firstPwd);
        let request = newUser.changePassword(jSessionId, userId, resCode);
        //resetPasswordAPIDuration.add(request.timings.duration);
      });
    }

    // Step6 Delete new user
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });
  });
}

