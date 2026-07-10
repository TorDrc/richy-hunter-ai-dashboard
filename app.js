 async function scanToken() {
const url = document.getElementById("tokenUrl").value;
if(!url){
alert("Colle un lien DexScreener");
return;
}
// récupère l'adresse du token
let tokenAddress = url.split("/").pop();
try {
let response = await fetch(
`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
);
let data = await response.json();
if(!data.pairs){
alert("Token introuvable");
return;
}
let pair = data.pairs[0];
let liquidity = pair.liquidity.usd || 0;
let volume = pair.volume.h24 || 0;
let priceChange = pair.priceChange.h24 || 0;
let buys = pair.txns.h24.buys || 0;
let sells = pair.txns.h24.sells || 0;
let score = 50;
// Liquidity
if(liquidity > 10000)
score += 15;
if(liquidity > 50000)
score += 10;
// Volume
if(volume > 50000)
score += 10;
if(volume > 500000)
score += 10;
// Buyers
if(buys > sells)
score += 5;
else
score -= 10;
// Price movement
if(priceChange > 0)
score += 5;
if(score > 100)
score = 100;
let risk;
if(score >=80)
risk="Faible 🟢";
else if(score>=60)
risk="Moyen 🟡";
else
risk="Élevé 🔴";
document.getElementById("score").innerHTML =
score;
document.getElementById("liquidity").innerHTML =
"$"+liquidity.toLocaleString();
document.getElementById("volume").innerHTML =
"$"+volume.toLocaleString();
document.getElementById("holders").innerHTML =
"N/D (API future)";
document.getElementById("whales").innerHTML =
buys+" achats / "+sells+" ventes";
document.getElementById("rug").innerHTML =
risk;
document.getElementById("signal").innerHTML =
score>=80 ?
"🚀 Hunter Entry" :
score>=60 ?
"👀 Surveillance" :
"⛔ Éviter";
}
catch(error){
alert("Erreur API DexScreener");
console.log(error);
}
}