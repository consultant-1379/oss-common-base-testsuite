import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { BRO } from '../../modules/BRO.js';
import * as Constants from '../../modules/Constants.js';

export function broHealthCheck() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

  let jSessionId;

  group("Use Case: BRO Healthcheck", function () {
    let response;

    group("Log in as admin user", function () {
      jSessionId = soUser.login();
    });

    group("Get BRO Healthcheck", function () {
      response = BRO.getBroHealthCheck(jSessionId);
    });

    group("Verify that BRO status is Healthy", function () {
      check(response, {
        "Status is Healthy": (r) => r.json(`status`) == "Healthy"
      });
    });

    group("Verify that agent is registered", function () {
      check(response, {
        "Agent is registered": (r) => r.json(`registeredAgents.#`) > 0
      });
    });

    group("Logout as admin user", function () {
      soUser.logout(jSessionId);
    });
  });
}
