//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, getUsersTenantEnv, teardownEnv } from './use_cases/userManagement/UC-UM-01.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function getUsersTenant(data) {
    getUsersTenantEnv(data);
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-UM-01.html' : htmlReport(data),
        './reports/result_UC-UM-01.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}