//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, teardownEnv, configureBFPEnv } from './use_cases/bruteforceProtection/UC-BFP-08.js'

export default function configureBFP(data) {
    configureBFPEnv(data);
}

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function handleSummary(data) {
    return {
       // './reports/result_UC-BFP-08.html' : htmlReport(data),
        './reports/result_UC-BFP-08.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}

