import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { SharedArray } from 'k6/data';
import { vu, scenario } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';


//NEEDED TO GET VALUE OF VUS IN OPTIONS FILE
// function generateOptions(){
//   let f = JSON.parse(open('../../../resources/config/exposureUX/UC-EUX-OPTIONS.json')); // `${__ENV.OPTIONS_FILE}`
//   return new Array(f);
// }

// const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);
// const VUS = sharedOptionsFile[0].scenarios.get_groups_list.vus;

// to be dynamically set when having a single main file
const VUS = 70;


const currentDate = new Date().getTime();
//NAME OF CONCURRENT USERS PERFORMING USE CASES
const CONCURRENT_USERS_NAME = "concurrent_user_eux_" + currentDate + "_";

function getNewUser(name){
  let user = { "username": name, "password": Constants.NEW_USER_PWD , "tenantname":  Constants.TENANT_NAME, "base_url":  Constants.GAS_URL};
  return user;
}

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

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  dataArray[0] = jSessionIdArray;
  dataArray[1] = CONCURRENT_USERS_NAME;

  return dataArray;
}

export function teardownEnv(data) {

  //console.log("TEARDOWN - JSESSION ARRAY: " + JSON.stringify(data));

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

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}
