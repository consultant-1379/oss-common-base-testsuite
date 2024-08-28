#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2

kctl="kubectl --kubeconfig=$KUBECONFIG -n ${NAMESPACE}";
NumDB=`${kctl} get statefulset -o yaml | grep -c "currentPGVersion"`

echo $NumDB | tr -d '\n'