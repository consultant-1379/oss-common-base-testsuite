//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, loginAttemptsWithBfpAndMaxLoginFailure, teardownEnv } from './use_cases/bruteforceProtection/UC-BFP-03.js'

export function setup() {
    setupEnv();
}

export function teardown() {
    teardownEnv();
}

export default function () {
    loginAttemptsWithBfpAndMaxLoginFailure();
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-BFP-03.html' : htmlReport(data),
        './reports/result_UC-BFP-03.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}