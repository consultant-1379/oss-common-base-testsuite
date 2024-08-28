import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, createBucketEnv, uploadObjectInBucketEnv,
 listObjectsInBucketEnv, downloadObjectsFromBucketEnv,
 removeAllObjectsInBucketEnv,  deleteBucketEnv, teardownEnv} from './use_cases/osmn/UC-OSMN-02.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function uploadObjectInBucket(data) {
    uploadObjectInBucketEnv(data);
}

export function listObjectsInBucket(data) {
    listObjectsInBucketEnv(data);
}

export function downloadObjectsFromBucket(data) {
    downloadObjectsFromBucketEnv(data);
}

export function removeAllObjectsInBucket(data) {
    removeAllObjectsInBucketEnv(data);
}

export function handleSummary(data) {
    return {
        './reports/result_UC-UC-OSMN-02.html' : htmlReport(data),
        './reports/result_UC-UC-OSMN-02.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
 }
}