import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkDSTTraces } from './use_cases/logsManagement/UC-LM-12.js'

let traceOn = __ENV.TRACEON;
let service = __ENV.SERVICE;
let operation = __ENV.OPERATION;

export default function () {
    checkDSTTraces(traceOn, service, operation);
}

export function handleSummary(data) {
    return {
        './reports/result_UC-LM-12.html' : htmlReport(data),
        './reports/result_UC-LM-12.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}

