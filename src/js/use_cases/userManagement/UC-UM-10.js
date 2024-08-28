import { group } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { ClientID } from '../../modules/ClientId.js';

let config = JSON.parse(open('../../../resources/data/creating_rapp_client.json'));
let configMapper = JSON.parse(open('../../../resources/data/creating_client_mapper.json'));

function getClientId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

export function manageRappClient() {

    let soUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);
    let jSessionId;
    let token;
    let mapper_name;
    let idList;

    let clientId = Constants.CLIENT_ID+ "_" + new Date().getTime();
    let clientMapper = Constants.CLIENT_MAPPER + "_" + new Date().getTime();

    group("USECASE-1: Creating a client",function(){

        //Login
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //step-2 Getting access-token in keycloak
        group("Get access-token from Keycloak", function () {
            token = soUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

        group("Creating a rapp client",function(){
            config['clientId'] = clientId;
            let response = ClientID.createRappClient(jSessionId,token,config);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-2: View all the clients",function() {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("View all the clients",function(){
            let response = ClientID.getRappClientId(jSessionId,token);
        });

        group("Get existing id of client",function(){
            let response = ClientID.getRappClientId(jSessionId,token);
            let body = JSON.parse(response.body);
            idList = getClientId(body,"clientId",clientId);
            console.log("id: "+ idList);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-3: Change client secret",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Change client secret",function(){
            let response = ClientID.regenerateClientSecret(jSessionId,token,clientId);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-4: Update realm level role mappings to the service account user",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Update the realm level roles",function(){
            let response = ClientID.updateServiceRoles(jSessionId,token,clientId);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-5: View assigned role mappings to the service account",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //Only the external roles will be fetched
        group("View assigned roles",function(){
            ClientID.getServiceRoles(jSessionId,token,clientId);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-6:Create claim of client mapper",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Creating a client mapper",function(){
            configMapper["name"] = clientMapper;
            let response = ClientID.createClientMapper(jSessionId,token,configMapper,clientId);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-7: Get protocol mappers of a client",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("View protocol mapper of a client",function(){
            let response = ClientID.getAllProtocolMappers(jSessionId,token,clientId);
        });

        group("Get name of protocol mapper of a client",function(){
            let r = ClientID.getAllProtocolMappers(jSessionId,token,clientId);
            mapper_name = r.json(`#.name`);/**Fetching the mapper name from array of json */
            console.log("mapper id: "+ mapper_name);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-8: Get Protocol mappers by name",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Get protocol mappers by name",function(){
            let response = ClientID.getProtocolMapperByName(jSessionId,token,clientId,mapper_name);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-9: Update claim of client mapper",function() {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Update the claim of client mapper",function() {
            ClientID.updateProtocolMapper(jSessionId,token,clientId,mapper_name);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-10: Delete claim of client mapper",function() {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Delete claim of client mapper",function() {
            ClientID.deleteProtocolMapper(jSessionId,token,clientId,mapper_name);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-11: Enable/disable client for a tenant/realm",function() {

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Enable client status",function(){
            let status = "ENABLED";
            ClientID.toggleClient(jSessionId,token,clientId,status);
        });

        group("Disable client status",function(){
            let status = "DISABLED";
            ClientID.toggleClient(jSessionId,token,clientId,status);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("USECASE-12: Negative case: Enable.Disble client with wront client id",function(){

        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        group("Enable/Disable client with wrong client id",function(){
            let status = "ENABLED";
            ClientID.toggleClient(jSessionId,token,clientId="clientnew",status,404);
        });

        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });

    group("Usecase-13: Deleting the Client", function() {

        //Login
        group("Log in as admin user", function () {
            jSessionId = soUser.login();
        });

        //Delete the client
        group("Delete the client", function () {
            ClientID.deleteClient(token,clientId,idList);
        });

        //Logout
        group("Logout as admin user", function () {
            soUser.logout(jSessionId);
        });
    });
}