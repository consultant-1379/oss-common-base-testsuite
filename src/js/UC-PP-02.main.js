//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, teardownEnv, getPasswordPolicyEnv } from './use_cases/passwordPolicy/UC-PP-02.js'

export default function getPasswordPolicy(data) {
    getPasswordPolicyEnv(data);
}

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function handleSummary(data) {
    return {
       // './reports/result_UC-PP-02.html' : htmlReport(data),
        './reports/result_UC-PP-02.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}
