//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, teardownEnv, updateTrustedCertificateEnv, getTrustedCertificateByNameEnv,
         removeTrustedCertificateEnv, updateAsymmetricKeyEnv, getAsymmetricKeyByNameEnv,
	 removeAsymmetricKeyEnv, getTrusteCertificatesEnv, getAsymmetrickeysEnv, 
	 createTrustedCertificateEnv, createAsymmetricKeyEnv } from './use_cases/certManagement/UC-CERTM-06.js'

export function updateTrustedCertificate(data) {
  updateTrustedCertificateEnv(data);
}

export function getTrustedCertificateByName(data) {
  getTrustedCertificateByNameEnv(data);
}

export function removeTrustedCertificate(data) {
  removeTrustedCertificateEnv(data);
}

export function updateAsymmetricKey(data) {
  updateAsymmetricKeyEnv(data);
}

export function getAsymmetricKeyByName(data) {
  getAsymmetricKeyByNameEnv(data);
}

export function removeAsymmetricKey(data) {
  removeAsymmetricKeyEnv(data);
}

export function getTrusteCertificates(data) {
  getTrusteCertificatesEnv(data);
}

export function getAsymmetrickeys(data) {
  getAsymmetrickeysEnv(data);
}

export function createTrustedCertificate(data) {
  createTrustedCertificateEnv(data);
}

export function createAsymmetricKey(data) {
  createAsymmetricKeyEnv(data);
}

export function setup() {
  return setupEnv();
}

export function teardown(data) {
  teardownEnv(data);
}

export function handleSummary(data) {
    return {
//        './reports/result_UC-CERTM-06.html' : htmlReport(data),
        './reports/result_UC-CERTM-06.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}
