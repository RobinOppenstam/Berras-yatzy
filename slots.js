// Berra's Slots - Game Logic
// Built with ⚡

const Slots = (() => {
    // ========================================================================
    // GAME STATE
    // ========================================================================
    
    const state = {
        credits: 1000,
        bet: 10,
        spinning: false,
        reels: [0, 0, 0],
        winLines: []
    };
    
    // ========================================================================
    // SYMBOLS & PAYOUTS
    // ========================================================================
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣', '💎'];
    
    // Weights for each symbol (lower index = more common)
    const weights = [25, 20, 18, 15, 12, 7, 3]; // Total: 100
    
    // Payouts for 3 matching symbols (multiplier of bet)
    const payouts = {
        '🍒': 2,
        '🍋': 3,
        '🍊': 4,
        '🍇': 6,
        '⭐': 10,
        '7️⃣': 25,
        '💎': 50
    };
    
    // Special payouts
    const specialPayouts = {
        'any2_cherry': 1,  // 2 cherries anywhere = 1x
        'any_seven': 2     // Any 7 in line = 2x
    };
    
    // ========================================================================
    // HELPERS
    // ========================================================================
    
    function getRandomSymbol() {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) return i;
        }
        return 0;
    }
    
    function calculateWin(reels) {
        const symbolsOnReels = reels.map(i => symbols[i]);
        let winAmount = 0;
        let winType = null;
        
        // Check for 3 of a kind
        if (symbolsOnReels[0] === symbolsOnReels[1] && symbolsOnReels[1] === symbolsOnReels[2]) {
            winAmount = state.bet * payouts[symbolsOnReels[0]];
            winType = `3x ${symbolsOnReels[0]}`;
        }
        // Check for 2 of a kind (first two or last two)
        else if (symbolsOnReels[0] === symbolsOnReels[1]) {
            winAmount = Math.floor(state.bet * payouts[symbolsOnReels[0]] * 0.2);
            winType = `2x ${symbolsOnReels[0]}`;
        }
        else if (symbolsOnReels[1] === symbolsOnReels[2]) {
            winAmount = Math.floor(state.bet * payouts[symbolsOnReels[1]] * 0.2);
            winType = `2x ${symbolsOnReels[1]}`;
        }
        // Check for any 7
        else if (symbolsOnReels.includes('7️⃣')) {
            winAmount = state.bet * specialPayouts.any_seven;
            winType = 'Lucky 7!';
        }
        // Check for 2 cherries anywhere
        else if (symbolsOnReels.filter(s => s === '🍒').length >= 2) {
            winAmount = state.bet * specialPayouts.any2_cherry;
            winType = '2x 🍒';
        }
        
        return { winAmount, winType };
    }
    
    // ========================================================================
    // RENDERING
    // ========================================================================
    
    function renderReels(finalReels = null, spinning = false) {
        const reelEls = document.querySelectorAll('.slots-reel');
        
        reelEls.forEach((reel, index) => {
            if (spinning) {
                // Show spinning animation with random symbols
                reel.classList.add('spinning');
                reel.innerHTML = `
                    <div class="reel-strip">
                        ${symbols.map(s => `<div class="reel-symbol">${s}</div>`).join('')}
                    </div>
                `;
            } else {
                reel.classList.remove('spinning');
                const symbolIndex = finalReels ? finalReels[index] : state.reels[index];
                reel.innerHTML = `<div class="reel-symbol final">${symbols[symbolIndex]}</div>`;
            }
        });
    }
    
    function updateUI() {
        const creditsEl = document.getElementById('slots-credits');
        const betEl = document.getElementById('slots-bet');
        const spinBtn = document.getElementById('spin-btn');
        
        if (creditsEl) creditsEl.textContent = state.credits;
        if (betEl) betEl.textContent = state.bet;
        if (spinBtn) {
            spinBtn.disabled = state.spinning || state.credits < state.bet;
        }
        
        // Update bet buttons
        document.querySelectorAll('.bet-btn').forEach(btn => {
            const action = btn.dataset.bet;
            if (action === 'decrease') {
                btn.disabled = state.bet <= 10 || state.spinning;
            } else if (action === 'increase') {
                btn.disabled = state.bet >= 100 || state.spinning || state.bet >= state.credits;
            }
        });
    }
    
    function showMessage(text, type = 'info') {
        const msgEl = document.getElementById('slots-message');
        if (!msgEl) return;
        
        msgEl.textContent = text;
        msgEl.className = `slots-message ${type}`;
        msgEl.classList.remove('hidden');
        
        if (type !== 'spinning') {
            setTimeout(() => {
                msgEl.classList.add('hidden');
            }, 2500);
        }
    }
    
    function hideMessage() {
        const msgEl = document.getElementById('slots-message');
        if (msgEl) msgEl.classList.add('hidden');
    }
    
    // ========================================================================
    // GAME ACTIONS
    // ========================================================================
    
    function changeBet(direction) {
        if (state.spinning) return;
        
        if (direction === 'increase' && state.bet < 100 && state.bet < state.credits) {
            state.bet += 10;
        } else if (direction === 'decrease' && state.bet > 10) {
            state.bet -= 10;
        }
        
        updateUI();
    }
    
    function spin() {
        if (state.spinning || state.credits < state.bet) return;
        
        state.spinning = true;
        state.credits -= state.bet;
        hideMessage();
        updateUI();
        
        // Start spinning animation
        renderReels(null, true);
        showMessage('Spinning...', 'spinning');
        
        // Generate final results
        const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        // Stop reels one by one
        setTimeout(() => stopReel(0, finalReels), 600);
        setTimeout(() => stopReel(1, finalReels), 1000);
        setTimeout(() => stopReel(2, finalReels), 1400);
        
        // Calculate and show result
        setTimeout(() => {
            state.reels = finalReels;
            state.spinning = false;
            
            const { winAmount, winType } = calculateWin(finalReels);
            
            if (winAmount > 0) {
                state.credits += winAmount;
                showMessage(`${winType} — Won $${winAmount}!`, 'win');
                highlightWin();
            } else {
                showMessage('Try again!', 'lose');
            }
            
            updateUI();
            
            // Check if broke
            if (state.credits < state.bet && state.credits > 0) {
                state.bet = Math.min(state.bet, Math.floor(state.credits / 10) * 10 || 10);
                if (state.credits < 10) {
                    setTimeout(() => {
                        showMessage('Out of credits! Have some more...', 'info');
                        state.credits = 1000;
                        state.bet = 10;
                        updateUI();
                    }, 1500);
                }
            } else if (state.credits <= 0) {
                setTimeout(() => {
                    showMessage('Out of credits! Have some more...', 'info');
                    state.credits = 1000;
                    state.bet = 10;
                    updateUI();
                }, 1500);
            }
        }, 1600);
    }
    
    function stopReel(index, finalReels) {
        const reelEl = document.querySelectorAll('.slots-reel')[index];
        if (!reelEl) return;
        
        reelEl.classList.remove('spinning');
        reelEl.innerHTML = `<div class="reel-symbol final">${symbols[finalReels[index]]}</div>`;
    }
    
    function highlightWin() {
        const reelEls = document.querySelectorAll('.slots-reel');
        reelEls.forEach(reel => reel.classList.add('winner'));
        
        setTimeout(() => {
            reelEls.forEach(reel => reel.classList.remove('winner'));
        }, 1500);
    }
    
    // ========================================================================
    // RESET & INIT
    // ========================================================================
    
    function reset() {
        state.credits = 1000;
        state.bet = 10;
        state.spinning = false;
        state.reels = [0, 0, 0];
        hideMessage();
        renderReels();
        updateUI();
    }
    
    function init() {
        // Spin button
        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn) spinBtn.addEventListener('click', spin);
        
        // Bet buttons
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', () => changeBet(btn.dataset.bet));
        });
        
        renderReels();
        updateUI();
    }
    
    document.addEventListener('DOMContentLoaded', init);
    
    return { reset };
})();
