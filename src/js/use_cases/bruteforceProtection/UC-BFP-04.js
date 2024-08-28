//import http from 'k6/http';
import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';

export const options = {
  insecureSkipTLSVerify: true,
  iterations: 30,
}

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

  // Step3 Enable BFP
  group("Enable BFP and set MinimumQuickLoginWaitSeconds and PermanentLockout false", function () {
    bfProtection.setBruteForceProtected(true);
    bfProtection.setPermanentLockout(false);
    bfProtection.setQuickLoginCheckMilliSeconds(1000);
    bfProtection.setMinimumQuickLoginWaitSeconds(20);
    bfProtection.setBFProtection(jsessionId);
  });

  // Step4 Logout
  group("Logout as admin user", function () {
    soUser.logout();
  });
}

export function loginAttemptsWithOnlyBfpEnable(data) {
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
  group("Login attempt with correct password: new user should be locked", function () {
    newUser.login(401);
  });

  sleep(20);

  // Step7 Login attempt after MinimumQuickLoginWaitSeconds
  group("Login attempt after MinimumQuickLoginWaitSeconds: new user should be unlocked", function () {
    newUser.login(200);
  });

  // Step8 Logout
  group("Logout as new user", function () {
    newUser.logout();
  });

  // Step9 Login
  group("Log in as admin user", function () {
    jsessionId = soUser.login();
  });

  // Step10 Delete new user
  group("Delete new user", function () {
    newUser.delete(jsessionId);
  });

  // Step11 Logout
  group("Logout as admin user", function () {
    soUser.logout();
  });
}

