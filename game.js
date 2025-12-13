// Game elements
const playerNameElement = document.getElementById('player-name');
const logoutButton = document.getElementById('logout-button');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const problemTextElement = document.getElementById('problem');
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const answerChoicesElement = document.getElementById('answer-choices');

// Game state
let score = 0, level = 1, timeLeft = 60;
let currentAnswer, timerInterval, currentUser, currentMode;

// --- HELPER FUNCTIONS ---
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- PROBLEM GENERATION HELPERS ---
function generateNumberProblem(op) {
    let num1, num2;
    if (op === '+') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*10*level); currentAnswer = num1 + num2; }
    if (op === '-') { num1 = Math.floor(Math.random()*10*level); num2 = Math.floor(Math.random()*num1); currentAnswer = num1 - num2; }
    if (op === '*') { num1 = Math.floor(Math.random()*10); num2 = Math.floor(Math.random()*10); currentAnswer = num1 * num2; }
    if (op === '/') { num2 = Math.floor(Math.random()*9)+1; num1 = num2*(Math.floor(Math.random()*10)); currentAnswer = num1 / num2; }
    
    const problemText = `${num1} ${op.replace('*','×').replace('/','÷')} ${num2}`;
    const choices = [
        { text: currentAnswer, value: currentAnswer },
        { text: currentAnswer + (Math.floor(Math.random()*3)+1), value: currentAnswer + (Math.floor(Math.random()*3)+1) },
        { text: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)), value: Math.max(0, currentAnswer - (Math.floor(Math.random()*3)+1)) }
    ];
    return { problemText, choices };
}

function generateDecimalProblem() {
    const num1 = parseFloat((Math.random() * 10).toFixed(1));
    const num2 = parseFloat((Math.random() * 10).toFixed(1));
    currentAnswer = parseFloat((num1 + num2).toFixed(1));
    const problemText = `${num1} + ${num2}`;
    const choices = [
        { text: currentAnswer, value: currentAnswer },
        { text: parseFloat((currentAnswer + 1).toFixed(1)), value: parseFloat((currentAnswer + 1).toFixed(1)) },
        { text: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)), value: parseFloat(Math.max(0, currentAnswer - 1).toFixed(1)) }
    ];
    return { problemText, choices };
}

function generateFractionProblem() {
    const den1 = Math.floor(Math.random() * 5) + 2;
    const den2 = Math.floor(Math.random() * 5) + 2;
    const num1 = Math.floor(Math.random() * den1) + 1;
    const num2 = Math.floor(Math.random() * den2) + 1;
    const problemText = `${num1}/${den1} + ${num2}/${den2}`;
    const ansNum = num1 * den2 + num2 * den1;
    const ansDen = den1 * den2;
    const common = gcd(ansNum, ansDen);
    currentAnswer = `${ansNum/common}/${ansDen/common}`;
    const choices = [
        { text: currentAnswer, value: currentAnswer },
        { text: `${ansNum/common + 1}/${ansDen/common}`, value: `${ansNum/common + 1}/${ansDen/common}` },
        { text: `${ansNum/common}/${ansDen/common + 1}`, value: `${ansNum/common}/${ansDen/common + 1}` }
    ];
    return { problemText, choices };
}

function generateAngleProblem() {
    const angleTypes = ['Acute', 'Obtuse', 'Right'];
    currentAnswer = angleTypes[Math.floor(Math.random() * angleTypes.length)];
    drawAngle(currentAnswer);
    const choices = angleTypes.map(type => ({ text: type, value: type }));
    return { problemText: '', choices }; // No text for angle problems
}

// --- MAIN PROBLEM DISPATCHER ---
function generateProblem() {
    let problemTypes = [];
    if (currentMode === 'mix') { problemTypes = ['number', 'fraction', 'decimal', 'angle']; }
    else if (currentMode.startsWith('number_')) { problemTypes = [currentMode]; }
    else { problemTypes = [currentMode]; }

    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let problemData;
    problemTextElement.style.display = 'block';
    canvasContainer.style.display = 'none';

    if (problemType.startsWith('number_')) {
        const op = problemType.split('_')[1];
        problemData = generateNumberProblem(op);
    } else {
        switch (problemType) {
            case 'number':
                 const ops = ['+', '-', '*', '/'];
                 const randOp = ops[Math.floor(Math.random() * ops.length)];
                 problemData = generateNumberProblem(randOp);
                 break;
            case 'decimal': problemData = generateDecimalProblem(); break;
            case 'fraction': problemData = generateFractionProblem(); break;
            case 'angle':
                problemTextElement.style.display = 'none';
                canvasContainer.style.display = 'block';
                problemData = generateAngleProblem();
                break;
        }
    }
    
    problemTextElement.textContent = problemData.problemText;
    displayChoices(shuffle(problemData.choices));
}


// --- CORE GAME LOGIC ---
function checkAnswer(selectedAnswer) {
    if (selectedAnswer == currentAnswer) {
        score++;
        updateScore();
        if (score > 0 && score % 10 === 0) { level++; levelElement.textContent = `Level: ${level}`; }
    }
    generateProblem();
}

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

function drawAngle(angleType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 5;
    const centerX = canvas.width / 2, centerY = canvas.height - 20, lineLength = 80;
    let angle;
    if (angleType === 'Right') angle = Math.PI / 2;
    else if (angleType === 'Acute') angle = (Math.random() * 60 + 20) * Math.PI / 180;
    else angle = (Math.random() * 60 + 100) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(centerX + lineLength * Math.cos(angle), centerY - lineLength * Math.sin(angle)); ctx.stroke();
}

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

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('math_game_currentUser');
    localStorage.removeItem('math_game_currentMode');
    window.location.href = 'index.html?t=' + new Date().getTime();
});

initialize();
