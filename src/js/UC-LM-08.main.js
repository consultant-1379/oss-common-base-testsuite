import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { LogAPI_ExtApps_Application_ReadOnly} from './use_cases/logsManagement/UC-LM-08.js'

export default function () {
    LogAPI_ExtApps_Application_ReadOnly();
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-08.html' : htmlReport(data),
        './reports/result_UC-LM-08.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}