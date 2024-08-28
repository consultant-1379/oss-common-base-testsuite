import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, getGasKpi, teardownEnv } from './use_cases/exposureUX/UC-EUX-CHARACT.js'

export function setup() {
    setupEnv();
}

export function teardown() {
    teardownEnv();
}

export function gasKpi() {
    getGasKpi();
}

export function handleSummary(data) {
    return {
        './reports/result_UC-EUX-CHARACT.html' : htmlReport(data),
        './reports/result_UC-EUX-CHARACT.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}