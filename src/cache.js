// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Cache Management Engine
// ============================================================================

const memoryCache=new Map();


// Create cache key
function createKey(namespace,id){

return `RH16_${namespace}_${id}`;

}


// Save data
export function setCache(namespace,id,data,ttl=300){

const key=createKey(namespace,id);

memoryCache.set(key,{

data,

expires:Date.now()+(ttl*1000)

});

return true;

}


// Read data
export function getCache(namespace,id){

const key=createKey(namespace,id);

const item=memoryCache.get(key);


if(!item)
return null;


if(Date.now()>item.expires){

memoryCache.delete(key);

return null;

}


return item.data;

}


// Delete cache item
export function deleteCache(namespace,id){

const key=createKey(namespace,id);

return memoryCache.delete(key);

}


// Clear all cache
export function clearCache(){

memoryCache.clear();

}


// Check existing cache
export function hasCache(namespace,id){

return getCache(namespace,id)!==null;

}


// Cache statistics
export function cacheStats(){

let active=0;

let expired=0;


for(const item of memoryCache.values()){

if(Date.now()>item.expires)
expired++;

else
active++;

}


return {

size:memoryCache.size,

active,

expired

};

}


// Automatic cleanup
export function cleanupCache(){

for(const [key,item] of memoryCache.entries()){

if(Date.now()>item.expires){

memoryCache.delete(key);

}

}

}


// Predefined namespaces

export const CACHE_KEYS={

TOKEN:"TOKEN",

MARKET:"MARKET",

HOLDERS:"HOLDERS",

RUGCHECK:"RUGCHECK",

HELIUS:"HELIUS",

SMART_MONEY:"SMART_MONEY",

ANALYSIS:"ANALYSIS"

};


export default {

setCache,
getCache,
deleteCache,
clearCache,
hasCache,
cacheStats,
cleanupCache,
CACHE_KEYS

};
