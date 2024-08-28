import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { SharedArray } from 'k6/data';
import { vu, scenario } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

export const createUserPolicyAPIDurationCuncurrentUser = new Trend('Create User API Duration Cuncurrent Users');
export const getUsersPolicyAPIDurationCuncurrentUser = new Trend('Get Users API Duration Cuncurrent Users');
export const updateUserPolicyAPIDurationCuncurrentUser = new Trend('Update User API Duration Cuncurrent Users');
export const deleteUserPolicyAPIDurationCuncurrentUser = new Trend('Delete User API Duration Cuncurrent Users');
export const filterUserPolicyAPIDurationCuncurrentUser = new Trend('Filter User API Duration Cuncurrent Users');
export const getRolesPolicyAPIDurationCuncurrentUser = new Trend('Get Roles API Duration Cuncurrent Users');
export const getUserByNamePolicyAPIDurationCuncurrentUser = new Trend('Get User By Name API Duration Cuncurrent Users');
export const resetPasswordPolicyAPIDurationCuncurrentUser = new Trend('Reset Password API Duration Cuncurrent Users');

// MAX CONCURRENT USERS (20), KPIs FOR USER MANAGEMENT

function generateArrayUsersSoProvider(){
  let f = JSON.parse(open('../../../resources/data/concurrent_users.json')).users;
  return f;
}

const sharedSoProviderUsers = new SharedArray('sharedSoProviderUsers', generateArrayUsersSoProvider);

export function setupEnv() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
  let jSessionId;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Create new users with OSSPortalAdmin role", function () {
    create_user_loop(jSessionId, sharedSoProviderUsers);
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function teardownEnv(data) {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Delete new users with OSSPortalAdmin role", function () {
    delete_user_loop(jSessionId, sharedSoProviderUsers);
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function usermgmtKpiEnv() {

  let iter = scenario.iterationInTest;
  let newUserName = Constants.NEW_USER + "_" + new Date().getTime() + "_" + iter;

  let newUser = new User(newUserName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let user = create_user(sharedSoProviderUsers[vu.idInTest - 1]);
  let jSessionId;
  let userId;

  group("Use Case: Cuncurrent Users - Create new user and Verify KPIs", function () {
    let response;
    sleep(5);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Create new user", function () {
      response = newUser.create(jSessionId);
    });

    group("Cuncurrent Users - Verify create user KPI", function () {
        createUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Get users under Tenant using limit parameter", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Query Users under Tenant master using limit parameter", function () {
      response = user.getUsers(jSessionId, 200, 100);
    });

    group("Cuncurrent Users - Verify get all Users KPI", function () {
      getUsersPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Get users under Tenant by Name", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Query Users under Tenant master by Name", function () {
      response = user.getUserByName(newUserName);
    });

    group("Cuncurrent Users - Verify get users by name KPI", function () {
      getUserByNamePolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Get Roles", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Get All Roles", function () {
      response = user.getSystemRoles(jSessionId);
    });

    group("Cuncurrent Users - Verify get roles KPI", function () {
      getRolesPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Search/Filter new user by attributes", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Filter user by attributes", function () {
      let attributes = `?&search=(username==${newUser.username};tenantname==${newUser.tenantname};status==ENABLED)`
      response = user.filterUsers(jSessionId, attributes);
      let filtered_length = response.json(`#`);
      let filtered_user_name = response.json(`#.username`);

      check(response, {
        ["Filtered user is not empty"]: (r) => filtered_length > 0,
        [`Filtered user should have username ${newUser.username}`]: (r) => filtered_user_name == newUserName
      });
      console.log("Searched user has length: " + filtered_length);
      console.log("Searched user has username: " + filtered_user_name);
    });

    group("Cuncurrent Users - Verify Search/Filter user by attributes KPI", function () {
      filterUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Update new user name and Verify KPIs", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Update new user firstName", function () {
      newUser.firstName=newUser.firstName + "_updated"
      console.log("firstName name to update: " + newUser.firstName);
      response = newUser.update(jSessionId);
    });

    group("Cuncurrent Users - Verify updated user KPI", function () {
      updateUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);

  });

  group("Use Case: Cuncurrent Users - Reset Password", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);


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

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);
  });

  group("Use Case: Cuncurrent Users - Delete new user", function () {
    let response;
    sleep(10);
    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    //sleep(1);

    group("Cuncurrent Users - Delete new user", function () {
      response = newUser.delete(jSessionId);
    });

    group("Cuncurrent Users - Verify delete user KPI", function () {
      deleteUserPolicyAPIDurationCuncurrentUser.add(response.timings.duration);
    });

    //sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    //sleep(1);
  });

}
