import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class BFProtection {
  constructor(GAS_URL, tenantName) {
    this.tenantName = tenantName;
    this.base_url = GAS_URL;
    this.bruteForceProtected = true;
    this.permanentLockout = false;
    this.failureFactor = 30;
    this.waitIncrementSeconds = 2;
    this.quickLoginCheckMilliSeconds = 1000;
    this.minimumQuickLoginWaitSeconds = 20;
    this.maxFailureWaitSeconds = 40;
    this.maxDeltaTimeSeconds = 1;
  }

  getBFProtection(jsessionId) {
    let bfp_url = this.base_url + `/idm/usermgmt/v1/tenants/${this.tenantName}/brute-force`;
    let request = http.get(bfp_url);
    console.log('Get BFP result: ' + request.status);
    console.log('Response time was ' + String(request.timings.duration) + ' ms');

    check(request, {
      "Get BFP status should be 200": (r) => r.status === 200
    });

    return request;
  }

  setBFProtection(jsessionId) {
    var payload = JSON.stringify({
      "bruteForceProtected": this.bruteForceProtected,
      "permanentLockout": this.permanentLockout,
      "failureFactor": this.failureFactor,
      "waitIncrementSeconds": this.waitIncrementSeconds,
      "quickLoginCheckMilliSeconds": this.quickLoginCheckMilliSeconds,
      "minimumQuickLoginWaitSeconds": this.minimumQuickLoginWaitSeconds,
      "maxFailureWaitSeconds": this.maxFailureWaitSeconds,
      "maxDeltaTimeSeconds" : this.maxDeltaTimeSeconds
    });

    var params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let bfp_url = this.base_url + `/idm/usermgmt/v1/tenants/${this.tenantName}/brute-force`;
    var res = http.put(bfp_url, payload, params);

    check(res, {
      "Set Brute Force Protection status should be 204": (r) => r.status === 204
    });

    console.log("SetBFProtection result: " + res.status);

    return res;
  }

  setBruteForceProtected(bruteForceProtected) {
    this.bruteForceProtected = bruteForceProtected; 
  }

  setPermanentLockout(permanentLockout) {
    this.permanentLockout = permanentLockout;
  } 

  setFailureFactor(failureFactor) {
    this.failureFactor = failureFactor;
  }

  setQuickLoginCheckMilliSeconds(quickLoginCheckMilliSeconds) {
    this.quickLoginCheckMilliSeconds = quickLoginCheckMilliSeconds;
  }

  setMinimumQuickLoginWaitSeconds(minimumQuickLoginWaitSeconds) {
    this.minimumQuickLoginWaitSeconds = minimumQuickLoginWaitSeconds;
  }

  setMaxFailureWaitSeconds(maxFailureWaitSeconds) {
    this.maxFailureWaitSeconds = maxFailureWaitSeconds;
  }
  
  setMaxDeltaTimeSeconds(maxDeltaTimeSeconds) {
    this.maxDeltaTimeSeconds = maxDeltaTimeSeconds;
  }
}
