import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';

export const getAppsListPolicyAPIDuration = new Trend('Get Apps List API Duration');

export function getAppsList(data) {

  let jSessionId = data[0];

  group("Check Apps", function () {
    let response;

    group("Get Apps List", function () {
      response = GUIAggregator.getApps(jSessionId);
      getAppsListPolicyAPIDuration.add(response.timings.duration);
    });

    group("UC: Verify that User Admin App is listed", function () {
      check(response, {
        "has User Admin App": (r) => r.json(`#(name="user-mgmt")`)
      });
    });

    group("UC: Verify that Help Center App is listed", function () {
      check(response, {
        "has Help Center App": (r) => r.json(`#(name="help-center-main-page")`)
      });
    });

    group("UC: Verify that Metric(s) Viewer App is listed", function () {
      check(response, {
        "has Metric(s) Viewer App": (r) => r.json(`#(name="eoportalSysadm:cnom-metrics-viewer")`),
      });
    });

    group("UC: Verify that Log Viewer App is listed", function () {
      check(response, {
        "has Log Viewer App": (r) => r.json(`#(name="eoportalSysadm:log-viewer")`),
      });
    });

    group("UC: Verify that External LDAP App is listed", function () {
      check(response, {
        "has External LDAP App": (r) => r.json(`#(name="eoportalSysadm:external-ldap-configuration")`)
      });
    });

    group("UC: Verify that Connected Systems App is listed", function () {
      check(response, {
        "has Connected Systems App": (r) => r.json(`#(name="eoportalSysadm:connected-systems")`)
      });
    });

    group("UC: Verify that System Monitor App is listed", function () {
      check(response, {
        "has System Monitor App": (r) => r.json(`#(name="eoportalSysadm:system-monitor")`)
      });
    });
  });
}
