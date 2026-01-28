// Berra's Game Hub - Navigation
// ============================================================================

const Hub = {
    currentGame: null,
    
    init() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                this.showGame(game);
            });
        });
        
        // Back buttons
        document.querySelectorAll('[data-back]').forEach(btn => {
            btn.addEventListener('click', () => this.showHub());
        });
    },
    
    showGame(game) {
        document.getElementById('hub').classList.add('hidden');
        
        if (game === 'yatzy') {
            document.getElementById('yatzy-game').classList.remove('hidden');
            if (typeof Yatzy !== 'undefined') Yatzy.reset();
        } else if (game === 'blackjack') {
            document.getElementById('blackjack-game').classList.remove('hidden');
            if (typeof Blackjack !== 'undefined') Blackjack.reset();
        }
        
        this.currentGame = game;
    },
    
    showHub() {
        document.querySelectorAll('.game-container').forEach(el => {
            el.classList.add('hidden');
        });
        document.getElementById('hub').classList.remove('hidden');
        this.currentGame = null;
    }
};

document.addEventListener('DOMContentLoaded', () => Hub.init());
