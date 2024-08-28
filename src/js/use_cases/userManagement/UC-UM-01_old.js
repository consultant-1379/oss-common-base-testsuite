import { group, sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { vu, scenario } from 'k6/execution';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

// MAX CONCURRENT USERS (15), GET ALL USERS UNDER MASTER TENANTS

export const getAllUsersPerTenantPolicyAPIDuration = new Trend('Get All Users Inside a Tenant API Duration');

function generateArrayUsers(){
  let f = JSON.parse(open('../../../resources/data/concurrent_users.json')).users;
  return f;
}

const sharedUsers = new SharedArray('sharedUsers', generateArrayUsers);

const VUS = 10;

export function setupEnv() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
  let jSessionId;

  // Step1 Login
  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  //Step 2 Create Users
  group("Create new users", function () {
    create_user_loop(jSessionId, sharedUsers.slice(0,VUS));
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
  //return {data:jSessionIdArray};
}

export function teardownEnv(data) {
  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  // Step1 Login
  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  //Step 2 Delete Users
  group("Delete new users", function () {
    delete_user_loop(jSessionId, sharedUsers.slice(0,VUS));
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function getUsersTenantEnv(data) {

  let user = create_user(sharedUsers[vu.idInTest - 1]);
  let jSessionId;

  group("Use Case: Max number of concurrent users trying to get all users inside a tenant", function () {

      // Step1 Login
      group("Log in as new user", function () {
        jSessionId = user.login();
      });

      sleep(2);

      // Step2 Get Users
      group("Get all users inside specific Tenant and verify timing duration KPI", function () {
        let response = user.getUsers(jSessionId, 200, 50);
        console.log("NUMBER OF USERS RETRIEVED: " + response.json(`#`));
        getAllUsersPerTenantPolicyAPIDuration.add(response.timings.duration);
      });

      sleep(2);

      //Step 3 Logout
      group("Logout new user", function () {
        user.logout(jSessionId);
      });

      sleep(2);

  });

}
