import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';

export const getGroupsListPolicyAPIDuration = new Trend('Get Groups List API Duration');

export function getGroupsList(data) {

  let jSessionId = data[0];

  group("Check Groups", function () {
    let response;

    group("Get Groups List", function () {
      response = GUIAggregator.getGroups(jSessionId);
      getGroupsListPolicyAPIDuration.add(response.timings.duration);
    });
  });
}
