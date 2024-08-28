import { User } from '../../modules/User.js';
import { Certificate } from '../../modules/Certificate.js';
import * as Constants from '../../modules/Constants.js';
import { group, check } from "k6";
import { Trend } from 'k6/metrics';
import { scenario, exec } from "k6/execution";

export const createTrustedCertAPIDuration = new Trend('Create_trusted_certificate_API_Duration');
export const removeTrustedCertAPIDuration = new Trend('Remove_trusted_certificate_API_Duration');
export const createAsymmetrickeyAPIDuration = new Trend('Create_asymmetric_key_API_Duration');
export const removeAsymmetrickeyAPIDuration = new Trend('Remove_asymmetric_key_API_Duration');
export const getTrustedCertAPIDuration = new Trend('Get_trusted_certificates_API_Duration');
export const getTrustedCertByNameAPIDuration = new Trend('Get_trusted_certificate_by_name_API_Duration');
export const getAsymmetrickeyAPIDuration = new Trend('Get_asymmetric_keys_API_Duration');
export const getAsymmetrickeyByNameAPIDuration = new Trend('Get_asymmetric_key_by_name_API_Duration');
export const updateTrustedCertAPIDuration = new Trend('Update_trusted_certificate_API_Duration');
export const updateAsymmetrickeyAPIDuration = new Trend('Update_asymmetric_key_API_Duration');


let gasUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);

let ossSecurityAdminName = Constants.NEW_USER + "_certmtest";

let userOssSecurityAdmin = new User(ossSecurityAdminName,
                         Constants.GAS_USER_PWD,
                         Constants.TENANT_NAME,
                         Constants.GAS_URL,
                         ["OSSSecurityAdmin"]);

let certName = "mycertificatefortest";
let asymmetricKeyName = "myasymmetrickKeyfortest";
const MAX_CERTS = 42;
const NUM_VU = 4;

export function setupEnv() {
  let jSessionId;

  group("Log in as admin user", function() {
    jSessionId = gasUser.login();
  });

  group("Create a user with role OSSSecurityAdmin", function() {
    userOssSecurityAdmin.create(jSessionId, 200);
  });

  group("Logout as admin user", function() {
    gasUser.logout(jSessionId);
  });

  group("Log in as OSSSecurityAdmin", function() {
    jSessionId = userOssSecurityAdmin.login();
  });

  group("Create certificates and asymmetric keys", function() {
    for (let i = 0; i < MAX_CERTS; i++) {
      Certificate.create(jSessionId, Constants.GAS_URL, `${certName}_100${i}`);
      Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_100${i}`);
    }

    for (let i = 0; i < NUM_VU; i++) {
      Certificate.create(jSessionId, Constants.GAS_URL, `${certName}_update_${i}`);
      Certificate.create(jSessionId, Constants.GAS_URL, `${certName}_remove_${i}`);
      Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_update_${i}`);
      Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_remove_${i}`);
    }
  });

  return { jSessionId: jSessionId };
}

export function updateTrustedCertificateEnv(data) {
  let jSessionId = data.jSessionId;

  group("Update trusted certificate", function() {
    let request = Certificate.create(jSessionId, Constants.GAS_URL, `${certName}_update_${scenario.iterationInTest}`);
    updateTrustedCertAPIDuration.add(request.timings.duration);
  });
}

export function getTrustedCertificateByNameEnv(data) {
  let jSessionId = data.jSessionId;

  group("Get trusted certificate by name", function() {
    let request = Certificate.getCertificateByName(jSessionId, Constants.GAS_URL, `${certName}_update_${scenario.iterationInTest}`);
    getTrustedCertByNameAPIDuration.add(request.timings.duration);
  });
}

export function removeTrustedCertificateEnv(data) {
  let jSessionId = data.jSessionId;

  group("Remove trusted certificate", function() {
    let request = Certificate.remove(jSessionId, `${certName}_remove_${scenario.iterationInTest}`, Constants.GAS_URL);
    removeTrustedCertAPIDuration.add(request.timings.duration);
  });
}

export function updateAsymmetricKeyEnv(data) {
  let jSessionId = data.jSessionId;

  group("Update asymmetric Key", function() {
    let request = Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_update_${scenario.iterationInTest}`);
    updateAsymmetrickeyAPIDuration.add(request.timings.duration);
  });
}

export function getAsymmetricKeyByNameEnv(data) {
  let jSessionId = data.jSessionId;

  group("Get asymmetric Key by name", function() {
    let request = Certificate.getAsymmetricKeyByName(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_update_${scenario.iterationInTest}`);
    getAsymmetrickeyByNameAPIDuration.add(request.timings.duration);
  });
}

export function removeAsymmetricKeyEnv(data) {
  let jSessionId = data.jSessionId;

  group("Remove asymmetric key", function () {
    let request = Certificate.removeAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_remove_${scenario.iterationInTest}`);
    removeAsymmetrickeyAPIDuration.add(request.timings.duration);
  });
}

export function getTrusteCertificatesEnv(data) {
  let jSessionId = data.jSessionId;

  group("Get trusted certificates", function() {
    let request = Certificate.getCertificates(jSessionId, Constants.GAS_URL);
    getTrustedCertAPIDuration.add(request.timings.duration);
  });
}

export function getAsymmetrickeysEnv(data) {
  let jSessionId = data.jSessionId;

  group("Get asymmetric keys", function () {
    let request = Certificate.asymmetrickeys(jSessionId, Constants.GAS_URL, 200)
    getAsymmetrickeyAPIDuration.add(request.timings.duration);
  });
}

export function createTrustedCertificateEnv(data) {
  let jSessionId = data.jSessionId;

  group("Create trusted certificate", function() {
    let request = Certificate.create(jSessionId, Constants.GAS_URL, `${certName}_create_${scenario.iterationInTest}`);
    createTrustedCertAPIDuration.add(request.timings.duration);
  });
}

export function createAsymmetricKeyEnv(data) {
  let jSessionId = data.jSessionId;

  group("Create asymmetric Key", function() {
    let request = Certificate.createAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_create_${scenario.iterationInTest}`);
    createAsymmetrickeyAPIDuration.add(request.timings.duration);
  });
}

export function teardownEnv(data) {
  let jSessionId = data.jSessionId;

  group("Remove certificates and asymmetric keys", function() {
    for (let i = 0; i < MAX_CERTS; i++) {
      Certificate.remove(jSessionId, `${certName}_100${i}`, Constants.GAS_URL);
      Certificate.removeAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_100${i}`);
    }
    for (let i = 0; i < NUM_VU; i++) {
      Certificate.remove(jSessionId, `${certName}_update_${i}`, Constants.GAS_URL);
      Certificate.remove(jSessionId, `${certName}_create_${i}`, Constants.GAS_URL);
      Certificate.removeAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_update_${i}`);
      Certificate.removeAsymmetricKey(jSessionId, Constants.GAS_URL, `${asymmetricKeyName}_create_${i}`);
    }
  });

  group("Logout as OSSSecurityAdmin user", function() {
    userOssSecurityAdmin.logout(jSessionId);
  });

  group("Log in as admin user", function() {
    jSessionId = gasUser.login();
  });

  group("Delete new user", function() {
    userOssSecurityAdmin.delete(jSessionId);
  });

  group("Logout as admin user", function() {
    gasUser.logout(jSessionId);
  });
}


