import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class User {
  constructor(username, password, tenantname, GAS_URL, roles = [Constants.SA_ROLE,Constants.USER_ADMIN_ROLE]) {
    this.username = username;
    this.firstName = username;
    this.lastName = username;
    this.password = password;
    this.tenantname = tenantname;
    this.base_url = GAS_URL;
    this.roles = roles;
  }

  setPassword(password) {
    this.password = password;
  }

  getPassword() {
    return this.password;
  }

  setRoles(roles) {
    this.roles = roles;
  }

  create(jsessionId, resCode = 200) {
    let payload = JSON.stringify({
         "user":{
             "firstName": this.firstName,
             "lastName": this.lastName,
             "email": this.username + "@gmail.com",
             "username": this.username,
             "status": "Enabled",
             "privileges": this.roles
         },
        "password": this.password,
        "passwordResetFlag": false,
        "tenant": this.tenantname
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let user_url = Constants.GAS_URL + '/idm/usermgmt/v1/users';
    let res = http.post(user_url, payload, params);

    check(res, {
      ["Create user status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Create user " + this.username + " result: " + res.status);
    return res;
  }

  update(jsessionId, status = "enabled", resCode = 200) {
    let payload = JSON.stringify({
        "firstName": this.firstName,
        "lastName": this.lastName,
        "email": this.email,
        "username": this.username,
        "status": status,
        "privileges": this.roles
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let user_url = Constants.GAS_URL + '/idm/usermgmt/v1/users/' + this.username;
    let res = http.put(user_url, payload, params);

    check(res, {
      ["Update user status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Update user " + this.username + " result: " + res.status);
    return res;
  }

  delete(jsessionId, resCode = 204) {
    let deluser_url =  Constants.GAS_URL + '/idm/usermgmt/v1/users/' + this.username + "?tenantname=" + this.tenantname;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.del(deluser_url, null, params);

    check(res, {
      ["Delete user status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete user " + this.username + " result: " + res.status);
    return res;
  }

  login(resCode = 200) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + null,
        'x-login': this.username,
        'x-password': this.password,
        'x-tenant': this.tenantname
      },
    };

    let login_url = Constants.GAS_URL + "/auth/v1";
    let res = http.post(login_url, null, params);

    console.log("Login user " + this.username + " result: " + res.status);

    if(resCode === 200){
      check(res, {
        ['Login status should be ' + resCode]: (r) => r.status === resCode,
      });
    }
    else{
      check(res, {
        ['Login status should be ' + resCode]: (r) => r.status != 200,
      });
    }

    return res.body;
  }

  logout(jsessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let logout_url = Constants.GAS_URL + "/auth/v1/logout";
    let res = http.post(logout_url, null, params);

    console.log("Logout user " + this.username + " result: " + res.status);

    check(res, {
      'Logout status should be 200': (r) => r.status === 200,
    });
  }

  setPasswordPolicy(jsessionId, upperCase = 0, lowerCase = 0, minLength = 0, pwdHistory = 0) {

    let upCaseStr = "";
    if (upperCase != 0) {
      upCaseStr = ` and upperCase(${upperCase})`;
    }
    let lowCaseStr = "";
    if (lowerCase != 0) {
      lowCaseStr = ` and lowerCase(${lowerCase})`;
    }
    let minLengthStr = "";
    if (minLength != 0) {
      minLengthStr = ` and length(${minLength})`;
    }
    let pwdHistoryStr = "";
    if (pwdHistory != 0) {
      pwdHistoryStr = ` and passwordHistory(${pwdHistory})`;
    }

    let parameterString = `hashIterations(27500)${pwdHistoryStr}${minLengthStr} and notUsername and specialChars(1)${upCaseStr}${lowCaseStr} and digits(1) and hashAlgorithm(pbkdf2-sha256) and notEmail and filteredForceExpiredPwdChange(90)`;

    let body = {"passwordPolicy": parameterString};
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let pwdpolicy_url = Constants.GAS_URL + `/idm/usermgmt/v1/tenants/${this.tenantname}/password-policy`;
    let request = http.put(pwdpolicy_url, JSON.stringify(body), params);
    console.log('Set password policy result: ' + request.status);
    console.log('Response time was ' + String(request.timings.duration) + ' ms');

    check(request, {
      "Set password policy status should be 204": (r) => r.status === 204
    });

    return request;
  }

  getPasswordPolicy() {
    let pwdpolicy_url = Constants.GAS_URL + `/idm/usermgmt/v1/tenants/${this.tenantname}/password-policy`;
    let request = http.get(pwdpolicy_url);
    console.log('Get password policy result: ' + request.status);
    console.log('Response time was ' + String(request.timings.duration) + ' ms');

    check(request, {
      "Get password policy status should be 200": (r) => r.status === 200
    });

    return request;
  }

  getUserId(jsessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users/${this.username}`;
    let request = http.get(get_url, params);

    check(request, {
      "Get user status should be 200": (r) => r.status === 200
    });

    console.log("Get user id for user " + this.username + " result: " + request.status);

    const elem = request.json();

    return  elem['id'];
  }

  getUserByName(jsessionId, username) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users/` + username;
    let request = http.get(get_url, params);

    check(request, {
      "Get user by name status should be 200": (r) => r.status === 200
    });

    console.log("Get user name for user " + username + " result: " + request.status);

    return  request;
  }

  getRoles() {
    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users/${this.username}`
    let request = http.get(get_url);

    check(request, {
      "Get user status should be 200": (r) => r.status === 200
    });

    console.log("Get user roles for user " + this.username + " result: " + request.status);

    const elem = request.json();

    return  elem['privileges'];
  }

  changeRoles(jsessionId, resCode = 200) {
    let set_url =  Constants.GAS_URL + '/idm/usermgmt/v1/users/' + this.username + "?tenantname=" + this.tenantname;
    let payload = JSON.stringify({
      "firstName": this.username,
      "lastName": this.username,
      "email": this.username + "@gmail.com",
      "username": this.username,
      "status": "Enabled",
      "privileges": this.roles
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.put(set_url, payload, params);

    check(res, {
      ["Change roles status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Change roles for user " + this.username + " result: " + res.status);
  }

  changePassword(jsessionId, userId, resCode = 204) {
    let resetpwd_url = Constants.GAS_URL + `/idm/usermgmt/v1/users/${userId}/reset-password?tenantname=${this.tenantname}`;
    let body = {"password": this.password, "passwordResetFlag": true};
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let request = http.put(resetpwd_url, JSON.stringify(body), params);
    console.log("Change password for user " + this.username + " result: " + request.status);

    check(request, {
      ["Change password status should be " + resCode]: (r) => r.status === resCode
    });

    return request;
  }

  login_cookies(jsessionId) {
    let login_cookies_url =  Constants.GAS_URL;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res_login = http.get(login_cookies_url, params);
    let jar = http.cookieJar();
    let cookies = jar.cookiesForURL(res_login.url);
    //console.log("CC::"+JSON.stringify(cookies));

    check(res_login, {
        "has cookie 'userName' ": (r) => cookies.userName.length > 0,
        "cookie 'userName' has correct value": (r) => cookies.userName[0] === this.username,
    });

    check(res_login, {
      "Login to base url should be 200": (r) => r.status === 200
    });

    console.log("Login to base url with user " + this.username + " result: " + res_login.status);
    return res_login.body;
   }

  logout_cookies(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let logout_url = Constants.GAS_URL + "/auth/v1/logout";
    let res = http.post(logout_url, null, params);

    let jar = http.cookieJar();
    let cookies = jar.cookiesForURL(res.url);

    console.log("Logout user " + this.username + " result: " + res.status);

    check(res, {
      "has no cookie 'userName'": (r) => typeof cookies.userName === 'undefined',
      "has no cookie 'JSESSIONID'": (r) => typeof cookies.JSESSIONID === 'undefined',
    });

    check(res, {
      'Logout status should be 200': (r) => r.status === 200,
    });
  }

 create_tenant(jsessionId, tenantname, description){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/idm/tenantmgmt/v1/tenants/";
    let body = {"name": tenantname, "description": description};

    let res = http.post(url, JSON.stringify(body), params);

    check(res, {
        "Tenant created": (r) => r.status === 200
    });

    console.log("Tenant created - name: " +  tenantname + " description: " + description + " result: "+ res.status);
    console.log("result tenant name: "+ res.json(`name`));
    return  res;
  }

  update_tenant(jsessionId, tenantname, newDescription){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/idm/tenantmgmt/v1/tenants/" + tenantname;
    let body = {"description": newDescription};

    let res = http.patch(url, JSON.stringify(body), params);

    check(res, {
        "Tenant updated": (r) => r.status === 200,
        "Tenant description updated": (r) => res.json(`description`) == newDescription
    });

    console.log("Tenant updated - name: " +  tenantname + " result: "+ res.status);
    console.log("result tenant description: "+ res.json(`description`));
    return  res;
  }

  delete_tenant(jsessionId, tenantname){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/idm/tenantmgmt/v1/tenants/" + tenantname;

    let res = http.del(url, null, params);

    check(res, {
        "Tenant deleted": (r) => r.status === 204
    });

    console.log("Tenant deleted - name: " +  tenantname + " result: "+ res.status);
    return  res;
  }

  get_tenants(jsessionId){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/idm/tenantmgmt/v1/tenants/";

    let res = http.get(url, params);

    check(res, {
        "Get tenants": (r) => r.status === 200
    });

    console.log("Fetching tenants result: "+ res.status);
    return  res;
  }

  getUsers(jsessionId, resCode = 200, limit=100) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId
        },
    };
    //let get_url = this.base_url + `/idm/usermgmt/v1/users?limit=` + limit;
    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users?&sortAttr=username&sortDir=asc&limit=` + limit;
    let response = http.get(get_url, params);

    check(response, {
      ["Get all users status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Get all users for tenant " + this.tenantname + " with limit " + limit + " - result: " + response.status);

    return  response;
  }

  filterUsers(jsessionId, attributes, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = Constants.GAS_URL + `/idm/usermgmt/v1/users` + attributes;
    let response = http.get(get_url, params);

    check(response, {
      ["Filter users status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Filter users by attributes result: " + response.status);

    return  response;
  }

  getSystemRoles(jsessionId, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = Constants.GAS_URL + `/idm/rolemgmt/v1/roles`;
    let response = http.get(get_url, params);

    check(response, {
      ["Get roles status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Get roles result: " + response.status);

    return  response;
  }

  getKeycloackToken(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    /* let post_url = Constants.IAM_URL + "/auth/realms/" + tenantName + "/protocol/openid-connect/token"; */
    let post_url = Constants.IAM_URL + "/auth/realms/master/protocol/openid-connect/token";

    let formData = {"username": this.username, "password": this.password, "client_id": "admin-cli", "grant_type": "password"}
    let response = http.post(post_url, formData, params);

    check(response, {
      "Get keycloack token status should be 200": (r) => r.status === 200
    });

    console.log("Get token for user " + this.username + " result: " + response.status);
    return  response;
  }

  getKeyCloackTokenSecret(clientId,secret) {
    let params = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Accept": "*/*",
          },
      };

      let post_url = Constants.IAM_URL + "/auth/realms/master/protocol/openid-connect/token";

      let formData = {"client_id": clientId, "client_secret": secret, "tenant": "master", "grant_type": "client_credentials"}
      let response = http.post(post_url, formData, params);

      check(response, {
        "Get keycloack token secret status should be 200": (r) => r.status === 200
      });

      console.log("Get token secret for client " + clientId + " result: " + response.status);
      return  response;
  }

  getKeycloackSessionTimeouts(jsessionId, token, tenantName) {
      let params = {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'JSESSIONID=' + jsessionId,
            "Accept": "*/*",
          },
      };
      let get_url = Constants.IAM_URL + "/auth/admin/realms/" + tenantName;

      let response = http.get(get_url, params);

      check(response, {
        "Get SessionTimeouts status should be 200": (r) => r.status === 200,
        "Get Session Idle Timeout": (r) => r.json()['ssoSessionIdleTimeout'] === Constants.KEYCLOACK_SESSION_IDLE_TIMEOUT,
        "Get Session Max Timeout": (r) => r.json()['ssoSessionMaxLifespan'] === Constants.KEYCLOACK_SESSION_MAX_TIMEOUT
      });

      console.log("Get SessionTimeouts for tenant " + tenantName + " result: " + response.status);
      return  response;
  }

  getApps(jsessionId) {
      let params = {
          headers: {
            'Content-Type': 'application/json',
            "Accept": "*/*",
            'Cookie': 'JSESSIONID=' + jsessionId,
          },
      };

      let url = Constants.GAS_URL + "/ui-meta/v1/apps";

      let res = http.get(url, params);

      check(res, {
          "Get Apps": (r) => r.status === 200
      });

      console.log("Get apps list result: " + res.status);
      return  res;
  }

  getGroups(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-meta/v1/groups";

    let res = http.get(url, params);

    check(res, {
        "Get Groups": (r) => r.status === 200
    });

    console.log("Get groups list result: " + res.status);
    return  res;
  }

  getComponents(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-meta/v1/components";

    let res = http.get(url, params);

    check(res, {
        "Get Components": (r) => r.status === 200
    });

    console.log("Get components list result: " + res.status);
    return  res;
  }

  getImportMap(jsessionId) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/ui-serve/v1/import-map";

    let res = http.get(url, params);

    check(res, {
        "Get Import Map": (r) => r.status === 200
    });

    console.log("Get import map result: " + res.status);
    return  res;
  }

  getStaticAsset(jsessionId, staticAssetPath) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + staticAssetPath;
    console.log("Static asset URL: " + url);

    let res = http.get(url, params);

    check(res, {
        "Get Static Asset": (r) => r.status === 200
    });

    console.log("Get static asset result: " + res.status);
    return  res;
  }

  get_logs_logViewer(jsessionId, body){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/log/viewer/api/v2/sources/query";
    let res = http.post(url, JSON.stringify(body), params);

    if(res.status === 404){
      console.log("calling endpoint sources-query");
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query";
      res = http.post(new_url, JSON.stringify(body), params);
      if(res.status === 422){
        console.log("calling endpoint with new body");
        let body_str = JSON.stringify(body);
        body_str = body_str.replace("\"source\":", "\"sourceModel\":");
        res = http.post(new_url, body_str, params);
      }
    }

    if(res.status === 422){
      console.log("calling endpoint with new body");
      let new_url = Constants.GAS_URL + "/log/viewer/api/v2/sources-query";
      let body_str = JSON.stringify(body);
      body_str = body_str.replace("\"source\":", "\"sourceModel\":");
      res = http.post(new_url, body_str, params);
    }

    check(res, {
        "Get Logs": (r) => r.status === 200
    });

    console.log("Get Logs Login Auth Flow result: " + res.status);

    return  res;
  }

  get_logplane_names_logViewer(jsessionId){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/log/viewer/api/v2/elasticsearch/logplanes?excludeEmpty=false";

    let res = http.get(url, null, params);

    check(res, {
        "Logplanes retrieved": (r) => r.status === 200
    });
    console.log("Get LogPlane names result " + res.status);
    return  res;
  }

  get_logViewer_home_page(jsessionId, resCode=200){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/log/viewer";

    let res = http.get(url, null, params);

    check(res, {
      ["Get LogViewer Home Page status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Get LogViewer Home Page result " + res.status);
    return  res;
  }

  getDocuments(jsessionId) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*",
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let url = Constants.GAS_URL + "/help-meta/v1/documents";

    let res = http.get(url, params);

    check(res, {
      "Get Docs": (r) => r.status === 200
    });

    console.log("Get Docs List result: " + res.status);
    return  res;
  }

  create_dynamic_route(jsessionId, payload){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/v1/routes/";

    let res = http.post(url, JSON.stringify(payload), params);

    check(res, {
        "Dynamic Route created": (r) => r.status === 201
    });

    console.log("Dynamic Route - name: " +  payload['id'] + " result: "+ res.status);
    console.log("Response Dynamic Route name: " + res.json(`id`));
    return  res;
  }

  update_dynamic_route(jsessionId, payload){
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };

    let url = Constants.GAS_URL + "/v1/routes/";

    let res = http.put(url, JSON.stringify(payload), params);

    check(res, {
        "Dynamic Route updated": (r) => r.status === 200
    });

    console.log("Dynamic Route Updated - name: " +  payload['id'] + " result: "+ res.status);
    console.log("Response Dynamic Route Updated name: " + res.json(`id`));
    return  res;
  }

  delete_dynamic_route(jsessionId, dynamicRouteName, resCode = 204) {
    let deluser_url =  Constants.GAS_URL + "/v1/routes/" + dynamicRouteName;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.del(deluser_url, null, params);

    check(res, {
      ["Delete Dynamic Route status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete Dynamic Route " + dynamicRouteName + " result: " + res.status);
    return res;
  }

  get_single_dynamic_route(jsessionId, dynamicRouteName, resCode = 200) {
    let get_url =  Constants.GAS_URL + "/v1/routes/" + dynamicRouteName;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.get(get_url, params);

    check(res, {
      ["Get Dynamic Route status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Get Dynamic Route " + dynamicRouteName + " result: " + res.status);
    return res;
  }

  get_all_dynamic_routes(jsessionId, resCode = 200) {
    let get_url =  Constants.GAS_URL + "/v1/routes";

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.get(get_url, params);

    check(res, {
      ["Get All Dynamic Routes status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Get All Dynamic Routes" + " result: " + res.status);
    return res;
  }

  create_ExtAppRestRole(jsessionId, payload, resCode = 200) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };
    console.log(payload);
    let user_url = Constants.GAS_URL + '/idm/rolemgmt/v1/extapp/rbac';
    let res = http.post(user_url, payload, params);

    check(res, {
      ["Create Role status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Create Role result: " + res.status);

    return res;
  }

  delete_ExtAppRestRole(jsessionId, payload, resCode = 204) {
    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let user_url = Constants.GAS_URL + '/idm/rolemgmt/v1/extapp/rbac';
    let res = http.del(user_url, payload, params);

    check(res, {
      ["Delete Role status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Delete Role result: " + res.status);
    return res;
  }

  getKeycloackEffectiveRoles(jsessionId, token, roleId) {
    let params = {
       headers: {
         'Authorization': 'Bearer ' + token,
         'Content-Type': 'application/x-www-form-urlencoded',
         'Cookie': 'JSESSIONID=' + jsessionId,
         "Accept": "*/*",
        },
    };

    let get_url = `${Constants.IAM_URL}/auth/admin/realms/${this.tenantname}/roles-by-id/${roleId}/composites/realm`;
    let response = http.get(get_url, params);

    check(response, {
      "Get Effective Roles status should be 200": (r) => r.status === 200,
    });

    console.log("Get Effective Roles result: " + response.status);
    return  response;
  }

}


