import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { checkLogEnries } from './use_cases/logsManagement/UC-LM-14.js'

let prefix = __ENV.PREFIX;
let entries = __ENV.ENTRIES;
let replicas = __ENV.REPLICAS;

export default function () {
  checkLogEnries(prefix, entries, replicas);
}

export function handleSummary(data) {
  return {
    './reports/result_UC-LM-14.html' : htmlReport(data),
    './reports/result_UC-LM-14.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  }
}

