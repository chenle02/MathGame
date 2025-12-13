// Auth elements
const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');

function initialize() {
    // If user is already logged in, redirect to game
    if (localStorage.getItem('math_game_currentUser')) {
        window.location.href = 'game.html?t=' + new Date().getTime();
    }
}

loginButton.addEventListener('click', () => {
    const username = loginUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter your username.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('math_game_users')) || [];
    if (users.includes(username)) {
        localStorage.setItem('math_game_currentUser', username);
        window.location.href = 'game.html?t=' + new Date().getTime();
    } else {
        alert('Username not found. Please create a new user.');
    }
});

initialize();
