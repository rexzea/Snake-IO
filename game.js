class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        // Game configuration
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.initialSpeed = 150;
        
        // Game state
        this.isPaused = false;
        this.isGameOver = false;
        this.isStarted = false;
        
        // Initialize game elements
        this.resetGame();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // High score from localStorage
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.updateHighScore();
    }

    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = this.initialSpeed;
        this.lastRenderTime = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        this.updateScore();
        this.updateLevel();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    }

    handleKeyPress(event) {
        if (!this.isStarted) return;

        // Pause game
        if (event.code === 'Space' || event.key.toLowerCase() === 'p') {
            this.togglePause();
            return;
        }

        if (this.isPaused) return;

        const keyPressed = event.keyCode;
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;

        if (keyPressed === 37 && !goingRight) { // Left
            this.dx = -1;
            this.dy = 0;
        }
        if (keyPressed === 38 && !goingDown) { // Up
            this.dx = 0;
            this.dy = -1;
        }
        if (keyPressed === 39 && !goingLeft) { // Right
            this.dx = 1;
            this.dy = 0;
        }
        if (keyPressed === 40 && !goingUp) { // Down
            this.dx = 0;
            this.dy = 1;
        }
    }

    startGame() {
        this.isStarted = true;
        document.getElementById('start-screen').style.display = 'none';
        this.gameLoop();
    }

    restartGame() {
        this.resetGame();
        document.getElementById('game-over').style.display = 'none';
        this.gameLoop();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-screen').style.display = this.isPaused ? 'flex' : 'none';
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    checkCollision() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    updateScore() {
        document.getElementById('current-score').textContent = `Skor: ${this.score}`;
    }

    updateHighScore() {
        const highScoreElements = document.querySelectorAll('#high-score, #end-high-score');
        highScoreElements.forEach(element => {
            element.textContent = `Skor Tertinggi: ${this.highScore}`;
        });
    }

    updateLevel() {
        document.getElementById('level').textContent = this.level;
    }

    gameOver() {
        this.isGameOver = true;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').style.display = 'flex';
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Draw head
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Draw body with gradient
                const gradient = this.ctx.createLinearGradient(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    (segment.x + 1) * this.gridSize,
                    (segment.y + 1) * this.gridSize
                );
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#45a049');
                this.ctx.fillStyle = gradient;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    update() {
        if (this.dx === 0 && this.dy === 0) return;

        // Move snake
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);

        // Check collision
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            
            // Level up every 50 points
            if (this.score % 50 === 0) {
                this.level++;
                this.speed = Math.max(50, this.initialSpeed - (this.level - 1) * 10);
                this.updateLevel();
            }
            
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    gameLoop(currentTime) {
        if (this.isGameOver) return;

        window.requestAnimationFrame(this.gameLoop.bind(this));

        if (!this.lastRenderTime) {
            this.lastRenderTime = currentTime;
            return;
        }

        const elapsed = currentTime - this.lastRenderTime;
        
        if (elapsed < this.speed || this.isPaused) return;
        
        this.lastRenderTime = currentTime;

        this.update();
        this.draw();
    }
}

// Initialize game when window loads
window.onload = () => {
    const game = new SnakeGame();
    document.getElementById('start-screen').style.display = 'flex';
};