// Berra's Blackjack - Game Logic
// Built with ⚡

const Blackjack = (() => {
    // ========================================================================
    // GAME STATE
    // ========================================================================
    
    const state = {
        deck: [],
        playerHand: [],
        dealerHand: [],
        chips: 1000,
        bet: 0,
        gamePhase: 'betting', // betting | playing | ended
        dealerHidden: true
    };
    
    // ========================================================================
    // DECK & CARDS
    // ========================================================================
    
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    function createDeck() {
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank });
            }
        }
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    function getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        if (card.rank === 'A') return 11;
        return parseInt(card.rank);
    }
    
    function calculateHand(hand) {
        let value = 0;
        let aces = 0;
        
        for (const card of hand) {
            value += getCardValue(card);
            if (card.rank === 'A') aces++;
        }
        
        // Adjust for aces
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    function isBlackjack(hand) {
        return hand.length === 2 && calculateHand(hand) === 21;
    }
    
    // ========================================================================
    // CARD RENDERING
    // ========================================================================
    
    function renderCard(card, hidden = false) {
        if (hidden) {
            return `<div class="card card-back">🂠</div>`;
        }
        
        const isRed = ['♥', '♦'].includes(card.suit);
        const colorClass = isRed ? 'red' : 'black';
        
        return `
            <div class="card ${colorClass}">
                <div class="card-corner top">${card.rank}${card.suit}</div>
                <div class="card-center">${card.suit}</div>
                <div class="card-corner bottom">${card.rank}${card.suit}</div>
            </div>
        `;
    }
    
    function renderHand(hand, containerId, hideFirst = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = hand.map((card, i) => 
            renderCard(card, hideFirst && i === 0)
        ).join('');
    }
    
    // ========================================================================
    // UI UPDATE
    // ========================================================================
    
    function updateUI() {
        // Chips & bet
        const chipsEl = document.getElementById('chips');
        const betEl = document.getElementById('current-bet');
        if (chipsEl) chipsEl.textContent = state.chips;
        if (betEl) betEl.textContent = state.bet;
        
        // Hands
        renderHand(state.dealerHand, 'dealer-cards', state.dealerHidden);
        renderHand(state.playerHand, 'player-cards');
        
        // Scores
        const dealerScoreEl = document.getElementById('dealer-score');
        const playerScoreEl = document.getElementById('player-score');
        
        if (dealerScoreEl) {
            if (state.dealerHidden && state.dealerHand.length > 0) {
                dealerScoreEl.textContent = `(${getCardValue(state.dealerHand[1])})`;
            } else if (state.dealerHand.length > 0) {
                dealerScoreEl.textContent = `(${calculateHand(state.dealerHand)})`;
            } else {
                dealerScoreEl.textContent = '';
            }
        }
        
        if (playerScoreEl) {
            playerScoreEl.textContent = state.playerHand.length > 0 
                ? `(${calculateHand(state.playerHand)})` 
                : '';
        }
        
        // Controls visibility
        const bettingControls = document.getElementById('betting-controls');
        const gameControls = document.getElementById('game-controls');
        const newRoundBtn = document.getElementById('new-round-btn');
        
        if (bettingControls) bettingControls.classList.toggle('hidden', state.gamePhase !== 'betting');
        if (gameControls) gameControls.classList.toggle('hidden', state.gamePhase !== 'playing');
        if (newRoundBtn) newRoundBtn.classList.toggle('hidden', state.gamePhase !== 'ended');
        
        // Deal button
        const dealBtn = document.getElementById('deal-btn');
        if (dealBtn) dealBtn.disabled = state.bet === 0;
        
        // Double button - only enabled if player has enough chips
        const doubleBtn = document.getElementById('double-btn');
        if (doubleBtn) {
            doubleBtn.disabled = state.chips < state.bet || state.playerHand.length !== 2;
        }
    }
    
    function showMessage(text, type = 'info') {
        const msgEl = document.getElementById('blackjack-message');
        if (!msgEl) return;
        
        msgEl.textContent = text;
        msgEl.className = `game-message ${type}`;
        msgEl.classList.remove('hidden');
    }
    
    function hideMessage() {
        const msgEl = document.getElementById('blackjack-message');
        if (msgEl) msgEl.classList.add('hidden');
    }
    
    // ========================================================================
    // BETTING
    // ========================================================================
    
    function addBet(amount) {
        if (state.gamePhase !== 'betting') return;
        if (state.chips < amount) return;
        
        state.chips -= amount;
        state.bet += amount;
        updateUI();
    }
    
    function clearBet() {
        if (state.gamePhase !== 'betting') return;
        
        state.chips += state.bet;
        state.bet = 0;
        updateUI();
    }
    
    // ========================================================================
    // GAME ACTIONS
    // ========================================================================
    
    function deal() {
        if (state.gamePhase !== 'betting' || state.bet === 0) return;
        
        hideMessage();
        state.deck = createDeck();
        state.playerHand = [state.deck.pop(), state.deck.pop()];
        state.dealerHand = [state.deck.pop(), state.deck.pop()];
        state.dealerHidden = true;
        state.gamePhase = 'playing';
        
        updateUI();
        
        // Check for blackjacks
        if (isBlackjack(state.playerHand)) {
            state.dealerHidden = false;
            if (isBlackjack(state.dealerHand)) {
                endRound('push', 'Both Blackjack! Push.');
            } else {
                endRound('blackjack', 'Blackjack! You win 3:2!');
            }
        } else if (isBlackjack(state.dealerHand)) {
            state.dealerHidden = false;
            endRound('lose', 'Dealer Blackjack! You lose.');
        }
    }
    
    function hit() {
        if (state.gamePhase !== 'playing') return;
        
        state.playerHand.push(state.deck.pop());
        const playerValue = calculateHand(state.playerHand);
        
        updateUI();
        
        if (playerValue > 21) {
            state.dealerHidden = false;
            endRound('lose', 'Bust! You lose.');
        } else if (playerValue === 21) {
            stand();
        }
    }
    
    function stand() {
        if (state.gamePhase !== 'playing') return;
        
        state.dealerHidden = false;
        
        // Dealer draws
        while (calculateHand(state.dealerHand) < 17) {
            state.dealerHand.push(state.deck.pop());
        }
        
        const playerValue = calculateHand(state.playerHand);
        const dealerValue = calculateHand(state.dealerHand);
        
        updateUI();
        
        if (dealerValue > 21) {
            endRound('win', 'Dealer busts! You win!');
        } else if (dealerValue > playerValue) {
            endRound('lose', `Dealer wins ${dealerValue} to ${playerValue}.`);
        } else if (playerValue > dealerValue) {
            endRound('win', `You win ${playerValue} to ${dealerValue}!`);
        } else {
            endRound('push', `Push! Both have ${playerValue}.`);
        }
    }
    
    function double() {
        if (state.gamePhase !== 'playing') return;
        if (state.chips < state.bet) return;
        if (state.playerHand.length !== 2) return;
        
        state.chips -= state.bet;
        state.bet *= 2;
        
        // Take one card and stand
        state.playerHand.push(state.deck.pop());
        const playerValue = calculateHand(state.playerHand);
        
        updateUI();
        
        if (playerValue > 21) {
            state.dealerHidden = false;
            endRound('lose', 'Bust! You lose.');
        } else {
            stand();
        }
    }
    
    // ========================================================================
    // ROUND END
    // ========================================================================
    
    function endRound(result, message) {
        state.gamePhase = 'ended';
        
        if (result === 'win') {
            state.chips += state.bet * 2;
            showMessage(message, 'win');
        } else if (result === 'blackjack') {
            state.chips += Math.floor(state.bet * 2.5);
            showMessage(message, 'win');
        } else if (result === 'push') {
            state.chips += state.bet;
            showMessage(message, 'push');
        } else {
            showMessage(message, 'lose');
        }
        
        state.bet = 0;
        updateUI();
        
        // Check if player is broke
        if (state.chips <= 0) {
            setTimeout(() => {
                showMessage('You\'re out of chips! Starting fresh...', 'lose');
                state.chips = 1000;
                updateUI();
            }, 2000);
        }
    }
    
    function newRound() {
        state.playerHand = [];
        state.dealerHand = [];
        state.dealerHidden = true;
        state.gamePhase = 'betting';
        hideMessage();
        updateUI();
    }
    
    // ========================================================================
    // RESET & INIT
    // ========================================================================
    
    function reset() {
        state.deck = [];
        state.playerHand = [];
        state.dealerHand = [];
        state.chips = 1000;
        state.bet = 0;
        state.gamePhase = 'betting';
        state.dealerHidden = true;
        hideMessage();
        updateUI();
    }
    
    function init() {
        // Chip buttons
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', () => addBet(parseInt(btn.dataset.chip)));
        });
        
        // Action buttons
        const clearBetBtn = document.getElementById('clear-bet-btn');
        const dealBtn = document.getElementById('deal-btn');
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const doubleBtn = document.getElementById('double-btn');
        const newRoundBtn = document.getElementById('new-round-btn');
        
        if (clearBetBtn) clearBetBtn.addEventListener('click', clearBet);
        if (dealBtn) dealBtn.addEventListener('click', deal);
        if (hitBtn) hitBtn.addEventListener('click', hit);
        if (standBtn) standBtn.addEventListener('click', stand);
        if (doubleBtn) doubleBtn.addEventListener('click', double);
        if (newRoundBtn) newRoundBtn.addEventListener('click', newRound);
        
        updateUI();
    }
    
    document.addEventListener('DOMContentLoaded', init);
    
    return { reset };
})();
