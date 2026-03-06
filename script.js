class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.won = false;
        this.over = false;
        this.soundEnabled = true;
        this.difficulty = 'normal';
        this.history = [];
        this.maxHistoryLength = 10;
        this.combo = 0;
        this.lastMergeTime = 0;
        this.achievements = {
            firstWin: false,
            score1000: false,
            score5000: false,
            score10000: false,
            combo5: false,
            combo10: false,
            noUndoWin: false
        };
        
        // DOM elements
        this.tileContainer = document.getElementById('tile-container');
        this.particleContainer = document.getElementById('particle-container');
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.messageContainer = document.getElementById('game-message');
        this.scorePopup = document.getElementById('score-popup');
        this.undoButton = document.getElementById('undo-button');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.soundToggle = document.getElementById('sound-toggle');
        this.comboDisplay = document.getElementById('combo-display');
        this.achievementList = document.getElementById('achievement-list');
        
        // Sound elements
        this.moveSound = document.getElementById('move-sound');
        this.mergeSound = document.getElementById('merge-sound');
        this.winSound = document.getElementById('win-sound');
        this.loseSound = document.getElementById('lose-sound');
        
        this.init();
        this.setupEventListeners();
        this.setupSounds();
        this.loadAchievements();
        this.renderAchievements();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.combo = 0;
        this.history = [];
        this.updateScore();
        this.hideMessage();
        this.clearTiles();
        this.clearParticles();
        this.updateUndoButton();
        
        // Add initial tiles based on difficulty
        this.addRandomTile();
        if (this.difficulty === 'hard') {
            this.addRandomTile();
        } else if (this.difficulty === 'extreme') {
            this.addRandomTile();
            this.addRandomTile();
        } else {
            this.addRandomTile();
        }
        
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.over && !this.won) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.undo();
                    }
                    break;
            }
            
            if (moved) {
                this.sounds.move();
                this.addRandomTile();
                this.updateDisplay();
                this.checkAchievements();
                
                if (this.isWon() && !this.won) {
                    this.won = true;
                    this.sounds.win();
                    this.showMessage('You win!', 'game-won');
                    this.unlockAchievement('firstWin');
                    if (this.history.length === 0) {
                        this.unlockAchievement('noUndoWin');
                    }
                } else if (this.isGameOver()) {
                    this.over = true;
                    this.sounds.lose();
                    this.showMessage('Game over!', 'game-over');
                }
            }
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.init();
        });
        
        document.querySelector('.retry-button').addEventListener('click', () => {
            this.init();
        });
        
        this.undoButton.addEventListener('click', () => {
            this.undo();
        });
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.init();
        });
        
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Muted';
            this.soundToggle.classList.toggle('muted', !this.soundEnabled);
        });
    }
    
    setupSounds() {
        // Create simple sound effects using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate sounds
        this.sounds = {
            move: () => this.playTone(200, 0.1),
            merge: () => this.playTone(400, 0.15),
            win: () => this.playMelody([523, 659, 784], 0.2),
            lose: () => this.playMelody([392, 349, 330], 0.3)
        };
    }
    
    playTone(frequency, duration) {
        if (!this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMelody(frequencies, noteDuration) {
        if (!this.soundEnabled) return;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, noteDuration), index * noteDuration * 1000);
        });
    }
    
    saveHistory() {
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score,
            won: this.won,
            over: this.over
        });
        
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
        
        this.updateUndoButton();
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const previousState = this.history.pop();
        this.grid = previousState.grid;
        this.score = previousState.score;
        this.won = previousState.won;
        this.over = previousState.over;
        
        this.updateScore();
        this.updateDisplay();
        this.updateUndoButton();
        this.hideMessage();
    }
    
    updateUndoButton() {
        this.undoButton.disabled = this.history.length === 0;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.x][randomCell.y] = value;
            
            // Add spawn animation
            setTimeout(() => {
                this.createTile(value, randomCell.x, randomCell.y, true);
            }, 50);
        }
    }
    
    move(direction) {
        this.saveHistory();
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        let mergeCount = 0;
        
        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                const result = this.mergeRow(this.grid[i]);
                this.grid[i] = result.merged.concat(Array(this.size - result.merged.length).fill(0));
                mergeCount += result.mergeCount;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const result = this.mergeRow(this.grid[i].filter(val => val !== 0).reverse());
                this.grid[i] = Array(this.size - result.merged.length).fill(0).concat(result.merged.reverse());
                mergeCount += result.mergeCount;
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                const result = this.mergeRow(column);
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = result.merged[i] || 0;
                }
                mergeCount += result.mergeCount;
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                const result = this.mergeRow(column.reverse());
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = result.merged[this.size - 1 - i] || 0;
                }
                mergeCount += result.mergeCount;
            }
        }
        
        // Check if grid changed
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (previousGrid[i][j] !== this.grid[i][j]) {
                    moved = true;
                    break;
                }
            }
        }
        
        // Update combo system
        const currentTime = Date.now();
        if (mergeCount > 0) {
            if (currentTime - this.lastMergeTime < 2000) {
                this.combo += mergeCount;
            } else {
                this.combo = mergeCount;
            }
            this.lastMergeTime = currentTime;
            this.updateCombo();
        } else {
            this.combo = 0;
            this.updateCombo();
        }
        
        return moved;
    }
    
    mergeRow(row) {
        const merged = [];
        let mergeCount = 0;
        let i = 0;
        
        while (i < row.length) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
                const mergedValue = row[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue * (1 + Math.floor(this.combo / 3) * 0.5); // Combo bonus
                this.showScorePopup(mergedValue * (1 + Math.floor(this.combo / 3) * 0.5));
                this.createParticles(mergedValue);
                this.sounds.merge();
                mergeCount++;
                i += 2;
            } else {
                merged.push(row[i]);
                i++;
            }
        }
        
        return { merged, mergeCount };
    }
    
    updateCombo() {
        if (this.combo > 1) {
            this.comboDisplay.textContent = `${this.combo}x COMBO!`;
            this.comboDisplay.classList.add('active');
            
            if (this.combo >= 5) {
                this.unlockAchievement('combo5');
            }
            if (this.combo >= 10) {
                this.unlockAchievement('combo10');
            }
        } else {
            this.comboDisplay.textContent = '';
            this.comboDisplay.classList.remove('active');
        }
    }
    
    showScorePopup(points) {
        const popup = document.createElement('div');
        popup.textContent = `+${Math.floor(points)}`;
        popup.className = 'score-popup';
        this.scorePopup.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    createParticles(value) {
        const colors = {
            2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
            32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
            512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        
        const color = colors[value] || '#3c3a32';
        const particleCount = Math.min(value / 32, 10);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = color;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            const tilePosition = this.getTilePosition(2, 2); // Center position
            particle.style.left = `${tilePosition.x + 53}px`;
            particle.style.top = `${tilePosition.y + 53}px`;
            
            this.particleContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    clearParticles() {
        this.particleContainer.innerHTML = '';
    }
    
    isWon() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                // Check right
                if (j < this.size - 1 && current === this.grid[i][j + 1]) {
                    return false;
                }
                // Check down
                if (i < this.size - 1 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateDisplay() {
        this.clearTiles();
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(this.grid[i][j], i, j);
                }
            }
        }
        
        this.updateScore();
    }
    
    createTile(value, row, col, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (isNew) {
            tile.style.animation = 'appear 0.3s ease-out';
        }
        tile.textContent = value;
        
        if (value >= 2048) {
            tile.className += ' tile-super';
        }
        
        const position = this.getTilePosition(row, col);
        tile.style.left = position.x + 'px';
        tile.style.top = position.y + 'px';
        
        this.tileContainer.appendChild(tile);
    }
    
    getTilePosition(row, col) {
        const cellSize = 107;
        const gap = 15;
        return {
            x: col * (cellSize + gap),
            y: row * (cellSize + gap)
        };
    }
    
    clearTiles() {
        this.tileContainer.innerHTML = '';
    }
    
    updateScore() {
        this.scoreElement.textContent = Math.floor(this.score);
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', this.best);
        }
        this.bestElement.textContent = Math.floor(this.best);
        
        // Check score achievements
        if (this.score >= 1000) this.unlockAchievement('score1000');
        if (this.score >= 5000) this.unlockAchievement('score5000');
        if (this.score >= 10000) this.unlockAchievement('score10000');
    }
    
    showMessage(text, className) {
        this.messageContainer.querySelector('p').textContent = text;
        this.messageContainer.className = `game-message ${className}`;
        this.messageContainer.style.display = 'block';
    }
    
    hideMessage() {
        this.messageContainer.style.display = 'none';
    }
    
    // Achievement system
    unlockAchievement(id) {
        if (!this.achievements[id]) {
            this.achievements[id] = true;
            this.saveAchievements();
            this.renderAchievements();
            
            // Show achievement notification
            const achievement = this.getAchievementInfo(id);
            this.showAchievementNotification(achievement.name);
        }
    }
    
    getAchievementInfo(id) {
        const achievements = {
            firstWin: { name: 'First Win', description: 'Win your first game' },
            score1000: { name: 'Scorer', description: 'Reach 1000 points' },
            score5000: { name: 'High Scorer', description: 'Reach 5000 points' },
            score10000: { name: 'Master Scorer', description: 'Reach 10000 points' },
            combo5: { name: 'Combo Master', description: 'Achieve 5x combo' },
            combo10: { name: 'Combo Legend', description: 'Achieve 10x combo' },
            noUndoWin: { name: 'Perfect Run', description: 'Win without using undo' }
        };
        return achievements[id] || { name: 'Unknown', description: '' };
    }
    
    showAchievementNotification(name) {
        const notification = document.createElement('div');
        notification.textContent = `🏆 Achievement: ${name}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #edc22e;
            color: #f9f6f2;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    renderAchievements() {
        this.achievementList.innerHTML = '';
        
        Object.entries(this.achievements).forEach(([id, unlocked]) => {
            const achievement = this.getAchievementInfo(id);
            const element = document.createElement('div');
            element.className = `achievement ${unlocked ? 'unlocked' : ''}`;
            element.textContent = achievement.name;
            element.title = achievement.description;
            this.achievementList.appendChild(element);
        });
    }
    
    saveAchievements() {
        localStorage.setItem('achievements2048', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('achievements2048');
        if (saved) {
            this.achievements = JSON.parse(saved);
        }
    }
    
    checkAchievements() {
        // This is called after each move to check for any new achievements
    }
}

// Add slide animations for achievement notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
