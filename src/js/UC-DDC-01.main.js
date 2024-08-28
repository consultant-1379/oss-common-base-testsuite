//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

let result = __ENV.RESULT;

//Test Cases
import { triggerCollection } from './use_cases/ddc/UC-DDC-01.js'

export default function () {
    triggerCollection(result);
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-DDC-01.html' : htmlReport(data),
        './reports/result_UC-DDC-01.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}
