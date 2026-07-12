 const WORKER_URL =
"https://richy-hunter-api.kenedykabori104.workers.dev";


// =======================
// SCAN TOKEN
// =======================

async function scanToken(){

const input=document.getElementById("tokenUrl");
const button=input.nextElementSibling;

let url=input.value.trim();

if(!url){
alert("Colle un lien DexScreener");
return;
}

let token=url.split("/").pop().split("?")[0];


try{

button.disabled=true;
button.innerHTML="⏳ Analyse...";

document.getElementById("signal").innerHTML=
"⏳ Analyse AI en cours...";


let response=await fetch(
`${WORKER_URL}/?token=${token}`
);


let data=await response.json();


if(data.error){
alert(data.error);
return;
}


// SCORE

document.getElementById("score").innerHTML=
data.score+"/100";


if(data.score>=80){

document.getElementById("score").style.color=
"#22c55e";

}

else if(data.score>=60){

document.getElementById("score").style.color=
"#eab308";

}

else{

document.getElementById("score").style.color=
"#ef4444";

}


// SIGNAL

document.getElementById("signal").innerHTML=

data.score>=80
?
"🟢 HUNTER ENTRY"
:
data.score>=60
?
"🟡 SURVEILLANCE"
:
"🔴 ÉVITER";



// MARKET DATA

document.getElementById("liquidity").innerHTML=
"$"+Number(data.liquidity||0)
.toLocaleString();


document.getElementById("volume").innerHTML=
"$"+Number(data.volume||0)
.toLocaleString();



// SECURITY

document.getElementById("mint").innerHTML=
data.mint || "N/D";


document.getElementById("freeze").innerHTML=
data.freeze || "N/D";


document.getElementById("lpLock").innerHTML=
data.lp || "N/D";


document.getElementById("holderRisk").innerHTML=
data.holders || "N/D";


document.getElementById("rug").innerHTML=
data.rug || "N/D";



// SMART MONEY

document.getElementById("smartMoney").innerHTML=
data.smart || 
"Analyse Helius prochaine étape";


// ALERT

document.getElementById("alert").innerHTML=
data.alert ||
"Aucune alerte";



// REGLES HUNTER

let liquidity=
Number(data.liquidity||0);

let volume=
Number(data.volume||0);



document.getElementById("ruleLiquidity").innerHTML=

liquidity>10000
?
"✅ Liquidité suffisante"
:
"❌ Liquidité faible";



document.getElementById("ruleVolume").innerHTML=

volume>100000
?
"✅ Volume en croissance"
:
"❌ Volume faible";



document.getElementById("ruleSecurity").innerHTML=

(data.mint==="OFF" &&
data.freeze==="OFF")

?
"✅ Sécurité du contrat vérifiée"
:
"⚠️ Contrat à vérifier";



}

catch(error){

console.error(error);

alert(
"Erreur : Worker Cloudflare ou API indisponible"
);

}


finally{

button.disabled=false;
button.innerHTML="Analyser Token";

}

}
document.getElementById("holders").innerHTML =
data.holders || "N/D";



// =======================
// SCANNER NOUVEAUX TOKENS
// =======================

async function scanNewTokens(){


let status=
document.getElementById("scannerStatus");


try{


status.innerHTML=
"⏳ Recherche nouveaux Solana Gems...";


let response=
await fetch(
`${WORKER_URL}/?mode=new`
);


let data=
await response.json();



if(data.error){

alert(data.error);
return;

}



let html="";


data.tokens.forEach((token,index)=>{


let signal=

token.score>=80
?
"🟢 Hunter Entry"
:
token.score>=60
?
"🟡 Watch"
:
"🔴 Avoid";



html+=`

<div class="card">

<h3>
#${index+1}
${token.name || "Unknown"}
(${token.symbol || ""})
</h3>

<p>
Score :
<b>${token.score}/100</b>
</p>

<p>
💰 Market Cap :
$${Number(token.marketCap||0)
.toLocaleString()}
</p>

<p>
💧 Liquidity :
$${Number(token.liquidity||0)
.toLocaleString()}
</p>

<p>
📈 Volume :
$${Number(token.volume||0)
.toLocaleString()}
</p>

<p>
🟢 Buy :
${token.buys||0}
|
🔴 Sell :
${token.sells||0}
</p>

<p>
${signal}
</p>

</div>

`;

});


document.getElementById("results").innerHTML=
html;


status.innerHTML=
"✅ Scan terminé : "
+
data.tokens.length
+
" tokens analysés";


}


catch(error){

console.error(error);

status.innerHTML=
"❌ Erreur scanner automatique";

}


}
