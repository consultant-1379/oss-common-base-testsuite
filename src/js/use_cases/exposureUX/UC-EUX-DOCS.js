import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';

export const getDocsListPolicyAPIDuration = new Trend('Get Docs List API Duration');

export function getDocsList(data) {

  let jSessionId = data[0];

  group("Check Documents", function () {
    let response;

    group("Get Docs List", function () {
      response = GUIAggregator.getDocuments(jSessionId);
      getDocsListPolicyAPIDuration.add(response.timings.duration);
    });

    group("UC: Verify that GAS Light Service User Guide Doc is listed", function () {
      check(response, {
        "has GAS Light Service User Guide Doc": (r) => r.json(`#(name="1/1553-APR201088/2")`),
      });
    });

    group("UC: Verify that Help Aggr. Service User Guide Doc is listed", function () {
      check(response, {
        "has Help Aggregator Service User Guide Doc": (r) => r.json(`#(name="1/1553-APR201577/1")`)
      });
    });
  });
}
