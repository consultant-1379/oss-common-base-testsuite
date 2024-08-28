import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';
import { vu, scenario, exec, test } from 'k6/execution';

export const getAppsListPolicyAPIDuration = new Trend('Get Apps List API Duration');

export function getAppsList(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];

  let response;

  group("Use Case: Get Apps", function () {

    group("Get Apps List", function () {
      response = GUIAggregator.getApps(jSessionId);
      getAppsListPolicyAPIDuration.add(response.timings.duration);
    });

    group("Verify that User Admin App is listed", function () {
      check(response, {
        "has Admin App": (r) => r.json(`#(name="user-mgmt")`)
      });
    });

    group("Verify that Help Center App is listed", function () {
      check(response, {
        "has Help Center App": (r) => r.json(`#(name="help-center-main-page")`)
      });
    });

    group("Verify that Metric(s) Viewer App is listed", function () {
      check(response, {
        "has Metric(s) Viewer App": (r) => r.json(`#(name="eoportalSysadm:cnom-metrics-viewer")`),
      });
    });

    group("Verify that Log Viewer App is listed", function () {
      check(response, {
        "has Log Viewer App": (r) => r.json(`#(name="eoportalSysadm:log-viewer")`),
      });
    });
  });
}