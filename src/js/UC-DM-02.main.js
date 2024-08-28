import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

let dasboardId = __ENV.DASHBOARDID;
//Test Cases
import { CheckTestDashboard } from "./use_cases/dashboardManagement/UC-DM-02.js";

export default function () {
  CheckTestDashboard(dasboardId);
}

export function handleSummary(data) {
  return {
    "./reports/result_UC-DM-02.html": htmlReport(data),
    "./reports/result_UC-DM-02.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true })
  };
}
