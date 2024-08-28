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

### ALARMS TEST START #####
#cmd="$k6Command -c ../resources/config/default.options.json ./UC-AM-01.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-AM-02.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
### ALARMS TEST END #####

##### DDC START #####
kube=../../tests/config
res=$(/bin/sh ../resources/ddc/ddcTest.sh "SETUPTEST" $kube $NAMESPACE)
cmd="$k6Command -e RESULT=$res -c ../resources/config/ddc/UC-DDC-01.options.json ./UC-DDC-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
/bin/sh ../resources/ddc/ddcTest.sh "TEARDOWN" $kube $NAMESPACE
##### DDC START #####

####### LOG THROUGHPUT BEGIN ######
kube=../../tests/config
timeDate=`date +"%Y%d%m%H%M%S"`
prefix="pod$timeDate"
entries=1000
replicas=5
/bin/sh setLogginStack.sh "UP" $kube $NAMESPACE "../resources/logging_stack/eric-ref-catfacts-text-encoder-1.33.1-SNAPSHOT.tgz" $prefix $entries $replicas $PROXY
wait_pid

sleep 10

cmd="$k6Command -e PREFIX=$prefix -e ENTRIES=$entries -e REPLICAS=$replicas -c ../resources/config/default.options.json ./UC-LM-14.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

/bin/sh setLogginStack.sh "DOWN" $kube $NAMESPACE "../resources/logging_stack/eric-ref-catfacts-text-encoder-1.33.1-SNAPSHOT.tgz" $prefix
####### LOG THROUGHPUT END ######

##### DST START #####
#res=$(/bin/sh removeJaegerFile.sh $kube $NAMESPACE)
#res=$(/bin/sh setDST.sh "1.0" $kube $NAMESPACE)
#sleep 80
#cmd="$k6Command -e USERNAME="newusername" -c ../resources/config/default.options.json ./UC-UM-16.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -e TRACEON="true" -e SERVICE="eric-eo-usermgmt" -e OPERATION="post__idm_usermgmt_v1_users" -c ../resources/config/default.options.json ./UC-LM-12.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#res=$(/bin/sh setDST.sh "0.0" $kube $NAMESPACE)
#sleep 90
#res=$(/bin/sh removeJaegerFile.sh $kube $NAMESPACE)
#cmd="$k6Command -e USERNAME="newusername" -c ../resources/config/default.options.json ./UC-UM-16.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#cmd="$k6Command -e TRACEON="false" -e SERVICE="eric-eo-usermgmt" -e OPERATION="post__idm_usermgmt_v1_users" -c ../resources/config/default.options.json ./UC-LM-12.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code
##### DST END #####



#Put errors file in reports folder in order to identify tests failures
echo $COUNT > /tests/reports/errors.txt

#cmd="$k6Command -c ../resources/config/userManagement/UC-UM-01.options.json ./UC-UM-01.main.js --out influxdb=http://influxdb:8086/k6 &"
#eval "${cmd}"
#wait_pid
#--out influxdb=http://seroius06634.sero.gic.ericsson.se:8086/k6_report_tool
