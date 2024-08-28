import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { User } from './modules/User.js';
import * as Constants from './modules/Constants.js';

//Test Cases
import { getGroupsList } from './use_cases/exposureUX/UC-EUX-GROUPS.js'
import { getAppsList } from './use_cases/exposureUX/UC-EUX-APPS.js'
import { fetchStaticAsset } from './use_cases/exposureUX/UC-EUX-ASSET.js'
import { getDocsList } from './use_cases/exposureUX/UC-EUX-DOCS.js'

export function setup() {
    let soUser = new User(Constants.GAS_USER,
        Constants.GAS_USER_PWD,
        Constants.TENANT_NAME,
        Constants.GAS_URL);

    let dataArray = [];

    let jSessionId = soUser.login();
    dataArray[0] = jSessionId;

    return dataArray;
}

export function teardown(data) {
    let soUser = new User(Constants.GAS_USER,
        Constants.GAS_USER_PWD,
        Constants.TENANT_NAME,
        Constants.GAS_URL);

    let jSessionId = data[0];

    soUser.logout(jSessionId);
}

export function getGroups(data) {
  getGroupsList(data);
}

export function getApps(data) {
    getAppsList(data);
}

export function getAsset(data) {
    fetchStaticAsset(data);
}

export function getDocs(data) {
    getDocsList(data);
}

export function handleSummary(data) {
    return {
        './reports/result_UC-EUX-ALL.html' : htmlReport(data),
        './reports/result_UC-EUX-ALL.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}