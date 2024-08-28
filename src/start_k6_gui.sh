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


cmd="K6_BROWSER_ENABLED=true $k6Command -c ../resources/config/default.options.json ./UC-GUI-01.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

cmd="K6_BROWSER_ENABLED=true $k6Command -c ../resources/config/default.options.json ./UC-GUI-02.main.js &"
eval "${cmd}"
wait_pid
#check_exit_code

#cmd="K6_BROWSER_ENABLED=true $k6Command -c ../resources/config/default.options.json ./UC-GUI-03.main.js &"
#eval "${cmd}"
#wait_pid
#check_exit_code

#Put errors file in reports folder in order to identify tests failures
echo $COUNT > /tests/reports/errors_gui.txt
