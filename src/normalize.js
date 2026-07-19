// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Quant Normalization Engine
// ============================================================================

function clamp(value,min=0,max=100){
return Math.max(min,Math.min(max,value));
}


// Log normalization for large values
export function normalizeLog(value,maxReference){

if(!value||value<=0)return 0;

return clamp(
(Math.log10(value+1)/Math.log10(maxReference+1))*100
);

}


// Linear normalization
export function normalizeLinear(value,min,max){

if(value<=min)return 0;
if(value>=max)return 100;

return ((value-min)/(max-min))*100;

}


// Liquidity scoring
export function normalizeLiquidity(liquidity){

return normalizeLog(
liquidity,
1000000
);

}


// Volume scoring
export function normalizeVolume(volume){

return normalizeLog(
volume,
10000000
);

}


// Holder count scoring
export function normalizeHolders(count){

return normalizeLog(
count,
10000
);

}


// Holder concentration risk
// Lower concentration = better score
export function normalizeDistribution(topHolderPercent){

if(topHolderPercent<=10)return 100;

if(topHolderPercent>=80)return 0;

return clamp(
100-((topHolderPercent-10)/70)*100
);

}


// Whale concentration
export function normalizeWhales(concentration){

if(concentration<=20)return 100;

if(concentration>=75)return 0;

return clamp(
100-((concentration-20)/55)*100
);

}


// Token age scoring
export function normalizeAge(hours){

if(hours<1)return 20;

if(hours>=720)return 100;

return clamp(
(hours/720)*100
);

}


// Momentum scoring
export function normalizeMomentum(changePercent){

if(changePercent<=-50)return 0;

if(changePercent>=100)return 100;

return clamp(
((changePercent+50)/150)*100
);

}


// Volatility scoring
// Moderate volatility is preferred
export function normalizeVolatility(volatility){

if(volatility<10)return 70;

if(volatility>100)return 20;

return clamp(
100-Math.abs(50-volatility)
);

}


// Security score
export function normalizeSecurity(flags={}){

let score=100;

if(flags.mintEnabled)
score-=35;

if(flags.freezeEnabled)
score-=35;

if(!flags.lpLocked)
score-=25;

return clamp(score);

}


// Smart money scoring
export function normalizeSmartMoney(data={}){

let score=50;

if(data.wallets>0)
score+=15;

if(data.successRate>60)
score+=20;

if(data.averageROI>200)
score+=15;

return clamp(score);

}


// Creator reputation scoring
export function normalizeCreator(data={}){

let score=50;

if(data.previousRugs)
score-=50;

if(data.successTokens>0)
score+=20;

if(data.walletAge>365)
score+=20;

return clamp(score);

}


export function normalize(value,type){

switch(type){

case "liquidity":
return normalizeLiquidity(value);

case "volume":
return normalizeVolume(value);

case "holders":
return normalizeHolders(value);

default:
return clamp(value);

}

}


export default {

normalizeLiquidity,
normalizeVolume,
normalizeHolders,
normalizeDistribution,
normalizeWhales,
normalizeAge,
normalizeMomentum,
normalizeVolatility,
normalizeSecurity,
normalizeSmartMoney,
normalizeCreator

};
