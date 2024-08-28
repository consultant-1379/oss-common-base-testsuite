#!/bin/bash

KUBECONFIG=$2
NAMESPACE=$3

defaultValue=`kubectl --kubeconfig ${KUBECONFIG} get rs  -n  ${NAMESPACE} | grep "eric-sec-certm" | awk {'print $2'}`

if [ $1 == "UP" ]
  then
    res=`kubectl --kubeconfig ${KUBECONFIG} patch deployment eric-sec-certm --type='json' -p='[{"op": "replace", "path": "/spec/replicas", "value":1}]' -n ${NAMESPACE}`
  else  
    res=`kubectl --kubeconfig ${KUBECONFIG} patch deployment eric-sec-certm --type='json' -p='[{"op": "replace", "path": "/spec/replicas", "value":0}]' -n ${NAMESPACE}`	  
fi

echo "$defaultValue"
