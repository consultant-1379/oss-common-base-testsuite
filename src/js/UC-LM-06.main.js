import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, logViewerCharacteristicsWithJSessionEnv,
        logViewerCharacteristicsWithClientSecretEnv,
        logViewerCharacteristicsServiceIdWithJSessionEnv,
        logViewerCharacteristicsServiceIdWithClientSecretEnv,
        logViewerCharacteristicsPlainTextWithJSessionEnv,
        logViewerCharacteristicsPlainTextWithClientSecretEnv,
        logViewerCharacteristicsPlainTextAndIdWithJSessionEnv,
        logViewerCharacteristicsPlainTextAndIdWithClientSecretEnv,
        teardownEnv } from './use_cases/logsManagement/UC-LM-06.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function logViewerCharacteristicsWithJSession(data) {
    logViewerCharacteristicsWithJSessionEnv(data);
}

export function logViewerCharacteristicsWithClientSecret(data) {
    logViewerCharacteristicsWithClientSecretEnv(data);
}

export function logViewerCharacteristicsServiceIdWithJSession(data) {
    logViewerCharacteristicsServiceIdWithJSessionEnv(data);
}

export function logViewerCharacteristicsServiceIdWithClientSecret(data) {
    logViewerCharacteristicsServiceIdWithClientSecretEnv(data);
}

export function logViewerCharacteristicsPlainTextWithJSession(data) {
    logViewerCharacteristicsPlainTextWithJSessionEnv(data);
}

export function logViewerCharacteristicsPlainTextWithClientSecret(data) {
    logViewerCharacteristicsPlainTextWithClientSecretEnv(data);
}

export function logViewerCharacteristicsPlainTextAndIdWithJSession(data) {
    logViewerCharacteristicsPlainTextAndIdWithJSessionEnv(data);
}

export function logViewerCharacteristicsPlainTextAndIdWithClientSecret(data) {
    logViewerCharacteristicsPlainTextAndIdWithClientSecretEnv(data);
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-06.html' : htmlReport(data),
        './reports/result_UC-LM-06.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}