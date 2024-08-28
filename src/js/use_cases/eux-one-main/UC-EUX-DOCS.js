import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';
import { vu, scenario, exec, test } from 'k6/execution';


export const getDocsListPolicyAPIDuration = new Trend('Get Docs List API Duration');

export function getDocsList(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];

  let response;

  group("Use Case: Get Docs", function () {

    group("Get Docs List", function () {
      response = GUIAggregator.getDocuments(jSessionId);
      getDocsListPolicyAPIDuration.add(response.timings.duration);
    });

    group("Verify that GAS Light Service User Guide Doc is listed", function () {
      check(response, {
        "has GAS Light Service User Guide Doc": (r) => r.json(`#(name="1/1553-APR201088/2")`),
      });
    });

    group("Verify that Help Aggr. Service User Guide Doc is listed", function () {
      check(response, {
        "has Help Aggregator Service User Guide Doc": (r) => r.json(`#(name="1/1553-APR201577/1")`)
      });
    });
  });
}