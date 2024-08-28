import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { CheckDashboardExistance_VerifyQueriesDefinedInTheDashboard } from "./use_cases/dashboardManagement/UC-DM-01.js";

export default function () {
  CheckDashboardExistance_VerifyQueriesDefinedInTheDashboard();
}

export function handleSummary(data) {
  return {
    "./reports/result_UC-DM-01.html": htmlReport(data),
    "./reports/result_UC-DM-01.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true })
  };
}
