 // ============================================
// RICHY HUNTER AI - FRONTEND v4.9 (Debug)
// Compatible avec Worker v15.0
// ============================================

const WORKER_URL = "https://richy-hunter-api.kenedykabori104.workers.dev";

// =======================
// UTILITAIRES
// =======================

function extractTokenAddress(input) {
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input)) {
        return input;
    }
    const match = input.match(/\/([1-9A-HJ-NP-Za-km-z]{32,44})(?:\?|$)/);
    if (match) return match[1];
    return null;
}

function getSafe(data, path, defaultValue) {
    const parts = path.split('.');
    let current = data;
    for (const part of parts) {
        if (current === undefined || current === null) return defaultValue;
        current = current[part];
    }
    return current !== undefined && current !== null ? current : defaultValue;
}

// =======================
// FORMATAGE
// =======================
function formatNumber(num, style = "compact") {
    if (num === undefined || num === null) return "N/A";
    const n = Number(num);
    if (!Number.isFinite(n) || isNaN(n)) return "N/A";

    if (style === "currency") {
        if (n < 0.01) return "< $0.01";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(n);
    }

    if (style === "compact") {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return n.toString();
    }

    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// =======================
// MISE À JOUR SÉCURISÉE
// =======================
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    } else {
        console.warn(`⚠️ Élément #${id} introuvable`);
    }
}

// =======================
// SCAN TOKEN (debug)
// =======================
async function scanToken() {
    console.log("🔍 scanToken() appelée");

    const input = document.getElementById('tokenUrl');
    if (!input) {
        console.error("❌ Élément #tokenUrl introuvable");
        alert("Erreur : le champ de recherche n'existe pas dans la page.");
        return;
    }

    const button = input.nextElementSibling;
    let url = input.value.trim();

    if (!url) {
        alert('📌 Colle un lien DexScreener ou une adresse Solana');
        return;
    }

    const token = extractTokenAddress(url);
    if (!token) {
        alert('❌ Adresse Solana invalide');
        return;
    }

    console.log(`🔍 Token extrait : ${token}`);

    try {
        if (button) { button.disabled = true; button.innerHTML = '⏳ Analyse...'; }

        updateElement('signal', '⏳ Analyse AI en cours...');
        updateElement('score', '...');

        const fullUrl = `${WORKER_URL}/?token=${encodeURIComponent(token)}`;
        console.log(`🌐 Appel au worker : ${fullUrl}`);

        const response = await fetch(fullUrl);
        console.log(`📡 Réponse reçue : status ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} : ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Données reçues :", data);

        if (data.error) {
            alert('⚠️ ' + data.error);
            return;
        }

        // ---------- SCORE ----------
        const score = getSafe(data, 'score', getSafe(data, 'scores.final', 0));
        updateElement('score', score + '/100');
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.style.color = score >= 75 ? '#22c55e' : score >= 55 ? '#eab308' : '#ef4444';
        }

        // ---------- SIGNAL ----------
        const alertMsg = getSafe(data, 'decision.alert', getSafe(data, 'alert', ''));
        let signalText, signalClass;
        if (alertMsg.includes('HUNTER ENTRY') || alertMsg.includes('SNIPER ENTRY') || alertMsg.includes('INSTITUTIONAL ENTRY')) {
            signalText = '🟢 ' + alertMsg;
            signalClass = 'hunter';
        } else if (alertMsg.includes('WATCH') || alertMsg.includes('SURVEILLANCE')) {
            signalText = '🟡 WATCH';
            signalClass = 'watch';
        } else if (alertMsg.includes('RISQUE ÉLEVÉ')) {
            signalText = '🟠 RISQUE ÉLEVÉ';
            signalClass = 'avoid';
        } else {
            signalText = '🔴 RUG WARNING';
            signalClass = 'avoid';
        }
        updateElement('signal', signalText);
        const signalEl = document.getElementById('signal');
        if (signalEl) signalEl.className = 'status ' + signalClass;

        // ---------- MARKET DATA ----------
        const liquidity = getSafe(data, 'market.liquidity', getSafe(data, 'liquidity', 0));
        const volume = getSafe(data, 'market.volume', getSafe(data, 'volume', 0));
        const marketCap = getSafe(data, 'market.marketCap', getSafe(data, 'marketCap', 0));
        const holders = getSafe(data, 'holders', getSafe(data, 'holdersDetail.count', null));
        const whaleRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'UNKNOWN'));
        const rugRisk = getSafe(data, 'rug', getSafe(data, 'security.rugRisk', getSafe(data, 'rugRisk', 'N/D')));

        updateElement('liquidity', formatNumber(liquidity, "currency"));
        updateElement('volume', formatNumber(volume, "currency"));
        updateElement('marketCap', formatNumber(marketCap, "compact"));
        updateElement('holders', (holders !== null && holders !== undefined && holders > 0) ? holders.toLocaleString() : 'N/A');
        updateElement('whales', whaleRisk === 'UNKNOWN' ? 'Non évalué' : whaleRisk);
        updateElement('rug', (rugRisk === 'N/D' || rugRisk === 'UNKNOWN' || !rugRisk) ? 'Non évalué' : rugRisk);

        // ---------- SECURITY ----------
        const mint = getSafe(data, 'security.mint', getSafe(data, 'mintStatus', 'N/D'));
        const freeze = getSafe(data, 'security.freeze', getSafe(data, 'freezeStatus', 'N/D'));
        const lpLock = getSafe(data, 'security.lpLock', getSafe(data, 'lpLocked', 'N/D'));
        const holderRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'N/D'));

        updateElement('mint', mint);
        updateElement('freeze', freeze);
        updateElement('lpLock', lpLock === true ? 'OUI' : lpLock === false ? 'NON' : 'N/D');
        updateElement('holderRisk', holderRisk === 'UNKNOWN' ? 'Non évalué' : holderRisk);

        // ---------- SMART MONEY ----------
        const smartMoney = getSafe(data, 'smartMoney', getSafe(data, 'smartMoneyDetail.score', 0));
        updateElement('smartMoney', smartMoney > 0 ? smartMoney + '/100' : 'Analyse Helius prochaine étape');

        // ---------- ALERT ----------
        updateElement('alert', alertMsg || 'Aucune alerte');

        // ---------- RULES ----------
        const liq = Number(liquidity);
        const vol = Number(volume);
        const isSecure = (mint === 'REVOKED' || mint === 'SAFE') && (freeze === 'REVOKED' || freeze === 'SAFE');

        updateElement('ruleLiquidity', liq > 30000 ? '✅ Liquidité suffisante' : liq > 10000 ? '🟡 Liquidité moyenne' : '❌ Liquidité faible');
        updateElement('ruleVolume', vol > 100000 ? '✅ Volume en croissance' : vol > 50000 ? '🟡 Volume modéré' : '❌ Volume faible');
        updateElement('ruleSecurity', isSecure ? '✅ Sécurité contrat vérifiée' : '⚠️ Contrat à vérifier');

        console.log("✅ Analyse terminée avec succès.");

    } catch (error) {
        console.error('❌ Erreur lors du scan :', error);
        alert('❌ Erreur : ' + error.message);
        updateElement('signal', '❌ Erreur de connexion');
    } finally {
        if (button) { button.disabled = false; button.innerHTML = 'Analyser Token'; }
    }
}

// =======================
// SCAN NEW TOKENS
// =======================
async function scanNewTokens() {
    console.log("🔍 scanNewTokens() appelée");

    const status = document.getElementById('scannerStatus');
    const results = document.getElementById('results');

    try {
        if (status) status.innerHTML = '⏳ Recherche nouveaux Solana Gems...';
        if (results) results.innerHTML = '<p>🔍 Scan en cours...</p>';

        const response = await fetch(`${WORKER_URL}/?mode=new`);
        const data = await response.json();

        if (data.error) {
            alert('⚠️ ' + data.error);
            if (status) status.innerHTML = '❌ Erreur scan';
            return;
        }

        if (!data.tokens || data.tokens.length === 0) {
            if (results) results.innerHTML = '<p>😕 Aucun nouveau token détecté</p>';
            if (status) status.innerHTML = '✅ Scan terminé : 0 token';
            return;
        }

        let html = '';
        data.tokens.forEach((token, index) => {
            const score = getSafe(token, 'scores.final', getSafe(token, 'score', 0));
            const alertMsg = getSafe(token, 'decision.alert', getSafe(token, 'alert', ''));
            let signal;
            if (alertMsg.includes('HUNTER ENTRY') || alertMsg.includes('SNIPER ENTRY') || alertMsg.includes('INSTITUTIONAL ENTRY')) {
                signal = '🟢 ' + alertMsg;
            } else if (alertMsg.includes('WATCH') || alertMsg.includes('SURVEILLANCE')) {
                signal = '🟡 Watch';
            } else if (alertMsg.includes('RISQUE ÉLEVÉ')) {
                signal = '🟠 Risque Élevé';
            } else {
                signal = '🔴 RUG WARNING';
            }

            const name = getSafe(token, 'token.name', 'Unknown');
            const symbol = getSafe(token, 'token.symbol', '');
            const marketCap = getSafe(token, 'market.marketCap', getSafe(token, 'marketCap', 0));
            const liquidity = getSafe(token, 'market.liquidity', getSafe(token, 'liquidity', 0));
            const volume = getSafe(token, 'market.volume', getSafe(token, 'volume', 0));
            const buys = getSafe(token, 'buys', 0);
            const sells = getSafe(token, 'sells', 0);
            const mint = getSafe(token, 'security.mint', getSafe(token, 'mintStatus', 'N/D'));
            const freeze = getSafe(token, 'security.freeze', getSafe(token, 'freezeStatus', 'N/D'));

            const fmt = (v) => {
                if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
                if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k';
                return Number(v).toLocaleString();
            };

            html += `
                <div class="card">
                    <h3>#${index + 1} ${name} (${symbol})</h3>
                    <p>Score : <b>${score}/100</b></p>
                    <p>💰 Market Cap : $${fmt(marketCap)}</p>
                    <p>💧 Liquidité : $${fmt(liquidity)}</p>
                    <p>📈 Volume : $${fmt(volume)}</p>
                    <p>🟢 Buy : ${buys} | 🔴 Sell : ${sells}</p>
                    <p>🔐 Mint: ${mint} | Freeze: ${freeze}</p>
                    <p><b>${signal}</b></p>
                </div>
            `;
        });

        if (results) results.innerHTML = html;
        if (status) status.innerHTML = `✅ Scan terminé : ${data.tokens.length} tokens analysés`;

    } catch (error) {
        console.error('New tokens scan error:', error);
        if (status) status.innerHTML = '❌ Erreur scanner automatique';
        if (results) results.innerHTML = '<p>⚠️ Impossible de récupérer les données</p>';
    }
}

// =======================
// ENTER KEY SUPPORT
// =======================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Richy Hunter AI Frontend chargé (v4.9)");
    const input = document.getElementById('tokenUrl');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                scanToken();
            }
        });
    }
});

// Exposer les fonctions globalement
window.scanToken = scanToken;
window.scanNewTokens = scanNewTokens;
