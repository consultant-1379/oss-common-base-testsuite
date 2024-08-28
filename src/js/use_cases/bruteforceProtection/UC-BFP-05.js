import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';

// so-user
let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
// test user
let newUser = new User(Constants.NEW_USER,
                       Constants.NEW_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

let bfProtection = new BFProtection(Constants.GAS_URL, Constants.TENANT_NAME);

export function setupEnv() {
  let jsessionId;

  // Step1 Login
  group("Log in as admin user", function () {
    jsessionId = soUser.login();
  });

  // Step2 Create new user
  group("Create a new user", function () {
    newUser.create(jsessionId);
  });

  // Step3 Disable BFP
  group("Disable BFP", function () {
    bfProtection.setBruteForceProtected(false);
    bfProtection.setBFProtection(jsessionId);
  });

  // Step4 Logout
  group("Logout as admin user", function () {
    soUser.logout();
  });
}

export function loginWithBfpDisabled(data) {
  // set wrong password to execute failed login attempt
  newUser.setPassword('Ericsson123');

  // Step5 Failed login attempts
  group("Login attempts with wrong password", function () {
    newUser.login(401);
  });
}

export function teardownEnv(data) {
  let jsessionId;

  // set right password
  newUser.setPassword(Constants.NEW_USER_PWD);

  // Step6 New user login attempt
  group("Login attempt: new user should not be locked", function () {
    newUser.login();
  });

  // Step7 Logout
  group("Logout as new user", function () {
    newUser.logout();
  });

  // Step8 Login
  group("Log in as admin user", function () {
    jsessionId = soUser.login();
  });

  // Step9 Delete new user
  group("Delete new user", function () {
    newUser.delete(jsessionId);
  });

  // Step10 Logout
  group("Logout as admin user", function () {
    soUser.logout();
  });
}

