// Berra's Yatzy - Game Logic
// Built with the Ralph pattern ⚡

const Yatzy = (() => {
    // ========================================================================
    // GAME STATE
    // ========================================================================
    
    const state = {
        dice: [1, 1, 1, 1, 1],
        held: [false, false, false, false, false],
        rollsLeft: 3,
        scores: {},
        gameOver: false
    };
    
    // ========================================================================
    // SCORING CATEGORIES
    // ========================================================================
    
    const categories = {
        // Upper Section
        ones: { name: 'Ones', section: 'upper', calc: (dice) => sumOfValue(dice, 1) },
        twos: { name: 'Twos', section: 'upper', calc: (dice) => sumOfValue(dice, 2) },
        threes: { name: 'Threes', section: 'upper', calc: (dice) => sumOfValue(dice, 3) },
        fours: { name: 'Fours', section: 'upper', calc: (dice) => sumOfValue(dice, 4) },
        fives: { name: 'Fives', section: 'upper', calc: (dice) => sumOfValue(dice, 5) },
        sixes: { name: 'Sixes', section: 'upper', calc: (dice) => sumOfValue(dice, 6) },
        
        // Lower Section
        threeOfKind: { name: 'Three of a Kind', section: 'lower', calc: (dice) => hasNOfKind(dice, 3) ? sum(dice) : 0 },
        fourOfKind: { name: 'Four of a Kind', section: 'lower', calc: (dice) => hasNOfKind(dice, 4) ? sum(dice) : 0 },
        fullHouse: { name: 'Full House', section: 'lower', calc: (dice) => isFullHouse(dice) ? 25 : 0 },
        smallStraight: { name: 'Small Straight', section: 'lower', calc: (dice) => isSmallStraight(dice) ? 30 : 0 },
        largeStraight: { name: 'Large Straight', section: 'lower', calc: (dice) => isLargeStraight(dice) ? 40 : 0 },
        yahtzee: { name: 'Yahtzee', section: 'lower', calc: (dice) => hasNOfKind(dice, 5) ? 50 : 0 },
        chance: { name: 'Chance', section: 'lower', calc: (dice) => sum(dice) }
    };
    
    // ========================================================================
    // SCORING HELPERS
    // ========================================================================
    
    function sum(dice) {
        return dice.reduce((a, b) => a + b, 0);
    }
    
    function sumOfValue(dice, value) {
        return dice.filter(d => d === value).length * value;
    }
    
    function getCounts(dice) {
        const counts = {};
        dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
        return counts;
    }
    
    function hasNOfKind(dice, n) {
        const counts = getCounts(dice);
        return Object.values(counts).some(c => c >= n);
    }
    
    function isFullHouse(dice) {
        const counts = Object.values(getCounts(dice));
        return counts.includes(3) && counts.includes(2);
    }
    
    function isSmallStraight(dice) {
        const unique = [...new Set(dice)].sort();
        const straights = ['1234', '2345', '3456'];
        return straights.some(s => {
            const chars = s.split('');
            return chars.every(c => unique.includes(parseInt(c)));
        });
    }
    
    function isLargeStraight(dice) {
        const sorted = [...dice].sort().join('');
        return sorted === '12345' || sorted === '23456';
    }
    
    function calculateUpperBonus() {
        const upperCategories = Object.keys(categories).filter(k => categories[k].section === 'upper');
        const upperTotal = upperCategories.reduce((sum, key) => {
            return sum + (state.scores[key] ?? 0);
        }, 0);
        return upperTotal >= 63 ? 35 : 0;
    }
    
    function calculateTotal() {
        const scoreSum = Object.values(state.scores).reduce((a, b) => a + b, 0);
        return scoreSum + calculateUpperBonus();
    }
    
    // ========================================================================
    // DICE RENDERING
    // ========================================================================
    
    const dotPatterns = {
        1: [false, false, false, false, true, false, false, false, false],
        2: [true, false, false, false, false, false, false, false, true],
        3: [true, false, false, false, true, false, false, false, true],
        4: [true, false, true, false, false, false, true, false, true],
        5: [true, false, true, false, true, false, true, false, true],
        6: [true, false, true, true, false, true, true, false, true]
    };
    
    function renderDie(value, index) {
        const pattern = dotPatterns[value];
        const heldClass = state.held[index] ? 'held' : '';
        const dots = pattern.map(show => 
            show ? '<div class="dot"></div>' : '<div></div>'
        ).join('');
        
        return `<div class="die ${heldClass}" data-index="${index}">${dots}</div>`;
    }
    
    function renderDice() {
        const container = document.getElementById('dice-container');
        if (!container) return;
        container.innerHTML = state.dice.map((value, index) => renderDie(value, index)).join('');
        
        container.querySelectorAll('.die').forEach(die => {
            die.addEventListener('click', () => toggleHold(parseInt(die.dataset.index)));
        });
    }
    
    // ========================================================================
    // SCORECARD RENDERING
    // ========================================================================
    
    function renderScorecard() {
        const scorecard = document.getElementById('scorecard');
        if (!scorecard) return;
        let html = '';
        
        html += `<div class="score-row section-header"><span class="category">Upper Section</span><span class="score"></span></div>`;
        
        Object.keys(categories).filter(k => categories[k].section === 'upper').forEach(key => {
            html += renderScoreRow(key);
        });
        
        const upperBonus = calculateUpperBonus();
        const upperTotal = Object.keys(categories)
            .filter(k => categories[k].section === 'upper')
            .reduce((sum, key) => sum + (state.scores[key] ?? 0), 0);
        html += `<div class="score-row bonus-row locked"><span class="category">Bonus (63+ = 35)</span><span class="score">${upperTotal}/63 → ${upperBonus}</span></div>`;
        
        html += `<div class="score-row section-header"><span class="category">Lower Section</span><span class="score"></span></div>`;
        
        Object.keys(categories).filter(k => categories[k].section === 'lower').forEach(key => {
            html += renderScoreRow(key);
        });
        
        scorecard.innerHTML = html;
        
        scorecard.querySelectorAll('.score-row:not(.locked):not(.section-header)').forEach(row => {
            row.addEventListener('click', () => selectCategory(row.dataset.category));
        });
        
        const totalEl = document.getElementById('total-score');
        if (totalEl) totalEl.textContent = calculateTotal();
    }
    
    function renderScoreRow(key) {
        const category = categories[key];
        const isLocked = state.scores[key] !== undefined;
        const score = isLocked ? state.scores[key] : category.calc(state.dice);
        const lockedClass = isLocked ? 'locked' : '';
        
        return `<div class="score-row ${lockedClass}" data-category="${key}">
            <span class="category">${category.name}</span>
            <span class="score">${score}</span>
        </div>`;
    }
    
    // ========================================================================
    // GAME ACTIONS
    // ========================================================================
    
    function rollDice() {
        if (state.rollsLeft <= 0 || state.gameOver) return;
        
        state.dice = state.dice.map((value, index) => 
            state.held[index] ? value : Math.floor(Math.random() * 6) + 1
        );
        state.rollsLeft--;
        
        updateUI();
    }
    
    function toggleHold(index) {
        if (state.rollsLeft === 3 || state.gameOver) return;
        state.held[index] = !state.held[index];
        renderDice();
    }
    
    function selectCategory(key) {
        if (state.scores[key] !== undefined || state.rollsLeft === 3) return;
        
        state.scores[key] = categories[key].calc(state.dice);
        
        state.rollsLeft = 3;
        state.held = [false, false, false, false, false];
        state.dice = [1, 1, 1, 1, 1];
        
        if (Object.keys(state.scores).length === 13) {
            endGame();
        } else {
            updateUI();
        }
    }
    
    function endGame() {
        state.gameOver = true;
        const finalScoreEl = document.getElementById('yatzy-final-score');
        if (finalScoreEl) finalScoreEl.textContent = calculateTotal();
        const gameOverEl = document.getElementById('yatzy-game-over');
        if (gameOverEl) gameOverEl.classList.remove('hidden');
    }
    
    function reset() {
        state.dice = [1, 1, 1, 1, 1];
        state.held = [false, false, false, false, false];
        state.rollsLeft = 3;
        state.scores = {};
        state.gameOver = false;
        
        const gameOverEl = document.getElementById('yatzy-game-over');
        if (gameOverEl) gameOverEl.classList.add('hidden');
        updateUI();
    }
    
    // ========================================================================
    // UI UPDATE
    // ========================================================================
    
    function updateUI() {
        renderDice();
        renderScorecard();
        
        const rollsLeftEl = document.getElementById('rolls-left');
        if (rollsLeftEl) rollsLeftEl.textContent = `Rolls left: ${state.rollsLeft}`;
        
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) rollBtn.disabled = state.rollsLeft <= 0;
    }
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    function init() {
        const rollBtn = document.getElementById('roll-btn');
        const playAgainBtn = document.getElementById('yatzy-play-again-btn');
        
        if (rollBtn) rollBtn.addEventListener('click', rollDice);
        if (playAgainBtn) playAgainBtn.addEventListener('click', reset);
        
        updateUI();
    }
    
    document.addEventListener('DOMContentLoaded', init);
    
    return { reset };
})();
