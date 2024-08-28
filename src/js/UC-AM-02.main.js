//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkScrapePools } from './use_cases/alarmManagement/UC-AM-02.js'

export default function () {
    checkScrapePools();
}

export function handleSummary(data) {
    return {
       // './reports/result_UC-AM-02.html' : htmlReport(data),
        './reports/result_UC-AM-02.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}
