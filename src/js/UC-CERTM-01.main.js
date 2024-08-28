import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { certM } from './use_cases/certManagement/UC-CERTM-01.js'

export default function () {
    certM();
}

export function handleSummary(data) {
    return {
        './reports/result_UC-CERTM-01.html' : htmlReport(data),
        './reports/result_UC-CERTM-01.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}
