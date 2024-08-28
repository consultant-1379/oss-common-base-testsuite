#!/bin/bash

wait_pid() {
  BACK_PID=$!
  wait $BACK_PID
}

COUNT=0
check_exit_code() {
  if [ $? != 0 ]
    then COUNT=$((COUNT+1))
  fi
}

k6Command="k6 run "
if [ "$PROXY" != "NO_PROXY" ];
then
  k6Command="HTTPS_PROXY=$PROXY $k6Command"
fi

#working dir is tests
kube=../../tests/config

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-01.options.json ./UC-BFP-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-02.options.json ./UC-BFP-02.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-02.options.json ./UC-BFP-03.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP.default.options.json ./UC-BFP-04.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-05.options.json ./UC-BFP-05.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-06.options.json ./UC-BFP-06.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP.default.options.json ./UC-BFP-07.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/bruteforceProtection/UC-BFP-08.options.json ./UC-BFP-08.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/default.options.json ./UC-BRO-01.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/passwordPolicy/UC-PP-01.options.json ./UC-PP-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/passwordPolicy/UC-PP-02.options.json ./UC-PP-02.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-RBAC-02.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/userManagement/UC-UM-03.options.json ./UC-UM-03.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/userManagement/UC-UM-06.options.json ./UC-UM-06.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-09.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-10.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -c ../resources/config/userManagement/UC-UM-11.options.json ./UC-UM-11_1.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/userManagement/UC-UM-12.options.json ./UC-UM-12.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-13.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-14.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-15.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

#defaultReplicas=$(/bin/sh setCertMReplicas.sh "DOWN" $kube $NAMESPACE)
#sleep 2
#cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-02.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code
#/bin/sh setCertMReplicas.sh "UP" $kube $NAMESPACE
### CERTM TEST END ####

### SCRAPE TEST START #####
#cmd="$k6Command -c ../resources/config/default.options.json ./UC-AM-02.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code
### SCRAPE TEST END #####

### LOGGING STACK TEST START #####
kube=../../tests/config
cmd="$k6Command -c ../resources/config/userManagement/UC-UM-07.options.json ./UC-UM-07.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

res=$(/bin/sh getServiceLogs.sh $kube $NAMESPACE "eric-eo-usermgmt")
cmd="$k6Command -e RESCODE=$res -c ../resources/config/userManagement/UC-UM-08.options.json ./UC-UM-08.main.js  &"
eval "${cmd}"
wait_pid
check_exit_code
### LOGGING STACK TEST END #####

### KMS TEST START #####
#cmd="$k6Command -c ../resources/config/default.options.json ./UC-KMS-01.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code
### KMS TEST END #####

##### DDC START #####
kube=../../tests/config
res=$(/bin/sh ../resources/ddc/ddcTest.sh "SETUPTEST" $kube $NAMESPACE)
cmd="$k6Command -e RESULT=$res -c ../resources/config/default.options.json ./UC-DDC-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code
/bin/sh ../resources/ddc/ddcTest.sh "TEARDOWN" $kube $NAMESPACE
##### DDC END #####

####### LOG THROUGHPUT BEGIN ######
#kube=../../tests/config
#timeDate=`date +"%Y%d%m%H%M%S"`
#prefix="pod$timeDate"
#entries=1000
#replicas=5
#/bin/sh setLogginStack.sh "UP" $kube $NAMESPACE "../resources/logging_stack/eric-ref-catfacts-text-encoder-1.33.1-SNAPSHOT.tgz" $prefix $entries $replicas $PROXY
#wait_pid

#sleep 10

#cmd="$k6Command -e PREFIX=$prefix -e ENTRIES=$entries -e REPLICAS=$replicas -c ../resources/config/default.options.json ./UC-LM-14.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#/bin/sh setLogginStack.sh "DOWN" $kube $NAMESPACE "../resources/logging_stack/eric-ref-catfacts-text-encoder-1.33.1-SNAPSHOT.tgz" $prefix
####### LOG THROUGHPUT END ######

### ALARMS TEST START #####
cmd="$k6Command -e KUBECONFIG=$kube -e NAMESPACE=$NAMESPACE -c ../resources/config/default.options.json ./UC-AM-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code
### ALARMS TEST END #####

### CERTM TEST START #####
cmd="$k6Command -c ../resources/config/certManagement/UC-CERTM-06.options.json ./UC-CERTM-06.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
### CERTM TEST END #####

#Put errors file in reports folder in order to identify tests failures
echo $COUNT > /tests/reports/errors.txt
