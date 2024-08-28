import { group } from 'k6';
import { User } from '../../modules/User.js';
import * as Constants from '../../modules/Constants.js';
import { OSMN } from '../../modules/OSMN.js';
import { ClientID } from '../../modules/ClientId.js';
import { parseHTML } from "k6/html";

function getClientId(array, key, value){
    for (let i = 0; i < array.length; ++i){
        if(array[i][key] === value){
            return array[i].id;
        }
    }
}

export function osmnTest() {

  let jSessionId;
  let token;
  let idList;
  const currentDate = new Date().getTime();
  const bucketName = "bucket-func-" + currentDate;
  const objectName = Constants.BDR_FILE_NAME;
  let bdr_host = Constants.BDR_HOST;
  let accessToken;
  let refreshToken;
  let MinIOtoken;
  let accesskey;
  let secretkey;
  let sessiontoken;
  let client_id = Constants.BDR_CLIENT;
  let secret;

  let gasUser = new User(Constants.GAS_USER,
                        Constants.GAS_USER_PWD,
                        Constants.TENANT_NAME,
                        Constants.GAS_URL);

   group("Use Case: Get accsskey, secretkey and session token from MinIo", function() {

        //Login
        group("Log in as admin user", function () {
            jSessionId = gasUser.login();
        });

        //Get access token
        group("Get access-token from Keycloak", function () {
            token = gasUser.getKeycloackToken(jSessionId).json()['access_token'];
        });

       //first access the id then from client id access the secret*/
        group("Get existing client id bdr-client", function() {
            let response = ClientID.getClientIdList(jSessionId,token,client_id);
            let body= JSON.parse(response.body);
            idList=getClientId(body,"clientId",client_id);
            console.log("id: "+ idList);
         });

        //get the client secret
        group("Get the bdr-client secret", function() {
            secret=ClientID.getClientSecret(jSessionId,token,idList).json()['value'];
            console.log("secret: "+ secret);
        });

        //Request Access Token from Key clock by using client id and client secret
        group("Request Access Token using client id and secret", function() {
            let responseToken = gasUser.getKeyCloackTokenSecret(client_id, secret);
            accessToken = responseToken.json()['access_token'];
            refreshToken = responseToken.json()['refresh_token'];
            console.log("Access Token = " +accessToken);
        });

        //Get MinIO Token and Secret
        group("Get MinIO token using keyclock access token" , function() {
            MinIOtoken = OSMN.getMinIOTokenSecret(accessToken)

            accesskey = parseHTML(MinIOtoken).find('AccessKeyId');
            let element = accesskey.get(0);
            console.log("Access Key: " + element.textContent());
            accesskey = element.textContent();
            secretkey = parseHTML(MinIOtoken).find('SecretAccessKey');
            element = secretkey.get(0);
            console.log("Secret Access Key: " + element.textContent());
            secretkey = element.textContent();

            sessiontoken = parseHTML(MinIOtoken).find('SessionToken');
            element = sessiontoken.get(0);
            console.log("Session Token: " + element.textContent());
            sessiontoken = element.textContent();

        });

        group("Clean Env - Delete old Buckets and Objects", function () {
          let result = [];
          let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
          let response = OSMN.listBuckets(body);
          let size = response.json("buckets.#") || 0;
          result = response.json("buckets");

          console.log("Number of old buckets: " + size);
          console.log("Names of old buckets: " + result);

          for (var i=0; i < size; i++){
            let name = result[i];
            console.log("Removing all objects if exist for old bucket: " + name);
            OSMN.removeAllObjectsInBucket(name, body);
            console.log("Deleting old bucket: " + name);
            OSMN.deleteBucket(name, body)
          }
        });
   });

  group("Use Case: MinIo operations", function () {
    let response;

    group("Create Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.createBucket(bucketName, body)
    });

    group("Upload Objects in Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.uploadObjectInBucket(bucketName, objectName, objectName, body)
    });

    group("List Objects in Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.listObjectInBucket(bucketName, body)
    });

    group("Download Objects in Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.downloadObjectInBucket(bucketName, objectName, objectName, body)
    });

    group("Remove All Objects in Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.removeAllObjectsInBucket(bucketName, body)
    });

/*     group("List Objects in Bucket should be empty ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.listObjectInBucket(bucketName, body)
    }); */

    group("Delete Bucket ", function () {
      let body = {"accesskey": accesskey, "secretkey": secretkey, "sessiontoken": sessiontoken, "bdr_url": bdr_host}
      response = OSMN.deleteBucket(bucketName, body)
    });
  });
}
