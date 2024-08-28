import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';
import { Trend } from 'k6/metrics';
import { create_user } from '../../modules/Utils.js';

export const enableBFPAPIDuration = new Trend('Enable_Brute_Force_Protection_API_Duration')
export const disableBFPAPIDuration = new Trend('Disable_Brute_Force_Protection_API_Duration')
export const configureBFPAPIDuration = new Trend('Configure_Brute_Force_Protection_API_Duration')

const MAX_USERS = 10;

function getNewUser(name) {
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

let gasUser = new User(Constants.GAS_USER,
                       Constants.GAS_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

const USER_NAME = "user_client_bfp_" + new Date().getTime() + "_";

let bfProtection = new BFProtection(Constants.GAS_URL, Constants.TENANT_NAME);

export function setupEnv() {
  let jSessionId;
  let userArray = [];

  group("Log in as admin user", function () {
    jSessionId = gasUser.login();
  });

  for (let i = 1; i < MAX_USERS; i++) {
    let user = getNewUser(USER_NAME + i);
    let newUser = create_user(user);
    newUser.create(jSessionId);
    newUser.login();
    userArray[i] = newUser;
  }

  console.log("JSESSION-ID = " + jSessionId);
  return { jSessionId: jSessionId, userArray: userArray };
}

export function teardownEnv(data) {
  let jSessionId = data.jSessionId;
  let userArray = data.userArray;

  for (let i = 1; i < MAX_USERS; i++) {
    let user = Object.assign(new User(), userArray[i]);
    user.delete(jSessionId);
  }

  group("Logout as admin user", function () {
    gasUser.logout(jSessionId);
  });
}

export function configureBFPEnv(data) {
  let jSessionId = data.jSessionId;

  // Step1 enable BFP
  group("Enable BFP", function () {
    bfProtection.setBruteForceProtected(true);
    let response = bfProtection.setBFProtection(jSessionId);
    enableBFPAPIDuration.add(response.timings.duration);
  });

  // Step2 configure BFP
  group("Configure BFP", function () {
    bfProtection.setPermanentLockout(true);
    let response = bfProtection.setBFProtection(jSessionId);
    disableBFPAPIDuration.add(response.timings.duration);
  });

  // Step3 disable BFP
  group("Disable BFP", function () {
    bfProtection.setBruteForceProtected(false);
    let response = bfProtection.setBFProtection(jSessionId);
    configureBFPAPIDuration.add(response.timings.duration);
  });
}

