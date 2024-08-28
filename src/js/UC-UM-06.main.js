//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, usermgmtKpiEnvCreate, usermgmtKpiEnvUpdate, usermgmtKpiEnvFilter, usermgmtKpiEnvGetAll,
    usermgmtKpiEnvGetByName, usermgmtKpiEnvResetPassword, usermgmtKpiEnvGetRoles, usermgmtKpiEnvDelete, teardownEnv } from './use_cases/userManagement/UC-UM-06.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function usermgmtKpiCreate(data) {
    usermgmtKpiEnvCreate(data);
}

export function usermgmtKpiUpdate(data) {
    usermgmtKpiEnvUpdate(data);
}

export function usermgmtKpiFilter(data) {
    usermgmtKpiEnvFilter(data);
}

export function usermgmtKpiGetAll(data) {
    usermgmtKpiEnvGetAll(data);
}

export function usermgmtKpiGetByName(data) {
    usermgmtKpiEnvGetByName(data);
}

export function usermgmtKpiResetPassword(data) {
    usermgmtKpiEnvResetPassword(data);
}

export function usermgmtKpiGetRoles(data) {
    usermgmtKpiEnvGetRoles(data);
}

export function usermgmtKpiDelete(data) {
    usermgmtKpiEnvDelete(data);
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-UM-06.html' : htmlReport(data),
        './reports/result_UC-UM-06.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}