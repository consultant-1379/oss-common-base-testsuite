import { htmlReport } from "../modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

//Test Cases
import { setupEnv, getUsersWithJSessionEnv, getUsersWithClientSecretEnv, 
    getAppsWithJSessionEnv, getAppsWithClientSecretEnv, 
    getRolesWithJSessionEnv, getRolesWithClientSecretEnv, 
    getComponentsWithJSessionEnv, getComponentsWithClientSecretEnv, 
    getGroupsWithJSessionEnv, getGroupsWithClientSecretEnv, 
    getTenantsWithJSessionEnv, getTenantsWithClientSecretEnv,
    getSatusOverviewAppWithJSessionEnv, getStatusOverviewAppWithClientSecretEnv,
    getBROStatusWithJSessionEnv, getBROStatusWithClientSecretEnv,
    createDynamicRoutesWithJSessionEnv, createDynamicRoutesWithClientSecretEnv,
    updateDynamicRoutesWithJSessionEnv, updateDynamicRoutesWithClientSecretEnv,
    deleteDynamicRoutesWithJSessionEnv, deleteDynamicRoutesWithClientSecretEnv,
    teardownEnv } from './use_cases/userManagement/UC-UM-12.js'

export function setup() {
    return setupEnv();
}

export function teardown(data) {
    teardownEnv(data);
}

export function getUsersWithJSession(data) {
    getUsersWithJSessionEnv(data);  
}

export function getUsersWithClientSecret(data) {
    getUsersWithClientSecretEnv(data);  
}

export function getAppsWithJSession(data) {
    getAppsWithJSessionEnv(data);  
}

export function getAppsWithClientSecret(data) {
    getAppsWithClientSecretEnv(data);  
}

export function getRolesWithJSession(data) {
    getRolesWithJSessionEnv(data);  
}

export function getRolesWithClientSecret(data) {
    getRolesWithClientSecretEnv(data);  
}

export function getComponentsWithJSession(data) {
    getComponentsWithJSessionEnv(data);  
}

export function getComponentsWithClientSecret(data) {
    getComponentsWithClientSecretEnv(data);  
}

export function getGroupsWithJSession(data) {
    getGroupsWithJSessionEnv(data);  
}

export function getGroupsWithClientSecret(data) {
    getGroupsWithClientSecretEnv(data);  
}

export function getTenantsWithJSession(data) {
    getTenantsWithJSessionEnv(data);  
}

export function getTenantsWithClientSecret(data) {
    getTenantsWithClientSecretEnv(data) ;  
}

export function getStatusOverviewAppWithJSession(data) {
    getSatusOverviewAppWithJSessionEnv(data);  
}

export function getStatusOverviewAppWithClientSecret(data) {
    getStatusOverviewAppWithClientSecretEnv(data) ;  
}

export function getBROStatusWithJSession(data) {
    getBROStatusWithJSessionEnv(data);  
}

export function getBROStatusWithClientSecret(data) {
    getBROStatusWithClientSecretEnv(data);  
}

export function createDynamicRoutesWithJSession(data) {
    createDynamicRoutesWithJSessionEnv(data);  
}

export function createDynamicRoutesWithClientSecret(data) {
    createDynamicRoutesWithClientSecretEnv(data);  
}

export function updateDynamicRoutesWithJSession(data) {
    updateDynamicRoutesWithJSessionEnv(data);  
}

export function updateDynamicRoutesWithClientSecret(data) {
    updateDynamicRoutesWithClientSecretEnv(data);  
}

export function deleteDynamicRoutesWithJSession(data) {
    deleteDynamicRoutesWithJSessionEnv(data);  
}

export function deleteDynamicRoutesWithClientSecret(data) {
    deleteDynamicRoutesWithClientSecretEnv(data);  
}

export function handleSummary(data) {
    return {
        './reports/result_UC-UM-12.html' : htmlReport(data),
        './reports/result_UC-UM-12.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    }
}