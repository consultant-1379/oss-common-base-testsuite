import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { BFProtection } from '../../modules/BFProtection.js';
import { Trend } from 'k6/metrics';

export const setBFPAPIDuration = new Trend('Update_Brute_Force_Protection_API_Duration')
export const getBFPAPIDuration = new Trend('Get_Brute_Force_Protection_API_Duration')

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
  let maxLoginFailures = 30;

  group("Setup", function () {

    // Step1 Login
    group("Log in as admin user", function () {
      jsessionId = soUser.login();
    });

    // Step2 Create new user
    group("Create a new user", function () {
      newUser.create(jsessionId);
    });

    // Step3 enable BFP
    group("Enable BFP and set Max login Failures", function () {
      bfProtection.setBruteForceProtected(true);
      bfProtection.setPermanentLockout(true);
      // set Max login Failures
      bfProtection.setFailureFactor(maxLoginFailures);
      let response = bfProtection.setBFProtection(jsessionId);
      //setBFPAPIDuration.add(response.timings.duration);
    });

    // Step4 get BFP
    group("Get BFP configuration for Tenant", function () {
      let request = bfProtection.getBFProtection(jsessionId);
      //getBFPAPIDuration.add(request.timings.duration);
    });
  });

  // Step5 Logout
  group("Logout as admin user", function () {
    soUser.logout();
  });
}

export function failedLoginAttempts(data) {
  // set wrong password to execute failed login attempt
  newUser.setPassword('Ericsson123');

  // Step6 Failed login attempts
  group("Login attempts with wrong password", function () {
    newUser.login(500);
  });
}

export function teardownEnv(data) {

  let jsessionId;

  // Step7 New user login attempt
  group("Login attempt with correct password: new user should be locked", function () {
    // set right password
    newUser.setPassword(Constants.NEW_USER_PWD);
    newUser.login(401);
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


