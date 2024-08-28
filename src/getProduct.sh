#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2

kctl="kubectl --kubeconfig=$KUBECONFIG";

res=`${kctl} get configmap -n ${NAMESPACE} eric-installed-applications -o yaml | yq '.data.Installed' | yq '.helmfile.name'`

if [ "$res" == "eric-eiae-helmfile" ]; then
  echo "EIC"
else
  echo "EO" 
fi
