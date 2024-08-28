import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export const createUserPolicyAPIDurationSingleUser = new Trend('CreateUserAPIDurationSingleUser');
export const getUsersPolicyAPIDurationSingleUser = new Trend('GetUsersAPIDurationSingleUser');
export const updateUserPolicyAPIDurationSingleUser = new Trend('UpdateUserAPIDurationSingleUser');
export const deleteUserPolicyAPIDurationSingleUser = new Trend('DeleteUserAPIDurationSingleUser');
export const filterUserPolicyAPIDurationSingleUser = new Trend('FilterUserAPIDurationSingleUser');
export const getRolesPolicyAPIDurationSingleUser = new Trend('GetRolesAPIDurationSingleUser');

export function enableDisableUser() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let newUserName = Constants.NEW_USER + "_" + new Date().getTime();

  let newUser = new User(newUserName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let jSessionId;

  group("Use Case: Create new user with satus enabled and login", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Create new user", function () {
      response = newUser.create(jSessionId);
    });

/*     group("Verify create user KPI", function () {
      createUserPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });

    group("Log in as new user", function () {
      jSessionId = soUser.login();
    });

    group("Logout as new user", function () {
      soUser.logout(jSessionId);
    });

  });

  group("Use Case: Get all users", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Get all Users", function () {
      response = soUser.getUsers(jSessionId);
    });

/*     group("Verify get all Users KPI", function () {
      getUsersPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });


  group("Use Case: Get Roles", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Get All Roles", function () {
      response = soUser.getSystemRoles(jSessionId);
    });

/*     group("Verify get roles KPI", function () {
      getRolesPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });

  group("Use Case: Search/Filter new user by attributes", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Filter user by attributes", function () {
      let attributes = `?&search=(username==${newUser.username};tenantname==${newUser.tenantname};status==ENABLED)`
      response = soUser.filterUsers(jSessionId, attributes);
      let filtered_length = response.json(`#`);
      let filtered_user_name = response.json(`#.username`);

      check(response, {
        ["Filtered user is not empty"]: (r) => filtered_length > 0,
        [`Filtered user should have username ${newUser.username}`]: (r) => filtered_user_name == newUserName
      });
      console.log("Searched user has length: " + filtered_length);
      console.log("Searched user has username: " + filtered_user_name);
    });

/*     group("Verify Search/Filter user by attributes KPI", function () {
      filterUserPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });

  group("Use Case: Update new user satus to disabled value and login", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Update new user status to disabled", function () {
      response = newUser.update(jSessionId, "disabled");
    });

/*     group("Verify updated user KPI", function () {
      updateUserPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });

    group("Log in as new user should fail", function () {
      jSessionId = newUser.login(401);
    });

  });

  group("Use Case: Update new user satus to enable value and login", function () {
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Update new user status to enabled", function () {
      newUser.update(jSessionId, "enabled");
    });

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });

    group("Log in as new user", function () {
      jSessionId = newUser.login();
    });

    group("Logout as new user", function () {
      jSessionId = newUser.logout(jSessionId);
    });
  });

  group("Use Case: Delete new user", function () {
    let response;
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Delete new user", function () {
      response = newUser.delete(jSessionId);
    });

/*     group("Verify delete user KPI", function () {
      deleteUserPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });

}
