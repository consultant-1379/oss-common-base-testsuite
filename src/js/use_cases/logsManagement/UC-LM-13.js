import { group, check, sleep } from 'k6'
import http from 'k6/http';

export const options = {
  "insecureSkipTLSVerify": true
}

export function sendLogsToLT(prefix, entries, replicas) {
  console.log("PREFIX = " + prefix);	
  console.log("ENTRIES = " + entries);	
  console.log("REPLICAS= " + replicas);
	
  group("Use Case: Sending Logs to Log Transformer", function() {
    let url = "http://localhost:8075/v1/logging";
    let body = {"size":500, "count":`${entries}`, "interval":5, "runPrefix":`${prefix}`};
    let params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let port = 8075;
    for(let i = 0; i < replicas; i++) {	  
      let url = `http://localhost:${port}/v1/logging`;
      let request = http.put(url, JSON.stringify(body), params);
      console.log(`Sending Logs to Log Transformer on port ${port} result: ${request.status}`);

      check(request, {
        [`Sending Logs to Log Transformer on port ${port} status should be 200`]: (r) => r.status === 200
      }); 	  
      port++;
    } 	    
  });
}
