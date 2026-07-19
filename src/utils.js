// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Utility & Statistics Engine
// ============================================================================


export function clamp(value,min=0,max=100){

return Math.max(
min,
Math.min(max,value)
);

}


export function round(value,decimals=2){

if(typeof value!=="number")
return 0;

return Number(
value.toFixed(decimals)
);

}


export function percent(part,total){

if(!total||total===0)
return 0;

return round(
(part/total)*100
);

}


export function average(values=[]){

if(!values.length)
return 0;

return values.reduce(
(a,b)=>a+b,
0
)/values.length;

}


export function sum(values=[]){

return values.reduce(
(a,b)=>a+b,
0
);

}


export function min(values=[]){

return values.length?
Math.min(...values):
0;

}


export function max(values=[]){

return values.length?
Math.max(...values):
0;

}


export function median(values=[]){

if(!values.length)
return 0;


const sorted=[...values]
.sort((a,b)=>a-b);


const mid=Math.floor(
sorted.length/2
);


return sorted.length%2
?
sorted[mid]
:
(sorted[mid-1]+sorted[mid])/2;

}


// Standard deviation
export function standardDeviation(values=[]){

if(values.length<2)
return 0;


const avg=average(values);


const variance=average(

values.map(
x=>(x-avg)**2
)

);


return Math.sqrt(variance);

}


// Percentage change
export function percentageChange(oldValue,newValue){

if(!oldValue)
return 0;


return round(

((newValue-oldValue)/oldValue)*100

);

}


// Safe number conversion
export function toNumber(value,defaultValue=0){

const number=Number(value);

return Number.isFinite(number)
?
number
:
defaultValue;

}


// Check empty value
export function isEmpty(value){

return (
value===null||
value===undefined||
value===""
);

}


// Delay helper
export function sleep(ms){

return new Promise(
resolve=>setTimeout(resolve,ms)
);

}


// Generate unique id
export function uid(prefix="RH16"){

return `${prefix}_${Date.now()}_${Math.random()
.toString(36)
.substring(2,8)}`;

}


// Deep clone object
export function deepClone(object){

return JSON.parse(
JSON.stringify(object)
);

}


// Validate Solana address format
export function isValidAddress(address){

if(typeof address!=="string")
return false;


return address.length>=32 &&
address.length<=44;

}


// Calculate weighted score
export function weightedScore(values={},weights={}){

let score=0;


for(const key in weights){

score+=
(values[key]||0)*
weights[key];

}


return round(score);

}


// Safe JSON parsing
export function safeJSON(data){

try{

return JSON.parse(data);

}

catch{

return null;

}

}


export default {

clamp,
round,
percent,
average,
sum,
min,
max,
median,
standardDeviation,
percentageChange,
toNumber,
isEmpty,
sleep,
uid,
deepClone,
isValidAddress,
weightedScore,
safeJSON

};
