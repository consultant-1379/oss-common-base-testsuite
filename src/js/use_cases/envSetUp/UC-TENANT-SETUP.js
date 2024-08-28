import { group, sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { vu, scenario } from 'k6/execution';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

// MAX CONCURRENT USERS PER TENANT MANAGEMENT (5), CREA E CANCELLA I TENANTS

export const createTenantPolicyAPIDuration = new Trend('Create Tenant API Duration');
export const deleteTenantPolicyAPIDuration = new Trend('Delete Tenant API Duration');

function generateArrayUsersForAllTenants(){
  let f = JSON.parse(open('../../../resources/data/users_tenant.json')).users;
/*  for (let i = 0; i < Constants.MAX_TENANT_CONCURRENT_USERS; ++i) {
    let time = new Date().getTime();
    f[i].username = f[i].username + time;
  }*/
  return f;
}

const sharedUsers = new SharedArray('sharedUsers', generateArrayUsersForAllTenants);
//const GAS_URL = `${__ENV.GAS_URL}`;

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
    create_user_loop(jSessionId, sharedUsers);
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
    delete_user_loop(jSessionId, sharedUsers);
  });

  //Step 3 Logout
  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function maxTenantsEnv(data) {

 // console.log("idInTest: " + vu.idInTest);
  let user = create_user(sharedUsers[vu.idInTest - 1]);
  let jSessionId;

  group("Use Case: Max number of concurrent users trying to create new tenants", function () {

      // Step1 Login
      group("Log in as an user previously created", function () {
        jSessionId = user.login();
      });

      sleep(1);

      // Step2 Create new Tenant
      group("Create tenant and verify timing duration KPI", function () {
        let iter = scenario.iterationInTest;
        let response = user.create_tenant(jSessionId, Constants.TENANT_NAME+"_"+iter, Constants.TENANT_DESCRIPTION+iter);
        //createTenantPolicyAPIDuration.add(response.timings.duration);
      });

      //Step 3 Logout
     group("Logout user previously created", function () {
        user.logout(jSessionId);
      });

      sleep(1);
  });

  /*group("Use Case: Max number of concurrent users trying to delete new tenants", function () {

      // Step1 Login
      group("Log in as an user previously created", function () {
        jSessionId = user.login();
      });

      sleep(1);

      // Step2 Delete new Tenant
      group("Delete tenant and verify timing duration KPI", function () {
        let iter = scenario.iterationInTest;
        let response = user.delete_tenant(jSessionId, Constants.TENANT_NAME+"_"+iter);
        deleteTenantPolicyAPIDuration.add(response.timings.duration);
      });

      //Step 3 Logout
      group("Logout user previously created", function () {
        user.logout(jSessionId);
      });

      sleep(1);
  });*/
}
