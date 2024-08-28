import http from 'k6/http';
import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { KeyManagement } from '../../modules/KeyManagement.js';
import * as Constants from '../../modules/Constants.js';

export function kmsRequests() {

    let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

    group("Use Case: KMS requests", function () {

    let jSessionId;
    let credentialReference;

    // Step-1 Login
    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    // Step-2 Store credentials
    group("Store credentials", function () {
      credentialReference = KeyManagement.storeCredentials(jSessionId);
    });

    // Step-2 Update credentials
    group("Update credentials", function () {
      KeyManagement.updateCredentials(jSessionId, credentialReference);
    });

    // Step-3 Delete credentials
    group("Delete credentials", function () {
      KeyManagement.deleteCredentials(jSessionId, credentialReference);
    });

    // Step-4 Logout
    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });
}
