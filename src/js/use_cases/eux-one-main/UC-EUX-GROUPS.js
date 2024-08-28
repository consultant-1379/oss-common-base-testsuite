import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';
import { vu, scenario, exec, test } from 'k6/execution';

export const getGroupsListPolicyAPIDuration = new Trend('Get Groups List API Duration');

export function getGroupsList(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];

  let response;

  group("Use Case: Get Groups", function () {
    response = GUIAggregator.getGroups(jSessionId);
    getGroupsListPolicyAPIDuration.add(response.timings.duration);
  });
}