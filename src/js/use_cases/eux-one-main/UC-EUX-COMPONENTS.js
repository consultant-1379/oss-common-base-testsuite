import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import { GUIAggregator } from '../../modules/GUIAggregator.js';
import { vu, scenario, exec, test } from 'k6/execution';

export const getComponentsListPolicyAPIDuration = new Trend('Get Components List API Duration');

export function getComponentsList(data) {

  //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];

  let response;

  group("Use Case: Get Components", function () {
    response = GUIAggregator.getComponents(jSessionId);
    getComponentsListPolicyAPIDuration.add(response.timings.duration);
  });
}