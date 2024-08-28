#!/bin/bash
OP=$1
KUBECONFIG=$2
NAMESPACE=$3
RAPP=$4
PREFIX=$5
ENTRIES=$6
REPLICAS=$7
PROXY=$8

localport=8075
remoteport=8080
rappStatus=""

kctl="kubectl --kubeconfig=$KUBECONFIG --namespace ${NAMESPACE}";

wait_pid() {
  BACK_PID=$!
  wait $BACK_PID
}

k6Command="k6 run "
if [ "$PROXY" != "NO_PROXY" ];
then
  k6Command="HTTPS_PROXY=$PROXY $k6Command"
fi

function install_rapp() {
	
  res=`helm install adp-catfacts-text-encoder --kubeconfig=$KUBECONFIG -n ${NAMESPACE} ${RAPP} --set global.security.tls.enabled=true`
  wait_pid

  ${kctl} scale --replicas=$REPLICAS deployment eric-ref-catfacts-text-encoder
  wait_pid
  
  ${kctl} rollout status deployment eric-ref-catfacts-text-encoder --timeout=90s
  wait_pid
}

function uninstall_rapp() {

  ${kctl} delete deployment eric-ref-catfacts-text-encoder
  ${kctl} delete service eric-ref-catfacts-text-encoder

  res=`helm delete adp-catfacts-text-encoder --kubeconfig=$KUBECONFIG -n ${NAMESPACE}`
}

function sendLog() {

  podlist=`${kctl} get pods | grep eric-ref-catfacts | awk '{print $1}'`
  for podname in $podlist; do
    ${kctl} port-forward $podname $localport:$remoteport > /dev/null 2>&1 &

    pid=$!

    # kill the port-forward regardless of how this script exits
    trap '{
      # echo killing $pid
      kill $pid
    }' EXIT

    # wait for port to become available
    while ! nc -vz localhost 8075 > /dev/null 2>&1 ; do
      sleep 0.1
    done

    localport=$(($localport + 1))
  done  

  cmd="$k6Command -e PREFIX=$PREFIX -e ENTRIES=$ENTRIES -e REPLICAS=$REPLICAS -c ../resources/config/default.options.json ./UC-LM-13.main.js"
  eval "${cmd}"
}


if [ "$OP" = "UP" ];
then
  install_rapp

  sendLog
else
  uninstall_rapp
fi

