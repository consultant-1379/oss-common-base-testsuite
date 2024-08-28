import http from 'k6/http';
import { check } from 'k6';
import { User } from './User.js';
import * as Constants from './Constants.js';

export class ClientSecretFlow{

  static getUserMgmt(token,refreshToken,resCode=200,limit=100) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users?&sortAttr=username&sortDir=asc&limit=` + limit;
    let response = http.get(get_url, params);

    check(response, {
      ["Get User Mgmt API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get User Mgmt API call result: " + response.status);
    return  response;
  }

  static createUserMgmt(token,refreshToken, user, resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let payload = JSON.stringify({
      "user":{
          "firstName": user.firstName,
          "lastName": user.lastName,
          "email": user.username + "@gmail.com",
          "username": user.username,
          "status": "Enabled",
          "privileges": user.roles
      },
     "password": user.password,
     "passwordResetFlag": false,
     "tenant": user.tenantname
    });

    let post_url = Constants.GAS_URL + "/idm/usermgmt/v1/users";
    let response = http.post(post_url, payload, params);

    check(response, {
      ["Create User API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Create User API call result: " + response.status);
    return  response;
  }

  static updateUserMgmt(token,refreshToken, user, resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let payload = JSON.stringify({
      "firstName": user.firstName,
      "lastName": user.lastName,
      "email": user.email,
      "username": user.username,
      "status": "Enabled",
      "privileges": user.roles
    });

    let put_url = Constants.GAS_URL + '/idm/usermgmt/v1/users/' + user.username;
    let response = http.put(put_url, payload, params);

    check(response, {
      ["Update User API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Update User " + user.username + " result: " + response.status);
    return  response;
  }

  static deleteUserMgmt(token,refreshToken, user, resCode=204) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let delete_url = Constants.GAS_URL + '/idm/usermgmt/v1/users/' + user.username + "?tenantname=" + user.tenantname;
    let response = http.del(delete_url, null, params);

    check(response, {
      ["Delete User API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Delete User API call result: " + response.status);
    return  response;
  }

  static getTenantMgmt(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {},
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/idm/usermgmt/v1/tenants/master/password-policy";
    let response = http.get(get_url, params);

    check(response, {
      ["Get PasswordPolicy Mgmt API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get PasswordPolicy mgmt call result: " + response.status);
    return  response;
  }

  static getApps(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/ui-meta/v1/apps";
    let response = http.get(get_url, params);

    check(response, {
      ["Get Apps with token API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get apps list with token result: " + response.status);
    return  response;
  }

  static getRolesMgmt(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/idm/rolemgmt/v1/roles";
    let response = http.get(get_url, params);

    check(response, {
      ["Get Roles Mgmt API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get Roles Mgmt API call result: " + response.status);
    return  response;
  }

  static getComponentsMgmt(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/ui-meta/v1/components";
    let response = http.get(get_url, params);

    check(response, {
      ["Get Component Mgmt API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get Component Mgmt API call result: " + response.status);
    return  response;
  }

  static getGroupsMgmt(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/ui-meta/v1/groups";
    let response = http.get(get_url, params);

    check(response, {
      ["Get Groups Mgmt API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get Groups Mgmt API call result: " + response.status);
    return  response;
  }

  static getTenantsList(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/idm/tenantmgmt/v1/tenants/";
    let response = http.get(get_url, params);

    check(response, {
      ["Get Tenants List API call status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get Tenants List API call result: " + response.status);
    return  response;
  }

  static getStatusOverviewApp(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + '/log/viewer/#status-overview';
    let response = http.get(get_url, params);

    check(response, {
      ["Get Status Overview App status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get Status Overview App API call result: " + response.status);
    return  response;
  }

  static getBROStatus(token,refreshToken,resCode=200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + "/backup-restore/v1/health";
    let response = http.get(get_url, params);

    check(response, {
      ["Get BRO Status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Get BRO Status API call result: " + response.status);
    return  response;
  }

  static createDynamicRoutesClientSecret(token,refreshToken,payload) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let post_url = Constants.GAS_URL + "/v1/routes/";
    let response = http.post(post_url, JSON.stringify(payload), params);

    check(response, {
      "Create Dynamic Route status should be 201": (r) => r.status === 201
    });

    console.log("Create Dynamic Route result: " + response.status);

    return  response;
  }

  static updateDynamicRoutesClientSecret(token,refreshToken,payload) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let put_url = Constants.GAS_URL + "/v1/routes/";
    let response = http.put(put_url, JSON.stringify(payload), params);

    check(response, {
      "Update Dynamic Route status should be 200": (r) => r.status === 200
    });

    console.log("Update Dynamic Route result: " + response.status);

    return  response;
  }

  static deleteDynamicRoutesClientSecret(token,refreshToken,routeName) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let del_url = Constants.GAS_URL + "/v1/routes/" + routeName;
    let response = http.del(del_url, null, params);

    check(response, {
      "Delete Dynamic Route status should be 204": (r) => r.status === 204
    });

    console.log("Delete Dynamic Route result: " + response.status);

    return  response;
  }

  static getSingleDynamicRouteClientSecret(token,refreshToken,routeName) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + "/v1/routes/" + routeName;
    let response = http.get(get_url, params);

    check(response, {
      "Get Single Dynamic Route status should be 200": (r) => r.status === 200
    });

    console.log("Get Single Dynamic Route result: " + response.status);

    return  response;
  }

  static getAllDynamicRoutesClientSecret(token,refreshToken) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + "/v1/routes/";
    let response = http.get(get_url, params);

    check(response, {
      "Get All Dynamic Routes status should be 200": (r) => r.status === 200
    });

    console.log("Get All Dynamic Routes result: " + response.status);

    return  response;
  }

  static getAllLogs(token,refreshToken,body) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let url = Constants.GAS_URL + "/log/viewer/api/v2/sources/query";
    let response = http.post(url, JSON.stringify(body), params);

    if(response.status === 404){
      console.log("calling endpoint sources-query");
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query";
      response = http.post(new_url, JSON.stringify(body), params);
      if(response.status === 422){
        let body_str = JSON.stringify(body);
        body_str = body_str.replace("\"source\":", "\"sourceModel\":");
        response = http.post(new_url, body_str, params);
      }
    }
    if(response.status === 422){
      let body_str = JSON.stringify(body);
      body_str = body_str.replace("\"source\":", "\"sourceModel\":");
      response = http.post(url, body_str, params);
    }

    check(response, {
      "Get Logs Client Secret Flow status should be 200": (r) => r.status === 200
    });

    console.log("Get Logs Client Secret Flow result: " + response.status);

    return  response;
  }

  //#### CLIENTS MANAGEMENT API
  static toggleClient(token,refreshToken,client_id,status,resCode=204) {
    let payload = JSON.stringify({
      "status": status
    });

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };
    let put_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL+"/clients/" + client_id;
    let response = http.put(put_url, payload, params);
    check(response, {
      ["Client Secret Auth Flow - Enable/Disable status should be "+ resCode] : (r) => r.status === resCode,
     });

     console.log("Client Secret Auth Flow - Enable/Disable a client result: " + response.status);
     return  response;
  }

  static getAllExternalClients(token,refreshToken) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients";
    let response = http.get(get_url, params);

    check(response, {
      "Get Clients list status should be 200": (r) => r.status === 200
    });

    console.log("Get Clients result: " + response.status);

    return  response;
  }

  static getClientByAttribute(token,refreshToken,attributes) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients"+attributes;
    let response = http.get(get_url, params);

    check(response, {
      "Get Client By Attribute status should be 200": (r) => r.status === 200
    });

    console.log("Get Client By Attribute result: " + response.status);
    console.log("Get Client By Attribute body: " + response.body);

    return  response;
  }

  static getClientSecret(token,refreshToken,idList) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL + "/" + idList +"/client-secret";
    let response = http.get(get_url, params);

    check(response, {
      "Get Client secret status should be 200": (r) => r.status === 200
    });

    console.log("Get Client secret result: " + response.status);
    return  response;
  }

  static regenerateClientSecret(token,refreshToken,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let post_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/client-secret";
    let response = http.post(post_url, null, params);

    check(response, {
      "Change Client secret status should be 200": (r) => r.status === 200
    });

    console.log("Change Client secret result: " + response.status);

    return  response;
  }

  static getServiceRoles(token,refreshToken,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id +"/service-account-user/role-mappings?";
    let response = http.get(get_url, params);

    check(response, {
      "Get assigned Service Role  status should be 200": (r) => r.status === 200
    });

    console.log("Get assigned Service Role result: " + response.status);
    console.log("Service roles:"+response.body);

    return  response;
  }

  static updateServiceRoles(token,refreshToken,client_id) {
    //Internal and external roles will be updated but while fetching only external roles can be fetched
    let body = {"roleNames":["default-roles-master","UserAdmin","MetricsViewer"]};
    let payload = JSON.stringify(body);

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let put_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/service-account-user/role-mappings";
    let response = http.put(put_url, payload, params);

    check(response, {
      "Update service roles status should be 200": (r) => r.status === 200
    });

    console.log("Update service roles result: " + client_id + " " +response.status);
    console.log("update Service roles:"+response.body);
    return  response;
  }

  static getAllProtocolMappers(token,refreshToken,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers";
    let response = http.get(get_url, params);

    check(response, {
      "Get Protocol mapper list of client status should be 200": (r) => r.status === 200
    });

    console.log("Get Protocol Mapper result: " + response.status);
    //console.log("Get all mappers:"+response.body);

    return  response;
  }

  static createClientMapper(token,refreshToken,configMapper,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let post_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers";
    let response = http.post(post_url, JSON.stringify(configMapper), params);

    check(response, {
      "Create client mapper status should be 201": (r) => r.status === 201
    });

    console.log("Creating a client Mapper result: " + response.status);
    //console.log("Creating clientMapper: "+response.body);

    return  response;
  }

  static updateProtocolMapper(token,refreshToken,client_id,mapper_name) {
    let body = {
      "claimName": "testKey",
      "claimValue": "testValue2123"
    };
  let payload = JSON.stringify(body);

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let put_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers/" + mapper_name;
    let response = http.put(put_url, payload, params);

    check(response, {
      "Update protocol mappers status should be 204": (r) => r.status === 204
    });

    console.log("Update protocol mappers result: " + response.status);

    return  response;
  }

  static getProtocolMapperByName(token,refreshToken,client_id,mapper_name) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers/" + mapper_name;
    let response = http.get(get_url, params);

    check(response, {
      "Get Protocol mapper name of client status should be 200": (r) => r.status === 200
    });

    console.log("Get Protocol Mapper name result: " + response.status);
    console.log("Get mapper by name:"+response.body);

    return  response;
  }

  static getProtocolMapperByAttribute(token,refreshToken,client_id,attributes) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers/" + attributes;
    let response = http.get(get_url, params);

    check(response, {
      "Get Protocol mapper by attribute status should be 200": (r) => r.status === 200
    });

    console.log("Get Protocol Mapper by attribute result: " + response.status);
    console.log("Get mapper by attribute:"+response.body);

    return  response;
  }

  static deleteProtocolMapper(token,refreshToken,client_id,mapper_name,resCode=204) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let deluser_url =  Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers/" + mapper_name;
    let res = http.del(deluser_url, null, params);

    check(res, {
      ["Delete client mapper status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete client Mapper " + mapper_name + " result: " + res.status);

    return res;
  }

  static searchRappLogs(token, refreshToken, resCode = 200) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let url = Constants.GAS_URL + '/rapps-logs*/_search';
    console.log("URL 1: " + url);
    let res = http.get(url, params);

    check(res, {
      ["Get R app logs status should be " + resCode]: (r) => r.status === resCode
    });

    console.log(" Get logs result: " + res.status);
    if (resCode === 200) {
      let splitString = res.body.toString().split(/,|;|:| /);
      let size = splitString.length;
      console.log(" logs size: " + size);

      check(size, {
        "Log size should be > 0": (size) => size > 0
      });
    }
  }

  static searchEiapLogs(token, refreshToken, resCode = 403) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Authorization-Refresh': refreshToken,
          'Content-Type': 'application/json',
          'Cookie': {}, /** For service to service call using userMgmt API we need cookies to be removed */
          "Accept": "*/*",
        },
    };

    let get_url = Constants.GAS_URL + '/oss-audit-logs*/_search'
    console.log("URL 2: " + get_url);
    let response = http.get(get_url, params);

    check(response, {
      ["Get Eiap logs should be " + resCode ] : (r) => r.status === resCode
    });

    console.log("Get all Eiap logs result: " + response.status);
  }
}
