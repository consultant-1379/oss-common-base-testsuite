import http from "k6/http";
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';
import { group, check, sleep } from "k6";
import { Trend } from 'k6/metrics';
import { create_user } from '../../modules/Utils.js';

export const getPwdPolicyAPIDuration = new Trend('Get_Password_Policy_API_Duration')

const MAX_USERS = 10;

function getNewUser(name) {
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

let gasUser = new User(Constants.GAS_USER,
                       Constants.GAS_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

const USER_NAME = "user_client_passpolicy_" + new Date().getTime() + "_";

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
    //LOGIN of concurrent users
    newUser.login();
    userArray[i] = newUser;
  }

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

export function getPasswordPolicyEnv(data) {

  let newUser = new User(Constants.NEW_USER,
                       Constants.NEW_USER_PWD,
                       Constants.TENANT_NAME,
                       Constants.GAS_URL);

  let jSessionId = data.jSessionId;

  group("Use Case: Get password policy for a tenant", function () {
    let request = gasUser.getPasswordPolicy();
    getPwdPolicyAPIDuration.add(request.timings.duration);
  });
}

