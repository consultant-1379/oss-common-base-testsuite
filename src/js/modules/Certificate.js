import http from 'k6/http';
import { check } from 'k6';
import * as Constants from './Constants.js';

export const options = {
  insecureSkipTLSVerify: true,
}


export class Certificate {

  static createAsymmetricKey(jsessionId, URL, keyName) {

    let set_url =  URL + '/certm/nbi/v2/asymmetric-keys-pkcs12-installations';

    let payload = JSON.stringify({
      "name": keyName,
      "certificate-name": "certificate",
      "p12": "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",
      "p12-password": "test"
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.post(set_url, payload, params);

    check(res, {
      ["Create asymmetric key status should be 200 or 201"]: (r) => (r.status === 200) || (r.status === 201)
    });

    console.log(`Create asymmetric key ${keyName} result: ${res.status}`);

    return res;
  }	   

  static removeAsymmetricKey(jsessionId, URL, keyName, resCode = 200) {
    let remove_url = `${URL}/certm/nbi/v2/asymmetric-keys/${keyName}`;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.del(remove_url, null, params);

    check(res, {
      ["Remove asymmetric key status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Remove asymmetric key " + keyName + " result: " + res.status);

    return res;	  
  }

  static create(jsessionId, URL, certificateName = "certificate") {
    let set_url =  URL + '/certm/nbi/v2/trusted-certificates/' + certificateName;
	
    let payload = JSON.stringify({
      "description" : "Trusted certificate for service",
      "certificates" : [{
        "name" : certificateName,
        "certificate" : `-----BEGIN CERTIFICATE-----
MIIENzCCAh8CFCOo4KRj+VhUWqRb9awMsvKSC9GnMA0GCSqGSIb3DQEBCwUAMF0x
CzAJBgNVBAYTAlNFMSUwIwYDVQQKDBxFcmljc3NvbiwgaGFydDE3NC1lcmljLWVp
Yy0xMScwJQYDVQQDDB5oYXJ0MTc0LXgxLmV3cy5naWMuZXJpY3Nzb24uc2UwHhcN
MjMxMjE0MTQwODEwWhcNMzcwODIyMTQwODEwWjBTMQswCQYDVQQGEwJTRTFEMEIG
A1UECgw7RXJpY3Nzb24sIGhhcnQxNzQtZXJpYy1laWMtMS5oYXJ0MTc0LXgxLmV3
cy5naWMuZXJpY3Nzb24uc2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQC2hxgCLiNiUoTWIAZt/DRYVinNRhvhlenCO62AYKCIG6StGj9VwvyAshhYaScW
vcQgvldjBcVKR0uMwaLsT3FboPfW9lQmLch3ZAnKxU0QFALPhECMHUfhKLZ8HPpl
Sj7MOzEopQDmzKFXJZkPcTIJEfIIk0/dHiIAE8AlYzC54p+0bWq+3DxJZ9CG05qU
Xy+NSv6cRIdZaEAmtqndS12B9DTf58GZfB/ajjWvTG2XsX8ytBPKobYBy3kkc3oD
4zFZG1gLfGVGyzAl6VPJOlbwPdD3z3yb9FwWvx/3HYUrtI+UtpBBGLd+OGdBhClT
1/CCm8ekc99iboVpzMS4KXOVAgMBAAEwDQYJKoZIhvcNAQELBQADggIBAIQPok7k
yKZiKbd3m8T5K7jAwBaGuQE9WcWNWa0rLTQmCcEurSv/7GAy+sF3eSa3gKel0rcu
a+A+KX3VIMnWl5qtAQWglu/59tuWAWwzbJlHEQmLYpyfgqHq2jDnJidDnd0JvxmD
4dpP1Nq3eYJIaJc4Ds1sGg+b+PlF5EQWx4zSD9WeMCho0GcIlC2OuP+93f0UGnTn
zNot/LF8ZJhE1d7i+fW8M8dT5c4Y2SMgKeYMu0VZulI3Ecxd+4xdumWvX/8kmHjS
GonQeOPbtJ4Cl9SHk8xw5tcLef7DszOrT3Qk+PbDfvGSgy4dVxzRc8+7SSRUKFcd
GjTXOtcwmjbRQJjWOzpOEniYGxn3PbFwsPXZFb8G4klPswHcmNedJysFR6CpE2vF
/Hxx9py/2fLSebdDZz8g1qQTtiLuVBrUQXqaifINvp5PGI24h9kEYUXkLaeTd938
yefv2GgUAXayV5sa+136P8TJrqArKurS67U15v/31e9qRhMm7wg1JhWMZnich6HW
gvBpsKO4ZROnoecwHv8yOTpPPzg4olj+GXGPXKZYyG9VO9yGI3ZUKEMYNL+/nEoT
JbEkz8W9zxmuhZwh4ku/ZgIZiR7pOl2b56DRU12028o2D0QXMD3e3Fo5WqhrMZ6l
p9F0gxRPREzopRQcqmiiZRXR/TULuDxnMBSv
-----END CERTIFICATE-----`
      }]
    });

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.put(set_url, payload, params);

    check(res, {
      ["Create certificate status should be 200 or 201"]: (r) => (r.status === 200) || (r.status === 201) 
    });

    console.log(`Create certificate ${certificateName} result: ${res.status}`);
    console.log(`REQUEST: ${payload}`);
	
    return res;
  }

  static remove(jsessionId, certName, URL, resCode = 200) { 
    let remove_url =  URL + '/certm/nbi/v2/trusted-certificates/' + certName;

    let params = {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'JSESSIONID=' + jsessionId,
      },
    };

    let res = http.del(remove_url, null, params);

    check(res, {
      ["Remove certificate status should be " + resCode]: (r) => r.status === resCode
    });

    console.log("Remove certificate " + certName + " result: " + res.status);

    return res;	  
  }

  static getCertificates(jsessionId, URL, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = URL + `/certm/nbi/v2/trusted-certificates`
    let response = http.get(get_url, params);

    check(response, {
      ["Get all certificates status should be " + resCode] : (r) => r.status === resCode
    });

    console.log("Get all certificates result: " + response.status);

    if (response.status == 200) {
      return response;
    }
    return null;
  }

  static getCertificateByName(jsessionId, URL, name, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = `${URL}/certm/nbi/v2/trusted-certificates/${name}`
    let response = http.get(get_url, params);

    check(response, {
      ["Get certificate by name status should be " + resCode] : (r) => r.status === resCode
    });

    console.log("Get certificate by name result: " + response.status);

    if (response.status == 200) {
      return response;
    }
    return null;
  }

  static asymmetrickeys(jsessionId, URL, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = URL + `/certm/nbi/v2/asymmetric-keys`
    let response = http.get(get_url, params);

    check(response, {
      ["Get all asymmetric-keys status should be " + resCode ] : (r) => r.status === resCode
    });

    console.log("Get all asymmetric-keys certificates result: " + response.status);
    return response;
  }

  static getAsymmetricKeyByName(jsessionId, URL, name, resCode = 200) {
    let params = {
        headers: {
          'Content-Type': 'application/json',
          "Accept": "*/*",
          'Cookie': 'JSESSIONID=' + jsessionId,
        },
    };
    let get_url = `${URL}/certm/nbi/v2/asymmetric-keys/${name}`
    let response = http.get(get_url, params);

    check(response, {
      ["Get asymmetric-key by name status should be " + resCode ] : (r) => r.status === resCode
    });

    console.log("Get asymmetric-key by name result: " + response.status);
    return response;
  }
}
