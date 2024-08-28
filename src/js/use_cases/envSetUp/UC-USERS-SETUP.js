import { group, sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { vu, scenario } from 'k6/execution';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

// MAX CONCURRENT USERS (15), CREA MAX NUMBERS OF USERS INSIDE ALL TENANTS

export const createUserPolicyAPIDuration = new Trend('Create User API Duration');

function generateArrayUsersSoProvider(){
  let f = JSON.parse(open('../../../resources/data/concurrent_users.json')).users;
/*  for (let i = 0; i < Constants.MAX_TENANT_CONCURRENT_USERS; ++i) {
    let time = new Date().getTime();
    f[i].username = f[i].username + time;
  }*/
  return f;
}

function generateArrayUsers(){
  let f = JSON.parse(open('../../../resources/data/max_users.json')).users;
  return f;
}

const sharedSoProviderUsers = new SharedArray('sharedSoProviderUsers', generateArrayUsersSoProvider);
const sharedUsers = new SharedArray('sharedUsers', generateArrayUsers);
let tenant_name = "master";

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
  group("Create new users with OSSPortalAdmin role", function () {
    create_user_loop(jSessionId, sharedSoProviderUsers);
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
  group("Delete new users with OSSPortalAdmin role", function () {
    delete_user_loop(jSessionId, sharedSoProviderUsers);
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function maxUsersEnv(data) {

 // console.log("idInTest: " + vu.idInTest);
 //If Vus are 10 then vu.idInTest is from 1 to 10
  let user = create_user(sharedSoProviderUsers[vu.idInTest - 1]);
  let jSessionId;

  group("Use Case: Max number of concurrent users trying to create new user", function () {

      // Step1 Login
      group("Log in as OSSPortalAdmin user previously created", function () {
        jSessionId = user.login();
      });

      sleep(1);

      // Step2 Create new User
      group("Create OSSPortalAdmin user under specific Tenant and verify timing duration KPI", function () {
        //If iterations are 500 then scenario.iterationInTest is from 0 to 499
        let iter = scenario.iterationInTest;
/*         let newUser = new User(sharedUsers[iter].username+"_"+iter,
                               sharedUsers[iter].password,
                               sharedUsers[iter].tenantname,
                               Constants.GAS_URL,
                               ["TenantAdmin"]); */

        let diff = iter - Constants.MAX_USERS_PER_TENANT;
        let iter_tenant;

        if(diff > -1){
          iter_tenant = Math.trunc(iter/Constants.MAX_USERS_PER_TENANT) -1;
          console.log("iter_tenant: "+iter_tenant);
          tenant_name = "master_"+iter_tenant;
        }

        let newUser = new User("test_user_" + iter,
                               Constants.GAS_USER_PWD,
                               tenant_name,
                               Constants.GAS_URL,
                               ["OSSPortalAdmin"]
                               );
        let response = newUser.create(jSessionId);
        console.log("Created by " + user.username + " under Tenant " + tenant_name);
        createUserPolicyAPIDuration.add(response.timings.duration);
      });

      //Step 3 Logout
     group("Logout OSSPortalAdmin user previously created", function () {
        user.logout(jSessionId);
      });

      sleep(1);
  });

 /* group("Use Case: Max number of concurrent users trying to delete new users", function () {

      // Step1 Login
      group("Log in as an user previously created", function () {
        jSessionId = user.login();
      });

      sleep(1);

      // Step2 Delete new User
      group("Delete user", function () {
        let iter = scenario.iterationInTest;
        let newUser = new User("test_user_" + iter,
                               Constants.GAS_USER_PWD,
                               "master",
                               Constants.GAS_URL,
                               ["TenantAdmin"]);
        newUser.delete(jSessionId);
      });

      //Step 3 Logout
      group("Logout user previously created", function () {
        user.logout(jSessionId);
      });

      sleep(1);
  });*/
}
