import http from 'k6/http';
import { check } from 'k6';
import { User } from './User.js';
import * as Constants from './Constants.js';

export class ClientID{

  static setClientID(jsessionId, token, config) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL;
    let response = http.post(post_url, JSON.stringify(config), params);

    check(response, {
      "Set client id on Keycloack status should be 201": (r) => r.status === 201
    });

    console.log("Client ID on Keycloack result: " + response.status);

    return  response;
  }

  static updateClientId(jsessionId, token, updateConfig,idList) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let put_url = Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL +"/" +idList;
    let response = http.put(put_url, JSON.stringify(updateConfig), params);

    check(response, {
      "Update client with refresh token on Keycloack status should be 204": (r) => r.status === 204
    });

    console.log("Update client with refresh token on Keycloack result: " + response.status);

    return  response;
  }

  static getClientIdList(jsessionId, token, clientId) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + "/auth/admin/realms/master/clients?clientId=" + clientId;
    let response = http.get(get_url, params);

    check(response, {
      "Get ClientID list status should be 200": (r) => r.status === 200
    });

    console.log("Get Client ID result: " + response.status);

    return  response;
  }

  static setServiceRoles(jsessionId,token,serviceRolesId,realmRoles) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + "/auth/admin/realms/master/users/" + serviceRolesId +"/role-mappings/realm/"; 
    let response = http.post(post_url, JSON.stringify(realmRoles), params);

    check(response, {
      "Set service roles on Keycloack status should be 204": (r) => r.status === 204
    });

    console.log("Service roles on Keycloack result: " + response.status);

    return  response;
  }

  static getServiceRolesIdList(jsessionId, token, serviceRolesId) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + "/auth/admin/realms/master/users/" + serviceRolesId +"/role-mappings/realm/available";
    let response = http.get(get_url, params);

    check(response, {
      "Get Service roles list status should be 200": (r) => r.status === 200
    });

    console.log("Get service roles list ID result: " + response.status);

    return  response;
  }

  static getClientSecret(jsessionId, token, idList) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static getServiceRolesId(jsessionId, token, idList) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL + "/" + idList +"/service-account-user";
    let response = http.get(get_url, params);

    check(response, {
      "Get Service Role id status should be 200": (r) => r.status === 200
    });

    console.log("Get Service Role Id result: " + response.status);

    return  response;
  }

  static deleteServiceRoles(jsessionId,token,serviceRolesId,realmRoles, resCode = 204) {

    let params = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
        "Accept": "*/*",
      },
    };

    let deluser_url =  Constants.IAM_URL + "/auth/admin/realms/master/users/" + serviceRolesId +"/role-mappings/realm/";
    let res = http.del(deluser_url, JSON.stringify(realmRoles), params);

    check(res, {
      ["Delete roles status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete client " + serviceRolesId + " result: " + res.status);
  }

  static deleteClient(token, clientId, idList, resCode = 204) {
    let deluser_url =  Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL + "/" + idList;

    let params = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        "Accept": "*/*",
      },
    };

    let res = http.del(deluser_url, null, params);

    check(res, {
      ["Delete client status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete client " + clientId + " result: " + res.status);
  }

  static createRappClient(jsessionId, token, config) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_CLIENT_URL;
    let response = http.post(post_url, JSON.stringify(config), params);

    check(response, {
      "Create rapp client name on Keycloack status should be 201": (r) => r.status === 201
    });

    console.log("Rapp Client name on Keycloack result: " + response.status);

    return  response;
  }

  static getRappClientId(jsessionId, token) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients";
    let response = http.get(get_url, params);

    check(response, {
      "Get Clients list status should be 200": (r) => r.status === 200
    });

    console.log("Get Clients result: " + response.status);
    console.log("Get rapp clients:"+response.body);

    return  response;
  }

  static toggleClient(jsessionId, token, client_id,status,resCode=204) {

    let payload = JSON.stringify({
         "status": status
    });

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let put_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL+"/clients/" + client_id;
    let response = http.put(put_url, payload, params);

    check(response, {
      ["Enable/Disable status should be "+ resCode] : (r) => r.status === resCode,
    });

    console.log("Enable/Disable a client result: " + response.status);

    return  response;
  }

  static regenerateClientSecret(jsessionId, token, client_id){
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let post_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/client-secret";
    let response = http.post(post_url, null, params);

    check(response, {
      "Change Client secret status should be 200": (r) => r.status === 200
    });

    console.log("Change Client secret result: " + response.status);
    console.log("secret:"+response.body);

    return  response;
  }

  static updateServiceRoles(jsessionId, token,client_id) {

    //Internal and external roles will be updated but while fetching only external roles can be fetched
    let body = {"roleNames":["default-roles-master","UserAdmin","MetricsViewer"]};
    let payload = JSON.stringify(body);

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static getServiceRoles(jsessionId, token, client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static createClientMapper(jsessionId, token, configMapper,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static getAllProtocolMappers(jsessionId, token,client_id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.GAS_URL + Constants.KEYCLOAK_BASE_URL + "/clients/" + client_id + "/protocol-mappers";
    let response = http.get(get_url, params);

    check(response, {
      "Get Protocol mapper list of client status should be 200": (r) => r.status === 200
    });

    console.log("Get Protocol Mapper result: " + response.status);
    console.log("Get all mappers:"+response.body);

    return  response;
  }

  static getProtocolMapperByName(jsessionId, token,client_id,mapper_name) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static updateProtocolMapper(jsessionId, token,client_id,mapper_name) {
    let body = {
        "claimName": "testKey",
        "claimValue": "testValue2123"
      };
    let payload = JSON.stringify(body);

    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
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

  static deleteProtocolMapper(jsessionId, token,client_id,mapper_name, resCode = 204) {

    let params = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        "Accept": "*/*",
        'Cookie': 'JSESSIONID=' + jsessionId,
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
}