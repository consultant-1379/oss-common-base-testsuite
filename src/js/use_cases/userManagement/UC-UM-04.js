import { group } from 'k6';
import { User } from '../../modules/User.js';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export const createTenantPolicyAPIDurationSingleUser = new Trend('CreateTenantAPIDurationSingleUser');
export const getTenantsPolicyAPIDurationSingleUser = new Trend('GetTenantsAPIDurationSingleUser');
export const updateTenantPolicyAPIDurationSingleUser = new Trend('UpdateTenantAPIDurationSingleUser');
//DELETE KPI is not yet clarified
export const deleteTenantPolicyAPIDurationSingleUser = new Trend('DeleteTenantAPIDurationSingleUser');

export function updateTenant() {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  let tenantName = Constants.TENANT_NAME + "_" + new Date().getTime();
  let description = "description";
  let newDescription = "new_" + description;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Use Case: Get all existing Tenants", function () {
    let response;
    group("Get Tenants", function () {
      response = soUser.get_tenants(jSessionId);
    });
/*     group("Verify get all Tenants KPI", function () {
      getTenantsPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */
  });

  group("Use Case: Create new Tenant", function () {
    let response;
    group("Create new Tenant", function () {
      response =  soUser.create_tenant(jSessionId, tenantName, description);
    });
 /*    group("Verify create Tenant KPI", function () {
      createTenantPolicyAPIDurationSingleUser.add(response.timings.duration);
    }); */
  });

  group("Use Case: Update new Tenant description", function () {
    let response;
    group("Update Tenant description", function () {
      response =  soUser.update_tenant(jSessionId, tenantName, newDescription);
    });
 /*    group("Verify update Tenant KPI", function () {
      updateTenantPolicyAPIDurationSingleUser.add(response.timings.duration);
    });   */
  });

  group("Use Case: Delete new Tenant", function () {
    let response;
    group("Delete new Tenant", function () {
      response =  soUser.delete_tenant(jSessionId, tenantName);
    });
/*     group("Verify delete Tenant KPI", function () {
      deleteTenantPolicyAPIDurationSingleUser.add(response.timings.duration);
    });   */
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}
