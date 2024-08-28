import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { group, check } from "k6";

export const options = {
  insecureSkipTLSVerify: true,
}

function checkSysAdminRoles(roles) {
  let match = 0;
  for(let i = 0; i < roles.length; i++) {
    let role = roles[i];
    switch(role.name) {
      case "LogViewer_System_Application_Operator":
      case "System_Security_CertMViewer":
      case "KmsAgentAdmin":
      case "Monitoring_Application_ReadOnly":
      case "BUR_Application_Administrator":
      case "TracesViewer":
      case "UISettingsAdmin":
      case "LogViewer_ExtApps_Application_Operator":
      case "Exposure_Application_Administrator":
      case "MetricsViewer":
	      ++match;
        break;
      default:
	      break;
    }
  }

  console.log("MATCH for sys admin: " + match);
  return (match == 10);
}

function checkSysReadOnlyRoles(roles) {
  let match = 0;
  for(let i = 0; i < roles.length; i++) {
    let role = roles[i];
    switch(role.name) {
      case "LogViewer_System_Application_Operator":
      case "LogViewer_ExtApps_Application_Operator":
      case "BUR_Application_Reader":
      case "Monitoring_Application_ReadOnly":
      case "MetricsViewer":
        ++match;
        break;
      default:
        break;
    }
  }

  console.log("MATCH for sys read only: " + match);
  return (match == 5);
}

function checkSysSecAdminRoles(roles) {
  let match = 0;
  for(let i = 0; i < roles.length; i++) {
    let role = roles[i];
    switch(role.name) {
      case "System_Security_CertMAdmin":
      case "System_Security_CertMViewer":
      case "LogViewer_System_Application_Operator":
      case "LogViewer_ExtApps_Application_Operator":
      case "Monitoring_Application_ReadOnly":
      case "UISettingsAdmin":
      case "UserAdmin":
        ++match;
        break;
      default:
        break;
    }
  }

  console.log("MATCH for sys security admin: " + match);
  return (match == 7);
}

function checkSysTroubleShooterRoles(roles) {
  let match = 0;
  for(let i = 0; i < roles.length; i++) {
    let role = roles[i];
    switch(role.name) {
      case "LogViewer_System_Application_Operator":
      case "LogViewer_ExtApps_Application_Operator":
      case "Monitoring_Application_ReadOnly":
        ++match;
        break;
      default:
        break;
    }
  }

  console.log("MATCH for sys tr shooter: " + match);
  return (match == 3);
}

function getRoleId(roles, roleName) {
  for(let i = 0; i < roles.length; i++) {
    let role = roles[i];
    if (role.name === roleName) {
      return role.id;
    }
  }
  return -1;
}

export function checkEffectiveRoles() {

  let gasUser = new User(Constants.GAS_USER,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);

  group("Use Case: Verify capabilities for System Roles", function () {

    let jSessionId;
    let token;
    let roles;

    group("Log in as admin user", function () {
      jSessionId = gasUser.login();
    });

    group("Get Keycloack Access Token", function () {
      token = gasUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get System roles", function () {
      let response = gasUser.getSystemRoles(jSessionId);
      roles = JSON.parse(response.body);
    });

    group("Verify Effective Roles for System Administrator", function () {
      let roleId = getRoleId(roles, "System_Administrator");
      if (roleId != -1) {
        let response = gasUser.getKeycloackEffectiveRoles(jSessionId, token, roleId);
        let body = JSON.parse(response.body);
        console.log("Effective Roles for System Administrator:");
        for(let i = 0; i < body.length; i++) {
          let role = body[i];
	        console.log("ROLE NAME: " + role.name);
        }

        check(body, {
          ["Check on Effective Roles for System Administrator should return true"]: (r) =>  checkSysAdminRoles(r) === true
        });
      }
    });

    group("Verify Effective Roles for System ReadOnly", function () {
      let roleId = getRoleId(roles, "System_ReadOnly");
      if (roleId != -1) {
        let response = gasUser.getKeycloackEffectiveRoles(jSessionId, token, roleId);
        let body = JSON.parse(response.body);
        console.log("Effective Roles for System ReadOnly:");
        for(let i = 0; i < body.length; i++) {
          let role = body[i];
          console.log("ROLE NAME: " + role.name);
        }
        check(body, {
          ["Check on Effective Roles for System ReadOnly should return true"]: (r) =>  checkSysReadOnlyRoles(r) === true
        });
      }
    });

    group("Verify Effective Roles for System Security Administrator", function () {
      let roleId = getRoleId(roles, "System_SecurityAdministrator");
      if (roleId != -1) {
        let response = gasUser.getKeycloackEffectiveRoles(jSessionId, token, roleId);
        let body = JSON.parse(response.body);
        console.log("Effective Roles for System Security Administrator:");
        for(let i = 0; i < body.length; i++) {
          let role = body[i];
          console.log("ROLE NAME: " + role.name);
        }
        check(body, {
          ["Check on Effective Roles for System Security Administrator should return true"]: (r) =>  checkSysSecAdminRoles(r) === true
        });
      }
    });

    group("Verify Effective Roles for System Trouble Shooter", function () {
      let roleId = getRoleId(roles, "System_Troubleshooter");
      if (roleId != -1) {
        let response = gasUser.getKeycloackEffectiveRoles(jSessionId, token, roleId);
        let body = JSON.parse(response.body);
        console.log("Effective Roles for System Trouble Shooter:");
        for(let i = 0; i < body.length; i++) {
          let role = body[i];
          console.log("ROLE NAME: " + role.name);
        }
        check(body, {
          ["Check on Effective Roles for System Trouble Shooter should return true"]: (r) =>  checkSysTroubleShooterRoles(r) === true
        });
      }
    });

    group("Logout as admin user", function () {
      gasUser.logout();
    });
  });
}

