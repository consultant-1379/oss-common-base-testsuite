import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { testGUI } from './use_cases/gui/UC-GUI-02.js'

export default function () {
  testGUI();
}

export function handleSummary(data) {
  return {
    './reports/result_UC-GUI-02.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  }
}

