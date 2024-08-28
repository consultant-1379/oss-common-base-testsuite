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
cmd="$k6Command -c ../resources/config/default.options.json ./UC-AM-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-AM-02.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
### ALARMS TEST END #####

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

cmd="$k6Command -c ../resources/config/default.options.json ./UC-BRO-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/passwordPolicy/UC-PP-01.options.json ./UC-PP-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/passwordPolicy/UC-PP-02.options.json ./UC-PP-02.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

######### EUX TEST START #########
cmd="$k6Command -c ../resources/config/exposureUX/UC-EUX-ALL-OPTIONS.json ./UC-EUX-ALL-MAIN.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/exposureUX/UC-EUX-CHARACT-OPTIONS.json ./UC-EUX-CHARACT-MAIN.js &"
eval "${cmd}"
wait_pid
check_exit_code

# ## EUX Tests Using 1 Main file and 1 Options file ##
# cmd="$k6Command -c ./use_cases/eux-one-main/UC-EUX-01.options.json ./use_cases/eux-one-main/UC-EUX-01.main.js &"
# eval "${cmd}"
# wait_pid
# check_exit_code
######### EUX TEST END #########

cmd="$k6Command -c ../resources/config/default.options.json ./UC-RBAC-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/userManagement/UC-UM-03.options.json ./UC-UM-03.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/userManagement/UC-UM-06.options.json ./UC-UM-06.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-09.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-10.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/userManagement/UC-UM-11.options.json ./UC-UM-11_1.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/userManagement/UC-UM-12.options.json ./UC-UM-12.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-13.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-14.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-UM-15.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-03.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-04.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/LogsManagement/UC-LM-05.options.json ./UC-LM-05.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/LogsManagement/UC-LM-06.options.json ./UC-LM-06.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-08.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-09.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-LM-10.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

### DASHBOARD TEST START ###
cmd="$k6Command -c ../resources/config/dashboardManagement/UC-DM-01.options.json ./UC-DM-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

kube=../../tests/config
/bin/sh setNewDashboard.sh "UP" $kube $NAMESPACE
sleep 60
cmd="$k6Command -e DASHBOARDID="TEST:dashboard" -c ../resources/config/dashboardManagement/UC-DM-01.options.json ./UC-DM-02.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
/bin/sh setNewDashboard.sh "DOWN" $kube $NAMESPACE
### DASHBOARD TEST END ###

# ### OSMN TEST START #####
#cmd="$k6Command -c ../resources/config/default.options.json ./UC-OSMN-01.main.js &"
#eval "${cmd}"
#wait_pid
# check_exit_code

# cmd="$k6Command -c ../resources/config/osmn/UC-OSMN-02.options.json ./UC-OSMN-02.main.js &"
# eval "${cmd}"
# wait_pid
# check_exit_code
# ### OSMN TEST STOP #####

### CERTM TEST START #####
kube=../../tests/config
cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-03.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-04.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-05.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

defaultReplicas=$(/bin/sh setCertMReplicas.sh "DOWN" $kube $NAMESPACE)
sleep 2
cmd="$k6Command -c ../resources/config/default.options.json ./UC-CERTM-02.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
/bin/sh setCertMReplicas.sh "UP" $kube $NAMESPACE
### CERTM TEST END ####

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
cmd="$k6Command -c ../resources/config/default.options.json ./UC-KMS-01.main.js &"
eval "${cmd}"
wait_pid
check_exit_code
### KMS TEST END #####

##### EXTERNAL LDAP TEST START #####
path=../resources/ext_ldap/
kube=../../tests/config

cd $path
chmod +x setLDAPServer.sh
chmod +x removeUserFromLDAPServer.sh
ipAddress=$(/bin/sh setLDAPServer.sh "UP" $kube $NAMESPACE)
echo $ipAddress
cd /tests
if [ "$ipAddress" != "-1" ];
  then
    cmd="$k6Command -c ../resources/config/userManagement/UC-LDAP.default.options.json ./UC-LDAP-01.main.js &"
    eval "${cmd}"
    wait_pid
    #check_exit_code
    cd $path
    /bin/sh removeUserFromLDAPServer.sh $kube $NAMESPACE
    cd /tests
    cmd="$k6Command -c ../resources/config/userManagement/UC-LDAP.default.options.json ./UC-LDAP-02.main.js &"
    eval "${cmd}"
    wait_pid
    #check_exit_code
  else
    COUNT=$((COUNT+1))
fi
cd $path
/bin/sh setLDAPServer.sh "DOWN" $kube $NAMESPACE
cd /tests
##### EXTERNAL LDAP TEST END #####

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
