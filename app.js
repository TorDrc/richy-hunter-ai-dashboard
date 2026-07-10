 async function scanToken(){
    let url = document.getElementById("tokenUrl").value;
    if(!url){
        alert("Colle un lien DexScreener");
        return;
    }
    // Récupération de l'adresse du token
    let token = url.split("/").pop();
    try{
        let response = await fetch(
            "https://richy-hunter-api.kenedykabori104.workers.dev/?token=" + token
        );
        let data = await response.json();
        document.getElementById("score").innerHTML =
        data.score + "/100";
        document.getElementById("liquidity").innerHTML =
        "$" + Number(data.liquidity).toLocaleString();
        document.getElementById("volume").innerHTML =
        "$" + Number(data.volume).toLocaleString();
        document.getElementById("mint").innerHTML =
        data.mint || "N/D";
        document.getElementById("freeze").innerHTML =
        data.freeze || "N/D";
        document.getElementById("lpLock").innerHTML =
        data.lp || "N/D";
        document.getElementById("holderRisk").innerHTML =
        data.holders || "N/D";
        document.getElementById("smartMoney").innerHTML =
        data.smart || "Analyse en cours";
        document.getElementById("alert").innerHTML =
        data.alert || "Aucune alerte";
        document.getElementById("signal").innerHTML =
        data.score >= 80
        ? "🚀 Hunter Entry"
        : data.score >= 60
        ? "👀 Surveillance"
        : "⛔ Éviter";
    }
    catch(e){
        console.log(e);
        alert("Erreur scanner : vérifie le Worker Cloudflare");
    }
}