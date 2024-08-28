import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { ClientID } from '../../modules/ClientId.js';
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

// MAX CONCURRENT USERS X=VUS, KPIs FOR CLIENT MANAGEMENT
// LOAD FACTOR:
// Y=MAX_CLIENTS CLIENTS PRE-POPULATED IN DB
// VUS USERS LOGGED-IN WITH NORMAL LOGIN FLOW FOR CONCURRENCY


//CLIENTS TO POPULATE DB
let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
let configMapper = JSON.parse(open('../../../resources/data/creating_client_mapper.json'));

//OPTIONS FILE TO RETRIEVE NUMBER OF VUS
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/userManagement/UC-UM-11.options.json'));
  return new Array(f);
}
const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);

const VUS = sharedOptionsFile[0].scenarios.concurrent_users_kpi_getAllExternalClients.vus;

let jSessionIdArray = [];
let clientIdListArray = [];
let dataArray = [];

//MAX_CLIENTS must be > 5*VUS
//This because we identified 5 different areas to work with different clients
// from 1 to VUS for all GET request
// from VUS+1 to 2*VUS for Regenerating Client Secret, Creating Protol Mapper and Update Realm Roles to Service Accoiunt User
// from 2*VUS+1 to 3*VUS for Updating Protocol Mapper
// from 3*VUS+1 to 4*VUS for Deleting Protocol Mapper
// 4*VUS+1 to 5*VUS for Disabling Clients
const MAX_CLIENTS = 300;

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

  const CLIENT_NAME = "client_kpis_" + new Date().getTime() + "_";
  const USER_NAME = "user_client_kpis_" + new Date().getTime() + "_";
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
  //Don't need all clients to have pre-populated protocol mapper but we just need 4*VUS protocol mapper
  //This because 4 different ares to work with protocol mapper
  group("Creating protocol mapper to populate DB",function(){
    for (let i = 0; i < 4*VUS; ++i){
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

  dataArray[0] = CLIENT_NAME;
  dataArray[1] = USER_NAME;
  dataArray[2] = jSessionIdArray;
  dataArray[3] = clientIdListArray;
  dataArray[4] = CLIENT_MAPPER_NAME;

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

  group("Delete clients", function () {
    for (let i = 0; i < MAX_CLIENTS; ++i){
      let clientId = data[0]+i;
      let idList = data[3][i];
      //check if idList is not null, undefined, NaN, 0, false or empty string ""
      if(idList){
        ClientID.deleteClient(token,clientId,idList);
      }
    }
  });

  group("Delete concurrent users with OSSPortalAdmin role", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[1]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function usermgmtKpiEnvEnableDisableClients(data) {
  let response;
  let token;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = 4*VUS + iter;
  //Session of active concurrent users that are from 41 to 50 if VUs=10
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
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
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are 10 if VUs=10
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
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
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Get Client Secret and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Client Secret",function(){
      //Get Client Secret of first 10 Clients if VUs=10
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
  let gap = VUS + iter;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Cuncurrent Users - Regenerate Client Secret and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Regenerate Client Secret",function(){
      //Regenerate Client Secret from 11 to 20 Clients if VUs=10
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
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Role Mapping assigned to service-account user and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("View service assigned roles",function(){
      //Get Client Role Mapping of first 10 Clients if VUs=10
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
  let gap = VUS + iter;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Update Realm Roles to Service Accoiunt User and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Update realm roles to service account user",function(){
      //Update realm roles from 11 to 20 if VUs=10
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
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Protocol Mapper and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Protocol Mapper",function(){
      //Get Protocol Mapper of first 10 Clients if VUs=10
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
  let gap = VUS + iter;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  //Create Protocol Mapper for Clients from 11 to 20 if VUs=10
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
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  group("Use Case: Cuncurrent Users - Get Claims and Verify KPIs", function () {

    group("Get access-token from Keycloak", function () {
      token = newUser.getKeycloackToken(jSessionId).json()['access_token'];
    });

    group("Get Claims",function(){
      //Get Claims of first 10 Clients if VUs=10
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
  let gap = 2*VUS + iter;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  //Update Protocol Mapper for Clients from 21 to 30 if VUs=10
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
  let gap = 3*VUS + iter;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  //Delete Protocol Mapper for Clients from 31 to 40 if VUs=10
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



