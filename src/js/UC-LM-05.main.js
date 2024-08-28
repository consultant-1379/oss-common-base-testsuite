import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

import { setupEnv,teardownEnv,clusterMetricsEnv } from './use_cases/logsManagement/UC-LM-05.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function clusterMetrics(data) {
    clusterMetricsEnv(data);
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-05.html' : htmlReport(data),
        './reports/result_UC-LM-05.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}