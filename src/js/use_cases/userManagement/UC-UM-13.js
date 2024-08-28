import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { group, check } from "k6";

export function extAppRestRole() {

    let gasUser = new User(Constants.GAS_USER,
            Constants.GAS_USER_PWD,
            Constants.TENANT_NAME,
            Constants.GAS_URL);

    let ExtApprestroleName = Constants.NEW_USER + "_" + new Date().getTime();
  
    let userExtAppRestRole = new User(ExtApprestroleName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL,
                         ["UserAdministration_ExtAppRbac_Application_SecurityAdministrator"]);

    let payload = JSON.stringify({
    "tenant": "master",
    "roles": [
        {
            "name": "ExtApp_Role_1"
        }
    ],
    "authorization": {
        "resources": [
            {
                "name": "extApp_rApp",
                "type": "urn:eo:resources:extApp",
                "ownerManagedAccess": false,
                "uris": [
                    "/path2/**"
                ],
                "scopes": [
                    {
                        "name": "PATCH"
                    },
                    {
                        "name": "DELETE"
                    },
                    {
                        "name": "GET"
                    },
                    {
                        "name": "POST"
                    },
                    {
                        "name": "PUT"
                    }
                ]
            }
        ],
        "policies": [
            {
                "name": "Is extApp_rApp",
                "type": "role",
                "logic": "POSITIVE",
                "decisionStrategy": "UNANIMOUS",
                "config": {
                    "roles": "[{\"id\":\"ExtApp_Role_1\",\"required\":false}]"
                }
            },
            {
                "name": "ExtApp_Role_Permission_1",
                "type": "scope",
                "logic": "POSITIVE",
                "decisionStrategy": "AFFIRMATIVE",
                "config": {
                    "resources": "[\"extApp_rApp\"]",
                    "scopes": "[\"GET\",\"PUT\",\"POST\",\"DELETE\",\"PATCH\"]",
                    "applyPolicies": "[\"Is extApp_rApp\"]"
                }
            }
        ],
        "scopes": [
            {
                "name": "GET"
            },
            {
                "name": "POST"
            },
            {
                "name": "DELETE"
            },
            {
                "name": "PUT"
            },
            {
                "name": "PATCH"
            }
        ]
    }
});

    group("Use Case1: Create, Delete ExtAppRestRole", function() {
        let jSessionId;

        //Step1 Login as Admin user
        group("Login as Admin user and Get session ID", function() {
            jSessionId = gasUser.login();
        });

         //Step2 Create new user with ExtAppRestRole 
        group("Create a user with role ExtAppRestRole ", function() {
            userExtAppRestRole.create(jSessionId, 200);
        });

        //Step3 Logout from Admin user
        group("Logout as admin user", function() {
            gasUser.logout(jSessionId);
        });

        //Step4 Login as ExtAppRestRole user 
        group("Log in as ExtAppRestRole", function() {
            jSessionId = userExtAppRestRole.login();
        });

        //Step5 Create a ExtAppRestRole 
        group("Call user management role creation API", function() {
            gasUser.create_ExtAppRestRole(jSessionId,payload, 200);
        });

        //Step6 Delete a Role
        group("Call user management role Deletion API", function() {
            gasUser.delete_ExtAppRestRole(jSessionId,payload, 204);
        });

        //Step7 Logut from ExtAppRestRole user
        group("Logout as ExtAppRestRole user", function() {
            userExtAppRestRole.logout(jSessionId);
        });

        //Step8 Login as Admin user
        group("Log in as admin user", function() {
            jSessionId = gasUser.login();
        });

        //Step9 Delete new user
        group("Delete new user", function() {
            userExtAppRestRole.delete(jSessionId);
        });
        //Step10 Logout from Admin user
        group("Logout as admin user", function() {
            gasUser.logout(jSessionId);
        });
    });

     group("Use Case2: Verify GAS-User able to create, delete rapp related RBAC ", function() {
        let jSessionId;

        //Step1 Login as GAS-User
        group("Login as GAS_User and Get session ID", function() {
            jSessionId = gasUser.login();
        });

        //Step2 Create a ExtAppRestRole 
        group("Call user management role creation API from GAS_User", function() {
            gasUser.create_ExtAppRestRole(jSessionId,payload, 200);
        });

        //Step3 Delete a Role
        group("Call user management role Deletion API from GAS_User", function() {
            gasUser.delete_ExtAppRestRole(jSessionId,payload, 204);
        });

        //Step4 Logut from ExtAppRestRole user
        group("Logout as ExtAppRestRole user", function() {
            gasUser.logout(jSessionId);
        });
     });
}
