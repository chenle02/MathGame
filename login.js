// Auth elements
const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');

function initialize() {
    try {
        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };
        // If a user is already marked as current, verify they are still an active user
        if (data.currentUser && data.users[data.currentUser]) {
            window.location.href = 'mode.html?t=' + new Date().getTime();
        }
    } catch (e) {
        alert('Error checking session: ' + e.message);
        console.error('Session check failed:', e);
    }
}

loginButton.addEventListener('click', () => {
    try {
        const username = loginUsernameInput.value.trim();
        if (username === '') {
            alert('Please enter your username.');
            return;
        }

        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        // Check if user is archived
        if (data.archivedUsers[username]) {
            alert('This username has been archived due to inactivity.');
            return;
        }

        const user = data.users[username];

        if (user) {
            // Check for inactivity
            if (Date.now() - user.lastPlayed > oneWeek) {
                // Archive the user
                data.archivedUsers[username] = user;
                data.archivedUsers[username].archiveDate = Date.now();
                delete data.users[username];

                localStorage.setItem('math_game_data', JSON.stringify(data));
                alert('This username has been archived due to over 1 week of inactivity.');
                return;
            }

            // If active, update lastPlayed, set as current user, and redirect
            user.lastPlayed = Date.now();
            data.currentUser = username;
            localStorage.setItem('math_game_data', JSON.stringify(data));
            window.location.href = 'mode.html?t=' + new Date().getTime();

        } else {
            alert('Username not found. Please create a new user.');
        }
    } catch (e) {
        alert('Error during login: ' + e.message);
        console.error('Login failed:', e);
    }
});

initialize();
