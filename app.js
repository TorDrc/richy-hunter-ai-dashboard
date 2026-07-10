 async function scan(){

let address =
document.getElementById("token").value;


if(address.length < 20){

alert("Adresse incorrecte");

return;

}


let url =
"https://api.dexscreener.com/latest/dex/tokens/"
+address;



let response =
await fetch(url);


let data =
await response.json();


let pair =
data.pairs ? data.pairs[0] : null;



if(!pair){

document.getElementById("result").innerHTML =
"❌ Token introuvable";

return;

}



let liquidity =
Number(pair.liquidity.usd || 0);


let volume =
Number(pair.volume.h24 || 0);



let score=0;


if(liquidity>10000)
score+=30;


if(volume>10000)
score+=30;


if(pair.priceUsd)
score+=20;


score+=20;



let status;


if(score>=80){

status="🟢 BON SIGNAL";

}

else if(score>=60){

status="🟡 SURVEILLANCE";

}

else{

status="🔴 RISQUE";

}



document.getElementById("result").innerHTML=`

<div class="card">

<h2>${pair.baseToken.name}</h2>

<h1 class="green">
${score}/100
</h1>


<h3>${status}</h3>


<p>
💧 Liquidité :
$${liquidity.toLocaleString()}
</p>


<p>
📊 Volume 24h :
$${volume.toLocaleString()}
</p>


<a target="_blank"
href="https://dexscreener.com/solana/${address}">
Voir DexScreener
</a>


<br><br>


<a target="_blank"
href="https://phantom.app/ul/browse/${address}">
Ouvrir Phantom
</a>


</div>

`;

}