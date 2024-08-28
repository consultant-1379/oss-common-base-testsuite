import { htmlReport } from "../../../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js"; //PATH TO BE UPDATED
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, teardownEnv } from './UC-EUX-SETUP-TEARDOWN.js'
import { getGroupsList } from './UC-EUX-GROUPS.js'
import { getAppsList } from './UC-EUX-APPS.js'
import { getDocsList } from './UC-EUX-DOCS.js'
import { getComponentsList } from './UC-EUX-COMPONENTS.js'
import { getStaticAsset } from './UC-EUX-ASSET.js'


export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function getGroups(data) {
    getGroupsList(data);
}

export function getApps(data) {
    getAppsList(data);
}

export function getDocs(data) {
    getDocsList(data);
}

export function getComponents(data) {
    getComponentsList(data);
}

export function getAsset(data) {
    getStaticAsset(data);
}

export function handleSummary(data) {
    return {
        '/tests/reports/result_UC-EUX-01.html' : htmlReport(data), //PATH TO BE UPDATED
        '/tests/reports/result_UC-EUX-01.json': JSON.stringify(data), //PATH TO BE UPDATED
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}