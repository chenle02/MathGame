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
        
        const welcomeMessage = `Welcome, ${username}! Your account has been successfully created.\n\nIf you do not play in 7 days or more, this username will be deleted.\n\nThis account is being recorded with a real-time recorder...`;
        alert(welcomeMessage);
        window.location.href = 'index.html';
    } catch (e) {
        alert('Error creating account: ' + e.message);
        console.error('Account creation failed:', e);
    }
});
