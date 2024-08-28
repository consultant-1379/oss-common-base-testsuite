import { group, check } from 'k6';
import { User } from '../../modules/User.js';
import { AlarmManagement } from '../../modules/AlarmManagement.js';
import * as Constants from '../../modules/Constants.js';
import exec from 'k6/x/exec';

function checkSeverity(severityList) {
  severityList.forEach(function(severity) {
    if ((severity != "Warning") && (severity != "Minor") &&
        (severity != "Major") && (severity != "Critical")) {
      return false;
    }
  });
  return true;
}

function checkFaultyResource(faultyList) {
  faultyList.forEach(function(faulty) {
    var count = (faulty.match(/name=/g) || []).length;
    if (count < 2) {
      return false;
    }
  });
  return true;
}

let payload = JSON.stringify({
  "sources":[
     {
        "sourceModel":{
           "_id":"builtin:alarm_list",
           "major":"true",
           "minor":"true",
           "warning":"true",
           "critical":"true",
           "sourceType":"alarmHandlerList"
        },
        "options":{
           "timeRange":{
              "start":86400000
           },
           "pagination":{
              "currentPage":1,
              "numEntries":20,
              "sortMode":"asc",
              "filter":"",
              "filterLabel":""
           },
           "fileName":"Active_alarm_list"
        }
     }
  ],
  "tarballName":"Active_alarms"
});

function filterBasePlatformAlarms(alarmList, validAlarms) {
  var validAlarmNum = 0;
  for (let j=0; j< validAlarms.length; j++) {
    var foundNum = 0;
    for (let i = 0; i < alarmList.length; i++) {
      if (checkBasePlatformAlarm(alarmList[i], validAlarms[j])) {
        foundNum++;
        if (foundNum == validAlarms[j].expected){
          validAlarmNum += foundNum;
          break;
        }
      }
    }
  }
  console.log("Valid alarm found " + validAlarmNum)
  return validAlarmNum;
}
  
function checkBasePlatformAlarm(receivedAlarm,expectedBaseAlarm) {
  var condition = (receivedAlarm.includes(expectedBaseAlarm.serviceName));
  if (expectedBaseAlarm.alarmName != "null") {
    condition = (condition && receivedAlarm.includes(expectedBaseAlarm.alarmName));
  }
  return condition;
}

export function getAlarms(kubeconfig, namespace, validAlarms) {

  let gasUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  group("Log in as admin user", function () {
    jSessionId = gasUser.login();
  });

  group("Use Case: Get Alarms", function () {
    let res = AlarmManagement.getAlarms(jSessionId, payload);

    let body = res.body.split("\n");

    let pgs = exec.command("/bin/sh" , ["/tests/printPGs.sh", kubeconfig, namespace]);
    console.log ("Postgres DB = " + pgs);

    let severityList = [];
    let faultyResourceList = [];
    for (let i = 1; i < body.length; i++) {
      let rowArray = body[i].split("\",\"");

      severityList.push(rowArray[6]);
      faultyResourceList.push(rowArray[3]);
      console.log(`Alarm ${i}: ${rowArray}`);
    };

    var severityOk = checkSeverity(severityList);
    var faultyResourceOk = checkFaultyResource(faultyResourceList);

    let validAlarmNum = filterBasePlatformAlarms(body, validAlarms);
    console.log("Num of valid alarms:  = " + validAlarmNum);

    check(validAlarmNum, {
      ["The number of alarms should be " + parseInt(Constants.NUM_BASE_ALARMS)]: (validAlarmNum) => validAlarmNum === parseInt(Constants.NUM_BASE_ALARMS)
    });

    check(severityOk, {
      ["Check on severity should return true"]: (severityOk) => severityOk === true
    });

    check(faultyResourceOk, {
      ["Check on faulty resource should return true"]: (faultyResourceOk) => faultyResourceOk === true
    });
  });

  group("Logout as admin user", function () {
    gasUser.logout(jSessionId);
  });
}


