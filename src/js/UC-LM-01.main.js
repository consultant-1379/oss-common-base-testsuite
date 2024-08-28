import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkLogsHousekeeping } from './use_cases/logsManagement/UC-LM-01.js'

export default function () {
    checkLogsHousekeeping();
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-01.html' : htmlReport(data),
        './reports/result_UC-LM-01.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}