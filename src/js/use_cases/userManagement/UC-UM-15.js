import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';

export function getSessionTimeouts() {

    let soUser = new User(Constants.GAS_USER,
                          Constants.GAS_USER_PWD,
                          Constants.TENANT_NAME,
                          Constants.GAS_URL);

    let jSessionId;
    //let token_list = [];
    let token;
    let tenant_name_list = [];

    group("Use Case 1: Verify that Session Timeouts are properly set in Keycloack", function () {
        // Step1 Login
        group("Log in as admin user", function () {
          jSessionId = soUser.login();
        });

        let response;
        // Step2 Get tenants
/*         group("Get tenants list", function () {
          response = soUser.get_tenants(jSessionId);
          tenant_name_list = response.json(`#.name`);
        }); */

        // Step3 Get Keycloack Access Token
        group("Get Keycloack Access Token for every Tenant", function () {
            token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        // Step4
        group("Check Session Timeouts for every Tenant", function () {
          soUser.getKeycloackSessionTimeouts(jSessionId, token, soUser.tenantname);

/*             for (let i = 0; i < tenant_name_list.length; ++i) {
                soUser.getKeycloackSessionTimeouts(jSessionId, token, tenant_name_list[i]);
                sleep(0.3);
            } */
        });

        // Step5 Logout
        group("Logout as admin user", function () {
          soUser.logout(jSessionId);
        });
      });

}
