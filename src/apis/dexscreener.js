// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// DexScreener Market Data Engine
// ============================================================================

import {apiGet} from "./apiClient.js";
import {CACHE_KEYS,setCache,getCache} from "../cache.js";
import {info,warn} from "../logger.js";


const BASE_URL="https://api.dexscreener.com/latest/dex";


const CACHE_TIME=300;


// Get token pairs
export async function getTokenPairs(tokenAddress){

const cached=getCache(
CACHE_KEYS.TOKEN,
tokenAddress
);


if(cached)
return cached;


const url=`${BASE_URL}/tokens/${tokenAddress}`;


const data=await apiGet(
url,
{
name:"DEXSCREENER",
timeout:8000,
retries:2
}
);


if(!data||!data.pairs){

warn(
"DEXSCREENER_NO_DATA",
{
tokenAddress
}
);

return null;

}


setCache(
CACHE_KEYS.TOKEN,
tokenAddress,
data,
CACHE_TIME
);


return data;

}


// Select best liquidity pair
export function selectBestPair(pairs=[]){

if(!pairs.length)
return null;


return pairs.sort(

(a,b)=>

Number(
b.liquidity?.usd||0
)

-

Number(
a.liquidity?.usd||0

)

)[0];

}


// Format market data
export function formatMarketData(pair){

if(!pair)
return null;


return {

chain:pair.chainId,

dex:pair.dexId,

pairAddress:pair.pairAddress,

tokenAddress:
pair.baseToken?.address,

symbol:
pair.baseToken?.symbol,

name:
pair.baseToken?.name,


priceUSD:
Number(pair.priceUsd||0),


marketCap:
Number(
pair.fdv||pair.marketCap||0
),


liquidityUSD:
Number(
pair.liquidity?.usd||0
),


volume24h:
Number(
pair.volume?.h24||0
),


volume6h:
Number(
pair.volume?.h6||0
),


volume1h:
Number(
pair.volume?.h1||0
),


priceChange1h:
Number(
pair.priceChange?.h1||0
),


priceChange24h:
Number(
pair.priceChange?.h24||0
),


buys24h:
Number(
pair.txns?.h24?.buys||0
),


sells24h:
Number(
pair.txns?.h24?.sells||0
),


createdAt:
pair.pairCreatedAt||null

};

}


// Complete market scan
export async function scanTokenMarket(tokenAddress){

const raw=await getTokenPairs(
tokenAddress
);


if(!raw?.pairs)
return null;


const pair=selectBestPair(
raw.pairs
);


const market=formatMarketData(
pair
);


info(
"MARKET_SCAN_COMPLETE",
{
token:tokenAddress
}
);


return market;

}


export default {

getTokenPairs,
selectBestPair,
formatMarketData,
scanTokenMarket

};
