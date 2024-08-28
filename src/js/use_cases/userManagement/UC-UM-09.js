import { group } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { ClientID } from '../../modules/ClientId.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';

let config= JSON.parse(open('../../../resources/data/creating_client.json'));
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));
let updateConfig= JSON.parse(open('../../../resources/data/updating_client.json'));

function getClientId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

function getServiceRoleId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

export function userMgmtTenantApi(){
    let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

    let jSessionId;
    let token;
    let response;
    let idList;
    let secret;
    let client_id;
    let tokenSecret;
    let refreshToken;
    let serviceRolesId;
    let rolesIdListUser;
    let rolesIdListTenant;
    let addRoles;
    let deleteRoles;
    let accessToken;
    let refreshTokenU;

    let clientId = Constants.CLIENT_ID+ "_" + new Date().getTime();

    group("USECASE-1:Access User management Api", function() {

        //Login
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //Get access token
        group("Get access-token from Keycloak", function () {
            token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        group("Creating a client", function() {
            config['clientId'] = clientId;
            client_id= ClientID.setClientID(jSessionId,token,config);
            console.log("clientID: "+client_id);
        });

        /*first access the id then from client id access the secret*/
        group("Get existing client id", function() {
            let response = ClientID.getClientIdList(jSessionId,token,clientId);
            let body= JSON.parse(response.body);
            idList=getClientId(body,"clientId",clientId);
            console.log("id: "+ idList);
         });

        group("Get the client secret", function() {
            secret=ClientID.getClientSecret(jSessionId,token,idList).json()['value'];
            console.log("secret: "+ secret);
        });

        //Get service roles iD
        group("Get service roles id",function() {
            serviceRolesId=ClientID.getServiceRolesId(jSessionId,token,idList).json()['id'];
            console.log("serviceRolesId: "+serviceRolesId);
        });

        //Get UserAdmin role id
        group("Get UserAdmin role id", function() {
            let response = ClientID.getServiceRolesIdList(jSessionId,token,serviceRolesId);
            let body= JSON.parse(response.body);
            rolesIdListUser=getServiceRoleId(body,"name","UserAdmin");
            console.log("id: "+ rolesIdListUser);
         });

         group("Add the UserAdmin roles", function() {
             realmRoles[0]['id'] = rolesIdListUser;
             realmRoles[0]['name'] = "UserAdmin";
             addRoles=ClientID.setServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
             console.log("Roles added: "+addRoles);
         });

         //Get access token using client_id and client_secret
        group("Get access token using client_id and secret", function() {
            tokenSecret=soUser.getKeyCloackTokenSecret(clientId,secret).json()['access_token'];
        });

        //enable the refresh token
        group("Add the refresh token",function() {
            updateConfig['id']=idList;
            updateConfig['clientId']=clientId;
            ClientID.updateClientId(jSessionId,token,updateConfig,idList);
        });

        //Get refresh token using client_id and client_secret
        group("Get refresh token using client_id and secret", function() {
            refreshToken=soUser.getKeyCloackTokenSecret(clientId,secret).json()['refresh_token'];
        });

        group("Get User management Api", function() {
            let userMgmt;
            userMgmt=ClientSecretFlow.getUserMgmt(tokenSecret,refreshToken,200);
            console.log("Usermgmt:"+userMgmt)
        });

        group("Get Password Policy Api", function() {
            let tenantMgmt;
            tenantMgmt=ClientSecretFlow.getTenantMgmt(tokenSecret,refreshToken,200);
            console.log("PasswordPolicy:"+tenantMgmt);
        });

         group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    /* group("USECASE-2:Access Tenant Mgmt Api", function() {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //Get TenantAdmin role id
        group("Get TenantAdmin role id", function() {
            let response = ClientID.getServiceRolesIdList(jSessionId,token,serviceRolesId);
            let body= JSON.parse(response.body);
            rolesIdListTenant=getServiceRoleId(body,"name","TenantAdmin");
            console.log("id: "+ rolesIdListTenant);
         });

         //Add the TenantAdmin roles
         group("Add the TenantAdmin roles", function() {
             realmRoles[0]['id'] = rolesIdListTenant;
             realmRoles[0]['name'] = "TenantAdmin";
             addRoles=ClientID.setServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
             console.log("Roles added: "+addRoles);
         });

         group("Get Tenant management Api", function() {
            let tenantMgmt;
            tenantMgmt=ClientSecretFlow.getTenantMgmt(tokenSecret,refreshToken,200);
            console.log("TenantMgmt:"+tenantMgmt);
         });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    }); */

    group("USECASE-2: Negative-test - Access Denied for User Mgmt API without roles",function() {

        group("Remove the UserAdminroles",function() {
            realmRoles[0]['id'] = rolesIdListUser;
            realmRoles[0]['name'] = "UserAdmin";
            deleteRoles=ClientID.deleteServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
            console.log("Delete Roles:"+deleteRoles);
        });

/*         group("Remove the TenantAdmin roles",function() {
            realmRoles[0]['id'] = rolesIdListTenant;
            realmRoles[0]['name'] = "TenantAdmin";
            deleteRoles=ClientID.deleteServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
            console.log("Delete Roles:"+deleteRoles);
        }); */

        group("Get access token using client_id and secret", function() {
            accessToken=soUser.getKeyCloackTokenSecret(clientId,secret).json()['access_token'];
        });

        //enable the refresh token
        group("Add the refresh token",function() {
            updateConfig['id']=idList;
            updateConfig['clientId']=clientId;
            ClientID.updateClientId(jSessionId,token,updateConfig,idList);
        });

        //Get refresh token using client_id and client_secret
        group("Get refresh token using client_id and secret", function() {
            refreshTokenU=soUser.getKeyCloackTokenSecret(clientId,secret).json()['refresh_token'];
        });

        group("Get User management Api without roles", function() {
            let userMgmt;
            userMgmt=ClientSecretFlow.getUserMgmt(accessToken,refreshTokenU,401);
            console.log("Usermgmt:"+userMgmt)
         });
    });

    group("USECASE-3: Negative Test-Access User Mgmt API without using access token in header Authentication Bearer",function(){

        group("Access User Mgmt API call without using access token", function(){
            ClientSecretFlow.getUserMgmt(tokenSecret=" ",refreshToken,401);
        });
    });

    group("Usecase 4: Deleting the Client", function() {

        //Login
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //Delete the client
        group("Delete the client", function () {
            ClientID.deleteClient(token,clientId,idList);
        });

        //Logout
        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });
}