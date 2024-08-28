import { group, sleep, check } from 'k6';
import { User } from '../../modules/User.js';
import { ClientID } from '../../modules/ClientId.js';
import { ClientSecretFlow } from '../../modules/ClientSecretFlow.js';
import { SharedArray } from 'k6/data';
import { vu, scenario, exec, test } from 'k6/execution';
import { Trend } from 'k6/metrics';
import * as Constants from '../../modules/Constants.js';
import { create_user, create_user_loop, delete_user_loop } from '../../modules/Utils.js';
import { LogViewer } from '../../modules/LogViewer.js';
import { BRO } from '../../modules/BRO.js';

export const getUsersLoginFlowPolicy = new Trend('Get All Users Login Flow Concurrent Users');
export const getUsersClientSecretFlowPolicy = new Trend('Get All Users Client Secret Flow Concurrent Users');
export const getAppsLoginFlowPolicy = new Trend('Get Apps Login Flow Concurrent Users');
export const getAppsClientSecretFlowPolicy = new Trend('Get Apps Client Secret Flow Concurrent Users');
export const getRolesLoginFlowPolicy = new Trend('Get Roles Login Flow Concurrent Users');
export const getRolesClientSecretFlowPolicy = new Trend('Get Roles Client Secret Flow Concurrent Users');
export const getComponentsLoginFlowPolicy = new Trend('Get Components Login Flow Concurrent Users');
export const getComponentsClientSecretFlowPolicy = new Trend('Get Components Client Secret Flow Concurrent Users');
export const getGroupsLoginFlowPolicy = new Trend('Get Groups Login Flow Concurrent Users');
export const getGroupsClientSecretFlowPolicy = new Trend('Get Groups Client Secret Flow Concurrent Users');
export const getTenantsLoginFlowPolicy = new Trend('Get Tenants Login Flow Concurrent Users');
export const getTenantsClientSecretFlowPolicy = new Trend('Get Tenants Client Secret Flow Concurrent Users');
export const getCNOMOverviewLoginFlowPolicy = new Trend('Get CNOM Status Login Flow Concurrent Users');
export const getCNOMOverviewClientSecretFlowPolicy = new Trend('Get CNOM Status Client Secret Flow Concurrent Users');
export const getBROStatusLoginFlowPolicy = new Trend('Get BRO Healthy status Login Flow Concurrent Users');
export const getBROStatusClientSecretFlowPolicy = new Trend('Get BRO Healthy status Client Secret Flow Concurrent Users');
export const createRoutesLoginFlowPolicy = new Trend('Create Dynamic Routes Login Flow Concurrent Users');
export const createRoutesClientSecretFlowPolicy = new Trend('Create Dynamic Routes Client Secret Flow Concurrent Users');
export const updateRoutesLoginFlowPolicy = new Trend('Update Dynamic Routes Login Flow Concurrent Users');
export const updateRoutesClientSecretFlowPolicy = new Trend('Update Dynamic Routes Client Secret Flow Concurrent Users');
export const deleteRoutesLoginFlowPolicy = new Trend('Delete Dynamic Routes Login Flow Concurrent Users');
export const deleteRoutesClientSecretFlowPolicy = new Trend('Delete Dynamic Routes Client Secret Flow Concurrent Users');
//CLIENTS TO POPULATE DB
let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
//SERVICE ROLES
let realmRoles = JSON.parse(open('../../../resources/data/service_roles.json'));

//DYNAMIC ROUTES
let dynamicRoutes = JSON.parse(open('../../../resources/data/dynamicRoute.json'));

//OPTIONS FILE TO RETRIEVE NUMBER OF VUS
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/userManagement/UC-UM-12.options.json'));
  return new Array(f);
}
const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);

const VUS = sharedOptionsFile[0].scenarios.concurrent_getUsersWithJSession.vus;

let jSessionIdArray = [];
let clientIdListArray = [];
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

export function setupEnv() {

  const currentDate = new Date().getTime();
  const CLIENT_NAME = "rapp_kpis_" + currentDate + "_";
  const USER_NAME = "user_jsession_" + currentDate + "_";
  const ROUTE_USER_NAME = "route_user_" + currentDate;
  const DYNAMIC_ROUTE_LOGIN_NAME = "route_login_" + currentDate + "_";
  const DYNAMIC_ROUTE_CLIENT_SECRET_NAME = "route_secret_" + currentDate + "_";

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL,
                        ["OSSPortalAdmin"]);

  let routeUser = new User(ROUTE_USER_NAME,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL,
                        ["RouteAdmin"]);
  let jSessionId;
  let jSessionIdRouteUser;
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

  group("Create RouteAdmin User", function () {
    //Createuser with RouteAdmin roles
    routeUser.create(jSessionId);
  });

  //Create DYNAMIC ROUTES
  group("Creating Dynamic Routes",function(){
    jSessionIdRouteUser = routeUser.login();
    //To Create Dynamic Routes we need RouteAdmin Role
    for (let i = 0; i < 2*VUS; ++i){
      //Dynamic Routes for Login Flow
      dynamicRoutes['id'] = DYNAMIC_ROUTE_LOGIN_NAME+i;
      routeUser.create_dynamic_route(jSessionIdRouteUser, dynamicRoutes);

      //Dynamic Routes for Client Secret Flow
      dynamicRoutes['id'] = DYNAMIC_ROUTE_CLIENT_SECRET_NAME+i;
      routeUser.create_dynamic_route(jSessionIdRouteUser, dynamicRoutes);
    }
  });

  //Create CLIENTS IN DB
  group("Creating rapp external clients",function(){
    for (let i = 0; i < VUS; ++i){

      config['clientId'] = CLIENT_NAME+i;
      //Enable Refresh Token
      config['attributes']['client_credentials.use_refresh_token'] = "true";

      //Concurrent Clients performing operations in Use Cases
      group("Creating rapp external clients with basic config",function(){
        ClientID.createRappClient(jSessionId,token,config);
      });

      //Get Client ID
      group("Retrieve ID for New Client just created",function(){
        let response = ClientID.getClientIdList(jSessionId,token,CLIENT_NAME+i);
        let body = JSON.parse(response.body);
        clientIdListArray[i] = body[0].id;
      });

      //Get Secret
      group("Generate Secret for New Client",function(){
        secret = ClientID.regenerateClientSecret(jSessionId,token,CLIENT_NAME+i).json()['secret'];
        //secretArray[i] = secret;
      });

      //Provide the new Client with a Role in order to perform all endpoints calls
      //Get service roles iD
      let serviceRolesId
      group("Get service roles id",function() {
        serviceRolesId = ClientID.getServiceRolesId(jSessionId,token,clientIdListArray[i]).json()['id'];
        console.log("serviceRolesId: "+serviceRolesId);
      });

      //Get OSSPortalAdmin and Route Admin roles id
      let rolesIdListUser;
      let rolesIdRouteAdmin;
      group("Get OSSPortalAdmin role id", function() {
        let response = ClientID.getServiceRolesIdList(jSessionId,token,serviceRolesId);
        let body = JSON.parse(response.body);
        rolesIdListUser = getServiceRoleId(body,"name","OSSPortalAdmin");
        console.log("OSSPortalAdmin id: "+ rolesIdListUser);
        rolesIdRouteAdmin = getServiceRoleId(body,"name","RouteAdmin");
        console.log("RouteAdmin id: "+ rolesIdRouteAdmin);
      });

      //Add OSSPortalAdmin and RouteAdmin roles to the Client
      group("Add the OSSPortalAdmin roles to the new Client", function() {
          realmRoles[0]['id'] = rolesIdListUser;
          realmRoles[0]['name'] = "OSSPortalAdmin";
          let addOSSPortalAdminRoles=ClientID.setServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
          console.log("Roles added: "+addOSSPortalAdminRoles);

          realmRoles[0]['id'] = rolesIdRouteAdmin;
          realmRoles[0]['name'] = "RouteAdmin";
          let addRouteAdminRoles=ClientID.setServiceRoles(jSessionId,token,serviceRolesId,realmRoles);
          console.log("Roles added: "+addRouteAdminRoles);
      });

      //Get Access and Refresh Token for a particular clientId and Secret
      group("Get Access and Refresh Token for New Client",function(){
        let responseToken = soUser.getKeyCloackTokenSecret(CLIENT_NAME+i,secret);
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
      newUser.setRoles(["OSSPortalAdmin","RouteAdmin"]);
      newUser.create(jSessionId);

      //LOGIN of concurrent users
      jSessionIdArray[i] = newUser.login();
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  group("Logout as Route Admin user", function () {
    routeUser.logout(jSessionIdRouteUser);
  });

  dataArray[0] = CLIENT_NAME;
  dataArray[1] = USER_NAME;
  dataArray[2] = jSessionIdArray;
  dataArray[3] = clientIdListArray;
  dataArray[4] = accessArray;
  dataArray[5] = refreshArray;
  dataArray[6] = DYNAMIC_ROUTE_LOGIN_NAME;
  dataArray[7] = ROUTE_USER_NAME;
  dataArray[8] = DYNAMIC_ROUTE_CLIENT_SECRET_NAME;

  return dataArray;
}

export function teardownEnv(data) {

  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL,
                        ["OSSPortalAdmin"]);
  let routeUser = new User(data[7],
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL,
                        ["RouteAdmin"]);
  let jSessionId;
  let jSessionIdRouteUser;
  let token;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Get access-token from Keycloak", function () {
    token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
  });

  group("Log in as Route Admin user", function () {
    jSessionIdRouteUser = routeUser.login();
  });
  //Delete DYNAMIC ROUTES
  group("Delete Dynamic Routes", function () {
    let dynamicRouteLoginName;
    let dynamicRouteSecretName;

    for (let i = 0; i < VUS; ++i){
      //Delete Dynamic Routes Pre-Populated in DB for Login Flow
      //They are 2*VUS but From VUS to VUS Routes are deleted by Delete Dynamic Route or Login Flow Scenario
      dynamicRouteLoginName = data[6]+i;
      routeUser.delete_dynamic_route(jSessionIdRouteUser, dynamicRouteLoginName);

      //Delete Dynamic Routes Pre-Populated in DB for Client Secret Flow
      //They are 2*VUS but From VUS to VUS Routes are deleted by Delete Dynamic Route for Client Secret Flow Scenario
      dynamicRouteSecretName = data[8]+i;
      routeUser.delete_dynamic_route(jSessionIdRouteUser, dynamicRouteSecretName);

      //Delete Dynamic Routes created by scenario Create Route for Login Flow that are VUS
      dynamicRouteLoginName = "new_" + data[6]+i;
      routeUser.delete_dynamic_route(jSessionIdRouteUser, dynamicRouteLoginName);
      //Delete Dynamic Routes created by scenario Create Route for Client Secret Flow that are VUS
      dynamicRouteSecretName = "new_" + data[8]+i;
      routeUser.delete_dynamic_route(jSessionIdRouteUser, dynamicRouteSecretName);
    }
  });

  group("Delete clients", function () {
    for (let i = 0; i < VUS; ++i){
      let clientId = data[0]+i;
      let idList = data[3][i];
      //check if idList is not null, undefined, NaN, 0, false or empty string ""
      if(idList){
        ClientID.deleteClient(token,clientId,idList);
      }
    }
  });

  group("Delete concurrent users with OSSPortalAdmin and RouteAdmin roles", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[1]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Delete user with Route Admin role", function () {
      routeUser.delete(jSessionId);
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  group("Logout as Route Admin user", function () {
    routeUser.logout(jSessionIdRouteUser);
  });
}

export function getUsersWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Users with Login Auth Flow", function () {

    group("Get all Users", function() {
      response = newUser.getUsers(jSessionId);
    });

    group("Concurrent Users - Verify Get Users with Login Auth Flow KPI", function () {
      getUsersLoginFlowPolicy.add(response.timings.duration);
      console.log("Get Users Time duration Login Flow: " + response.timings.duration);
    });

  });
}

export function getUsersWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  //console.log("access token: " + tokenSecret);
  let refreshToken = data[5][iter];
  //console.log("refresh token: " + refreshToken);

  group("Use Case: Concurrent Users - Get Users with Client Secret Auth Flow", function () {

    group("Get all Users", function() {
      response = ClientSecretFlow.getUserMgmt(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Users with Client Secret Auth Flow KPI", function () {
      getUsersClientSecretFlowPolicy.add(response.timings.duration);
      console.log("Get Users Time duration Client Secret Flow: "  + response.timings.duration);
    });

  });
}

export function getAppsWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Apps with Login Auth Flow", function () {

    group("Get Apps", function() {
      response = newUser.getApps(jSessionId);
    });

    group("Concurrent Users - Verify Get Apps with Login Auth Flow KPI", function () {
      getAppsLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getAppsWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Apps with Client Secret Auth Flow", function () {

    group("Get Apps", function() {
      response = ClientSecretFlow.getApps(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Apps with Client Secret Auth Flow KPI", function () {
      getAppsClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getRolesWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Roles with Login Auth Flow", function () {

    group("Get all roles", function() {
      response = newUser.getSystemRoles(jSessionId);
    });

    group("Concurrent Users - Verify Get Roles with Login Auth Flow KPI", function () {
      getRolesLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getRolesWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Roles with Client Secret Auth Flow", function () {

    group("Get all Roles", function() {
      response = ClientSecretFlow.getRolesMgmt(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Roles with Client Secret Auth Flow KPI", function () {
      getRolesClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getComponentsWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Components with Login Auth Flow", function () {

    group("Get all Components", function() {
      response = newUser.getComponents(jSessionId);
    });

    group("Concurrent Users - Verify Get Components with Login Auth Flow KPI", function () {
      getComponentsLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getComponentsWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Componets with Client Secret Auth Flow", function () {

    group("Get all Components", function() {
      response = ClientSecretFlow.getComponentsMgmt(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Components with Client Secret Auth Flow KPI", function () {
      getComponentsClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getGroupsWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Groups with Login Auth Flow", function () {

    group("Get all Groups", function() {
      response = newUser.getGroups(jSessionId);
    });

    group("Concurrent Users - Verify Get Groups with Login Auth Flow KPI", function () {
      getGroupsLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getGroupsWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Groups with Client Secret Auth Flow", function () {

    group("Get all Groups", function() {
      response = ClientSecretFlow.getGroupsMgmt(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Groups with Client Secret Auth Flow KPI", function () {
      getGroupsClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getTenantsWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Get Tenants with Login Auth Flow", function () {

    group("Get all Tenants", function() {
      response = newUser.get_tenants(jSessionId);
    });

    group("Concurrent Users - Verify Get Tenants with Login Auth Flow KPI", function () {
      getTenantsLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getTenantsWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get Tenants with Client Secret Auth Flow", function () {

    group("Get all tenants", function() {
      response = ClientSecretFlow.getTenantsList(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get Tenants with Client Secret Auth Flow KPI", function () {
      getTenantsClientSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function getSatusOverviewAppWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];

  group("Use Case: Concurrent Users - Get Status Overview App with Login Auth Flow", function () {

    group("Get CNOM Status Overview", function() {
      response = LogViewer.getStatusOverview(jSessionId, Constants.GAS_URL, 200);
    });

    group("Concurrent Users - Verify Get Status Overview APP with Login Auth Flow KPI", function () {
      getCNOMOverviewLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getStatusOverviewAppWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get CNOM Status Overview with Client Secret Auth Flow", function () {

    group("Get CNOM Status Overview", function() {
      response = ClientSecretFlow.getStatusOverviewApp(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Verify Get CNOM Status Overview with Client Secret Auth Flow KPI", function () {
      getCNOMOverviewClientSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function getBROStatusWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];

  group("Use Case: Concurrent Users - Get BRO Healthy status with Login Auth Flow", function () {

    group("Get BRO Status", function() {
      response = BRO.getBroHealthCheck(jSessionId)
    });

    group("Concurrent Users - Verify BRO Healthy status with Login Auth Flow KPI", function () {
      getBROStatusLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function getBROStatusWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Get BRO Healthy status with Client Secret Auth Flow", function () {

    group("Get BRO Status", function() {
      response = ClientSecretFlow.getBROStatus(tokenSecret,refreshToken);
    });

    group("Concurrent Users - Get BRO Healthy status with Client Secret Auth Flow KPI", function () {
      getBROStatusClientSecretFlowPolicy.add(response.timings.duration);
    });
  });
}

export function createDynamicRoutesWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);
  //Not needed because in this case jSessionId rules
  //newUser.setRoles(["OSSPortalAdmin","RouteAdmin"]);

  group("Use Case: Concurrent Users - Create Dynamic Routes with Login Auth Flow", function () {

    group("Create Dynamic Routes", function() {
      dynamicRoutes['id'] = "new_" + data[6]+iter;
      response = newUser.create_dynamic_route(jSessionId,dynamicRoutes);
    });

    group("Concurrent Users - Verify Create Dynamic Routes with Login Auth Flow KPI", function () {
      createRoutesLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function createDynamicRoutesWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  group("Use Case: Concurrent Users - Create Dynamic Routes with Client Secret Auth Flow", function () {

    group("Create Dynamic Routes", function() {
      dynamicRoutes['id'] = "new_" + data[8]+iter;
      response = ClientSecretFlow.createDynamicRoutesClientSecret(tokenSecret,refreshToken,dynamicRoutes);
    });

    group("Concurrent Users - Verify Create Dynamic Routes with Client Secret Auth Flow KPI", function () {
      createRoutesClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function updateDynamicRoutesWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  let predToUpdate = {"_genkey_0":"/metrics","_genkey_1":"/health"};

  group("Use Case: Concurrent Users - Update Dynamic Routes with Login Auth Flow", function () {

    group("Update Dynamic Routes", function() {
      dynamicRoutes['id'] = data[6]+iter;
      dynamicRoutes['predicates'][0]['args']= predToUpdate;
      response = newUser.update_dynamic_route(jSessionId, dynamicRoutes);
    });

    group("Concurrent Users - Verify Update Dynamic Routes with Login Auth Flow KPI", function () {
      updateRoutesLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function updateDynamicRoutesWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];

  let predToUpdate = {"_genkey_0":"/metrics","_genkey_1":"/health"};

  group("Use Case: Concurrent Users - Update Dynamic Routes with Client Secret Auth Flow", function () {

    group("Update Dynamic Routes", function() {
      dynamicRoutes['id'] = data[8]+iter;
      dynamicRoutes['predicates'][0]['args']= predToUpdate;
      response = ClientSecretFlow.updateDynamicRoutesClientSecret(tokenSecret,refreshToken,dynamicRoutes);
    });

    group("Concurrent Users - Verify Update Dynamic Routes with Client Secret Auth Flow KPI", function () {
      updateRoutesClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}

export function deleteDynamicRoutesWithJSessionEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let jSessionId = data[2][iter];
  let gap = VUS + iter;
  let dynamicRouteLoginName = data[6]+gap;
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  group("Use Case: Concurrent Users - Delete Dynamic Routes with Login Auth Flow", function () {

    group("Delete Dynamic Routes", function() {

      response = newUser.delete_dynamic_route(jSessionId, dynamicRouteLoginName);
    });

    group("Concurrent Users - Verify Delete Dynamic Routes with Login Auth Flow KPI", function () {
      deleteRoutesLoginFlowPolicy.add(response.timings.duration);
    });

  });
}

export function deleteDynamicRoutesWithClientSecretEnv(data) {
  let response;
  let iter = scenario.iterationInTest;
  let gap = VUS + iter;
  let tokenSecret = data[4][iter];
  let refreshToken = data[5][iter];
  let dynamicRouteLoginName = data[8]+gap;

  group("Use Case: Concurrent Users - Delete Dynamic Routes with Client Secret Auth Flow", function () {

    group("Delete Dynamic Routes", function() {
      response = ClientSecretFlow.deleteDynamicRoutesClientSecret(tokenSecret,refreshToken,dynamicRouteLoginName);
    });

    group("Concurrent Users - Verify Delete Dynamic Routes with Client Secret Auth Flow KPI", function () {
      deleteRoutesClientSecretFlowPolicy.add(response.timings.duration);
    });

  });
}