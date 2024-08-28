import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';

export const getImportMapPolicyAPIDuration = new Trend('Get Import Map API Duration');
export const getStaticAssetPolicyAPIDuration = new Trend('Get Static Asset API Duration');

export function fetchStaticAsset(data) {

  let jSessionId = data[0];
  let staticAssetPath;
  let response;

  group("Get Import Map", function () {
    response = GUIAggregator.getImportMap(jSessionId);
    getImportMapPolicyAPIDuration.add(response.timings.duration);
  });

  group("Check Module Name", function () {

    group("UC: Verify that module name is present", function () {
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
  });

  group("Check Static Asset", function () {
    group("UC: Verify Fetch Static Asset", function() {
      let staticAssetResponse = GUIAggregator.getStaticAsset(jSessionId, staticAssetPath);
      getStaticAssetPolicyAPIDuration.add(staticAssetResponse.timings.duration);
    });
  });
}
