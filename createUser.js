const signupUsernameInput = document.getElementById('signup-username');
const signupButton = document.getElementById('signup-button');

signupButton.addEventListener('click', () => {
    try {
        const username = signupUsernameInput.value.trim();
        if (username === '') {
            alert('Please enter a username.');
            return;
        }

        // Get the main data object, or initialize it
        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };

        // Check if user exists in active users or archived users
        if (data.users[username] || data.archivedUsers[username]) {
            alert('Username already exists. Please choose another one.');
            return;
        }

        // Create new user
        data.users[username] = {
            highScore: 0,
            lastPlayed: Date.now()
        };

        localStorage.setItem('math_game_data', JSON.stringify(data));
        
        alert('Account created successfully! Please sign in.');
        window.location.href = 'index.html';
    } catch (e) {
        alert('Error creating account: ' + e.message);
        console.error('Account creation failed:', e);
    }
});
