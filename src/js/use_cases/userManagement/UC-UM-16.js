import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export function createDeleteUser(userName) {

  let gasUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

  let newUser = new User(userName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  let jSessionId;

  group("Use Case: Create and delete user", function () {

    group("Log in as admin user", function () {
      jSessionId = gasUser.login();
    });

    group("Create new user", function () {
      newUser.create(jSessionId);
    });

    group("Delete new user", function () {
      newUser.delete(jSessionId);
    });

    group("Logout as admin user", function () {
      gasUser.logout(jSessionId);
    });
  });
}

