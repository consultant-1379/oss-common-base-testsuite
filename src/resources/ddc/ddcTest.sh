#!/bin/bash

OP=$1
KUBECONFIG=$2
NAMESPACE=$3

LOGFILE=/tests/reports/BP_pipeline_failure.txt
user="sftpuser"
collectionJob="testcollectionjob"

hlm="helm --kubeconfig=$KUBECONFIG --namespace ${NAMESPACE}"
kctl="kubectl --kubeconfig=$KUBECONFIG --namespace ${NAMESPACE}"

wait_pid() {
  BACK_PID=$!
  wait $BACK_PID
}

function printPodDebugInfo(){
   if [ -z $3 ] ; then
      echo -e "\n$2" >> ${LOGFILE} 2>&1
      echo -e "\n$1 pod not found" >> ${LOGFILE} 2>&1
   else
      ready=`${kctl} get pod $3 --output="jsonpath={.status.containerStatuses[*].ready}"` >> ${LOGFILE} 2>&1
      troubleshooting=`${kctl} get pods $3` >> ${LOGFILE}  2>&1
      echo -e "\n$2" >> ${LOGFILE} 2>&1
      echo -e "\n$3 pod info: " >> ${LOGFILE} 2>&1
      echo "${troubleshooting}\n" >> ${LOGFILE} 2>&1
      echo -e "ready containers: ${ready}\n" >> ${LOGFILE} 2>&1
   fi
}

function install_server() {
  ${hlm} repo add emberstack https://emberstack.github.io/helm-charts >> ${LOGFILE} 2>&1
  ${hlm} repo update >> ${LOGFILE} 2>&1
  ${hlm} upgrade --install sftp-server emberstack/sftp >> ${LOGFILE} 2>&1
  if [ $? -ne 0 ]
  then
    echo "1"
    exit 1
  fi
}

function configure_server() {  
  podName=`${kctl} get pods | grep sftp | awk {'print $1'}` >> ${LOGFILE} 2>&1

  ${kctl} rollout status deployment sftp-server --timeout=90s >> ${LOGFILE} 2>&1

  printPodDebugInfo  sftp "[configure_server]" ${podName}

  # set correct credentials
  ${kctl} cp /resources/ddc/sftp.json $podName:/app/config -c sftp >> ${LOGFILE} 2>&1
  if [ $? -ne 0 ]
  then
    echo "7"
    exit 1
  fi

  # create network policy to allow traffic to sftp server
  ${kctl} apply -f /resources/ddc/ddcSftpSrvNetPolicy.yaml >> ${LOGFILE} 2>&1
  if [ $? -ne 0 ]
  then
    echo "2"
    exit 1
  fi
}

function triggerDDCCollection() {
  ${kctl} create job --from=cronjob/eric-cncs-oss-config-eric-odca-ddc-cronjob $collectionJob >> ${LOGFILE} 2>&1
  if [ $? -ne 0 ]
  then
    echo "3"
    exit 1
  fi
}

function retrieveDatafromSftpServer() {
  ${kctl} get svc sftp-server >> ${LOGFILE} 2>&1

  ddcpod=`${kctl} get pods | grep odca | awk {'print $1'}` >> ${LOGFILE} 2>&1

  printPodDebugInfo  odca "[retrieveDatafromSftpServer]" ${ddcpod}

  numRetries=1
  while [ $numRetries -le 180 ]
  do
    dump=`${kctl} logs $ddcpod --since=3m | grep "Transfer finished"` >> ${LOGFILE} 2>&1
    if [ "$dump" = "" ];
    then
      numRetries=$(($numRetries + 1))
      sleep 1
    else
      break
    fi
  done

  ${kctl} get svc sftp-server >> ${LOGFILE} 2>&1
  podName=`${kctl} get pods | grep sftp | awk {'print $1'}`

  printPodDebugInfo  sftp "[retrieveDatafromSftpServer]" ${podName}

  fileName=`${kctl}  exec $podName -- ls /home/$user/sftp/upload/` >> ${LOGFILE} 2>&1
  if [ "$fileName" = "" ];
  then
    echo "4"
    exit 1
  fi
  size=`${kctl}  exec $podName -- ls -la /home/$user/sftp/upload/$fileName | awk {'print $5'}` >> ${LOGFILE} 2>&1
  if [ $size -eq 0 ]
  then
    echo "5"
    exit 1
  else
    echo "0"
  fi
}

function uninstall_server() {
  ${kctl} delete job $collectionJob >> ${LOGFILE} 2>&1
  ${hlm} delete sftp-server >> ${LOGFILE} 2>&1
  ${kctl} delete netpol/sftp-server-netpol >> ${LOGFILE} 2>&1
}  

if [ "$OP" = "SETUPTEST" ];
then
  echo -e "Install SFTP server\n" > ${LOGFILE} 2>&1
  install_server
  sleep 4
  configure_server
  triggerDDCCollection
  retrieveDatafromSftpServer
else
  echo -e "\nUninstall SFTP server" >> ${LOGFILE} 2>&1
  uninstall_server
fi


