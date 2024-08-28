import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkStatus } from './use_cases/logsManagement/UC-LM-04.js'

export default function () {
    checkStatus();
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-04.html' : htmlReport(data),
        './reports/result_UC-LM-04.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}