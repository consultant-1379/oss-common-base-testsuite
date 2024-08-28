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
#k6 run -c ../resources/config/envSetUp/UC-TENANT-SETUP.options.json ./UC-TENANT-SETUP.main.js &
#wait_pid
#check_exit_code
cmd="$k6Command -c ../resources/config/envSetUp/UC-USERS-SETUP.options.json ./UC-USERS-SETUP.main.js &"
eval "${cmd}"
wait_pid
check_exit_code

#Put errors file in reports folder in order to identify tests failures
echo $COUNT > /tests/reports/errors.txt
