#!/bin/bash
 
# set -x
 
KUBECONFIG=$1
NAMESPACE=$2
 
kctl="kubectl --kubeconfig=$KUBECONFIG -n ${NAMESPACE}";
pgs=`${kctl} get statefulset -o=jsonpath='{.items[?(@.spec.template.metadata.annotations.ericsson\.com/product-name=="Document Database PG")].metadata.name}'`
echo  "${pgs}"
