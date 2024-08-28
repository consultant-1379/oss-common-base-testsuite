import { group, sleep } from 'k6';
import { User } from '../../modules/User.js';
import { LDAPServer } from '../../modules/LDAPServer.js';
import * as Constants from '../../modules/Constants.js';

let config = JSON.parse(open('../../../resources/data/external_ldap_config.json'));
let mapper = JSON.parse(open('../../../resources/data/external_ldap_mapper_config.json'));
let connection_test = JSON.parse(open('../../../resources/data/external_ldap_connection_test.json'));


function getLdapId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

export function createExternalLdapConfig() {
    let soUser = new User(Constants.GAS_USER,
                          Constants.GAS_USER_PWD,
                          Constants.TENANT_NAME,
                          Constants.GAS_URL);

    let ldapUser = new User(Constants.LDAP_USER,
                            Constants.LDAP_USER_PWD,
                            Constants.TENANT_NAME,
                            Constants.GAS_URL);

    let fakeLdapUser = new User("fakeLdapUser",
                            Constants.LDAP_USER_PWD,
                            Constants.TENANT_NAME,
                            Constants.GAS_URL);
    let jSessionId;
    let token;
    let token_ldap_user;
    let id;
    let idMapper;
    let idGroups;
    let idMemberUser;
    let idRole;
    let idRoleGroup;

    group("Use Case: Apply external LDAP Configuration on Keycloack", function () {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
            //console.log("env: " + `ldap://${__ENV.EXTERNAL_LDAP_IP}`);
        });

        group("Get access-token from Keycloak", function () {
            token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        group("Apply external LDAP Settings on Keycloack", function () {
            config['name'] = Constants.LDAP_NAME;
            config['config']['connectionUrl'] = ["ldap://" + Constants.LDAP_SERVICE_NAME];
            //config['config']['connectionUrl'] = [`ldap://${__ENV.EXTERNAL_LDAP_IP}`];
            config['config']['usersDn'] = [Constants.LDAP_USERS_DN];
            config['config']['bindDn'] = [Constants.LDAP_BIND_DN];
            config['config']['bindCredential'] = [Constants.LDAP_BIND_PWD];
            let response = LDAPServer.setLdapConfig(jSessionId, token, config);
        });

        group("Get external LDAP Settings on Keycloack", function () {
            let parameters = "?parent=master&type=" + Constants.LDAP_TYPE_USER_STORAGE;
            let response = LDAPServer.getLdapList(jSessionId, token, parameters);
            let body = JSON.parse(response.body);
            id = getLdapId(body, "name", Constants.LDAP_NAME);
            console.log("id: " + id);
        });

        group("Test external LDAP connection", function () {
            //connection_test['connectionUrl'] = `ldap://${__ENV.EXTERNAL_LDAP_IP}`;
            connection_test['connectionUrl'] = "ldap://" + Constants.LDAP_SERVICE_NAME;
            console.log("connectionUrl: " + connection_test['connectionUrl']);
            let response = LDAPServer.checkLdapConnection(jSessionId, token, connection_test);
        });

        group("Test external LDAP Authentication", function () {
            connection_test['action'] = "testAuthentication";
            connection_test['bindDn'] = "cn=admin,dc=example,dc=org";
            connection_test['bindCredential'] = "admin";
            console.log("authenticationUrl: " + connection_test['connectionUrl']);
            LDAPServer.checkLdapConnection(jSessionId, token, connection_test);
        });

        sleep(2);

        group("Check external LDAP Authentication with TLS", function () {
            connection_test['connectionUrl'] = "ldaps://" + Constants.LDAP_SERVICE_NAME;
            console.log("authenticationUrl: " + connection_test['connectionUrl']);
            LDAPServer.checkLdapConnection(jSessionId, token, connection_test);
        });

        group("Apply external LDAP Mappers on Keycloack", function () {
            mapper['name'] = Constants.LDAP_MAPPER_NAME;
            mapper['parentId'] = id;
            mapper['config']['groups.dn'] = [Constants.LDAP_MAPPER_GROUPS_DN];
            let response = LDAPServer.setLdapConfig(jSessionId, token, mapper);

        });

        group("Get external LDAP Mappers on Keycloack", function () {
            let parameters = "?parent=" + id + "&type=" + Constants.LDAP_TYPE_MAPPER_STORAGE;
            let response = LDAPServer.getLdapList(jSessionId, token, parameters);
            let body = JSON.parse(response.body);
            idMapper = getLdapId(body, "name", Constants.LDAP_MAPPER_NAME);
            console.log("idMapper: " + idMapper);
        });

        group("Sync external LDAP Users with Keycloack", function () {
            let response = LDAPServer.syncLdapUsers(jSessionId, token, id);
        });

        group("Sync external LDAP Groups with Keycloack", function () {
            let response = LDAPServer.syncLdapGroups(jSessionId, token, id, idMapper);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("Use Case: Login successfully with an user present in external LDAP server with Default Role", function () {
        group("Log in as LDAP User with default role", function () {
            jSessionId = ldapUser.login();
        });

        group("Try to access LogViewer App should fail with access denied", function () {
            ldapUser.get_logViewer_home_page(jSessionId, 403);
        });

        group("Try to access User Management UI should fail with access denied", function () {
            ldapUser.getUsers(jSessionId, 403);
        });

        group("Logout as LDAP User with default role", function () {
            ldapUser.logout(jSessionId);
        });
    });

    //Assign Role TO GROUP
    group("Use Case: Assign LogViewer Role to Group", function () {
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Get existing Groups on Keycloack", function () {
            let response = LDAPServer.getLdapGroupsList(jSessionId, token);
            let body = JSON.parse(response.body);
            idGroups = getLdapId(body, "name", Constants.LDAP_GROUPS_NAME);
            console.log("idGroups: " + idGroups);
        });

        group("Get available Roles List for the Group", function () {
            let response = LDAPServer.getGroupRolesList(jSessionId, token, idGroups);
            let body = JSON.parse(response.body);
            idRoleGroup = getLdapId(body, "name", Constants.LDAP_GROUP_ROLE);
            console.log("idRoleGroup: " + idRoleGroup);
        });

        group("Set LogViewer Role to Group", function () {
            LDAPServer.setRoleToGroup(jSessionId, token, idGroups, idRoleGroup);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("Use Case: Login successfully with an user present in external LDAP server with LogViewer role", function () {
        group("Log in as LDAP user with LogViewer role", function () {
            jSessionId = ldapUser.login();
        });

        group("Try to access LogViewer App should succeed", function () {
            ldapUser.get_logViewer_home_page(jSessionId);
        });

        group("Try to access User Management UI should fail with access denied", function () {
            ldapUser.getUsers(jSessionId, 403);
        });

        group("Logout as LDAP user with LogViewer role", function () {
            ldapUser.logout(jSessionId);
        });
    });

    //Assign Role ONLY TO USER AND NOT TO GROUP
    group("Use Case: Assign OSSPortalAdmin role to User Member of Group on Keycloack", function () {
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Get existing User Member of Group on Keycloack", function () {
            let response = LDAPServer.getMembersList(jSessionId, token, idGroups);
            let body = JSON.parse(response.body);
            idMemberUser = getLdapId(body, "username", Constants.LDAP_USER);
            console.log("idMemberUser: " + idMemberUser);
        });

        group("Get available Roles for the User", function () {
            let response = LDAPServer.getMemberRolesList(jSessionId, token, idMemberUser);
            let body = JSON.parse(response.body);
            idRole = getLdapId(body, "name", Constants.LDAP_USER_ROLE);
            console.log("idRole: " + idRole);
        });

        group("Set OSSPortalAdmin Role to User Member of Group on Keycloack", function () {
            let response = LDAPServer.setRoleToMember(jSessionId, token, idMemberUser, idRole);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("Use Case: Login successfully with an user present in external LDAP server with OSSPortalAdmin role", function () {
        group("Log in as LDAP user", function () {
            jSessionId = ldapUser.login();
        });

        group("Try to access User Management UI should succeed", function () {
            ldapUser.getUsers(jSessionId);
        });

        group("Get access-token from Keycloak", function () {
            token_ldap_user = ldapUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        group("Modify external LDAP Settings on Keycloack should succeed", function () {
            config['name'] = Constants.LDAP_NAME + "_new";
            LDAPServer.modifyLdapConfig(jSessionId, token_ldap_user, config, id);
        });

        group("Logout as LDAP user", function () {
            ldapUser.logout(jSessionId);
        });
    });

    group("Use Case: Log in as not existing LDAP user should fail", function () {
        group("Log in as not existing user", function () {
            jSessionId = fakeLdapUser.login(401);
        });
    });
}
