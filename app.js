 // ============================================
// RICHY HUNTER AI - FRONTEND v4.4
// Compatible avec Worker v4.4 Stable Pro
// ============================================

const WORKER_URL = "https://richy-hunter-api.kenedykabori104.workers.dev";

// =======================
// EXTRACT TOKEN ADDRESS
// =======================
function extractTokenAddress(input) {
    // Si c'est déjà une adresse Solana (base58, ~32-44 caractères)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input)) {
        return input;
    }
    
    // Si c'est un lien DexScreener
    const match = input.match(/\/([1-9A-HJ-NP-Za-km-z]{32,44})(?:\?|$)/);
    if (match) {
        return match[1];
    }
    
    return null;
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

        // ======= SCORE =======
        const score = data.score || 0;
        document.getElementById('score').textContent = score + '/100';
        
        if (score >= 75) {
            document.getElementById('score').style.color = '#22c55e';
        } else if (score >= 55) {
            document.getElementById('score').style.color = '#eab308';
        } else {
            document.getElementById('score').style.color = '#ef4444';
        }

        // ======= SIGNAL (basé sur l'alert du Worker) =======
        let signalText, signalClass;
        const alertMsg = data.alert || '';
        
        if (alertMsg.includes('HUNTER ENTRY') || score >= 75) {
            signalText = '🟢 HUNTER ENTRY';
            signalClass = 'hunter';
        } else if (alertMsg.includes('SURVEILLANCE') || score >= 55) {
            signalText = '🟡 SURVEILLANCE';
            signalClass = 'watch';
        } else if (alertMsg.includes('RISQUE ÉLEVÉ') || score >= 35) {
            signalText = '🟠 RISQUE ÉLEVÉ';
            signalClass = 'avoid';
        } else {
            signalText = '🔴 RUG WARNING';
            signalClass = 'avoid';
        }
        document.getElementById('signal').textContent = signalText;
        document.getElementById('signal').className = 'status ' + signalClass;

        // ======= MARKET DATA =======
        document.getElementById('liquidity').textContent = '$' + Number(data.liquidity || 0).toLocaleString();
        document.getElementById('volume').textContent = '$' + Number(data.volume || 0).toLocaleString();
        document.getElementById('holders').textContent = data.holders || 'N/D';
        document.getElementById('whales').textContent = data.whaleRisk || 'N/D';
        document.getElementById('rug').textContent = data.rug || 'N/D';

        // ======= SECURITY =======
        document.getElementById('mint').textContent = data.mint || 'N/D';
        document.getElementById('freeze').textContent = data.freeze || 'N/D';
        document.getElementById('lpLock').textContent = data.lp || 'N/D';
        document.getElementById('holderRisk').textContent = data.holderRisk || 'N/D';

        // ======= SMART MONEY =======
        document.getElementById('smartMoney').textContent = data.smartMoney || 'Analyse Helius prochaine étape';

        // ======= ALERT =======
        document.getElementById('alert').textContent = data.alert || 'Aucune alerte';

        // ======= RULES =======
        const liquidity = Number(data.liquidity || 0);
        const volume = Number(data.volume || 0);

        document.getElementById('ruleLiquidity').textContent = 
            liquidity > 30000 ? '✅ Liquidité suffisante' : 
            liquidity > 10000 ? '🟡 Liquidité moyenne' : '❌ Liquidité faible';

        document.getElementById('ruleVolume').textContent = 
            volume > 100000 ? '✅ Volume en croissance' : 
            volume > 50000 ? '🟡 Volume modéré' : '❌ Volume faible';

        const isSecure = (data.mint === 'OFF') && (data.freeze === 'OFF');
        document.getElementById('ruleSecurity').textContent = 
            isSecure ? '✅ Sécurité contrat vérifiée' : '⚠️ Contrat à vérifier';

        // ======= SCORE BREAKDOWN (si disponible) =======
        if (data.scoreBreakdown) {
            console.log('Score Breakdown:', data.scoreBreakdown);
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
            const score = token.score || 0;
            const alertMsg = token.alert || '';
            let signal;
            
            if (alertMsg.includes('HUNTER ENTRY') || score >= 75) {
                signal = '🟢 Hunter Entry';
            } else if (alertMsg.includes('SURVEILLANCE') || score >= 55) {
                signal = '🟡 Watch';
            } else if (alertMsg.includes('RISQUE ÉLEVÉ') || score >= 35) {
                signal = '🟠 Risque Élevé';
            } else {
                signal = '🔴 RUG WARNING';
            }

            html += `
                <div class="card">
                    <h3>#${index + 1} ${token.name || 'Unknown'} (${token.symbol || ''})</h3>
                    <p>Score : <b>${score}/100</b></p>
                    <p>💰 Market Cap : $${Number(token.marketCap || 0).toLocaleString()}</p>
                    <p>💧 Liquidité : $${Number(token.liquidity || 0).toLocaleString()}</p>
                    <p>📈 Volume : $${Number(token.volume || 0).toLocaleString()}</p>
                    <p>🟢 Buy : ${token.buys || 0} | 🔴 Sell : ${token.sells || 0}</p>
                    <p>🔐 Mint: ${token.mint || 'N/D'} | Freeze: ${token.freeze || 'N/D'}</p>
                    <p><b>${signal}</b></p>
                </div>
            `;
        });

        results.innerHTML = html;
        status.innerHTML = `✅ Scan terminé : ${data.tokens.length} tokens analysés (${data.durationMs || 0}ms)`;

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
