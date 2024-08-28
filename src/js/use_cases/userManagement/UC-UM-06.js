import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { SharedArray } from 'k6/data';
import { vu, scenario, exec, test } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

export const createUserPolicyAPIDurationCuncurrentUser = new Trend('Create_User_API_Duration_Cuncurrent_Users');
export const getUsersPolicyAPIDurationCuncurrentUser = new Trend('Get_Users_API_Duration_Cuncurrent_Users');
export const updateUserPolicyAPIDurationCuncurrentUser = new Trend('Update_User_API_Duration_Cuncurrent_Users');
export const deleteUserPolicyAPIDurationCuncurrentUser = new Trend('Delete_User_API_Duration_Cuncurrent_Users');
export const filterUserPolicyAPIDurationCuncurrentUser = new Trend('Filter_User_API_Duration_Cuncurrent_Users');
export const getRolesPolicyAPIDurationCuncurrentUser = new Trend('Get_Roles_API_Duration_Cuncurrent_Users');
export const getUserByNamePolicyAPIDurationCuncurrentUser = new Trend('Get_User_By_Name_API_Duration_Cuncurrent_Users');
export const resetPasswordPolicyAPIDurationCuncurrentUser = new Trend('Reset_Password_API_Duration_Cuncurrent_Users');

// MAX CONCURRENT USERS VUS, KPIs FOR USER MANAGEMENT
// LOAD FACTOR:
// Y USERS PRE-POPULATED IN DB
// X=VUS USERS FOR CONCURRENCY
// 80 NEW USERS CREATED TO BE USED AND THEN REMOVED BY USE CASES

function getNewUser(name){
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

const currentDate = new Date().getTime();
const MAX_USERS_IN_DB = 1000;
//NAME OF USERS TO LOAD DB
const USERS_NAME = "a_test_" + currentDate + "_";
//NAME OF CONCURRENT USERS PERFORMING USE CASES
const CONCURRENT_USERS_NAME = "concurrent_user_" + currentDate + "_";
//NAME OF USERS TO BE MODIFIED DURING USE CASES
const USERS_NAME_TO_MODIFY = "usermgt_kpis_" + currentDate + "_";
const USERS_NAME_TO_MODIFY_V = "v_usermgt_kpis_" + currentDate + "_";
//NAME OF USERS TO BE CREATED DURING USE CASES
const USERS_NAME_CREATE= "create_user_" + currentDate + "_";

//NEEDED TO GET VALUE OF VUS IN OPTIONS FILE
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/userManagement/UC-UM-06.options.json'));
  return new Array(f);
}

const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);
const VUS = sharedOptionsFile[0].scenarios.concurrent_users_kpi_create.vus;

let jSessionIdArray = [];
let dataArray = [];

export function setupEnv() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
  let jSessionId;


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

  group("Create Users to load DB", function () {
    for (let i = 0; i < MAX_USERS_IN_DB; ++i){
      let user = getNewUser(USERS_NAME+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);
    }
  });

  //Users to be modified or deleted during Use Cases
  group("Create additional Users to be modified or deleted during Use Cases", function () {
    for (let i = 0; i < 3*VUS; ++i){
      let user = getNewUser(USERS_NAME_TO_MODIFY+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);
    }

    for (let i = 0; i < VUS; ++i){
      let user = getNewUser(USERS_NAME_TO_MODIFY_V+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  dataArray[0] = jSessionIdArray;
  dataArray[1] = CONCURRENT_USERS_NAME;
  dataArray[2] = USERS_NAME_TO_MODIFY;
  dataArray[3] = USERS_NAME_TO_MODIFY_V;
  dataArray[4] = USERS_NAME;
  dataArray[5] = USERS_NAME_CREATE;

  return dataArray;
}

export function teardownEnv(data) {

 // console.log("TEARDOWN - JSESSION ARRAY: " + JSON.stringify(data));
  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

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

  group("Delete users to modify", function () {
    for (let i = 0; i < 3*VUS; ++i) {
      let user = getNewUser(data[2]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Delete users to load DB", function () {
    for (let i = 0; i < MAX_USERS_IN_DB; ++i) {
      let user = getNewUser(data[4]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Delete users created in Create Use Case", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[5]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function usermgmtKpiEnvCreate(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];
  let user = getNewUser(data[5]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Create new user and Verify KPIs", function () {
    let response;

    group("Cuncurrent Users - Create new user", function () {
      response = newUser.create(jSessionId);
    });

    group("Cuncurrent Users - Verify create user KPI", function () {
        createUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });

}

export function usermgmtKpiEnvUpdate(data) {
  let iter = scenario.iterationInTest;
  //active session for concurrent users that are VUs
  let jSessionId = data[0][iter];

  group("Use Case: Cuncurrent Users - Update new user name and Verify KPIs", function () {
    let response;

    //Getting users to be modified from 0 to VUS
    group("Cuncurrent Users - Update new user firstName", function () {
      let user = getNewUser(data[2]+iter);
      let newUser = create_user(user);
      newUser.firstName=newUser.firstName + "_updated"
      console.log("firstName name to update: " + newUser.firstName);
      response = newUser.update(jSessionId);
    });

    group("Cuncurrent Users - Verify updated user KPI", function () {
      updateUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvFilter(data) {
  let iter = scenario.iterationInTest;
  let jSessionId = data[0][iter];
  //active concurrent users that are VUs
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Search/Filter new user by attributes", function () {
    let response;

    //Getting users to be modified from VUS to 2*VUS
    let index = iter + VUS;
    let userNameToFilter = data[2] + index;
    group("Cuncurrent Users - Filter user by attributes", function () {
      let attributes = `?&search=(username==${userNameToFilter};tenantname==${Constants.TENANT_NAME};status==ENABLED)`
      response = newUser.filterUsers(jSessionId, attributes);
      let filtered_length = response.json(`#`);
      let filtered_user_name = response.json(`#.username`);

      check(response, {
        ["Filtered user is not empty"]: (r) => filtered_length > 0,
        [`Filtered user should have username ${userNameToFilter}`]: (r) => filtered_user_name == userNameToFilter
      });
      console.log("Searched user has length: " + filtered_length);
      console.log("Searched user has username: " + filtered_user_name);
    });

    group("Cuncurrent Users - Verify Search/Filter user by attributes KPI", function () {
      filterUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetAll(data) {

  let iter = scenario.iterationInTest;
  let jSessionId = data[0][iter];
  //active concurrent users that are VUs
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Get users under Tenant using limit parameter", function () {
    let response;

    group("Cuncurrent Users - Query Users under Tenant master using limit parameter", function () {
      response = newUser.getUsers(jSessionId, 200, 1000);
    });

    group("Cuncurrent Users - Verify get all Users KPI", function () {
      getUsersPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetByName(data) {
  let iter = scenario.iterationInTest;
  let jSessionId = data[0][iter];
  //active concurrent users that are VUs
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  let index = iter + VUS;
  let userNameToGet = data[2] + index;

  group("Use Case: Cuncurrent Users - Get users under Tenant by Name", function () {
    let response;

    //Getting users to be modified from VUS to 2*VUS
    group("Cuncurrent Users - Query Users under Tenant master by Name", function () {
      response = newUser.getUserByName(jSessionId, userNameToGet);
    });

    group("Cuncurrent Users - Verify get users by name KPI", function () {
      getUserByNamePolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvResetPassword(data) {
  let iter = scenario.iterationInTest;
  //active session for concurrent users that are VUs
  let jSessionId = data[0][iter];
  let userId;

  //Working on Users to Modify from index 2*VUS to 3*VUS
  let gap = 2*VUS + iter;
  let user = getNewUser(data[2]+gap);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Reset Password", function () {
    let response;
    group("Cuncurrent Users - Get user id", function () {
      userId = newUser.getUserId(jSessionId);
      console.log("userId: " + userId + " for user " + newUser.username);
    });

    group("Cuncurrent Users - Reset Password", function () {
      newUser.setPassword("Ericsson111!");
      response = newUser.changePassword(jSessionId, userId);
    });

    group("Cuncurrent Users - Verify reset password KPI", function () {
      resetPasswordPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetRoles(data) {
  let iter = scenario.iterationInTest;
  let jSessionId = data[0][iter];
  //active concurrent users that are VUs
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Get Roles", function () {
    let response;

    group("Cuncurrent Users - Get All Roles", function () {
      response = newUser.getSystemRoles(jSessionId);
    });

    group("Cuncurrent Users - Verify get roles KPI", function () {
      getRolesPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvDelete(data) {
   let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUs
  let jSessionId = data[0][iter];
  //VUS users to be deleted from users to modify that are USERS_NAME_TO_MODIFY_V of length VUS
  let user = getNewUser(data[3]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Delete new user", function () {
    let response;
    group("Cuncurrent Users - Delete new user", function () {
      response = newUser.delete(jSessionId);
    });

    group("Cuncurrent Users - Verify delete user KPI", function () {
      deleteUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

  });
}