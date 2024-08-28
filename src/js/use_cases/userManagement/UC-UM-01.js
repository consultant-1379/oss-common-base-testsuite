import { group } from 'k6';
import { Trend } from 'k6/metrics';
import { vu, scenario } from 'k6/execution';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

// MAX CONCURRENT USERS (10), GET ALL USERS UNDER MASTER TENANTS

export const getAllUsersPerTenantPolicyAPIDuration = new Trend('GetAllUsersInsideTenantAPIDuration');

const VUS = 10;

function getNewUser(name){
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

const currentDate = new Date().getTime();
const CONCURRENT_USERS_NAME = "concurrent_user_" + currentDate + "_";
let jSessionIdArray = [];
let dataArray = [];

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

  //Concurrent users performing operations in Use Cases
  //CREATE AND LOGIN CUNCURRENT USERS
  group("Create concurrent users with OSSPortalAdmin role", function () {
    //Concurrent users performing operations in Use Cases
    for (let i = 0; i < VUS; ++i){
      let user = getNewUser(CONCURRENT_USERS_NAME+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);

      //LOGIN of concurrent users
      jSessionIdArray[i] = newUser.login();
    }
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  dataArray[0] = jSessionIdArray;
  dataArray[1] = CONCURRENT_USERS_NAME;
  return dataArray;
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

  group("Delete new users with OSSPortalAdmin role", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[1]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function getUsersTenantEnv(data) {

  let iter = scenario.iterationInTest;
  let jSessionId = data[0][iter];
  //active concurrent users that are VUs
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Max number of concurrent users trying to get all users inside a tenant", function () {
    let response;

    group("Get all users inside specific Tenant and verify timing duration KPI", function () {
      response = newUser.getUsers(jSessionId, 200, 50);
        console.log("NUMBER OF USERS RETRIEVED: " + response.json(`#`));
        getAllUsersPerTenantPolicyAPIDuration.add(response.timings.duration);
    });

  });

}
