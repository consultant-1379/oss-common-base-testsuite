import { group } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { ClientID } from '../../modules/ClientId.js';
import { LogViewer } from '../../modules/LogViewer.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';

let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
let updateConfig= JSON.parse(open('../../../resources/data/updating_client.json'));
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));


function getServiceRoleId(array, key, value){
  for (let i = 0; i < array.length; ++i){
    if(array[i][key] === value){
      return array[i].id;
    }
  }
}

export function LogAPI_ExtApps_Application_ReadOnly() {

  let gasUser = new User(Constants.GAS_USER,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL);
  let jSessionId;
  let token;
  let secret;
  let tokenSecret;
  let refreshToken;
  let accessToken;
  let clientId;

  let clientName = Constants.CLIENT_ID+ "_" + new Date().getTime();

  group("Test cases on LogAPI_ExtApps_Application_ReadOnly role", function() {

    //Login
    group("Log in as admin user", function () {
      jSessionId = gasUser.login();
    });

    group("Get access-token from Keycloak", function () {
      token = gasUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Creating rapp client", function() {
      config['clientId'] = clientName;
      //Enable Refresh Token
      config['attributes']['client_credentials.use_refresh_token'] = "true";
      //Create Clients
      ClientID.createRappClient(jSessionId, token, config);
    });

    //Get Client ID
    group("Retrieve ID for New Client just created", function() {
      let response = ClientID.getClientIdList(jSessionId, token, clientName);
      let body = JSON.parse(response.body);
      clientId = body[0].id;
    });

    //Get Secret
    group("Generate Secret for New Client",function(){
      secret = ClientID.regenerateClientSecret(jSessionId, token, clientName).json()['secret'];
    });
    //Provide the new Client with a Role in order to perform all endpoints calls
    //Get service roles iD
    let serviceRolesId
    group("Get service roles id",function() {
     serviceRolesId = ClientID.getServiceRolesId(jSessionId, token, clientId).json()['id'];
     console.log("serviceRolesId: " + serviceRolesId);
    });

    //Get LogAPI_ExtApps_Application_ReadOnly role id
    let rolesIdListUser;
    group("Get LogAPI_ExtApps_Application_ReadOnly role id", function() {
      let response = ClientID.getServiceRolesIdList(jSessionId, token, serviceRolesId);
      let body = JSON.parse(response.body);
      rolesIdListUser = getServiceRoleId(body, "name", "LogAPI_ExtApps_Application_ReadOnly");
      console.log("id: "+ rolesIdListUser);
    });

    //Add LogAPI_ExtApps_Application_ReadOnly role to the Client
    group("Add the LogAPI_ExtApps_Application_ReadOnly role to the new Client", function() {
      realmRoles[0]['id'] = rolesIdListUser;
      realmRoles[0]['name'] = "LogAPI_ExtApps_Application_ReadOnly";
      let addRoles = ClientID.setServiceRoles(jSessionId, token, serviceRolesId, realmRoles);
      console.log("Roles added: " + addRoles);
    });

    //Get Access and Refresh Token for a particular clientId and Secret
    group("Get Access and Refresh Token for New Client", function() {
      let responseToken = gasUser.getKeyCloackTokenSecret(clientName, secret);
      accessToken = responseToken.json()['access_token'];
      refreshToken = responseToken.json()['refresh_token'];
    });

    //Use case 1: Get logs of the R-app log-planes via Search Engine API endpoint
    group("search R-app log-plane logs", function () {
      ClientSecretFlow.searchRappLogs(accessToken, refreshToken, 200);
    });

    //Use case 2: Get logs of the Eiap log-planes via Search Engine API endpoint(should not be retrieved)
    group("search Eiap log-plane logs", function () {
      ClientSecretFlow.searchEiapLogs(accessToken, refreshToken, 403);
    });

    //Delete the client
    group("Delete the client", function () {
      ClientID.deleteClient(token, clientName, clientId);
    });

    group("Logout as admin user", function () {
      gasUser.logout(jSessionId);
    });
  });
}
