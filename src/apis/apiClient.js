// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Universal API Client Engine
// ============================================================================

import {error,warn,apiLog,startTimer,endTimer} from "../logger.js";
import {sleep,safeJSON} from "../utils.js";


const DEFAULT_TIMEOUT=10000;
const DEFAULT_RETRIES=2;


// Timeout controller
async function fetchTimeout(url,options={},timeout=DEFAULT_TIMEOUT){

const controller=new AbortController();

const timer=setTimeout(
()=>controller.abort(),
timeout
);


try{

const response=await fetch(url,{
...options,
signal:controller.signal
});

return response;

}

finally{

clearTimeout(timer);

}

}


// Main request engine
export async function apiRequest(
url,
options={},
config={}
){

const timeout=config.timeout||DEFAULT_TIMEOUT;
const retries=config.retries||DEFAULT_RETRIES;
const apiName=config.name||"UNKNOWN";


let attempt=0;


while(attempt<=retries){

const start=startTimer();


try{

const response=await fetchTimeout(
url,
options,
timeout
);


const duration=endTimer(start);


apiLog(
apiName,
response.status,
duration
);


if(!response.ok){

throw new Error(
`HTTP_${response.status}`
);

}


const text=await response.text();

const data=safeJSON(text);


return data??text;


}

catch(err){

attempt++;


warn(

`API_RETRY_${apiName}`,

{

attempt,

error:err.message

}

);


if(attempt>retries){

error(

`API_FAILED_${apiName}`,

{

url,

error:err.message

}

);

return null;

}


await sleep(500*attempt);

}

}

}


// GET helper
export function apiGet(
url,
config={}
){

return apiRequest(
url,
{
method:"GET",
headers:{
"Accept":"application/json"
}
},
config
);

}


// POST helper
export function apiPost(
url,body,config={}
){

return apiRequest(
url,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Accept":"application/json"
},
body:JSON.stringify(body)
},
config
);

}


export default {

apiRequest,
apiGet,
apiPost

};
