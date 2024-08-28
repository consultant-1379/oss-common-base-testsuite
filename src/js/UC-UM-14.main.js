//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkLoginCookies } from './use_cases/userManagement/UC-UM-14.js'

export default function () {
    checkLoginCookies();
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-UM-14.html' : htmlReport(data),
        './reports/result_UC-UM-14.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}