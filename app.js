 // ============================================
// RICHY HUNTER AI - FRONTEND v4.6
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
// FORMATAGE ROBUSTE (corrigé)
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
// SCAN TOKEN
// =======================
async function scanToken() {
    const input = document.getElementById('tokenUrl');
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

    try {
        button.disabled = true;
        button.innerHTML = '⏳ Analyse...';
        document.getElementById('signal').innerHTML = '⏳ Analyse AI en cours...';
        document.getElementById('score').textContent = '...';
        document.getElementById('score').style.color = '#94a3b8';

        const response = await fetch(`${WORKER_URL}/?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.error) {
            alert('⚠️ ' + data.error);
            return;
        }

        // ---------- SCORE ----------
        const score = getSafe(data, 'score', getSafe(data, 'scores.final', 0));
        document.getElementById('score').textContent = score + '/100';
        document.getElementById('score').style.color =
            score >= 75 ? '#22c55e' :
            score >= 55 ? '#eab308' :
            '#ef4444';

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
        document.getElementById('signal').textContent = signalText;
        document.getElementById('signal').className = 'status ' + signalClass;

        // ---------- MARKET DATA (corrigé) ----------
        const liquidity = getSafe(data, 'market.liquidity', getSafe(data, 'liquidity', 0));
        const volume = getSafe(data, 'market.volume', getSafe(data, 'volume', 0));
        const marketCap = getSafe(data, 'market.marketCap', getSafe(data, 'marketCap', 0));
        const holders = getSafe(data, 'holders', getSafe(data, 'holdersDetail.count', null));
        const whaleRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'UNKNOWN'));
        const rugRisk = getSafe(data, 'rug', getSafe(data, 'security.rugRisk', getSafe(data, 'rugRisk', 'N/D')));

        // Affichage avec formatage
        document.getElementById('liquidity').textContent = formatNumber(liquidity, "currency");
        document.getElementById('volume').textContent = formatNumber(volume, "currency");
        document.getElementById('marketCap').textContent = formatNumber(marketCap, "compact");

        // Holders : afficher N/A si 0 ou null
        document.getElementById('holders').textContent =
            (holders !== null && holders !== undefined && holders > 0)
            ? holders.toLocaleString()
            : 'N/A';

        // Whales : afficher "Non évalué" si UNKNOWN
        document.getElementById('whales').textContent =
            whaleRisk === 'UNKNOWN' ? 'Non évalué' :
            whaleRisk === 'N/D' ? 'N/A' :
            whaleRisk;

        // Rug Risk : afficher "Non évalué" si N/D ou inconnu
        document.getElementById('rug').textContent =
            (rugRisk === 'N/D' || rugRisk === 'UNKNOWN' || !rugRisk)
            ? 'Non évalué'
            : rugRisk;

        // ---------- SECURITY ----------
        const mint = getSafe(data, 'security.mint', getSafe(data, 'mintStatus', 'N/D'));
        const freeze = getSafe(data, 'security.freeze', getSafe(data, 'freezeStatus', 'N/D'));
        const lpLock = getSafe(data, 'security.lpLock', getSafe(data, 'lpLocked', 'N/D'));
        const holderRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'N/D'));

        document.getElementById('mint').textContent = mint;
        document.getElementById('freeze').textContent = freeze;
        document.getElementById('lpLock').textContent = lpLock === true ? 'OUI' : lpLock === false ? 'NON' : 'N/D';
        document.getElementById('holderRisk').textContent =
            holderRisk === 'UNKNOWN' ? 'Non évalué' : holderRisk;

        // ---------- SMART MONEY ----------
        const smartMoney = getSafe(data, 'smartMoney', getSafe(data, 'smartMoneyDetail.score', 0));
        document.getElementById('smartMoney').textContent = smartMoney > 0 ? smartMoney + '/100' : 'Analyse Helius prochaine étape';

        // ---------- ALERT ----------
        document.getElementById('alert').textContent = alertMsg || 'Aucune alerte';

        // ---------- RULES ----------
        const liq = Number(liquidity);
        const vol = Number(volume);
        const isSecure = (mint === 'REVOKED' || mint === 'SAFE') && (freeze === 'REVOKED' || freeze === 'SAFE');

        document.getElementById('ruleLiquidity').textContent =
            liq > 30000 ? '✅ Liquidité suffisante' :
            liq > 10000 ? '🟡 Liquidité moyenne' : '❌ Liquidité faible';

        document.getElementById('ruleVolume').textContent =
            vol > 100000 ? '✅ Volume en croissance' :
            vol > 50000 ? '🟡 Volume modéré' : '❌ Volume faible';

        document.getElementById('ruleSecurity').textContent =
            isSecure ? '✅ Sécurité contrat vérifiée' : '⚠️ Contrat à vérifier';

        // ---------- (optionnel) SCORE BREAKDOWN ----------
        if (data.scores) {
            console.log('Scores détaillés:', data.scores);
        }

    } catch (error) {
        console.error('Scan error:', error);
        alert('❌ Erreur : API ou Worker indisponible');
        document.getElementById('signal').textContent = '❌ Erreur de connexion';
    } finally {
        button.disabled = false;
        button.innerHTML = 'Analyser Token';
    }
}

// =======================
// SCAN NEW TOKENS
// =======================
async function scanNewTokens() {
    const status = document.getElementById('scannerStatus');
    const results = document.getElementById('results');

    try {
        status.innerHTML = '⏳ Recherche nouveaux Solana Gems...';
        results.innerHTML = '<p>🔍 Scan en cours...</p>';

        const response = await fetch(`${WORKER_URL}/?mode=new`);
        const data = await response.json();

        if (data.error) {
            alert('⚠️ ' + data.error);
            status.innerHTML = '❌ Erreur scan';
            return;
        }

        if (!data.tokens || data.tokens.length === 0) {
            results.innerHTML = '<p>😕 Aucun nouveau token détecté</p>';
            status.innerHTML = '✅ Scan terminé : 0 token';
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

            // Formatage compact pour les cartes
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

        results.innerHTML = html;
        status.innerHTML = `✅ Scan terminé : ${data.tokens.length} tokens analysés`;

    } catch (error) {
        console.error('New tokens scan error:', error);
        status.innerHTML = '❌ Erreur scanner automatique';
        results.innerHTML = '<p>⚠️ Impossible de récupérer les données</p>';
    }
}

// =======================
// ENTER KEY SUPPORT
// =======================
document.addEventListener('DOMContentLoaded', function() {
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

// Exposer les fonctions globalement si nécessaire
window.scanToken = scanToken;
window.scanNewTokens = scanNewTokens;
