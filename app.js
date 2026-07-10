 const WORKER_URL =
"https://richy-hunter-api.kenedykabori104.workers.dev";



async function scanToken(){


const input =
document.getElementById("tokenUrl");


const button =
document.querySelector("button");



let url =
input.value.trim();



if(!url){

alert("Colle un lien DexScreener");

return;

}




let token =
url.split("/")
.pop()
.split("?")[0];



try{


button.disabled=true;

button.innerHTML="⏳ Analyse...";



document.getElementById("signal").innerHTML =
"⏳ Analyse AI en cours...";





const response =
await fetch(

`${WORKER_URL}/?token=${token}`

);



const data =
await response.json();



if(data.error){

alert(data.error);

return;

}





// SCORE


 document.getElementById("score").innerHTML =
data.score;



if(data.score>=80){

document.getElementById("score").style.color="#22c55e";

}

else if(data.score>=60){

document.getElementById("score").style.color="#eab308";

}

else{

document.getElementById("score").style.color="#ef4444";

}





// SIGNAL


let signal;



if(data.score>=80){

signal="🟢 HUNTER ENTRY";

}

else if(data.score>=60){

signal="🟡 SURVEILLANCE";

}

else{

signal="🔴 ÉVITER";

}



document.getElementById("signal").innerHTML =
signal;





// MARKET


document.getElementById("liquidity").innerHTML =
"$"+Number(data.liquidity||0)
.toLocaleString();



document.getElementById("volume").innerHTML =
"$"+Number(data.volume||0)
.toLocaleString();




// SECURITY


document.getElementById("mint").innerHTML =
data.mint || "N/D";


document.getElementById("freeze").innerHTML =
data.freeze || "N/D";


document.getElementById("lpLock").innerHTML =
data.lp || "N/D";


document.getElementById("holderRisk").innerHTML =
data.holders || "N/D";


document.getElementById("rug").innerHTML =
data.rug || "N/D";




// SMART MONEY


document.getElementById("smartMoney").innerHTML =
data.smart || "N/D";




// ALERT


document.getElementById("alert").innerHTML =
data.alert || "Aucune alerte";





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








async function scanNewTokens(){


try{


const status =
document.getElementById("scannerStatus");


status.innerHTML =
"⏳ Recherche nouveaux Solana Gems...";



const response =
await fetch(

`${WORKER_URL}/?mode=new`

);



const data =
await response.json();



if(data.error){

alert(data.error);

return;

}



let html="";





data.tokens.forEach((token,index)=>{


let signal;



if(token.score>=80){

signal="🟢 Hunter Entry";

}

else if(token.score>=60){

signal="🟡 Watch";

}

else{

signal="🔴 Avoid";

}




html+=`

<div class="card">

<h3>
#${index+1} ${token.name || "Unknown"}
(${token.symbol || ""})
</h3>


<p>
Score :
<b>${token.score}/100</b>
</p>


<p>
💰 Market Cap :
$${Number(token.marketCap||0).toLocaleString()}
</p>


<p>
💧 Liquidity :
$${Number(token.liquidity||0).toLocaleString()}
</p>


<p>
📈 Volume :
$${Number(token.volume||0).toLocaleString()}
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




document.getElementById("results").innerHTML =
html;



document.getElementById("scannerStatus").innerHTML =
"✅ Scan terminé : "
+
data.tokens.length
+
" tokens";




}


catch(error){


console.error(error);


document.getElementById("scannerStatus").innerHTML =
"❌ Erreur scanner";


}


}