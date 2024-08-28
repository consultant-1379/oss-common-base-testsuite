 #!/bin/bash

NEWVALUE=$1 
KUBECONFIG=$2
NAMESPACE=$3

kubectl --kubeconfig ${KUBECONFIG} get configmap eric-dst-collector-remote-sampling -n ${NAMESPACE}  -o yaml >> eric-dst-collector-remote-sampling 

oldValue=$(cat eric-dst-collector-remote-sampling | sed 's/"param"/\n"param"/g' | grep '"param"' | awk -F':' '{print $2}' | xargs echo -n)

sed -i "s/\"param\":.*/\"param\": $NEWVALUE/g" eric-dst-collector-remote-sampling 

kubectl --kubeconfig ${KUBECONFIG} -n ${NAMESPACE} apply -f eric-dst-collector-remote-sampling >/dev/null 2>&1 

rm -f eric-dst-collector-remote-sampling 

#echo "$oldValue"

echo "$oldValue" | awk -F' ' '{print $1}'
