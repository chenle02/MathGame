const problemElement = document.getElementById('problem');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');

let score = 0;
let level = 1;
let timeLeft = 60;
let currentAnswer;
let timerInterval;

function generateProblem() {
    const num1 = Math.floor(Math.random() * 10 * level);
    const num2 = Math.floor(Math.random() * 10 * level);
    problemElement.textContent = `${num1} + ${num2}`;
    currentAnswer = num1 + num2;
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (userAnswer === currentAnswer) {
        score++;
        updateScore();
        if (score % 10 === 0) {
            level++;
            levelElement.textContent = `Level: ${level}`;
        }
        generateProblem();
        answerInput.value = '';
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            alert(`Game Over! Your score is ${score}`);
            // Reset game
            score = 0;
            level = 1;
            timeLeft = 60;
            updateScore();
            levelElement.textContent = `Level: ${level}`;
            timerElement.textContent = `Time: ${timeLeft}`;
            generateProblem();
            startTimer();
        }
    }, 1000);
}

submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

generateProblem();
startTimer();
