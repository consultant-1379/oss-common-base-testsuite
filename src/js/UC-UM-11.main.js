import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, usermgmtKpiEnvEnableDisableClients, usermgmtKpiEnvGetAllExternalClients, usermgmtKpiEnvGetClientsSecret, usermgmtKpiEnvUpdateRealmRoles,
    usermgmtKpiEnvViewRoleMapping, usermgmtKpiEnvGetProtocolMapper, usermgmtKpiEnvCreateProtocolMapper, usermgmtKpiEnvUpdateProtocolMapper, usermgmtKpiEnvDeleteProtocolMapper,
    usermgmtKpiEnvGetClaims, usermgmtKpiEnvRegenerateClientsSecret, teardownEnv } from './use_cases/userManagement/UC-UM-11.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function usermgmtKpiEnableDisableClients(data) {
    usermgmtKpiEnvEnableDisableClients(data);  
}

export function usermgmtKpiGetAllExternalClients(data) {
    usermgmtKpiEnvGetAllExternalClients(data);  
}

export function usermgmtKpiUpdateRealmRoles(data) {
    usermgmtKpiEnvUpdateRealmRoles(data);  
}

export function usermgmtKpiViewRoleMapping(data) {
    usermgmtKpiEnvViewRoleMapping(data);  
}

export function usermgmtKpiGetProtocolMapper(data) {
    usermgmtKpiEnvGetProtocolMapper(data);  
}

export function usermgmtKpiCreateProtocolMapper(data) {
    usermgmtKpiEnvCreateProtocolMapper(data);  
}

export function usermgmtKpiUpdateProtocolMapper(data) {
    usermgmtKpiEnvUpdateProtocolMapper(data);  
}

export function usermgmtKpiDeleteProtocolMapper(data) {
    usermgmtKpiEnvDeleteProtocolMapper(data);  
}

export function usermgmtKpiGetClaims(data) {
    usermgmtKpiEnvGetClaims(data);  
}

export function usermgmtKpiGetClientsSecret(data) {
    usermgmtKpiEnvGetClientsSecret(data);   
}

export function usermgmtKpiRegenerateClientsSecret(data) {
    usermgmtKpiEnvRegenerateClientsSecret(data);   
}

export function handleSummary(data) {
    return {
        './reports/result_UC-UM-11.html' : htmlReport(data),
        './reports/result_UC-UM-11.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}