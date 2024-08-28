import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { create_user } from '../../modules/Utils.js';
import { ClientID } from '../../modules/ClientId.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';
import { SharedArray } from 'k6/data';
import { scenario } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';

export const getAllLogsConcurrentUsers = new Trend('Get All Logs Users');
export const getAllLogsConcurrentClients = new Trend('Get All Logs Clients');

//CLIENTS TO POPULATE DB
let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));

//SERVICE ROLES
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));

//OPTIONS FILE TO RETRIEVE NUMBER OF VUS
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/LogsManagement/UC-LM-06.options.json'));
  return new Array(f);
}
const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);

const VUS = sharedOptionsFile[0].scenarios.concurrent_users_kpi_get_logs.vus;

let jSessionIdArray = [];
let concurrentClientIdListArray = [];
let dataArray = [];
let accessArray = [];
let refreshArray = [];

function getNewUser(name){
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

function getServiceRoleId(array, key, value){
  for (let i = 0; i < array.length; ++i){
      if(array[i][key] === value){
          return array[i].id;
      }
  }
}

let body_logs = JSON.parse(open('../../../resources/data/log_viewer_body.json'));
//All Logs of last day
body_logs['options']['timeRange']['start'] = 1800000;
body_logs['options']['timeRange']['end'] = 0;

export function setupEnv() {
  const currentDate = new Date().getTime();
  const CONCURRENT_CLIENT_NAME = "rapp_logs_kpis_" + currentDate + "_";
  const USER_NAME = "user_logs_jsession_" + currentDate + "_";

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL,
                        ["OSSPortalAdmin"]);

  let jSessionId;
  let token;
  let secret;
  let accessToken;
  let refreshToken;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Get access-token from Keycloak", function () {
    token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
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

  //CREATE AND LOGIN Concurrent USERS
  group("Create concurrent users with OSSPortalAdmin and RouteAdmin roles", function () {
    //Concurrent users performing operations in Use Cases
    for (let i = 0; i < VUS; ++i){
      let user = getNewUser(USER_NAME+i);
      let newUser = create_user(user);
      newUser.setRoles(["OSSPortalAdmin"]);
      newUser.create(jSessionId);

      //LOGIN of concurrent users
      jSessionIdArray[i] = newUser.login();
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  dataArray[0] = CONCURRENT_CLIENT_NAME;
  dataArray[1] = USER_NAME;
  dataArray[2] = jSessionIdArray;
  dataArray[3] = concurrentClientIdListArray;
  dataArray[4] = accessArray;
  dataArray[5] = refreshArray;

  return dataArray;
}

export function teardownEnv(data){
  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL
                      );

  let jSessionId;
  let token;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Get access-token from Keycloak", function () {
    token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
  });

  group("Delete concurrent clients", function () {
    for (let i = 0; i < VUS; ++i){
      let clientId = data[0]+i;
      let idList = data[3][i];
      //check if idList is not null, undefined, NaN, 0, false or empty string ""
      if(idList){
        ClientID.deleteClient(token,clientId,idList);
      }
    }
  });

  group("Delete concurrent users with OSSPortalAdmin roles", function () {
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

export function logViewerCharacteristicsWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Logs with Login Auth Flow", function () {

    group("Get Logs", function() {
      response = newUser.get_logs_logViewer(jSessionId,body_logs);
    });

    group("Concurrent Users - Verify Get Logs with Login Auth Flow KPI", function () {
      getAllLogsConcurrentUsers.add(response.timings.duration);
    });

  });
}

export function logViewerCharacteristicsWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Logs with Client Secret Flow", function () {

    group("Get Logs", function() {
      response = ClientSecretFlow.getAllLogs(tokenSecret,refreshToken,body_logs);
    });

    group("Concurrent Users - Verify Get Logs with Client Secret Flow KPI", function () {
      getAllLogsConcurrentClients.add(response.timings.duration);
    });

  });
}
