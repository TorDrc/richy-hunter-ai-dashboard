// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// RugCheck Security Engine
// ============================================================================

import {apiGet} from "./apiClient.js";
import {CACHE_KEYS,getCache,setCache} from "../cache.js";
import {info,warn} from "../logger.js";

const BASE_URL="https://api.rugcheck.xyz/v1";

const CACHE_TTL=600;


// Raw RugCheck response
export async function getTokenSecurity(token){

const cached=getCache(
CACHE_KEYS.RUGCHECK,
token
);

if(cached) return cached;

const url=`${BASE_URL}/tokens/${token}/report`;

const data=await apiGet(
url,
{
name:"RUGCHECK",
timeout:10000,
retries:2
}
);

if(!data){

warn(
"RUGCHECK_NO_DATA",
{token}
);

return null;

}

setCache(
CACHE_KEYS.RUGCHECK,
token,
data,
CACHE_TTL
);

return data;

}


// Normalize RugCheck response
export function normalizeSecurity(report){

if(!report) return null;

return{

mintAuthority:
Boolean(report.token?.mintAuthority),

freezeAuthority:
Boolean(report.token?.freezeAuthority),

lpLocked:
Boolean(report.markets?.[0]?.lp?.locked),

rugScore:
Number(report.score_normalised??0),

risks:
Array.isArray(report.risks)
?report.risks
:[],

warnings:
Array.isArray(report.warnings)
?report.warnings
:[],

holderCount:
Number(report.token?.totalHolders??0),

verified:
Boolean(report.verification),

tokenProgram:
report.token?.tokenProgram??null,

creator:
report.creator??null

};

}


// Complete security scan
export async function scanTokenSecurity(token){

const report=await getTokenSecurity(token);

if(!report) return null;

const security=normalizeSecurity(report);

info(
"RUGCHECK_SCAN_COMPLETE",
{token}
);

return security;

}


export default{

getTokenSecurity,
normalizeSecurity,
scanTokenSecurity

};
