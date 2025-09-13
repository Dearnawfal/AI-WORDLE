class WordleGame {
    constructor() {
        // 20个常用五字母英语单词作为词库
        this.wordBank = [
            "APPLE", "BRAIN", "CHAIR", "DANCE", "EARTH",
            "FOCUS", "GRAND", "HAPPY", "IDEAS", "JOKER",
            "KNIFE", "LIGHT", "MAGIC", "NIGHT", "OCEAN",
            "PEACE", "QUICK", "RIVER", "SMART", "TIGER"
        ];
        
        this.targetWord = "";
        this.maxAttempts = 7;
        this.currentAttempt = 0;
        this.gameOver = false;
        this.guessHistory = [];
        
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
    }
    
    initializeElements() {
        this.wordInput = document.getElementById('word-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.attemptsDisplay = document.getElementById('attempts-display');
        this.gameMessage = document.getElementById('game-message');
        this.guessesContainer = document.getElementById('guesses-container');
    }
    
    bindEvents() {
        this.submitBtn.addEventListener('click', () => this.handleGuess());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGuess();
            }
        });
        
        this.wordInput.addEventListener('input', (e) => {
            // 自动转换为大写
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    startNewGame() {
        this.targetWord = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
        this.currentAttempt = 0;
        this.gameOver = false;
        this.guessHistory = [];
        
        this.updateDisplay();
        this.clearInput();
        this.clearMessage();
        this.clearGuessHistory();
        
        this.typewriterEffect("Welcome to Wordle! Guess a 5-letter word.", this.gameMessage);
    }
    
    isValidInput(input) {
        if (!input) return false;
        if (input.length !== 5) return false;
        if (!/^[A-Z]+$/.test(input)) return false;
        return true;
    }
    
    handleGuess() {
        if (this.gameOver) return;
        
        const guess = this.wordInput.value.trim();
        
        if (!this.isValidInput(guess)) {
            this.typewriterEffect("您的输入格式不合规", this.gameMessage);
            this.shakeInput();
            return;
        }
        
        this.currentAttempt++;
        this.updateAttemptsDisplay();
        
        if (guess === this.targetWord) {
            this.gameOver = true;
            this.addGuessToHistory(guess, true);
            this.typewriterEffect("您猜中了！恭喜您！", this.gameMessage);
            this.submitBtn.disabled = true;
            this.wordInput.disabled = true;
            this.celebrateWin();
        } else {
            const feedback = this.analyzeGuess(guess);
            this.addGuessToHistory(guess, false, feedback);
            
            if (this.currentAttempt >= this.maxAttempts) {
                this.gameOver = true;
                this.typewriterEffect(`游戏结束！正确答案是: ${this.targetWord}`, this.gameMessage);
                this.submitBtn.disabled = true;
                this.wordInput.disabled = true;
            } else {
                this.typewriterEffect("继续猜测...", this.gameMessage);
            }
        }
        
        this.clearInput();
    }
    
    analyzeGuess(guess) {
        const correctPositions = [];
        const wrongPositions = [];
        const targetLetters = this.targetWord.split('');
        const guessLetters = guess.split('');
        
        // 首先检查位置正确的字母
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                correctPositions.push({
                    letter: guessLetters[i],
                    position: i + 1
                });
                targetLetters[i] = null; // 标记为已使用
                guessLetters[i] = null; // 标记为已使用
            }
        }
        
        // 然后检查位置错误但存在的字母
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                const targetIndex = targetLetters.indexOf(guessLetters[i]);
                if (targetIndex !== -1) {
                    wrongPositions.push(guessLetters[i]);
                    targetLetters[targetIndex] = null; // 避免重复计算
                }
            }
        }
        
        return {
            correctPositions,
            wrongPositions: [...new Set(wrongPositions)] // 去重
        };
    }
    
    addGuessToHistory(guess, isCorrect, feedback = null) {
        const guessItem = document.createElement('div');
        guessItem.className = 'guess-item';
        
        // 创建字母瓦片
        const letterTiles = this.createLetterTiles(guess, feedback);
        
        guessItem.innerHTML = `
            <div class="guess-word">${letterTiles}</div>
        `;
        
        this.guessesContainer.appendChild(guessItem);
        this.guessHistory.push({ guess, isCorrect, feedback });
        
        // 滚动到最新记录
        this.guessesContainer.scrollTop = this.guessesContainer.scrollHeight;
    }
    
    createLetterTiles(guess, feedback) {
        const letters = guess.split('');
        const targetLetters = this.targetWord.split('');
        const letterStates = new Array(5).fill('not-found');
        
        // 首先标记位置正确的字母
        if (feedback) {
            feedback.correctPositions.forEach(cp => {
                letterStates[cp.position - 1] = 'correct';
            });
            
            // 标记位置错误但存在的字母
            const usedPositions = new Set(feedback.correctPositions.map(cp => cp.position - 1));
            const remainingTargetLetters = targetLetters.map((letter, index) => 
                usedPositions.has(index) ? null : letter
            );
            
            letters.forEach((letter, index) => {
                if (letterStates[index] !== 'correct') {
                    const targetIndex = remainingTargetLetters.indexOf(letter);
                    if (targetIndex !== -1) {
                        letterStates[index] = 'wrong-position';
                        remainingTargetLetters[targetIndex] = null; // 避免重复标记
                    }
                }
            });
        }
        
        return letters.map((letter, index) => {
            const state = letterStates[index];
            return `<span class="letter-tile letter-${state}">${letter}</span>`;
        }).join('');
    }
    
    typewriterEffect(text, element, speed = 50) {
        element.innerHTML = '';
        element.classList.add('typewriter');
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typewriter');
            }
        }, speed);
    }
    
    updateDisplay() {
        this.updateAttemptsDisplay();
        this.submitBtn.disabled = false;
        this.wordInput.disabled = false;
    }
    
    updateAttemptsDisplay() {
        this.attemptsDisplay.textContent = `Attempts: ${this.currentAttempt}/${this.maxAttempts}`;
    }
    
    clearInput() {
        this.wordInput.value = '';
        this.wordInput.focus();
    }
    
    clearMessage() {
        this.gameMessage.innerHTML = '';
    }
    
    clearGuessHistory() {
        this.guessesContainer.innerHTML = '';
    }
    
    shakeInput() {
        this.wordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.wordInput.style.animation = '';
        }, 500);
    }
    
    celebrateWin() {
        // 添加庆祝动画
        document.body.style.animation = 'celebrate 1s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 1000);
    }
    
    showHint() {
        if (this.gameOver) return;
        
        const hint = this.targetWord.charAt(0) + '____';
        this.typewriterEffect(`Hint: The word starts with "${this.targetWord.charAt(0)}"`, this.gameMessage);
    }
}

// 添加震动动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new WordleGame();
});
