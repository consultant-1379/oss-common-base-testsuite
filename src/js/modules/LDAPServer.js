import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';


export class LDAPServer {

  static getLdapList(jsessionId, token, parameters) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_CONFIG_URL + parameters;
    let response = http.get(get_url, params);

    check(response, {
      "Get Ldap Config status should be 200": (r) => r.status === 200
    });

    console.log("Get Ldap Config result: " + response.status);

    return  response;
  }

  static getLdapGroupsList(jsessionId, token) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_GROUPS_URL + "?first=0&max=20";
    let response = http.get(get_url, params);

    check(response, {
      "Get Ldap Groups status should be 200": (r) => r.status === 200
    });

    console.log("Get Ldap Groups result: " + response.status);

    return  response;
  }

  static getMembersList(jsessionId, token, groupdId) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_GROUPS_URL + "/" + groupdId + "/members?first=0&max=5";
    let response = http.get(get_url, params);

    check(response, {
      "Get Ldap Members of Group status should be 200": (r) => r.status === 200
    });

    console.log("Get Ldap Members of Group result: " + response.status);

    return  response;
  }

  static getGroupRolesList(jsessionId, token, idGroup) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_GROUPS_URL + "/" + idGroup + "/role-mappings/realm/available";
    let response = http.get(get_url, params);

    check(response, {
      "Get Group Roles status should be 200": (r) => r.status === 200
    });

    console.log("Get Group Roles result: " + response.status);

    return  response;
  }

  static getMemberRolesList(jsessionId, token, idMemberUser) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'JSESSIONID=' + jsessionId,
          "Accept": "*/*",
        },
    };
    let get_url = Constants.IAM_URL + Constants.KEYCLOACK_MEMBER_USER_URL + "/" + idMemberUser + "/role-mappings/realm/available";
    let response = http.get(get_url, params);

    check(response, {
      "Get User Roles status should be 200": (r) => r.status === 200
    });

    console.log("Get User Roles result: " + response.status);

    return  response;
  }

  static setRoleToGroup(jsessionId, token, idGroup, idGroupRole) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_GROUPS_URL + "/" + idGroup + "/role-mappings/realm";
    let body = [
      {
        "id":idGroupRole,
        "name":Constants.LDAP_GROUP_ROLE,
        "composite":true,
        "clientRole":false,
        "containerId":"master"
      }
    ]; 

    let response = http.post(post_url, JSON.stringify(body), params);

    check(response, {
      "Set LogViewer role to Group status should be 204": (r) => r.status === 204
    });

    console.log("Set LogViewer role to Grouop result: " + response.status);

    return  response;
  }

  static setRoleToMember(jsessionId, token, idMemberUser, idRole) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_MEMBER_USER_URL + "/" + idMemberUser + "/role-mappings/realm";
    let body = [
      {
        "id":idRole,
        "name":Constants.LDAP_USER_ROLE,
        "composite":true,
        "clientRole":false,
        "containerId":"master"
      }
    ]; 

    let response = http.post(post_url, JSON.stringify(body), params);

    check(response, {
      "Set OSSPortalAdmin role to User Member status should be 204": (r) => r.status === 204
    });

    console.log("Set OSSPortalAdmin role to User Member result: " + response.status);

    return  response;
  }

  static setLdapConfig(jsessionId, token, config) {
      let params = {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            "Accept": "*/*",
            'Cookie': 'JSESSIONID=' + jsessionId,
          },
      };
      let post_url = Constants.IAM_URL + Constants.KEYCLOACK_CONFIG_URL;   
      let response = http.post(post_url, JSON.stringify(config), params);

      check(response, {
        "Set Ldap Settings on Keycloack status should be 201": (r) => r.status === 201
      });

      console.log("Set Ldap Settings on Keycloack result: " + response.status);

      return  response;
  }

  static modifyLdapConfig(jsessionId, token, config, id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let put_url = Constants.IAM_URL + Constants.KEYCLOACK_CONFIG_URL + "/" + id;   
    let response = http.put(put_url, JSON.stringify(config), params);

    check(response, {
      "Modify Ldap Settings on Keycloack status should be 204": (r) => r.status === 204
    });

    console.log("Modify Ldap Settings on Keycloack result: " + response.status);

    return  response;
  }

  static checkLdapConnection(jsessionId, token, config) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_CONNECTION_TEST_URL;   
    let response = http.post(post_url, JSON.stringify(config), params);

    check(response, {
      ["Check Ldap " + config['action'] + "status should be 204"]: (r) => r.status === 204
    });

    console.log("Check Ldap " + config['action'] +  "result: " + response.status);

    return  response;
  }

  static syncLdapUsers(jsessionId, token, id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_SYNC_URL + "/" + id + "/sync?action=triggerFullSync";
    let response = http.post(post_url, null, params);

    check(response, {
      "Sync Ldap Users from external LDAP to Keycloack status should be 200": (r) => r.status === 200
    });

    console.log("Sync Ldap Users on Keycloack result: " + response.status);

    return  response;
  }

  static syncLdapGroups(jsessionId, token, id, idMapper) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let post_url = Constants.IAM_URL + Constants.KEYCLOACK_SYNC_URL + "/" + id + "/mappers/" + idMapper + "/sync?direction=fedToKeycloak";
    let response = http.post(post_url, null, params);

    check(response, {
      "Sync Ldap Groups from external LDAP to Keycloack status should be 200": (r) => r.status === 200
    });

    console.log("Sync Ldap Groups on Keycloack result: " + response.status);

    return  response;
  }

  static deleteLdapConfig(jsessionId, token, id) {
      let params = {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            "Accept": "*/*",
            'Cookie': 'JSESSIONID=' + jsessionId,
          },
      };
      let del_url = Constants.IAM_URL + Constants.KEYCLOACK_CONFIG_URL;
      let response = http.del(del_url + "/" + id, null, params);

      check(response, {
        "Delete Ldap Config on Keycloack status should be 204": (r) => r.status === 204
      });

      console.log("Delete Ldap Config on Keycloack result: " + response.status);

      return  response;
  }

  static deleteLdapGroups(jsessionId, token, id) {
    let params = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let del_url = Constants.IAM_URL + Constants.KEYCLOACK_GROUPS_URL;
    let response = http.del(del_url + "/" + id, null, params);

    check(response, {
      "Delete Ldap Groups on Keycloack status should be 204": (r) => r.status === 204
    });

    console.log("Delete Ldap Groups on Keycloack result: " + response.status);

    return  response;
  }
  
}
