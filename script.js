class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.won = false;
        this.over = false;
        this.history = [];
        this.maxHistoryLength = 10;
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.undoButton = document.getElementById('undo-button');
        this.tileContainer = document.getElementById('tile-container');
        this.gridContainer = document.getElementById('grid-container');
        this.messageContainer = document.getElementById('game-message');
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.history = [];
        
        this.updateScore();
        this.hideMessage();
        this.clearTiles();
        this.updateUndoButton();
        
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        
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
                this.addRandomTile();
                this.updateDisplay();
                
                if (this.isWon() && !this.won) {
                    this.won = true;
                    this.showMessage('You win!', 'game-won');
                } else if (this.isGameOver()) {
                    this.over = true;
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
        }
    }
    
    move(direction) {
        this.saveHistory();
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                const result = this.mergeRow(this.grid[i]);
                this.grid[i] = result.merged.concat(Array(this.size - result.merged.length).fill(0));
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const result = this.mergeRow(this.grid[i].filter(val => val !== 0).reverse());
                this.grid[i] = Array(this.size - result.merged.length).fill(0).concat(result.merged.reverse());
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
        
        return moved;
    }
    
    mergeRow(row) {
        const merged = [];
        let i = 0;
        
        while (i < row.length) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
                const mergedValue = row[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i += 2;
            } else {
                merged.push(row[i]);
                i++;
            }
        }
        
        return merged;
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
    
    createTile(value, row, col) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
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
        this.scoreElement.textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', this.best);
        }
        this.bestElement.textContent = this.best;
    }
    
    showMessage(text, className) {
        this.messageContainer.querySelector('p').textContent = text;
        this.messageContainer.className = `game-message ${className}`;
        this.messageContainer.style.display = 'block';
    }
    
    hideMessage() {
        this.messageContainer.style.display = 'none';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
