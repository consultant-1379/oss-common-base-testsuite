import { group } from 'k6';
import { User } from '../../modules/User.js';
import { LDAPServer } from '../../modules/LDAPServer.js';
import * as Constants from '../../modules/Constants.js';

function getLdapId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

export function removeUserFromLDAPServer() {
    let soUser = new User(Constants.GAS_USER,
                          Constants.GAS_USER_PWD,
                          Constants.TENANT_NAME,
                          Constants.GAS_URL);

    let ldapUser = new User(Constants.LDAP_USER,
                            Constants.LDAP_USER_PWD,
                            Constants.TENANT_NAME,
                            Constants.GAS_URL);

    let jSessionId;
    let token;
    let id;
    let idMapper;
    let idGroups;

    group("Use Case: Sync Users and Groups From LDAP Server after removing LDAP User", function () {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Get access-token from Keycloak", function () {
            token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        group("Get existing external LDAP Settings on Keycloack", function () {
            let parameters = "?parent=master&type=" + Constants.LDAP_TYPE_USER_STORAGE;
            let response = LDAPServer.getLdapList(jSessionId, token, parameters);
            let body = JSON.parse(response.body);
            id = getLdapId(body, "name", Constants.LDAP_NAME + "_new");
            console.log("id: " + id);
        });

        group("Get existing external LDAP Mappers on Keycloack", function () {
            let parameters = "?parent=" + id + "&type=" + Constants.LDAP_TYPE_MAPPER_STORAGE;
            let response = LDAPServer.getLdapList(jSessionId, token, parameters);
            let body = JSON.parse(response.body);
            idMapper = getLdapId(body, "name", Constants.LDAP_MAPPER_NAME);
            console.log("idMapper: " + idMapper);
        });

        group("Sync external LDAP Users with Keycloack", function () {
            LDAPServer.syncLdapUsers(jSessionId, token, id);
        });

        group("Sync external LDAP Groups with Keycloack", function () {
            LDAPServer.syncLdapGroups(jSessionId, token, id, idMapper);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("Use Case: Login with User removed from external LDAP Server", function () {
        group("Log in as removed LDAP User", function () {
            jSessionId = ldapUser.login(401);
        });
    });

    group("Use Case: Delete external LDAP Configuration on Keycloack", function () {
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Get existing Groups on Keycloack", function () {
            let response = LDAPServer.getLdapGroupsList(jSessionId, token);
            let body = JSON.parse(response.body);
            idGroups = getLdapId(body, "name", Constants.LDAP_GROUPS_NAME);
            console.log("idGroups: " + idGroups);
        });

        group("Delete external LDAP Groups on Keycloack", function () {
            LDAPServer.deleteLdapGroups(jSessionId, token, idGroups);
            console.log("ID deleted " + idGroups);
        });

        group("Delete external LDAP Configuration on Keycloack", function () {
            LDAPServer.deleteLdapConfig(jSessionId, token, id);
            console.log("ID deleted " + id);
        });

        group("Logout as admin user", function () {
          soUser.logout(jSessionId);
        });
    });

    group("Use Case: Log in as LDAP user should fail when Keycloak User Federation is not configured", function () {
        group("Log in as LDAP User", function () {
            jSessionId = ldapUser.login(401);
        });
    });
}
