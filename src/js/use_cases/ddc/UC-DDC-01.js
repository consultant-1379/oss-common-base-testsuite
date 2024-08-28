import { group, sleep } from 'k6';
import { check } from 'k6';
import * as Constants from '../../modules/Constants.js';

export const options = {
  "insecureSkipTLSVerify": true
}

export function triggerCollection(result) {
  group("Trigger and verify data collection from DDC", function () {
    let resStr;
    switch (result) {
      case "0":
	resStr = "Upload to SFTP server successfully completed";
	break;
      case "1":
	resStr = "An error occurred while setting sftp server";
	break;
      case "2":
        resStr = "An error occurred while creating network policy to SFTP server";
        break;
      case "3":
        resStr = "An error occurred while triggering the collection job";
        break;
      case "4":
        resStr = "No DDC file has been uploaded to SFTP server";
        break;
      case "5":
        resStr = "No DDC data has been uploaded to SFTP server";
        break;
      case "6":
        resStr = "Timeout occurred, transfer did not complete within 180 seconds";
        break;
      case "7":
        resStr = "An error occurred while setting sftp credentials" ;
        break;
    }

    check(result, {
      [resStr]: (r) => r == "0" 
    });
  }); 
}



