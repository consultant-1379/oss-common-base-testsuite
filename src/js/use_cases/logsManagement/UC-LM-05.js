import http from 'k6/http';
import { group } from 'k6';
import { User } from '../../modules/User.js';
import { LogViewer } from '../../modules/LogViewer.js';
import * as Constants from '../../modules/Constants.js';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { vu, scenario, exec, test } from 'k6/execution';
import { create_user } from '../../modules/Utils.js';

export const exportAllClusterMetricsDuration = new Trend('Export all cluster statistics API duration');
export const exportTotalCpuDuration = new Trend('Export Total CPU API duration');
export const exportTotalFdsDuration = new Trend('Export Total FDS API duration');
export const exportTotalRssDuration = new Trend('Export Total RSS Memory API duration');
export const exportTotalVirutalMemoryDuration = new Trend('Export Total Virutal Memory duration');
export const exportPodStatusDuration= new Trend('Export Pod Status API duration');
export const downloadSpeedOfMetrics =  new Trend('Speed(mb/sec) for downloading the metrics');

let config = JSON.parse(open('../../../resources/data/cluster_statistics.json'));
let payload = JSON.stringify(config);

let cpuSourceObject = JSON.stringify({"sources":[config.sources[0]]});
let fdsSourceObject = JSON.stringify({"sources":[config.sources[1]]});
let RssSourceObject = JSON.stringify({"sources":[config.sources[2]]});
let virtualSourceObject = JSON.stringify({"sources":[config.sources[3]]});
let podSourceObject = JSON.stringify({"sources":[config.sources[4]]});

//NEEDED TO GET VALUE OF VUS IN OPTIONS FILE
function generateOptions(){
  let f = JSON.parse(open('../../../resources/config/LogsManagement/UC-LM-05.options.json'));
  return new Array(f);
}

const sharedOptionsFile = new SharedArray('sharedOptionsFile', generateOptions);
const VUS = sharedOptionsFile[0].scenarios.concurrent_cluster_metrics.vus;

const currentDate = new Date().getTime();
//NAME OF CONCURRENT USERS PERFORMING USE CASES
const CONCURRENT_USERS_NAME = "concurrent_user_" + currentDate + "_";

function getNewUser(name){
  let user = { "username": name, "password": "Newericsson123!" , "tenantname":  "master", "base_url":  Constants.GAS_URL};
  return user;
}

let jSessionIdArray = [];
let dataArray = [];

export function setupEnv() {

  let soUser = new User(Constants.GAS_USER,
                      Constants.GAS_USER_PWD,
                      Constants.TENANT_NAME,
                      Constants.GAS_URL);
  let jSessionId;


  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  //Concurrent users performing operations in Use Cases
  //CREATE AND LOGIN CUNCURRENT USERS
  group("Create concurrent users with OSSPortalAdmin role", function () {
    //Concurrent users performing operations in Use Cases
    for (let i = 0; i < VUS; ++i){
      let user = getNewUser(CONCURRENT_USERS_NAME+i);
      let newUser = create_user(user);
      newUser.create(jSessionId);

      //LOGIN of concurrent users
      jSessionIdArray[i] = newUser.login();
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });

  dataArray[0] = jSessionIdArray;
  dataArray[1] = CONCURRENT_USERS_NAME;

  return dataArray;
}

export function teardownEnv(data) {

 // console.log("TEARDOWN - JSESSION ARRAY: " + JSON.stringify(data));
  let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
  let jSessionId;

  group("Log in as admin user", function () {
    jSessionId = soUser.login();
  });

  group("Delete new users with OSSPortalAdmin role", function () {
    for (let i = 0; i < VUS; ++i) {
      let user = getNewUser(data[1]+i);
      let newUser = create_user(user);
      newUser.delete(jSessionId);
    }
  });

  group("Logout as admin user", function () {
    soUser.logout(jSessionId);
  });
}

export function clusterMetricsEnv(data) {

   //From 1 to VUS
  let iter = scenario.iterationInTest;
  //Session of active concurrent users that are VUS
  let jSessionId = data[0][iter];
  let user = getNewUser(data[1]+iter);
  let newUser = create_user(user);

  let response;
  let size;
  let time;

    group("UseCase-1: Download all cluster statistics", function () {

   // Download all cluster metrics
    group("Download all cluster statistics", function () {
      response = LogViewer.downloadMetrics(jSessionId,payload);
      //console.log("All clusters Statistics: " + JSON.stringify(response.body));
      size=response.headers['Content-Length'];
    });

    group("Export all cluster metrics duration",function(){
        time=exportAllClusterMetricsDuration.add(response.timings.duration);
    });

    group("Download in mb/sec",function(){
      let speed= size*0.001/time;
      console.log(speed);
      downloadSpeedOfMetrics.add(speed);
    });
  });

  group("Usecase2: Download cluster metrics",function(){

   // Download cluster metrics
    group("Download Total CPU", function () {
      response = LogViewer.downloadMetrics(jSessionId,cpuSourceObject);
      //console.log("Download Total CPU: " + JSON.stringify(response.body));
    });

    group("Export Total CPU duration",function(){
        exportTotalCpuDuration.add(response.timings.duration);
    });

    group("Download Total File Descriptors", function () {
      response = LogViewer.downloadMetrics(jSessionId,fdsSourceObject);
    });

    group("Export Total File Descriptors duration",function(){
        exportTotalFdsDuration.add(response.timings.duration);
    });

    group("Download Total RSS memory", function () {
      response = LogViewer.downloadMetrics(jSessionId,RssSourceObject);
    });

    group("Export Total RSS memory duration",function(){
        exportTotalRssDuration.add(response.timings.duration);
    });

    group("Download Total Virtual memory", function () {
      response = LogViewer.downloadMetrics(jSessionId,virtualSourceObject);
    });

    group("Export Total Virtual memory duration",function(){
        exportTotalVirutalMemoryDuration.add(response.timings.duration);
    });
  });

  group("Usecase-3: Download Pod Status",function(){

   // Download Pod Status
    group("Download Pod Status", function () {
      response = LogViewer.downloadMetrics(jSessionId,podSourceObject);
    });

    group("Export Pod Status duration",function(){
        exportPodStatusDuration.add(response.timings.duration);
    });
  });
}
