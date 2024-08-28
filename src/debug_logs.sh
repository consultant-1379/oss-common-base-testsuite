#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2

pod=`kubectl --kubeconfig ${KUBECONFIG} -n ${NAMESPACE} get pods | grep "eric-data-search-engine-ingest-*" | awk {'print $1'}`

esRest=`kubectl --kubeconfig ${KUBECONFIG} -n ${NAMESPACE} exec ${pod} -i -t -- /bin/esRest GET /_cluster/health?pretty`


echo "$esRest"
