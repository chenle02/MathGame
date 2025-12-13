/**
 * This script controls all the main game logic for the Math Game.
 * It is loaded by game.html and starts the game after ensuring a user is logged in
 * and has selected a game mode.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const playerNameElement = document.getElementById('player-name');
    const logoutButton = document.getElementById('logout-button');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const highScoreElement = document.getElementById('high-score');
    const timerElement = document.getElementById('timer');
    const problemTextElement = document.getElementById('problem');
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const answerChoicesElement = document.getElementById('answer-choices');
    const loadingOverlay = document.getElementById('loading-overlay');

    // --- GAME STATE VARIABLES ---
    let score = 0, level = 1, timeLeft = 60;
    let currentAnswer, timerInterval, currentUser, currentMode;
    let data = {};

    // --- HELPER FUNCTIONS ---

    /**
     * Calculates the greatest common divisor of two numbers.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The greatest common divisor.
     */
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    /**
     * Shuffles an array in place using the Fisher-Yates algorithm.
     * @param {Array<any>} array - The array to shuffle.
     * @returns {Array<any>} The shuffled array.
     */
    function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

    /**
     * Draws an angle on the canvas based on its type.
     * @param {('Acute'|'Obtuse'|'Right')} angleType - The type of angle to draw.
     */
    function drawAngle(angleType) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#333'; ctx.lineWidth = 5; const centerX = canvas.width / 2, centerY = canvas.height - 20, lineLength = 80; let angle; if (angleType === 'Right') angle = Math.PI / 2; else if (angleType === 'Acute') angle = (Math.random() * 60 + 20) * Math.PI / 180; else angle = (Math.random() * 60 + 100) * Math.PI / 180; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength, centerY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength * Math.cos(angle), centerY - lineLength * Math.sin(angle)); ctx.stroke(); }
    
    // --- PROBLEM GENERATION HELPERS ---

    /**
     * Generates a numeric problem (+, -, *, /).
     * @param {string} op - The operator to use.
     * @returns {{problemText: string, choices: Array<object>}}
     */
    function generateNumberProblem(op) {
        let num1, num2;
        if (op === '+') {
            num1 = Math.floor(Math.random() * 10 * level);
            num2 = Math.floor(Math.random() * 10 * level);
            currentAnswer = num1 + num2;
        } else if (op === '-') {
            num1 = Math.floor(Math.random() * 10 * level);
            num2 = Math.floor(Math.random() * num1);
            currentAnswer = num1 - num2;
        } else if (op === '*') {
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            currentAnswer = num1 * num2;
        } else if (op === '/') {
            num2 = Math.floor(Math.random() * 9) + 1;
            num1 = num2 * (Math.floor(Math.random() * 10));
            currentAnswer = num1 / num2;
        }
        
        const problemText = `${num1} ${op.replace('*','×').replace('/','÷')} ${num2}`;
        const choices = [
            { text: currentAnswer, value: currentAnswer },
            { text: currentAnswer + (Math.floor(Math.random()*3)+1), value: currentAnswer + (Math.floor(Math.random()*3)+1) },
            { text: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)), value: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)) }
        ];
        return { problemText, choices };
    }
    
    /**
     * Generates a decimal addition problem.
     * @returns {{problemText: string, choices: Array<object>}}
     */
    function generateDecimalProblem() { const num1 = parseFloat((Math.random() * 10).toFixed(1)); const num2 = parseFloat((Math.random() * 10).toFixed(1)); currentAnswer = parseFloat((num1 + num2).toFixed(1)); const problemText = `${num1} + ${num2}`; const choices = [ { text: currentAnswer, value: currentAnswer }, { text: parseFloat((currentAnswer + 1).toFixed(1)), value: parseFloat((currentAnswer + 1).toFixed(1)) }, { text: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)), value: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)) } ]; return { problemText, choices }; }
    
    /**
     * Generates a fraction addition problem.
     * @returns {{problemText: string, choices: Array<object>}}
     */
    function generateFractionProblem() { const den1 = Math.floor(Math.random() * 5) + 2; const den2 = Math.floor(Math.random() * 5) + 2; const num1 = Math.floor(Math.random() * den1) + 1; const num2 = Math.floor(Math.random() * den2) + 1; const problemText = `${num1}/${den1} + ${num2}/${den2}`; const ansNum = num1 * den2 + num2 * den1; const ansDen = den1 * den2; const common = gcd(ansNum, ansDen); currentAnswer = `${ansNum/common}/${ansDen/common}`; const choices = [ { text: currentAnswer, value: currentAnswer }, { text: `${ansNum/common + 1}/${ansDen/common}`, value: `${ansNum/common + 1}/${ansDen/common}` }, { text: `${ansNum/common}/${ansDen/common + 1}`, value: `${ansNum/common}/${ansDen/common + 1}` } ]; return { problemText, choices }; }
    
    /**
     * Generates an angle identification problem.
     * @returns {{problemText: string, choices: Array<object>}}
     */
    function generateAngleProblem() { const angleTypes = ['Acute', 'Obtuse', 'Right']; currentAnswer = angleTypes[Math.floor(Math.random() * angleTypes.length)]; drawAngle(currentAnswer); const choices = angleTypes.map(type => ({ text: type, value: type })); return { problemText: '', choices }; }

    // --- MAIN PROBLEM DISPATCHER ---

    /**
     * Selects a problem type based on the current game mode and calls the appropriate generator.
     */
    function generateProblem() { let problemTypes = []; if (currentMode === 'mix') { problemTypes = ['number', 'fraction', 'decimal', 'angle']; } else if (currentMode.startsWith('number_')) { problemTypes = [currentMode]; } else { problemTypes = [currentMode]; } const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)]; let problemData; problemTextElement.style.display = 'block'; canvasContainer.style.display = 'none'; if (problemType.startsWith('number_')) { const op = problemType.split('_')[1]; problemData = generateNumberProblem(op); } else if (problemType === 'number') { const ops = ['+', '-', '*', '/']; const randOp = ops[Math.floor(Math.random() * ops.length)]; problemData = generateNumberProblem(randOp); } else if (problemType === 'decimal') { problemData = generateDecimalProblem(); } else if (problemType === 'fraction') { problemData = generateFractionProblem(); } else if (problemType === 'angle') { problemTextElement.style.display = 'none'; canvasContainer.style.display = 'block'; problemData = generateAngleProblem(); } if (!problemData) { throw new Error('Failed to generate problem data for type: ' + problemType); } problemTextElement.textContent = problemData.problemText; displayChoices(shuffle(problemData.choices)); }
    
    // --- CORE GAME LOGIC & UI ---

    /**
     * Checks if the user's selected answer is correct.
     * @param {string|number} selectedAnswer - The value from the clicked button.
     */
    function checkAnswer(selectedAnswer) { if (selectedAnswer == currentAnswer) { score++; updateScore(); if (score > 0 && score % 10 === 0) { level++; levelElement.textContent = `Level: ${level}`; } } generateProblem(); }
    
    /**
     * Renders the multiple-choice buttons on the screen.
     * @param {Array<object>} choices - An array of choice objects {text, value}.
     */
    function displayChoices(choices) { answerChoicesElement.innerHTML = ''; choices.forEach(choice => { const button = document.createElement('button'); button.textContent = choice.text; button.className = 'choice-btn'; button.onclick = () => checkAnswer(choice.value); answerChoicesElement.appendChild(button); }); }
    
    /** Updates the score display on the UI. */
    function updateScore() { scoreElement.textContent = `Score: ${score}`; }
    
    /** Starts the main game timer. */
    function startTimer() { timerInterval = setInterval(() => { timeLeft--; timerElement.textContent = `Time: ${timeLeft}`; if (timeLeft <= 0) { clearInterval(timerInterval); const user = data.users[currentUser]; if (score > user.highScore) { user.highScore = score; try { localStorage.setItem('math_game_data', JSON.stringify(data)); alert(`Game Over! New High Score: ${score}`); } catch(e) { alert('Game Over! Could not save new high score.'); } } else { alert(`Game Over! Your score is ${score}`); } window.location.href = 'index.html'; } }, 1000); }
    
    /** Resets the game state to default values. */
    function resetGame() { score = 0; level = 1; timeLeft = 60; updateScore(); levelElement.textContent = `Level: ${level}`; if (timerInterval) clearInterval(timerInterval); }
    
    logoutButton.addEventListener('click', () => { try { data.currentUser = null; localStorage.setItem('math_game_data', JSON.stringify(data)); localStorage.removeItem('math_game_currentMode'); window.location.href = 'index.html?t=' + new Date().getTime(); } catch (e) { alert('Error during logout: ' + e.message); console.error('Logout failed:', e); } });

    // --- ASYNCHRONOUS INITIALIZATION ---

    /**
     * Prepares all game data before showing the content. Reads storage, validates sessions,
     * updates UI text, and generates the first problem.
     * @returns {Promise<void>} A promise that resolves when loading is complete.
     */
    function initializeData() { return new Promise((resolve, reject) => { try { data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null }; currentUser = data.currentUser; currentMode = localStorage.getItem('math_game_currentMode'); if (!currentUser || !data.users[currentUser]) { return reject(new Error("No valid user session. Redirecting to login.")); } if (!currentMode) { window.location.href = 'mode.html'; return reject(new Error("No game mode selected.")); } const user = data.users[currentUser]; playerNameElement.textContent = currentUser; highScoreElement.textContent = `High Score: ${user.highScore}`; resetGame(); generateProblem(); setTimeout(() => resolve(), 500); } catch (e) { reject(e); } }); }

    /**
     * Main entry point for the application. Controls the loading sequence.
     */
    async function main() { try { loadingOverlay.style.display = 'flex'; await initializeData(); loadingOverlay.style.display = 'none'; startTimer(); } catch (e) { loadingOverlay.style.display = 'none'; alert(`A critical error occurred while loading the game: ${e.message}`); console.error(e); window.location.href = 'index.html'; } }

    main();
});
