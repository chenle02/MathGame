const signupUsernameInput = document.getElementById('signup-username');
const signupButton = document.getElementById('signup-button');

signupButton.addEventListener('click', () => {
    const username = signupUsernameInput.value.trim();
    if (username === '') {
        alert('Please enter a username.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('math_game_users')) || [];
    if (users.includes(username)) {
        alert('Username already exists. Please choose another one.');
        return;
    }

    users.push(username);
    localStorage.setItem('math_game_users', JSON.stringify(users));
    
    alert('Account created successfully! Please sign in.');
    window.location.href = 'index.html';
});
