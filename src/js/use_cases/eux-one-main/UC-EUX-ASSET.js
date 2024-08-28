import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';
import { vu, scenario, exec, test } from 'k6/execution';

export const getImportMapPolicyAPIDuration = new Trend('Get Import Map API Duration');
export const getStaticAssetPolicyAPIDuration = new Trend('Get Static Asset API Duration');

export function getStaticAsset(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];

  let staticAssetPath;
  let response;

  group("Use Case: Get Static Asset", function () {

    group("Get Import Map", function () {
      response = GUIAggregator.getImportMap(jSessionId);
      getImportMapPolicyAPIDuration.add(response.timings.duration);
    });

    group("Verify that user-admin module name is present", function () {
      check(response, {
        "has module name": (r) => r.json('imports').hasOwnProperty('user-admin')
      });
    });

    staticAssetPath =  response.json('imports.user-admin');

    group("Check value of module name", function () {
      check(response, {
        "URL pointing to /ui-serve/v1/static/... endpoint": (r) => r.json('imports.user-admin').startsWith("/ui-serve/v1/static")
      });

      check(response, {
        "is a javascript module": (r) => r.json('imports.user-admin').endsWith(".js")
      });
    });

    group("Get Static Asset", function() {
      let staticAssetResponse = GUIAggregator.getStaticAsset(jSessionId, staticAssetPath);
      getStaticAssetPolicyAPIDuration.add(staticAssetResponse.timings.duration);
    });
  });
}
