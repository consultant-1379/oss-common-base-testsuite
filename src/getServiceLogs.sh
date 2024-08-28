#!/bin/bash

KUBECONFIG=$1
NAMESPACE=$2
SERVICE_ID=$3

kctl="kubectl --kubeconfig=$KUBECONFIG";

SE_POD=$(${kctl} --namespace ${NAMESPACE} get pod -l  "app=eric-data-search-engine,role in (ingest-tls,ingest)" -o jsonpath="{.items[0].metadata.name}")

esRest="$kctl -n ${NAMESPACE} exec -c ingest $SE_POD -- /bin/esRest"
#$esRest GET /_cat/indices?v

formattedDate=`date -u +"%Y.%m.%d"`
INDEX="oss-logs-$formattedDate"

query="{
         \"query\": {
           \"bool\": {
             \"must\": [
               {
                 \"match\": {
                   \"service_id\": \"$SERVICE_ID\"
                 }
               }
             ]
           }
         }
       }"

res=`$esRest GET /$INDEX/_search?q="new_user_for_test"`

if [ "$res" == "" ]; then
  echo "400"
else
  echo "200" 
fi

