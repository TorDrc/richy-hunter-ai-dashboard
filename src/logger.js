// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Logging & Performance Engine
// ============================================================================

const LEVELS={

DEBUG:"DEBUG",
INFO:"INFO",
WARN:"WARN",
ERROR:"ERROR"

};


let logs=[];


// Maximum logs stored in memory
const MAX_LOGS=200;


// Format timestamp
function timestamp(){

return new Date().toISOString();

}


// Create log object
function createLog(level,message,data={}){

return {

time:timestamp(),

level,

message,

data

};

}


// Store log
function storeLog(entry){

logs.push(entry);


if(logs.length>MAX_LOGS){

logs.shift();

}

}


// Generic logger
function log(level,message,data={}){

const entry=createLog(
level,
message,
data
);

storeLog(entry);


if(level===LEVELS.ERROR){

console.error(entry);

}

else if(level===LEVELS.WARN){

console.warn(entry);

}

else{

console.log(entry);

}


return entry;

}


// Debug
export function debug(message,data={}){

return log(
LEVELS.DEBUG,
message,
data
);

}


// Information
export function info(message,data={}){

return log(
LEVELS.INFO,
message,
data
);

}


// Warning
export function warn(message,data={}){

return log(
LEVELS.WARN,
message,
data
);

}


// Error
export function error(message,data={}){

return log(
LEVELS.ERROR,
message,
data
);

}


// Performance timer
export function startTimer(){

return Date.now();

}


export function endTimer(start){

return Date.now()-start;

}


// API call tracking
export function apiLog(api,status,duration,data={}){

return info(

`API_${api}`,

{

status,

duration:`${duration}ms`,

...data

}

);

}


// Get logs
export function getLogs(){

return logs;

}


// Clear logs
export function clearLogs(){

logs=[];

}


// Logger status
export function loggerStats(){

return {

total:logs.length,

errors:logs.filter(
x=>x.level===LEVELS.ERROR
).length,

warnings:logs.filter(
x=>x.level===LEVELS.WARN
).length

};

}


export const LOGGER_LEVELS=LEVELS;


export default {

debug,
info,
warn,
error,
startTimer,
endTimer,
apiLog,
getLogs,
clearLogs,
loggerStats

};
