import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { SharedArray } from 'k6/data';
import { vu, scenario } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

export const getAppsListPolicyAPIDurationConcurrentUser = new Trend('Get Apps List API Duration Concurrent Users');
export const getGroupsListPolicyAPIDurationConcurrentUser = new Trend('Get Groups List API Duration Concurrent Users');
export const getComponentsListPolicyAPIDurationConcurrentUser = new Trend('Get Components List API Duration Concurrent Users');
export const getImportMapPolicyAPIDurationConcurrentUser = new Trend('Get Import Map API Duration Concurrent Users');
export const getStaticAssetPolicyAPIDurationConcurrentUser = new Trend('Get Static Asset API Duration Concurrent Users');

function generateArrayUsersSoProvider(){
  let users = JSON.parse(open('../../../resources/data/concurrent_users_gas.json')).users;
  return users;
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

export function teardownEnv() {

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

export function getGasKpi() {

  let user = create_user(sharedSoProviderUsers[vu.idInTest - 1]);
  let jSessionId;
  let staticAssetPath;

  group("Use Case: Concurrent Users - Get apps list and Verify KPIs", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    sleep(1);

    group("Concurrent Users - Get apps list", function () {
      response = user.getApps(jSessionId);
    });

    group("Concurrent Users - Verify get apps list KPI", function () {
      getAppsListPolicyAPIDurationConcurrentUser.add(response.timings.duration);
    });

    sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    sleep(1);
  });

  group("Use Case: Concurrent Users - Get groups list and Verify KPIs", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    sleep(1);

    group("Concurrent Users - Get groups list", function () {
      response = user.getGroups(jSessionId);
    });

    group("Concurrent Users - Verify get groups list KPI", function () {
      getGroupsListPolicyAPIDurationConcurrentUser.add(response.timings.duration);
    });

    sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    sleep(1);
  });

  group("Use Case: Concurrent Users - Get components list and Verify KPIs", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    sleep(1);

    group("Concurrent Users - Get components list", function () {
      response = user.getComponents(jSessionId);
    });

    group("Concurrent Users - Verify get components list KPI", function () {
      getComponentsListPolicyAPIDurationConcurrentUser.add(response.timings.duration);
    });

    sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    sleep(1);
  });

  group("Use Case: Concurrent Users - Get import-map and Verify KPIs", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    sleep(1);

    group("Concurrent Users - Get import-map", function () {
      response = user.getImportMap(jSessionId);
    });

    group("Concurrent Users - Verify get import-map KPI", function () {
      getImportMapPolicyAPIDurationConcurrentUser.add(response.timings.duration);
    });

    staticAssetPath =  response.json('imports.user-admin');

    sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    sleep(1);
  });

  group("Use Case: Concurrent Users - Get static asset and Verify KPIs", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = user.login();
    });

    sleep(1);

    group("Concurrent Users - Get static asset", function () {
      response = user.getStaticAsset(jSessionId, staticAssetPath);
    });

    group("Concurrent Users - Verify get static asset KPI", function () {
      getStaticAssetPolicyAPIDurationConcurrentUser.add(response.timings.duration);
    });

    sleep(1);

    group("Logout as admin user", function () {
      user.logout(jSessionId);
    });

    sleep(1);
  });
}