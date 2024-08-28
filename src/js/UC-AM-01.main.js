//import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { getAlarms } from './use_cases/alarmManagement/UC-AM-01.js'

let validAlarms = JSON.parse(open('../../resources/data/alarm_scheme.json'));

let namespace = __ENV.NAMESPACE;
let kubeconfig = __ENV.KUBECONFIG;

export default function () {
    getAlarms(kubeconfig, namespace, validAlarms);
}

export function handleSummary(data) {
    return {
        //'./reports/result_UC-AM-01.html' : htmlReport(data),
        './reports/result_UC-AM-01.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}