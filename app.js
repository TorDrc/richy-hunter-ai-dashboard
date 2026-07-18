 // ============================================
// RICHY HUNTER AI - FRONTEND v4.5
// Compatible avec Worker v14.7 HOTFIX
// ============================================

const WORKER_URL = "https://richy-hunter-api.kenedykabori104.workers.dev";

// =======================
// UTILITAIRES D'EXTRACTION
// =======================
function extractTokenAddress(input) {
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input)) {
        return input;
    }
    const match = input.match(/\/([1-9A-HJ-NP-Za-km-z]{32,44})(?:\?|$)/);
    if (match) return match[1];
    return null;
}

// =======================
// LECTURE SÉCURISÉE DES CHAMPS
// =======================
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
        // Priorité : score à plat (hotfix) ou scores.final
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

        // ---------- MARKET DATA ----------
        const liquidity = getSafe(data, 'market.liquidity', getSafe(data, 'liquidity', 0));
        const volume = getSafe(data, 'market.volume', getSafe(data, 'volume', 0));
        const holders = getSafe(data, 'holders', getSafe(data, 'holdersDetail.count', 'N/D'));
        const whaleRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'N/D'));
        const rugRisk = getSafe(data, 'security.rugRisk', getSafe(data, 'rugRisk', 'N/D'));

        document.getElementById('liquidity').textContent = '$' + Number(liquidity).toLocaleString();
        document.getElementById('volume').textContent = '$' + Number(volume).toLocaleString();
        document.getElementById('holders').textContent = holders;
        document.getElementById('whales').textContent = whaleRisk;
        document.getElementById('rug').textContent = rugRisk;

        // ---------- SECURITY ----------
        const mint = getSafe(data, 'security.mint', getSafe(data, 'mintStatus', 'N/D'));
        const freeze = getSafe(data, 'security.freeze', getSafe(data, 'freezeStatus', 'N/D'));
        const lpLock = getSafe(data, 'security.lpLock', getSafe(data, 'lpLocked', 'N/D'));
        const holderRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'N/D'));

        document.getElementById('mint').textContent = mint;
        document.getElementById('freeze').textContent = freeze;
        document.getElementById('lpLock').textContent = lpLock === true ? 'OUI' : lpLock === false ? 'NON' : 'N/D';
        document.getElementById('holderRisk').textContent = holderRisk;

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

            html += `
                <div class="card">
                    <h3>#${index + 1} ${name} (${symbol})</h3>
                    <p>Score : <b>${score}/100</b></p>
                    <p>💰 Market Cap : $${Number(marketCap).toLocaleString()}</p>
                    <p>💧 Liquidité : $${Number(liquidity).toLocaleString()}</p>
                    <p>📈 Volume : $${Number(volume).toLocaleString()}</p>
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

// =======================
// FORMAT HELPERS (optionnel)
// =======================
function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toString();
}
