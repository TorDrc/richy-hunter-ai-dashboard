 // ============================================
// RICHY HUNTER AI – FRONTEND v6.1 (optimisé)
// Améliorations :
//   - Gestion du chargement et des erreurs intégrée à l'UI
//   - Boutons avec état "loading" natif
//   - Affichage de la latence
//   - Timeout réseau
//   - Code plus propre et robuste
// ============================================

const WORKER_URL = "https://richy-hunter-api.kenedykabori104.workers.dev";
const REQUEST_TIMEOUT = 15000; // 15 secondes

// =======================
// UTILITAIRES
// =======================

/** Affiche un message toast temporaire */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

/** Extrait l'adresse Solana d'une URL DexScreener ou d'une adresse brute */
function extractTokenAddress(input) {
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input)) {
        return input;
    }
    const match = input.match(/\/([1-9A-HJ-NP-Za-km-z]{32,44})(?:\?|$)/);
    return match ? match[1] : null;
}

/** Accès sécurisé aux propriétés imbriquées */
function getSafe(data, path, defaultValue) {
    const parts = path.split('.');
    let current = data;
    for (const part of parts) {
        if (current === undefined || current === null) return defaultValue;
        current = current[part];
    }
    return current !== undefined && current !== null ? current : defaultValue;
}

/** Formatage des nombres */
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

/** Mise à jour d'un élément texte */
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/** Mise à jour du HTML interne */
function setElementHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

/** Coloration selon le statut */
function setColor(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value === 'REVOKED' || value === 'SAFE') {
        el.style.color = '#22c55e';
    } else if (value === 'ACTIVE' || value === 'CRITICAL') {
        el.style.color = '#ef4444';
    } else {
        el.style.color = 'inherit';
    }
}

/** Active/désactive un bouton avec un spinner */
function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    const textSpan = btn.querySelector('.btn-text');
    const spinnerSpan = btn.querySelector('.spinner');
    if (isLoading) {
        btn.disabled = true;
        if (textSpan) textSpan.style.display = 'none';
        if (spinnerSpan) spinnerSpan.style.display = 'inline';
    } else {
        btn.disabled = false;
        if (textSpan) textSpan.style.display = 'inline';
        if (spinnerSpan) spinnerSpan.style.display = 'none';
    }
}

/** Fetch avec timeout */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
            throw new Error('La requête a expiré (timeout)');
        }
        throw err;
    }
}

// =======================
// ANALYSE D'UN TOKEN
// =======================

async function scanToken() {
    const input = document.getElementById('tokenUrl');
    if (!input) return;

    const url = input.value.trim();
    if (!url) {
        showToast('📌 Colle un lien DexScreener ou une adresse Solana', 'warning');
        return;
    }

    const token = extractTokenAddress(url);
    if (!token) {
        showToast('❌ Adresse Solana invalide', 'error');
        return;
    }

    const scanBtn = document.getElementById('scanBtn');
    const latencyEl = document.getElementById('latencyInfo');

    setButtonLoading(scanBtn, true);
    updateElement('latencyInfo', '');
    updateElement('signal', '⏳ Analyse AI en cours...');
    updateElement('score', '...');

    // Paramètres
    const analysisMode = document.querySelector('input[name="analysisMode"]:checked')?.value || 'fast';
    const checkExec = document.getElementById('checkExecution')?.checked;
    const execSize = parseInt(document.getElementById('execSize')?.value) || 1000;

    let apiUrl = `${WORKER_URL}/?token=${encodeURIComponent(token)}&analysis=${analysisMode}`;
    if (checkExec) {
        apiUrl += `&execution=true&execSize=${execSize}`;
    }

    const startTime = performance.now();

    try {
        const response = await fetchWithTimeout(apiUrl);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        const data = await response.json();
        const latency = Math.round(performance.now() - startTime);
        updateElement('latencyInfo', `⏱️ Latence totale : ${latency} ms`);

        if (data.error) {
            showToast('⚠️ ' + data.error, 'error');
            updateElement('signal', '❌ Erreur');
            return;
        }

        // Badge mode d'analyse
        const badge = document.getElementById('analysisModeBadge');
        if (badge) {
            badge.textContent = analysisMode === 'institutional' ? '🔬 Institutionnel' : '⚡ Rapide';
            badge.style.display = 'inline-block';
        }

        // ---------- SCORE ----------
        const score = getSafe(data, 'score', getSafe(data, 'scores.final', 0));
        updateElement('score', score + '/100');
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.style.color = score >= 75 ? '#22c55e' : score >= 55 ? '#eab308' : '#ef4444';

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

        // ---------- MARKET ----------
        const liquidity = getSafe(data, 'market.liquidity', getSafe(data, 'liquidity', 0));
        const volume = getSafe(data, 'market.volume', getSafe(data, 'volume', 0));
        const marketCap = getSafe(data, 'market.marketCap', getSafe(data, 'marketCap', 0));
        const holders = getSafe(data, 'holders', getSafe(data, 'holdersDetail.count', null));
        const whaleRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'UNKNOWN'));
        const rugRisk = getSafe(data, 'rug', getSafe(data, 'security.rugRisk', getSafe(data, 'rugRisk', 'N/D')));
        const buys = getSafe(data, 'buys', 0);
        const sells = getSafe(data, 'sells', 0);

        // Âge
        const createdAt = getSafe(data, 'token.createdAt', null);
        const ageDays = getSafe(data, 'token.ageDays', null);
        let ageText = 'N/A';
        if (ageDays !== null && ageDays !== undefined) {
            if (ageDays < 1) ageText = '< 1 jour';
            else if (ageDays === 1) ageText = '1 jour';
            else ageText = ageDays + ' jours';
        } else if (createdAt) {
            const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
            if (days < 1) ageText = '< 1 jour';
            else if (days === 1) ageText = '1 jour';
            else ageText = days + ' jours';
        }

        updateElement('liquidity', formatNumber(liquidity, "currency"));
        updateElement('volume', formatNumber(volume, "currency"));
        updateElement('marketCap', formatNumber(marketCap, "compact"));
        updateElement('holders', (holders !== null && holders > 0) ? holders.toLocaleString() : 'N/A');
        updateElement('whales', whaleRisk === 'UNKNOWN' ? 'Non évalué' : whaleRisk);
        updateElement('rug', (rugRisk === 'N/D' || rugRisk === 'UNKNOWN' || !rugRisk) ? 'Non évalué' : rugRisk);
        updateElement('buyCount', buys.toLocaleString());
        updateElement('sellCount', sells.toLocaleString());
        updateElement('tokenAge', ageText);
        updateElement('dataQuality', getSafe(data, 'dataQuality', 'N/A'));

        // ---------- SECURITY ----------
        const mint = getSafe(data, 'security.mint', getSafe(data, 'mintStatus', 'N/D'));
        const freeze = getSafe(data, 'security.freeze', getSafe(data, 'freezeStatus', 'N/D'));
        const lpLock = getSafe(data, 'security.lpLock', getSafe(data, 'lpLocked', 'N/D'));
        const holderRisk = getSafe(data, 'whaleRisk', getSafe(data, 'holdersDetail.whaleRisk', 'N/D'));

        updateElement('mint', mint);
        updateElement('freeze', freeze);
        updateElement('lpLock', lpLock === true ? 'OUI' : lpLock === false ? 'NON' : 'N/D');
        updateElement('holderRisk', holderRisk === 'UNKNOWN' ? 'Non évalué' : holderRisk);
        setColor('mint', mint);
        setColor('freeze', freeze);

        // ---------- SMART MONEY ----------
        const smartMoneyScore = getSafe(data, 'smartMoneyDetail.score', getSafe(data, 'smartMoney', 0));
        const wallets = getSafe(data, 'smartMoneyDetail.walletsDetected', []);
        let smartHtml = '';
        if (wallets.length > 0) {
            smartHtml = wallets.map(w => {
                const sourceIcon = w.source === 'verified' ? '✅' : '🔍';
                return `${sourceIcon} ${w.label || 'Wallet'} (${w.percent}%) - confiance ${w.confidence}%`;
            }).join('<br>');
            smartHtml += `<br>Score total : ${smartMoneyScore}/100`;
        } else {
            smartHtml = 'Aucun smart wallet détecté.';
        }
        setElementHTML('smartMoney', smartHtml);

        // ---------- ALERT ----------
        updateElement('alert', alertMsg || 'Aucune alerte');

        // Méta Signal
        const signalMeta = data.signalMeta;
        updateElement('signalMode', signalMeta?.entryMode || 'N/A');
        updateElement('signalTimestamp', signalMeta?.signalTimestamp ? new Date(signalMeta.signalTimestamp).toLocaleString() : 'N/A');

        // ---------- EXÉCUTION ----------
        const exec = data.execution;
        const execSection = document.getElementById('executionSection');
        const execDetails = document.getElementById('executionDetails');
        if (exec && execSection && execDetails) {
            let execHtml = '';
            if (exec.available) {
                const route = exec.route?.join(' → ') || 'N/A';
                const impact = exec.priceImpactPct != null ? exec.priceImpactPct + '%' : 'N/A';
                const slippage = exec.estimatedSlippage != null ? exec.estimatedSlippage + '%' : 'N/A';
                execHtml = `💱 Route : ${route}<br>📉 Impact prix : ${impact}<br>📊 Slippage estimé : ${slippage}`;
            } else {
                execHtml = '⚠️ Aucune route disponible (liquidité insuffisante ?)';
            }
            execDetails.innerHTML = execHtml;
            execSection.style.display = 'block';
        } else if (execSection) {
            execSection.style.display = 'none';
        }

        // ---------- RULES ----------
        const liq = Number(liquidity);
        const vol = Number(volume);
        const isSecure = (mint === 'REVOKED' || mint === 'SAFE') && (freeze === 'REVOKED' || freeze === 'SAFE');
        updateElement('ruleLiquidity', liq > 30000 ? '✅ Liquidité suffisante' : liq > 10000 ? '🟡 Liquidité moyenne' : '❌ Liquidité faible');
        updateElement('ruleVolume', vol > 100000 ? '✅ Volume en croissance' : vol > 50000 ? '🟡 Volume modéré' : '❌ Volume faible');
        updateElement('ruleSecurity', isSecure ? '✅ Sécurité contrat vérifiée' : '⚠️ Contrat à vérifier');

    } catch (error) {
        console.error('Erreur scan :', error);
        updateElement('signal', '❌ Erreur de connexion');
        updateElement('latencyInfo', '');
        showToast('❌ ' + error.message, 'error');
    } finally {
        setButtonLoading(scanBtn, false);
    }
}

// =======================
// SCAN NOUVEAUX TOKENS
// =======================

async function scanNewTokens() {
    const status = document.getElementById('scannerStatus');
    const results = document.getElementById('results');
    const newScanBtn = document.getElementById('newScanBtn');

    setButtonLoading(newScanBtn, true);

    try {
        if (status) status.textContent = '⏳ Recherche nouveaux Solana Gems...';
        if (results) results.innerHTML = '<p>🔍 Scan en cours...</p>';

        const response = await fetchWithTimeout(`${WORKER_URL}/?mode=new`);
        const data = await response.json();

        if (data.error) {
            showToast('⚠️ ' + data.error, 'error');
            if (status) status.textContent = '❌ Erreur scan';
            return;
        }

        if (!data.tokens || data.tokens.length === 0) {
            if (results) results.innerHTML = '<p>😕 Aucun nouveau token détecté</p>';
            if (status) status.textContent = '✅ Scan terminé : 0 token';
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
        if (status) status.textContent = `✅ Scan terminé : ${data.tokens.length} tokens analysés`;

    } catch (error) {
        console.error('New tokens scan error:', error);
        if (status) status.textContent = '❌ Erreur scanner automatique';
        if (results) results.innerHTML = '<p>⚠️ Impossible de récupérer les données</p>';
        showToast('❌ ' + error.message, 'error');
    } finally {
        setButtonLoading(newScanBtn, false);
    }
}

// =======================
// INITIALISATION
// =======================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Richy Hunter AI Frontend chargé (v6.1)");

    // Validation avec la touche Entrée
    const input = document.getElementById('tokenUrl');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                scanToken();
            }
        });
    }

    // Liaison des boutons (plus robuste qu'un onclick inline)
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', scanToken);
    }
    const newScanBtn = document.getElementById('newScanBtn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', scanNewTokens);
    }
});
