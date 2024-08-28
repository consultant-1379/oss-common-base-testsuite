import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { ClientID } from '../../modules/ClientId.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';
import { SharedArray } from 'k6/data';
import { vu, scenario, exec, test } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';

export const enableDisableClientsPolicy = new Trend('Enable Disable Clients Cuncurrent Users');
export const getExternalClientsPolicy = new Trend('Get All External Clients Cuncurrent Users');
export const getClientSecretPolicy = new Trend('Get Client Secret Cuncurrent Users');
export const regenerateClientSecretPolicy = new Trend('Regenerate Client Secret Cuncurrent Users');
export const updateRealmRolesPolicy = new Trend('Update Realm Roles Cuncurrent Users');
export const viewRoleMappingPolicy= new Trend('View Role Mapping Cuncurrent Users');
export const getProtocolMapperPolicy = new Trend('Get Protocol Mapper Cuncurrent Users');
export const createProtocolMapperPolicy = new Trend('Create Protocol Mapper Cuncurrent Users');
export const updateProtocolMapperPolicy = new Trend('Update Protocol Mapper Cuncurrent Users');
export const deleteProtocolMapperPolicy = new Trend('Delete Protocol Mapper Cuncurrent Users');
export const getClaimsPolicy = new Trend('Get Claims Cuncurrent Users');

export const enableDisableClientsSecretFlowPolicy = new Trend('Enable Disable Clients Cuncurrent Users Client Credential Flow');
export const getExternalClientsSecretFlowPolicy = new Trend('Get All External Clients Cuncurrent Users Client Credential Flow');
export const getClientSecretSecretFlowPolicy = new Trend('Get Client Secret Cuncurrent Users Client Credential Flow');
export const regenerateClientSecretSecretFlowPolicy = new Trend('Regenerate Client Secret Cuncurrent Users Client Credential Flow');
export const updateRealmRolesSecretFlowPolicy = new Trend('Update Realm Roles Cuncurrent Users Client Credential Flow');
export const viewRoleMappingSecretFlowPolicy= new Trend('View Role Mapping Cuncurrent Users Client Credential Flow');
export const getProtocolMapperSecretFlowPolicy = new Trend('Get Protocol Mapper Cuncurrent Users Client Credential Flow');
export const createProtocolMapperSecretFlowPolicy = new Trend('Create Protocol Mapper Cuncurrent Users Client Credential Flow');
export const updateProtocolMapperSecretFlowPolicy = new Trend('Update Protocol Mapper Cuncurrent Users Client Credential Flow');
export const deleteProtocolMapperSecretFlowPolicy = new Trend('Delete Protocol Mapper Cuncurrent Users Client Credential Flow');
export const getClaimsSecretFlowPolicy = new Trend('Get Claims Cuncurrent Users Client Credential Flow');

// MIX SCENARIO - USERS AND CLIENTS AUTHENTICATED PERFORMING CLIENT API ENDPOINTS CALLS
// MAX CONCURRENT CLIENTS (X/2), KPIs FOR CLIENT MANAGEMENT
// MAX CONCURRENT USERS (X/2), KPIs FOR CLIENT MANAGEMENT
// VUS IS X/2
// LOAD FACTOR:
// X TOTAL SESSIONS AUTHENTICATED THAT MEANS X/2 CONCURRENT CLIENTS + X/2 USERS LOGGED IN
// 11 ENDPOINTS TO BE CALLED
// X/2*11 + X/2*11 -> X*11 -> 2*VUS*11 CONCURRENT REQUESTS AT SAME TIME
// Y CLIENTS PRE-POPULATED IN DB


//CLIENTS TO POPULATE DB
let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
//CONFIG MAPPER TEMPLATE
let configMapper = JSON.parse(open('../../../resources/data/creating_client_mapper.json'));
//SERVICE ROLE TEMPLATE
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));

//OPTIONS FILE TO RETRIEVE NUMBER OF VUS
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/userManagement/UC-UM-11_mix.options.json'));
  return new Array(f);
}
const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);

const VUS = sharedOptionsFile[0].scenarios.concurrent_users_kpi_getAllExternalClients.vus;

function getServiceRoleId(array, key, value){
  for (let i = 0; i < array.length; ++i){
      if(array[i][key] === value){
          return array[i].id;
      }
  }
}

let jSessionIdArray = [];
let clientIdListArray = [];
let concurrentClientIdListArray = [];
let accessArray = [];
let refreshArray = [];
let dataArray = [];

//IN THIS CASE OF MIXED SCEANRIO VUS=X/2
//MAX_CLIENTS must be > 5*X -> 10*VUS
//This because we identified 5 different areas to work with different clients
// from 1 to X -> from 1 to 2*VUS for all GET request
// from X+1 to 2*X -> from 2*VUS+1 to 4*VUS for Regenerating Client Secret, Creating Protol Mapper and Update Realm Roles to Service Accoiunt User
// from 2*X+1 to 3*X -> from 4*VUS+1 to 6*VUS for Updating Protocol Mapper
// from 3*X+1 to 4*X -> from 6*VUS+1 to 8*VUS for Deleting Protocol Mapper
// 4*X+1 to 5*X -> from 8*VUS+1 to 10*VUS for Disabling Clients
const MAX_CLIENTS = 200;

function getNewUser(name){
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

export function setupEnv() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
  let jSessionId;
  let token;
  let secret;
  let accessToken;
  let refreshToken;

  const CLIENT_NAME = "client_kpis_" + new Date().getTime() + "_";
  const USER_NAME = "user_client_kpis_" + new Date().getTime() + "_";
  const CONCURRENT_CLIENT_NAME = "concurrent_client_kpis_" + new Date().getTime() + "_";
  const CLIENT_MAPPER_NAME = Constants.CLIENT_MAPPER + "_" + new Date().getTime() + "_";

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Get access-token from Keycloak", function () {
    token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
  });

  //Create MAX_CLIENTS IN DB AND GET idClientList
  group("Creating rapp clients to populate DB and get ID",function(){
    for (let i = 0; i < MAX_CLIENTS; ++i){
      config['clientId'] = CLIENT_NAME+i;
      //Create Clients
      ClientID.createRappClient(jSessionId,token,config);

      //Get Client ID
      let response = ClientID.getClientIdList(jSessionId,token,CLIENT_NAME+i);
      let body = JSON.parse(response.body);
      clientIdListArray[i] = body[0].id;
    }
  });

  //CREATE PROTOCOL MAPPER
  //Don't need all clients to have pre-populated protocol mapper but we just need 4*X protocol mapper
  //This because 4 different ares to work with protocol mapper
  group("Creating protocol mapper to populate DB",function(){
    for (let i = 0; i < 8*VUS; ++i){
      configMapper["name"] = CLIENT_MAPPER_NAME+i;
      ClientID.createClientMapper(jSessionId,token,configMapper,CLIENT_NAME+i);
    }
  });

  //CREATE AND LOGIN CUNCURRENT USERS
  group("Create concurrent users with OSSPortalAdmin role", function () {
    //Concurrent users performing operations in Use Cases
    for (let i = 0; i < VUS; ++i){
      let user = getNewUser(USER_NAME+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);

      //LOGIN of concurrent users
      jSessionIdArray[i] = newUser.login();
    }
  });

  //Create CONCURRENT CLIENTS IN DB AND GET idClientList
  group("Creating concurrent clients to perform Use Cases and get ID",function(){
    for (let i = 0; i < VUS; ++i){
      config['clientId'] = CONCURRENT_CLIENT_NAME+i;
      //Enable Refresh Token
      config['attributes']['client_credentials.use_refresh_token'] = "true";
      //Create Clients
      ClientID.createRappClient(jSessionId,token,config);

      //Get Client ID
      group("Retrieve ID for New Client just created",function(){
        let response = ClientID.getClientIdList(jSessionId,token,CONCURRENT_CLIENT_NAME+i);
        let body = JSON.parse(response.body);
        concurrentClientIdListArray[i] = body[0].id;
      });

      //Get Secret
      group("Generate Secret for New Client",function(){
        secret = ClientID.regenerateClientSecret(jSessionId,token,CONCURRENT_CLIENT_NAME+i).json()['secret'];
        //secretArray[i] = secret;
      });

      //Provide the new Client with a Role in order to perform all endpoints calls
      //Get service roles iD
      let serviceRolesId
      group("Get service roles id",function() {
        serviceRolesId = ClientID.getServiceRolesId(jSessionId,token,concurrentClientIdListArray[i]).json()['id'];
        console.log("serviceRolesId: "+serviceRolesId);
      });

      //Get OSSPortalAdmin role id
      let rolesIdListUser;
      group("Get OSSPortalAdmin role id", function() {
        let response = ClientID.getServiceRolesIdList(jSessionId,token,serviceRolesId);
        let body = JSON.parse(response.body);
        rolesIdListUser = getServiceRoleId(body,"name","OSSPortalAdmin");
        console.log("id: "+ rolesIdListUser);
      });

      //Add OSSPortalAdmin role to the Client
      group("Add the OSSPortalAdmin roles to the new Client", function() {
          realmRoles[0]['id'] = rolesIdListUser;
          realmRoles[0]['name'] = "OSSPortalAdmin";
          let addRoles=ClientID.setServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
          console.log("Roles added: "+addRoles);
      });

      //Get Access and Refresh Token for a particular clientId and Secret
      group("Get Access and Refresh Token for New Client",function(){
        let responseToken = soUser.getKeyCloackTokenSecret(CONCURRENT_CLIENT_NAME+i,secret);
        accessToken = responseToken.json()['access_token'];
        refreshToken = responseToken.json()['refresh_token'];
        accessArray[i] = accessToken;
        refreshArray[i] = refreshToken;
      });
    }
  });

  dataArray[0] = CLIENT_NAME;
  dataArray[1] = CONCURRENT_CLIENT_NAME;
  dataArray[2] = concurrentClientIdListArray;
  dataArray[3] = clientIdListArray;
  dataArray[4] = CLIENT_MAPPER_NAME;
  dataArray[5] = accessArray;
  dataArray[6] = refreshArray;
  dataArray[7] = USER_NAME;
  dataArray[8] = jSessionIdArray;

  return dataArray;
}

export function teardownEnv(data) {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;
  let token;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Get access-token from Keycloak", function () {
    token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
  });

  group("Delete rapp clients", function () {
    for (let i = 0; i < MAX_CLIENTS; ++i){
      let clientId = data[0]+i;
      let idList = data[3][i];
      //check if idList is not null, undefined, NaN, 0, false or empty string ""
      if(idList){
        ClientID.deleteClient(token,clientId,idList);
      }
    }
  });

  group("Delete concurrent clients", function () {
    for (let i = 0; i < VUS; ++i){
      let clientId = data[1]+i;
      let idList = data[2][i];
      //check if idList is not null, undefined, NaN, 0, false or empty string ""
      if(idList){
        ClientID.deleteClient(token,clientId,idList);
      }
    }
  });

  group("Delete concurrent users with OSSPortalAdmin role", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[7]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}


//#### USERS WEB FLOW
export function usermgmtKpiEnvEnableDisableClients(data) {
  let response;
  let token;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 8*VUS + iter;
  //Sessions of active concurrent users sre 5 if VUS=5
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Enable/Disable Clients and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Disable client status",function(){
      let status = "DISABLED";
      let clientId = data[0] + gap;
      response = ClientID.toggleClient(jSessionId,token,clientId,status);
    });

    group("Cuncurrent Users - Verify disable clients KPI", function () {
      enableDisableClientsPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetAllExternalClients(data) {
  let response;
  let token;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //Session of active concurrent users
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get All External Clients and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get all External Clients",function(){
      response = ClientID.getRappClientId(jSessionId,token);
    });

    group("Cuncurrent Users - Verify get all external clients KPI", function () {
      getExternalClientsPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetClientsSecret(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Get Client Secret and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Client Secret",function(){
      //Get Client Secret of first 5 Clients because of 5 VUs
      let idList = data[3][iter];
      response = ClientID.getClientSecret(jSessionId, token, idList);
      console.log("client secret for " + idList + " is: " + response.body);
    });

    group("Cuncurrent Users - Verify get client secret KPI", function () {
      getClientSecretPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvRegenerateClientsSecret(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let gap = 2*VUS + iter;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Regenerate Client Secret and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Regenerate Client Secret",function(){
      //Regenerate Client Secret from 11 to 15 Clients because of 5 VUs
      let clientId = data[0] + gap;
      response = ClientID.regenerateClientSecret(jSessionId,token,clientId);
      console.log("regenerated client secret for " + clientId + " is: " + response.body);
    });

    group("Cuncurrent Users - Verify regenerate client secret KPI", function () {
      regenerateClientSecretPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvViewRoleMapping(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Role Mapping assigned to service-account user and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("View service assigned roles",function(){
      //Get Client Role Mapping of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      response = ClientID.getServiceRoles(jSessionId,token,clientId);
    });

    group("Cuncurrent Users - Verify get role mapping KPI", function () {
      viewRoleMappingPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateRealmRoles(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let gap = 2*VUS + iter;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Update Realm Roles to Service Accoiunt User and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Update realm roles to service account user",function(){
      //Update realm roles from 10 to 14 because of 5 VUs
      let clientId = data[0] + gap;
      response = ClientID.updateServiceRoles(jSessionId,token,clientId);
    });

    group("Cuncurrent Users - Verify update roles to service account user KPI", function () {
      updateRealmRolesPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetProtocolMapper(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Protocol Mapper and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Protocol Mapper",function(){
      //Get Protocol Mapper of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      response = ClientID.getAllProtocolMappers(jSessionId,token,clientId);
    });

    group("Cuncurrent Users - Verify get protocol mapper KPI", function () {
      getProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvCreateProtocolMapper(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let gap = 2*VUS + iter;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  //Create Protocol Mapper for Clients from 10 to 14 because of 5 VUs
  group("Use Case: Cuncurrent Users - Create Protocol Mapper and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Creating a client mapper",function(){
      let clientId = data[0] + gap;
      configMapper["name"] = "new_" + data[4] + gap;
      response = ClientID.createClientMapper(jSessionId,token,configMapper,clientId);
    });

    group("Cuncurrent Users - Verify create mapper KPI", function () {
      createProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetClaims(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Claims and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Claims",function(){
      //Get Claims of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      let mapper_name = data[4] + iter;
      response = ClientID.getProtocolMapperByName(jSessionId,token,clientId,mapper_name);
    });

    group("Cuncurrent Users - Verify get claims KPI", function () {
      getClaimsPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateProtocolMapper(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let gap = 4*VUS + iter;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  //Update Protocol Mapper for Clients from 20 to 24 because of 5 VUs
  group("Use Case: Cuncurrent Users - Update Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Update claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientID.updateProtocolMapper(jSessionId,token,clientId,mapper_name);
    });

    group("Cuncurrent Users - Verify update claims of client mapper KPI", function () {
      updateProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvDeleteProtocolMapper(data) {
  let response;
  let token;
  let iter = scenario.iterationInTest;
  let gap = 6*VUS + iter;
  let jSessionId = data[8][iter];
  let user = getNewUser(data[7]+iter);
  let newUser = create_user(user);
  //Delete Protocol Mapper for Clients from 30 to 34 because of 5 VUs
  group("Use Case: Cuncurrent Users - Delete Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Delete claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientID.deleteProtocolMapper(jSessionId,token,clientId,mapper_name);
    });

    group("Cuncurrent Users - Verify delete claims of client mapper KPI", function () {
      deleteProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}


//#### CLIENT SECRET FLOW
export function usermgmtKpiEnvEnableDisableClientsSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //WORKING ON CLIENTS IN DB FROM 4*X + VUS TO 4*X + 2*VUS
  let gap = 9*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Enable/Disable Clients and Verify KPIs", function () {

    group("Client Secret Auth Flow - Disable client status",function(){
      let status = "DISABLED";
      let clientId = data[0] + gap;
      response = ClientSecretFlow.toggleClient(tokenSecret,refreshToken,clientId,status);
    });

    group("Cuncurrent Clients - Verify disable clients KPI", function () {
      enableDisableClientsSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetAllExternalClientsSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Get All External Clients and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get all External Clients",function(){
      response = ClientSecretFlow.getAllExternalClients(tokenSecret,refreshToken);
    });

    group("Cuncurrent Clients - Verify get all external clients KPI", function () {
      getExternalClientsSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetClientsSecretSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Get Client Secret and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Client Secret",function(){
      //Get Client Secret of first 5 Clients because of 5 VUs
      let idList = data[3][iter];
      response = ClientSecretFlow.getClientSecret(tokenSecret,refreshToken,idList);
      console.log("client secret for " + idList + " is: " + response.body);
    });

    group("Cuncurrent Clients - Verify get client secret KPI", function () {
      getClientSecretSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvRegenerateClientsSecretSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 3*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Regenerate Client Secret and Verify KPIs", function () {

    group("Client Secret Auth Flow - Regenerate Client Secret",function(){
      //Regenerate Client Secret from 15 to 20 Clients because of VUS=5 and gap
      let clientId = data[0] + gap;
      response = ClientSecretFlow.regenerateClientSecret(tokenSecret,refreshToken,clientId);
      console.log("regenerated client secret for " + clientId + " is: " + response.body);
    });

    group("Cuncurrent Clients - Verify regenerate client secret KPI", function () {
      regenerateClientSecretSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvViewRoleMappingSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Role Mapping assigned to service-account user and Verify KPIs", function () {

    group("Client Secret Auth Flow - View service assigned roles",function(){
      //Get Client Role Mapping of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      response = ClientSecretFlow.getServiceRoles(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify get role mapping KPI", function () {
      viewRoleMappingSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateRealmRolesSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 3*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Update Realm Roles to Service Accoiunt User and Verify KPIs", function () {

    group("Client Secret Auth Flow - Update realm roles to service account user",function(){
      //Update realm roles from 15 to 19 because of 5 VUs and gap
      let clientId = data[0] + gap;
      response = ClientSecretFlow.updateServiceRoles(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify update roles to service account user KPI", function () {
      updateRealmRolesSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetProtocolMapperSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Protocol Mapper",function(){
      //Get Protocol Mapper of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      response = ClientSecretFlow.getAllProtocolMappers(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify get protocol mapper KPI", function () {
      getProtocolMapperSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvCreateProtocolMapperSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 3*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Create Protocol Mapper for Clients from 15 to 19 because of 5 VUs and gap
  group("Use Case: Cuncurrent Clients - Create Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Creating a client mapper",function(){
      let clientId = data[0] + gap;
      configMapper["name"] = "new_" + data[4] + gap;
      response = ClientSecretFlow.createClientMapper(tokenSecret,refreshToken,configMapper,clientId);
    });

    group("Cuncurrent Clients - Verify create mapper KPI", function () {
      createProtocolMapperSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetClaimsSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Claims and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Claims",function(){
      //Get Claims of first 5 Clients because of 5 VUs
      let clientId = data[0] + iter;
      let mapper_name = data[4] + iter;
      response = ClientSecretFlow.getProtocolMapperByName(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify get claims KPI", function () {
      getClaimsSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateProtocolMapperSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 5*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Update Protocol Mapper for Clients from 25 to 29 because of 5 VUs and gap
  group("Use Case: Cuncurrent Clients - Update Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Update claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientSecretFlow.updateProtocolMapper(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify update claims of client mapper KPI", function () {
      updateProtocolMapperSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvDeleteProtocolMapperSecretFlow(data) {
  let response;
  //From 1 to 5 because of 5 VUs
  let iter = scenario.iterationInTest;
  let gap = 7*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Delete Protocol Mapper for Clients from 35 to 39 because of 5 VUs and gap
  group("Use Case: Cuncurrent Clients - Delete Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Delete claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientSecretFlow.deleteProtocolMapper(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify delete claims of client mapper KPI", function () {
      deleteProtocolMapperSecretFlowPolicy.add(response.timings.duration);
    });
  });
}



