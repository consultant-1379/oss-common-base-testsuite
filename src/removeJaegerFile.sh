#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2

kctl="kubectl --kubeconfig=$KUBECONFIG";

#SE_POD=$(${kctl} --namespace ${NAMESPACE} get pod -l  "app=eric-data-search-engine,role in (ingest-tls,ingest)" -o jsonpath="{.items[0].metadata.name}")
SE_POD=`${kctl} --namespace ${NAMESPACE} get pod -l  "app=eric-data-search-engine,role in (ingest-tls,ingest)" -o jsonpath="{.items[0].metadata.name}"`

echo "POD = $SE_POD"

esRest="$kctl -n ${NAMESPACE} exec -c ingest $SE_POD -- /bin/esRest"

res=`$esRest GET /_cat/indices?v | grep "jaeger-*"`

if [ "$res" != "" ]; then
  res=`$esRest DELETE /jaeger-span-*` >/dev/null 2>&1
fi

echo $res

