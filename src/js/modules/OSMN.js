import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}

export class OSMN {

  static getMinIOTokenSecret(access_token) {
    let params = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": "*/*",
      },
    };

    let url = Constants.BDR_URL;
    let formData = {
        "WebIdentityToken": access_token,
        "Action": "AssumeRoleWithWebIdentity",
        "Version": "2011-06-15",
        "DurationSeconds": "5000"
    };
    let res = http.post(url, formData, params);
    check(res, {
      "Get BDR token status should be 200": (r) => r.status === 200
    });
    console.log("Get BDR token result: " + res.status);
    console.log("MinIO Token XML === ", res.body);

    return  res.body;
  };

  static createBucket(bucketName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
    };

    let resTest = http.post("http://localhost:8000/createBucket/"+bucketName, JSON.stringify(body), paramsTest);
    console.log("################################## /createBucket response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Create Bucket": (r) => r.status === 200
    });
    console.log("Create Bucket result: " + resTest.status);
    return  resTest;
  }

  static listBuckets(body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
    };

    let resTest = http.post("http://localhost:8000/listBuckets/", JSON.stringify(body), paramsTest);
    console.log("################################## /listBuckets response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "List Buckets": (r) => r.status === 200
    });
    console.log("List Buckets result: " + resTest.status);
    return  resTest;
  }

  static listObjectInBucket(bucketName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
    };

    let resTest = http.post("http://localhost:8000/listObjects/"+bucketName, JSON.stringify(body), paramsTest);
    console.log("################################## /listObjects response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "List Objects in Bucket": (r) => r.status === 200
    });
    console.log("List Objects in Bucket result: " + resTest.status);
    return  resTest;
  }

  static uploadObjectInBucket(bucketName, objectName, fileName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
      "timeout": "240s"
    };

    let resTest = http.post("http://localhost:8000/uploadObject/"+bucketName+"/"+objectName+"/"+fileName, JSON.stringify(body),  paramsTest);
    console.log("################################## /uploadObject response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Upload Object in Bucket": (r) => r.status === 200
    });
    console.log("Upload Object in Bucket result: " + resTest.status);
    return  resTest;
  }

  static downloadObjectInBucket(bucketName, objectName, fileName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
      "timeout": "240s"
    };

    let resTest = http.post("http://localhost:8000/downloadObject/"+bucketName+"/"+objectName+"/"+fileName, JSON.stringify(body), paramsTest);
    console.log("################################## /downloadObject response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Download Object in Bucket": (r) => r.status === 200
    });
    console.log("Download Object in Bucket result: " + resTest.status);
    return  resTest;
  }

  static removeObjectInBucket(bucketName, objectName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
      "timeout": "240s"
    };

    let resTest = http.post("http://localhost:8000/removeObject/"+bucketName+"/"+objectName, JSON.stringify(body), paramsTest);
    console.log("################################## /removeObject response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Remove Object in Bucket": (r) => r.status === 200
    });
    console.log("Remove Object in Bucket result: " + resTest.status);
    return  resTest;
  }

  static removeAllObjectsInBucket(bucketName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
      "timeout": "240s"
    };

    let resTest = http.post("http://localhost:8000/removeObjects/"+bucketName, JSON.stringify(body), paramsTest);
    console.log("################################## /removeObjects response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Remove All Objects in Bucket": (r) => r.status === 200
    });
    console.log("Remove All Objects in Bucket result: " + resTest.status);
    return  resTest;
  }

  static deleteBucket(bucketName, body) {
    let paramsTest = {
      headers: {
        'Content-Type': 'application/json',
        "Accept": "*/*"
      },
    };

    let resTest = http.post("http://localhost:8000/deleteBucket/"+bucketName, JSON.stringify(body), paramsTest);
    console.log("################################## /deleteBucket response body: " + JSON.stringify(resTest.body));
    check(resTest, {
      "Delete Bucket": (r) => r.status === 200
    });
    console.log("Delete Bucket result: " + resTest.status);
    return  resTest;
  }
}
