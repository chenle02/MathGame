// Game elements
const playerNameElement = document.getElementById('player-name');
const logoutButton = document.getElementById('logout-button');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');

// Problem elements
const problemTextElement = document.getElementById('problem');
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const answerChoicesElement = document.getElementById('answer-choices');

// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let currentAnswer;
let currentProblemType;
let timerInterval;
let currentUser = null;
let currentMode = null;

// --- HELPER FUNCTIONS ---
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- INITIALIZATION ---
function initialize() {
    currentUser = localStorage.getItem('math_game_currentUser');
    currentMode = localStorage.getItem('math_game_currentMode');

    if (!currentUser) { window.location.href = 'index.html'; return; }
    if (!currentMode) { window.location.href = 'mode.html'; return; }
    
    playerNameElement.textContent = currentUser;
    resetGame();
    generateProblem();
    startTimer();
}

function resetGame() {
    score = 0; level = 1; timeLeft = 60;
    updateScore();
    levelElement.textContent = `Level: ${level}`;
    timerElement.textContent = `Time: ${timeLeft}`;
    if (timerInterval) clearInterval(timerInterval);
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('math_game_currentUser');
    localStorage.removeItem('math_game_currentMode');
    window.location.href = 'index.html?t=' + new Date().getTime();
});

// --- UI AND DRAWING ---
function displayChoices(choices) {
    answerChoicesElement.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.className = 'choice-btn';
        button.onclick = () => checkAnswer(choice.value);
        answerChoicesElement.appendChild(button);
    });
}
function drawAngle(angleType) { /* ... (drawing logic as before) ... */ }

// --- PROBLEM GENERATION ---
function generateProblem() {
    let problemTypes = [];
    if (currentMode === 'mix') {
        problemTypes = ['number', 'fraction', 'decimal', 'angle'];
    } else if (currentMode.startsWith('number_')) {
        problemTypes = [currentMode]; // e.g., 'number_+'
    } else {
        problemTypes = [currentMode]; // e.g., 'fraction'
    }

    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    currentProblemType = problemType;

    problemTextElement.style.display = 'block';
    canvasContainer.style.display = 'none';

    let choices = [];
    let problemText = '';

    // Determine the specific operation for number types
    let op = '';
    if (problemType.startsWith('number_')) {
        op = problemType.split('_')[1];
    } else if (problemType === 'number') {
        const ops = ['+', '-', '*', '/'];
        op = ops[Math.floor(Math.random() * ops.length)];
    }

    if (op) { // Handle all number-based operations
        let num1, num2;
        if (op === '+') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*10*level); currentAnswer = num1 + num2; }
        if (op === '-') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*num1); currentAnswer = num1 - num2; }
        if (op === '*') { num1 = Math.floor(Math.random()*10); num2 = Math.floor(Math.random()*10); currentAnswer = num1 * num2; }
        if (op === '/') { num2 = Math.floor(Math.random()*9)+1; num1 = num2*(Math.floor(Math.random()*10)); currentAnswer = num1 / num2; }
        problemText = `${num1} ${op.replace('*','×').replace('/','÷')} ${num2}`;
        choices = [
            { text: currentAnswer, value: currentAnswer },
            { text: currentAnswer + (Math.floor(Math.random()*3)+1), value: currentAnswer + (Math.floor(Math.random()*3)+1) },
            { text: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)), value: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)) }
        ];
    } else if (problemType === 'decimal') {
        let num1 = parseFloat((Math.random() * 10).toFixed(1));
        let num2 = parseFloat((Math.random() * 10).toFixed(1));
        currentAnswer = parseFloat((num1 + num2).toFixed(1));
        problemText = `${num1} + ${num2}`;
        choices = [
            { text: currentAnswer, value: currentAnswer },
            { text: parseFloat((currentAnswer + 1).toFixed(1)), value: parseFloat((currentAnswer + 1).toFixed(1)) },
            { text: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)), value: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)) }
        ];
    } else if (problemType === 'fraction') {
        const den1=Math.floor(Math.random()*5)+2, den2=Math.floor(Math.random()*5)+2;
        const num_1=Math.floor(Math.random()*den1)+1, num_2=Math.floor(Math.random()*den2)+1;
        problemText = `${num_1}/${den1} + ${num_2}/${den2}`;
        let ansNum=num_1*den2+num_2*den1, ansDen=den1*den2, common=gcd(ansNum,ansDen);
        currentAnswer = `${ansNum/common}/${ansDen/common}`;
        choices = [
            { text: currentAnswer, value: currentAnswer },
            { text: `${ansNum/common+1}/${ansDen/common}`, value: `${ansNum/common+1}/${ansDen/common}` },
            { text: `${ansNum/common}/${ansDen/common+1}`, value: `${ansNum/common}/${ansDen/common+1}` }
        ];
    } else if (problemType === 'angle') {
        problemTextElement.style.display = 'none'; canvasContainer.style.display = 'block';
        const angleTypes = ['Acute', 'Obtuse', 'Right'];
        currentAnswer = angleTypes[Math.floor(Math.random() * angleTypes.length)];
        drawAngle(currentAnswer);
        choices = angleTypes.map(type => ({ text: type, value: type }));
    }
    
    problemTextElement.textContent = problemText;
    displayChoices(shuffle(choices));
}

// --- GAME LOGIC ---
function checkAnswer(selectedAnswer) {
    if (selectedAnswer == currentAnswer) {
        score++;
        updateScore();
        if (score > 0 && score % 10 === 0) { level++; levelElement.textContent = `Level: ${level}`; }
    }
    generateProblem();
}

function updateScore() { scoreElement.textContent = `Score: ${score}`; }

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`Game Over! Your score is ${score}`);
            window.location.href = 'index.html';
        }
    }, 1000);
}

// Re-pasting drawAngle here because the previous thought block truncated it
function drawAngle(angleType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 20;
    const lineLength = 80;
    
    let angle;
    if (angleType === 'Right') angle = Math.PI / 2;
    else if (angleType === 'Acute') angle = (Math.random() * 60 + 20) * Math.PI / 180;
    else angle = (Math.random() * 60 + 100) * Math.PI / 180;

    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength * Math.cos(angle), centerY - lineLength * Math.sin(angle)); ctx.stroke();
}

initialize();