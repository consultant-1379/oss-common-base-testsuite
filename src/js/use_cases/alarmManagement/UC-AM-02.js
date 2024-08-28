import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { AlarmManagement } from '../../modules/AlarmManagement.js';
import * as Constants from '../../modules/Constants.js';

export function checkScrapePools() {

  let gasUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  group("Log in as admin user", function () {
    jSessionId = gasUser.login();
  });

  group("Use Case: Check scrape pools", function () {
    AlarmManagement.getScrapePools(jSessionId);	
  });

  group("Logout as admin user", function () {
    gasUser.logout(jSessionId);
  });
}
