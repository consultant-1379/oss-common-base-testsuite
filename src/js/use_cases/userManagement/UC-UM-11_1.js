import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { ClientID } from '../../modules/ClientId.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';
import { SharedArray } from 'k6/data';
import { vu, scenario, exec, test } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export const enableDisableClientsPolicy = new Trend('Enable_Disable_Clients_Cuncurrent_Users');
export const getExternalClientsPolicy = new Trend('Get_All_External_Clients_Cuncurrent_Users');
export const getClientByAttributePolicy = new Trend('Get_Client_By_Attribute_Cuncurrent_Users');
export const getClientSecretPolicy = new Trend('Get_Client_Secret_Cuncurrent_Users');
export const regenerateClientSecretPolicy = new Trend('Regenerate_Client_Secret_Cuncurrent_Users');
export const updateRealmRolesPolicy = new Trend('Update_Realm_Roles_Cuncurrent_Users');
export const viewRoleMappingPolicy= new Trend('View_Role_Mapping_Cuncurrent_Users');
export const getProtocolMapperPolicy = new Trend('Get_Protocol_Mapper_Cuncurrent_Users');
export const getProtocolMapperByAttributePolicy = new Trend('Get_Protocol_Mapper_By_Attribute_Cuncurrent_Users');
export const createProtocolMapperPolicy = new Trend('Create_Protocol_Mapper_Cuncurrent_Users');
export const updateProtocolMapperPolicy = new Trend('Update_Protocol_Mapper_Cuncurrent_Users');
export const deleteProtocolMapperPolicy = new Trend('Delete_Protocol_Mapper_Cuncurrent_Users');
export const getClaimsPolicy = new Trend('Get_Claims_Cuncurrent_Users');

// MAX CONCURRENT CLIENTS X=VUS, KPIs FOR CLIENT MANAGEMENT
// LOAD FACTOR:
// Y=MAX_CLIENTS CLIENTS PRE-POPULATED IN DB
// VUS MORE CLIENTS WITH CLIENT ID CLIENT SECRET AUTHENTICATION FOR CONCURRENCY


//CLIENTS TO POPULATE DB
let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
//CONFIG MAPPER TEMPLATE
let configMapper = JSON.parse(open('../../../resources/data/creating_client_mapper.json'));
//SERVICE ROLE TEMPLATE
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));

//OPTIONS FILE TO RETRIEVE NUMBER OF VUS
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/userManagement/UC-UM-11.options.json'));
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

let clientIdListArray = [];
let concurrentClientIdListArray = [];
let accessArray = [];
let refreshArray = [];
let dataArray = [];

//MAX_CLIENTS must be > 5*VUS
//This because we identified 5 different areas to work with different clients
// from 1 to VUS for all GET request
// from VUS+1 to 2*VUS for Regenerating Client Secret, Creating Protol Mapper and Update Realm Roles to Service Accoiunt User
// from 2*VUS+1 to 3*VUS for Updating Protocol Mapper
// from 3*VUS+1 to 4*VUS for Deleting Protocol Mapper
// 4*VUS+1 to 5*VUS for Disabling Clients
const MAX_CLIENTS = 100;

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

  const currentDate = new Date().getTime();
  const CLIENT_NAME = "client_kpis_" + currentDate + "_";
  const CONCURRENT_CLIENT_NAME = "concurrent_client_kpis_" + currentDate + "_";
  const CLIENT_MAPPER_NAME = Constants.CLIENT_MAPPER + "_" + currentDate + "_";

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

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function usermgmtKpiEnvEnableDisableClients(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //WORKING ON CLIENTS IN DB FROM 4*VUS TO 5*VUS
  let gap = 4*VUS + iter;
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
      enableDisableClientsPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetAllExternalClients(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Get All External Clients and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get all External Clients",function(){
      response = ClientSecretFlow.getAllExternalClients(tokenSecret,refreshToken);
    });

    group("Cuncurrent Clients - Verify get all external clients KPI", function () {
      getExternalClientsPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetClientByAttribute(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  let clientId = data[0] + iter;
  let attributes = `?&search=(clientId==${clientId};status==ENABLED)`;

  group("Use Case: Cuncurrent Clients - Get Client By Attribute and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Client By Attribute",function(){
      response = ClientSecretFlow.getClientByAttribute(tokenSecret,refreshToken,attributes);
    });

    group("Cuncurrent Clients - Verify get client by attribute KPI", function () {
      getClientByAttributePolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvGetClientsSecret(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Get Client Secret and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Client Secret",function(){
      //Get Client Secret of first 10 Clients if VUs=10
      let idList = data[3][iter];
      response = ClientSecretFlow.getClientSecret(tokenSecret,refreshToken,idList);
      console.log("client secret for " + idList + " is: " + response.body);
    });

    group("Cuncurrent Clients - Verify get client secret KPI", function () {
      getClientSecretPolicy.add(response.timings.duration);
    });

  });
}

export function usermgmtKpiEnvRegenerateClientsSecret(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Regenerate Client Secret and Verify KPIs", function () {

    group("Client Secret Auth Flow - Regenerate Client Secret",function(){
      //Regenerate Client Secret from VUS to 2*VUS Clients
      let clientId = data[0] + gap;
      response = ClientSecretFlow.regenerateClientSecret(tokenSecret,refreshToken,clientId);
      console.log("regenerated client secret for " + clientId + " is: " + response.body);
    });

    group("Cuncurrent Clients - Verify regenerate client secret KPI", function () {
      regenerateClientSecretPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvViewRoleMapping(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Role Mapping assigned to service-account user and Verify KPIs", function () {

    group("Client Secret Auth Flow - View service assigned roles",function(){
      //Get Client Role Mapping of first 10 Clients if VUs=10
      let clientId = data[0] + iter;
      response = ClientSecretFlow.getServiceRoles(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify get role mapping KPI", function () {
      viewRoleMappingPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateRealmRoles(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  group("Use Case: Cuncurrent Clients - Update Realm Roles to Service Accoiunt User and Verify KPIs", function () {

    group("Client Secret Auth Flow - Update realm roles to service account user",function(){
      //Update realm roles from 11 to 20 if VUs=10
      let clientId = data[0] + gap;
      response = ClientSecretFlow.updateServiceRoles(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify update roles to service account user KPI", function () {
      updateRealmRolesPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetProtocolMapper(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Protocol Mapper",function(){
      //Get Protocol Mapper of first 10 Clients if VUs=10
      let clientId = data[0] + iter;
      response = ClientSecretFlow.getAllProtocolMappers(tokenSecret,refreshToken,clientId);
    });

    group("Cuncurrent Clients - Verify get protocol mapper KPI", function () {
      getProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetProtocolMapperByAttribute(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Protocol Mapper By Attribute and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Protocol Mapper By Attribute",function(){
      //Get Protocol Mapper of first 10 Clients if VUs=10
      let clientId = data[0] + iter;
      let protocolMapperName = data[4] + iter;
      let attributes = `?&search=(protocolMapperName==${protocolMapperName};tenantname==${Constants.TENANT_NAME})`;
      response = ClientSecretFlow.getProtocolMapperByAttribute(tokenSecret,refreshToken,clientId,attributes);
    });

    group("Cuncurrent Clients - Verify get protocol mapper by attribute KPI", function () {
      getProtocolMapperByAttributePolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvCreateProtocolMapper(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Create Protocol Mapper for Clients from 11 to 20 if VUs=10
  group("Use Case: Cuncurrent Clients - Create Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Creating a client mapper",function(){
      let clientId = data[0] + gap;
      configMapper["name"] = "new_" + data[4] + gap;
      response = ClientSecretFlow.createClientMapper(tokenSecret,refreshToken,configMapper,clientId);
    });

    group("Cuncurrent Clients - Verify create mapper KPI", function () {
      createProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvGetClaims(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];
  group("Use Case: Cuncurrent Clients - Get Claims and Verify KPIs", function () {

    group("Client Secret Auth Flow - Get Claims",function(){
      //Get Claims of first 10 Clients if VUs=10
      let clientId = data[0] + iter;
      let mapper_name = data[4] + iter;
      response = ClientSecretFlow.getProtocolMapperByName(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify get claims KPI", function () {
      getClaimsPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvUpdateProtocolMapper(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = 2*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Update Protocol Mapper for Clients from 21 to 30 if VUs=10
  group("Use Case: Cuncurrent Clients - Update Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Update claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientSecretFlow.updateProtocolMapper(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify update claims of client mapper KPI", function () {
      updateProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}

export function usermgmtKpiEnvDeleteProtocolMapper(data) {
  let response;
  //From 1 to 10 if VUs=10
  let iter = scenario.iterationInTest;
  let gap = 3*VUS + iter;
  //CONCURRENT CLIENTS ARE VUS
  let tokenSecret = data[5][iter];
  let refreshToken = data[6][iter];

  //Delete Protocol Mapper for Clients from 31 to 40 if VUs=10
  group("Use Case: Cuncurrent Clients - Delete Claims of a Protocol Mapper and Verify KPIs", function () {

    group("Client Secret Auth Flow - Delete claims of client mapper",function(){
      let clientId = data[0] + gap;
      let mapper_name = data[4] + gap;
      response = ClientSecretFlow.deleteProtocolMapper(tokenSecret,refreshToken,clientId,mapper_name);
    });

    group("Cuncurrent Clients - Verify delete claims of client mapper KPI", function () {
      deleteProtocolMapperPolicy.add(response.timings.duration);
    });
  });
}



