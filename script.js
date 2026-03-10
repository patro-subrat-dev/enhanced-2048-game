class Enhanced2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.won = false;
        this.over = false;
        this.soundEnabled = true;
        this.musicEnabled = false;
        this.difficulty = 'normal';
        this.gameMode = 'classic';
        this.theme = 'classic';
        this.history = [];
        this.maxHistoryLength = 10;
        this.combo = 0;
        this.lastMergeTime = 0;
        this.timeLeft = 180; // 3 minutes for time attack
        this.timerInterval = null;
        this.moves = 0;
        this.tutorialStep = 0;
        this.powerUps = {
            bomb: 3,
            undoPlus: 3,
            multiplier: 2,
            shuffle: 1
        };
        this.activeMultiplier = 1;
        this.multiplierTimeout = null;
        
        // Statistics
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            totalMoves: 0,
            bestCombo: 0,
            achievements: 0
        };
        
        // Achievements
        this.achievements = {
            firstWin: false,
            score1000: false,
            score5000: false,
            score10000: false,
            combo5: false,
            combo10: false,
            noUndoWin: false,
            speedDemon: false, // Win time attack in under 2 minutes
            powerUser: false,
            themeCollector: false,
            modeMaster: false
        };
        
        // Tutorial steps
        this.tutorialSteps = [
            { title: "Welcome to Enhanced 2048!", content: "Use arrow keys to move tiles. When two tiles with the same number touch, they merge into one!" },
            { title: "How to Play", content: "The goal is to create a tile with the number 2048. You can also try different game modes and use power-ups!" },
            { title: "Game Modes", content: "Classic: Traditional 2048 gameplay. Time Attack: Race against time! Zen: No pressure, just relax." },
            { title: "Power-Ups", content: "Bomb: Clears tiles around highest value. Undo+: Extra undo moves. Multiplier: Double points. Shuffle: Rearrange board." },
            { title: "Achievements", content: "Unlock achievements by reaching milestones, winning games, and using different features!" },
            { title: "Tips & Tricks", content: "Keep your highest tile in a corner. Build chains of merges. Use power-ups strategically!" }
        ];
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.undoButton = document.getElementById('undo-button');
        this.difficultySelect = document.getElementById('difficulty');
        this.themeSelect = document.getElementById('theme');
        this.soundToggle = document.getElementById('sound-toggle');
        this.musicToggle = document.getElementById('music-toggle');
        this.tileContainer = document.getElementById('tile-container');
        this.messageContainer = document.getElementById('game-message');
        this.scorePopup = document.getElementById('score-popup');
        this.particleContainer = document.getElementById('particle-container');
        this.comboDisplay = document.getElementById('combo-display');
        this.powerDisplay = document.getElementById('power-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.timerValue = document.getElementById('timer-value');
        this.statsButton = document.getElementById('stats-button');
        this.tutorialButton = document.getElementById('tutorial-button');
        this.saveButton = document.getElementById('save-button');
        this.loadButton = document.getElementById('load-button');
        this.hintButton = document.getElementById('hint-button');
        this.achievementList = document.getElementById('achievement-list');
        this.statsModal = document.getElementById('stats-modal');
        this.tutorialOverlay = document.getElementById('tutorial-overlay');
        
        // Background music track
        this.musicTrack = new Audio();
        
        this.init();
        this.setupEventListeners();
        this.setupSounds();
        this.setupMusic();
        this.loadGameData();
        this.loadAchievements();
        this.loadStatistics();
        this.applyTheme();
        this.updateStatistics();
        this.renderAchievements();
        this.updatePowerUps();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.combo = 0;
        this.history = [];
        this.moves = 0;
        this.activeMultiplier = 1;
        
        if (this.multiplierTimeout) {
            clearTimeout(this.multiplierTimeout);
        }
        
        this.updateScore();
        this.hideMessage();
        this.clearTiles();
        this.clearParticles();
        this.updateUndoButton();
        this.updatePowerUps();
        
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
        
        // Start timer for time attack mode
        if (this.gameMode === 'time-attack') {
            this.startTimer();
        }
    }
    
    setupSounds() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.sounds = {
            move: () => this.playTone(200, 0.1),
            merge: () => this.playTone(400, 0.15),
            win: () => this.playMelody([523, 659, 784], 0.2),
            lose: () => this.playMelody([392, 349, 330], 0.3),
            powerUp: () => this.playMelody([440, 554, 659], 0.15),
            achievement: () => this.playMelody([523, 659, 784, 1047], 0.25)
        };
    }
    
    setupMusic() {
        // Create background music using Web Audio API
        this.createBackgroundMusic();
    }
    
    createBackgroundMusic() {
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        const duration = 0.5;
        
        let musicData = [];
        for (let i = 0; i < 32; i++) {
            const note = notes[i % notes.length];
            musicData.push({ frequency: note, startTime: i * duration, duration: duration * 0.8 });
        }
        
        // Store for later use
        this.backgroundMusicData = musicData;
    }
    
    playBackgroundMusic() {
        if (!this.musicEnabled || !this.backgroundMusicData) return;
        
        this.musicTrack.volume = 0.3;
        this.musicTrack.play();
    }
    
    stopBackgroundMusic() {
        this.musicTrack.pause();
        this.musicTrack.currentTime = 0;
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
    
    setupEventListeners() {
        // Keyboard controls
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
                this.moves++;
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
                    this.stopTimer();
                    this.updateStatsAfterGame(true);
                } else if (this.isGameOver()) {
                    this.over = true;
                    this.sounds.lose();
                    this.showMessage('Game over!', 'game-over');
                    this.stopTimer();
                    this.updateStatsAfterGame(false);
                }
            }
        });
        
        // Touch controls
        this.setupTouchControls();
        
        // Button controls
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
        
        this.themeSelect.addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.applyTheme();
            this.saveGameData();
        });
        
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Muted';
            this.soundToggle.classList.toggle('muted', !this.soundEnabled);
            this.saveGameData();
        });
        
        this.musicToggle.addEventListener('click', () => {
            this.musicEnabled = !this.musicEnabled;
            this.musicToggle.textContent = this.musicEnabled ? '🎵 Music' : '🔇 Music';
            this.musicToggle.classList.toggle('muted', !this.musicEnabled);
            if (this.musicEnabled) {
                this.playBackgroundMusic();
            } else {
                this.stopBackgroundMusic();
            }
            this.saveGameData();
        });
        
        // Game mode buttons
        document.querySelectorAll('.mode-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameMode = e.target.dataset.mode;
                this.init();
                
                // Check mode master achievement
                const modesPlayed = new Set(JSON.parse(localStorage.getItem('modesPlayed') || '[]'));
                modesPlayed.add(this.gameMode);
                localStorage.setItem('modesPlayed', JSON.stringify([...modesPlayed]));
                if (modesPlayed.size >= 4) {
                    this.unlockAchievement('modeMaster');
                }
            });
        });
        
        // Power-up buttons
        document.querySelectorAll('.power-up').forEach(button => {
            button.addEventListener('click', (e) => {
                const power = e.target.dataset.power;
                this.usePowerUp(power);
            });
        });
        
        // Statistics button
        this.statsButton.addEventListener('click', () => {
            this.showStatisticsModal();
        });
        
        // Tutorial button
        this.tutorialButton.addEventListener('click', () => {
            this.showTutorial();
        });
        
        // Save/Load buttons
        this.saveButton.addEventListener('click', () => {
            this.saveGame();
        });
        
        this.loadButton.addEventListener('click', () => {
            this.loadGame();
        });
        
        // Hint button
        this.hintButton.addEventListener('click', () => {
            this.showHint();
        });
        
        // Modal controls
        document.getElementById('close-stats').addEventListener('click', () => {
            this.hideStatisticsModal();
        });
        
        document.getElementById('reset-stats').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all statistics? This cannot be undone!')) {
                this.resetStatistics();
            }
        });
        
        // Tutorial controls
        document.getElementById('tutorial-close').addEventListener('click', () => {
            this.hideTutorial();
        });
        
        document.getElementById('tutorial-prev').addEventListener('click', () => {
            this.previousTutorialStep();
        });
        
        document.getElementById('tutorial-next').addEventListener('click', () => {
            this.nextTutorialStep();
        });
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.tileContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.tileContainer.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) > 30) {
                if (absDx > absDy) {
                    // Horizontal swipe
                    const direction = dx > 0 ? 'right' : 'left';
                    this.simulateKeyPress(direction);
                } else {
                    // Vertical swipe
                    const direction = dy > 0 ? 'down' : 'up';
                    this.simulateKeyPress(direction);
                }
                
                // Haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }
    
    simulateKeyPress(direction) {
        const event = new KeyboardEvent('keydown', {
            key: `Arrow${direction.charAt(0).toUpperCase() + direction.slice(1)}`
        });
        document.dispatchEvent(event);
    }
    
    applyTheme() {
        document.body.className = '';
        if (this.theme !== 'classic') {
            document.body.classList.add(`${this.theme}-theme`);
        }
        
        // Check theme collector achievement
        const themesPlayed = new Set(JSON.parse(localStorage.getItem('themesPlayed') || '[]'));
        themesPlayed.add(this.theme);
        localStorage.setItem('themesPlayed', JSON.stringify([...themesPlayed]));
        if (themesPlayed.size >= 5) {
            this.unlockAchievement('themeCollector');
        }
    }
    
    startTimer() {
        this.timeLeft = 180; // 3 minutes
        this.timerDisplay.style.display = 'block';
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.over = true;
                this.sounds.lose();
                this.showMessage('Time\'s up!', 'game-over');
                this.updateStatsAfterGame(false);
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerDisplay.style.display = 'none';
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Add urgency styling
        if (this.timeLeft <= 30) {
            this.timerValue.style.color = '#f65e3b';
        } else {
            this.timerValue.style.color = '#f9f6f2';
        }
    }
    
    usePowerUp(type) {
        if (this.powerUps[type] <= 0) return;
        
        this.powerUps[type]--;
        this.updatePowerUps();
        this.sounds.powerUp();
        
        switch(type) {
            case 'bomb':
                this.useBomb();
                break;
            case 'undoPlus':
                this.history.push({
                    grid: this.grid.map(row => [...row]),
                    score: this.score,
                    won: this.won,
                    over: this.over
                });
                this.updateUndoButton();
                break;
            case 'multiplier':
                this.activateMultiplier();
                break;
            case 'shuffle':
                this.shuffleBoard();
                break;
        }
        
        // Check power user achievement
        const allUsed = Object.values(this.powerUps).every(count => count === 0);
        if (allUsed) {
            this.unlockAchievement('powerUser');
        }
    }
    
    useBomb() {
        // Clear 3x3 area around highest tile
        let maxTile = { value: 0, x: 0, y: 0 };
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] > maxTile.value) {
                    maxTile = { value: this.grid[i][j], x: i, y: j };
                }
            }
        }
        
        // Clear surrounding tiles
        for (let i = Math.max(0, maxTile.x - 1); i <= Math.min(this.size - 1, maxTile.x + 1); i++) {
            for (let j = Math.max(0, maxTile.y - 1); j <= Math.min(this.size - 1, maxTile.y + 1); j++) {
                if (this.grid[i][j] !== 0) {
                    this.createExplosion(i, j);
                    this.grid[i][j] = 0;
                }
            }
        }
        
        this.updateDisplay();
        this.powerDisplay.textContent = '💣 Bomb Used!';
        setTimeout(() => {
            this.powerDisplay.textContent = '';
        }, 2000);
    }
    
    activateMultiplier() {
        this.activeMultiplier = 2;
        this.powerDisplay.textContent = '×2 Multiplier Active!';
        
        if (this.multiplierTimeout) {
            clearTimeout(this.multiplierTimeout);
        }
        
        this.multiplierTimeout = setTimeout(() => {
            this.activeMultiplier = 1;
            this.powerDisplay.textContent = '';
        }, 30000); // 30 seconds
        
        // Update tile colors to show multiplier
        document.querySelectorAll('.tile').forEach(tile => {
            tile.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        });
    }
    
    shuffleBoard() {
        const tiles = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    tiles.push(this.grid[i][j]);
                }
            }
        }
        
        // Shuffle tiles
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // Place shuffled tiles back
        let tileIndex = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = tileIndex < tiles.length ? tiles[tileIndex++] : 0;
            }
        }
        
        this.updateDisplay();
        this.powerDisplay.textContent = '🔀 Board Shuffled!';
        setTimeout(() => {
            this.powerDisplay.textContent = '';
        }, 2000);
    }
    
    createExplosion(row, col) {
        const position = this.getTilePosition(row, col);
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = position.x + 'px';
        explosion.style.top = position.y + 'px';
        explosion.style.width = '107px';
        explosion.style.height = '107px';
        explosion.style.position = 'absolute';
        explosion.style.pointerEvents = 'none';
        explosion.style.zIndex = '1000';
        explosion.style.animation = 'explode 0.5s ease-out forwards';
        
        this.particleContainer.appendChild(explosion);
        
        setTimeout(() => explosion.remove(), 500);
    }
    
    updatePowerUps() {
        document.querySelectorAll('.power-up').forEach(button => {
            const power = button.dataset.power;
            const count = this.powerUps[power];
            button.disabled = count <= 0;
            
            // Update count display
            let countElement = button.querySelector('.power-count');
            if (!countElement && count > 0) {
                countElement = document.createElement('span');
                countElement.className = 'power-count';
                countElement.textContent = count;
                button.appendChild(countElement);
            } else if (countElement) {
                countElement.textContent = count;
                if (count <= 0) {
                    countElement.remove();
                }
            }
        });
    }
    
    showHint() {
        // Simple AI hint: find best move
        const bestMove = this.calculateBestMove();
        if (bestMove) {
            this.powerDisplay.textContent = `💡 Hint: Move ${bestMove.direction}`;
            setTimeout(() => {
                this.powerDisplay.textContent = '';
            }, 3000);
        }
    }
    
    calculateBestMove() {
        // Simplified AI: check which direction has most merge potential
        const directions = ['up', 'down', 'left', 'right'];
        let bestMove = null;
        let maxMerges = 0;
        
        directions.forEach(direction => {
            const testGrid = this.grid.map(row => [...row]);
            const merges = this.countPotentialMerges(testGrid, direction);
            if (merges > maxMerges) {
                maxMerges = merges;
                bestMove = { direction, merges };
            }
        });
        
        return bestMove;
    }
    
    countPotentialMerges(grid, direction) {
        // Count potential merges in a given direction
        let merges = 0;
        
        // This is a simplified version - full implementation would be more complex
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (grid[i][j] !== 0) {
                    // Check adjacent tiles in the direction
                    const adjacent = this.getAdjacentTile(grid, i, j, direction);
                    if (adjacent && adjacent === grid[i][j]) {
                        merges++;
                    }
                }
            }
        }
        
        return merges;
    }
    
    getAdjacentTile(grid, row, col, direction) {
        switch(direction) {
            case 'up': return row > 0 ? grid[row - 1][col] : null;
            case 'down': return row < this.size - 1 ? grid[row + 1][col] : null;
            case 'left': return col > 0 ? grid[row][col - 1] : null;
            case 'right': return col < this.size - 1 ? grid[row][col + 1] : null;
            default: return null;
        }
    }
    
    showTutorial() {
        this.tutorialOverlay.style.display = 'flex';
        this.updateTutorialStep();
    }
    
    hideTutorial() {
        this.tutorialOverlay.style.display = 'none';
    }
    
    updateTutorialStep() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.style.display = index === this.tutorialStep ? 'block' : 'none';
        });
        
        // Update navigation buttons
        document.getElementById('tutorial-prev').disabled = this.tutorialStep === 0;
        document.getElementById('tutorial-next').disabled = this.tutorialStep === steps.length - 1;
    }
    
    nextTutorialStep() {
        const steps = document.querySelectorAll('.step');
        if (this.tutorialStep < steps.length - 1) {
            this.tutorialStep++;
            this.updateTutorialStep();
        }
    }
    
    previousTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.updateTutorialStep();
        }
    }
    
    showStatisticsModal() {
        this.updateModalStatistics();
        this.statsModal.style.display = 'flex';
    }
    
    hideStatisticsModal() {
        this.statsModal.style.display = 'none';
    }
    
    updateModalStatistics() {
        document.getElementById('modal-games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('modal-games-won').textContent = this.stats.gamesWon;
        document.getElementById('modal-win-rate').textContent = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) + '%' : '0%';
        document.getElementById('modal-best-score').textContent = Math.floor(this.best);
        document.getElementById('modal-avg-score').textContent = this.stats.gamesPlayed > 0 ? 
            Math.floor(this.stats.totalScore / this.stats.gamesPlayed) : '0';
        document.getElementById('modal-total-points').textContent = Math.floor(this.stats.totalScore);
        document.getElementById('modal-total-moves').textContent = this.stats.totalMoves;
        document.getElementById('modal-best-combo').textContent = this.stats.bestCombo;
        
        const unlockedAchievements = Object.values(this.achievements).filter(a => a).length;
        document.getElementById('modal-achievements').textContent = `${unlockedAchievements}/10`;
    }
    
    updateStatistics() {
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('games-won').textContent = this.stats.gamesWon;
        document.getElementById('win-rate').textContent = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) + '%' : '0%';
        document.getElementById('best-score').textContent = Math.floor(this.best);
        document.getElementById('total-moves').textContent = this.stats.totalMoves;
        document.getElementById('best-combo').textContent = this.stats.bestCombo;
    }
    
    updateStatsAfterGame(won) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.score;
        this.stats.totalMoves += this.moves;
        
        if (won) {
            this.stats.gamesWon++;
            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem('best2048', this.best);
            }
        }
        
        if (this.combo > this.stats.bestCombo) {
            this.stats.bestCombo = this.combo;
        }
        
        // Check speed demon achievement (win time attack in under 2 minutes)
        if (won && this.gameMode === 'time-attack' && this.timeLeft > 60) {
            this.unlockAchievement('speedDemon');
        }
        
        this.saveStatistics();
        this.updateStatistics();
    }
    
    saveStatistics() {
        localStorage.setItem('2048-stats', JSON.stringify(this.stats));
    }
    
    loadStatistics() {
        const saved = localStorage.getItem('2048-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
    
    resetStatistics() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            totalMoves: 0,
            bestCombo: 0,
            achievements: 0
        };
        this.saveStatistics();
        this.updateStatistics();
        this.updateModalStatistics();
    }
    
    saveGame() {
        const gameState = {
            grid: this.grid,
            score: this.score,
            gameMode: this.gameMode,
            difficulty: this.difficulty,
            timeLeft: this.timeLeft,
            powerUps: this.powerUps,
            moves: this.moves,
            timestamp: Date.now()
        };
        
        localStorage.setItem('2048-save', JSON.stringify(gameState));
        this.powerDisplay.textContent = '💾 Game Saved!';
        setTimeout(() => {
            this.powerDisplay.textContent = '';
        }, 2000);
    }
    
    loadGame() {
        const saved = localStorage.getItem('2048-save');
        if (!saved) {
            this.powerDisplay.textContent = '📁 No Save Found!';
            setTimeout(() => {
                this.powerDisplay.textContent = '';
            }, 2000);
            return;
        }
        
        const gameState = JSON.parse(saved);
        this.grid = gameState.grid;
        this.score = gameState.score;
        this.gameMode = gameState.gameMode;
        this.difficulty = gameState.difficulty;
        this.timeLeft = gameState.timeLeft;
        this.powerUps = gameState.powerUps;
        this.moves = gameState.moves;
        
        // Update UI
        this.difficultySelect.value = this.difficulty;
        document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-mode="${this.gameMode}"]`).classList.add('active');
        
        this.updateDisplay();
        this.updatePowerUps();
        this.powerDisplay.textContent = '📁 Game Loaded!';
        setTimeout(() => {
            this.powerDisplay.textContent = '';
        }, 2000);
        
        if (this.gameMode === 'time-attack') {
            this.startTimer();
        }
    }
    
    saveGameData() {
        const gameData = {
            theme: this.theme,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            achievements: this.achievements
        };
        localStorage.setItem('2048-gameData', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const saved = localStorage.getItem('2048-gameData');
        if (saved) {
            const gameData = JSON.parse(saved);
            this.theme = gameData.theme || 'classic';
            this.soundEnabled = gameData.soundEnabled !== false;
            this.musicEnabled = gameData.musicEnabled || false;
            this.achievements = gameData.achievements || this.achievements;
            
            // Update UI
            this.themeSelect.value = this.theme;
            this.soundToggle.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Muted';
            this.soundToggle.classList.toggle('muted', !this.soundEnabled);
            this.musicToggle.textContent = this.musicEnabled ? '🎵 Music' : '🔇 Music';
            this.musicToggle.classList.toggle('muted', !this.musicEnabled);
        }
        
        this.loadStatistics();
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
                this.score += mergedValue * this.activeMultiplier * (1 + Math.floor(this.combo / 3) * 0.5);
                this.showScorePopup(mergedValue * this.activeMultiplier * (1 + Math.floor(this.combo / 3) * 0.5));
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
            
            const tilePosition = this.getTilePosition(2, 2);
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
            
            // Play achievement sound
            this.sounds.achievement();
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
            noUndoWin: { name: 'Perfect Run', description: 'Win without using undo' },
            speedDemon: { name: 'Speed Demon', description: 'Win time attack in under 2 minutes' },
            powerUser: { name: 'Power User', description: 'Use all power-ups' },
            themeCollector: { name: 'Theme Collector', description: 'Try all themes' },
            modeMaster: { name: 'Mode Master', description: 'Play all game modes' }
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

// Add explosion animation
const explosionStyle = document.createElement('style');
explosionStyle.textContent = `
    @keyframes explode {
        0% {
            transform: scale(1);
            opacity: 1;
            background: radial-gradient(circle, rgba(246, 94, 59, 0.8) 0%, transparent 70%);
        }
        100% {
            transform: scale(2);
            opacity: 0;
            background: radial-gradient(circle, rgba(246, 94, 59, 0) 0%, transparent 70%);
        }
    }
`;
document.head.appendChild(explosionStyle);

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
    new Enhanced2048();
});
