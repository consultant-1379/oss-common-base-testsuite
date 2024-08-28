#!/bin/bash

OP=$1
KUBECONFIG=$2
NAMESPACE=$3

kctl="kubectl --kubeconfig=$KUBECONFIG --namespace ${NAMESPACE}"


function set_dashboard() {
  ${kctl} create cm dashboardtest --from-file ../resources/data/dashboard_test.json 
  ${kctl} label configmap/dashboardtest ericsson.com/cnom-server-dashboard-models="true" 
}

function remove_dashboard() {
  ${kctl} delete configmap/dashboardtest
}

if [ "$OP" = "UP" ];
then
  set_dashboard
else
  remove_dashboard
fi
