import http from "k6/http";
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { group, check, sleep } from "k6";
import { Trend } from 'k6/metrics';

//export const getPwdPolicyAPIDuration = new Trend('Get Password Policy API Duration')
//export const setPwdPolicyAPIDuration = new Trend('Set Password Policy API Duration')

export const options = {
  insecureSkipTLSVerify: true,
}

export function rbac() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

  let newUser = new User(Constants.NEW_USER,
                       Constants.NEW_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL,
                       ["LogViewer"]);

  let thirdUser = new User("view-user",
                       Constants.NEW_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL,
                       ["LogViewer"]);

  group("Use Case 1: Attempt to create a new user by LogViewer user", function () {

    let jSessionId;

    // Step1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step2 Create new user
    group("Create a user with role LogViewer", function () {
      newUser.create(jSessionId);
    });

    // Step3 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });

    // Step4 Login
    group("Log in as LogViewer user", function () {
      jSessionId = newUser.login();
    });

    // Step5 Attempt to create another user
    group("Attempt to create another user", function () {
      thirdUser.create(jSessionId, 403);
    });

    // Step6 Logout
    group("Logout as LogViewer user", function () {
      newUser.logout();
    });

    // Step7 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step8 Delete new user
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });

    // Step9 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });
  });

  group("Use Case 2: Attempt to delete a user by LogViewer user", function () {

    let jSessionId;

    // Step1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step2 Create new user
    group("Create two users with LogViewer role", function () {
      newUser.create(jSessionId);
      thirdUser.create(jSessionId);
    });

    // Step3 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });

    // Step4 Login
    group("Log in as LogViewer user", function () {
      jSessionId = newUser.login();
    });

    // Step5 Attempt to delete another user
    group("Attempt to delete a user", function () {
      thirdUser.delete(jSessionId, 403);
    });

    // Step6 Logout
    group("Logout as LogViewer user", function () {
      newUser.logout();
    });

    // Step7 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step8 Delete new users
    group("Delete new users", function () {
      newUser.delete(jSessionId);
      thirdUser.delete(jSessionId);
    });

    // Step9 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });
  });

  group("Use Case 3: Change roles to LogViewer user", function () {

    let jSessionId;

    // Step1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step2 Create new user
    group("Create a user with role LogViewer", function () {
      newUser.create(jSessionId);
    });

    // Step3 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });

    // Step4 Login
    group("Log in as LogViewer user", function () {
      jSessionId = newUser.login();
    });

    // Step5 Attempt to create another user
    group("Attempt to create another user", function () {
      thirdUser.create(jSessionId, 403);
    });

    // Step6 Logout
    group("Logout as LogViewer user", function () {
      newUser.logout();
    });

    // Step7 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step8 Change roles to new user
    group("Change roles ", function () {
      let roles = newUser.getRoles();
      roles.push('OSSPortalAdmin');
      newUser.setRoles(roles);
      newUser.changeRoles(jSessionId);
    });

    // Step9 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });

    // Step10 Login
    group("Log in as new user", function () {
      jSessionId = newUser.login();
    });

    // Step11 Attempt to create another user
    group("Attempt to create another user", function () {
      thirdUser.create(jSessionId);
    });

    // Step12 Delete new users
    group("Delete new user", function () {
      thirdUser.delete(jSessionId);
    });

    // Step13 Logout
    group("Logout as new user", function () {
      newUser.logout();
    });

    // Step14 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    })

    // Step15 Delete new users
    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });

    // Step16 Logout
    group("Logout as admin user", function () {
      soUser.logout();
    });

  });
}

