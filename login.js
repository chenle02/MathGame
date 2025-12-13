/**
 * This script handles the logic for the login page (index.html).
 * It validates credentials, handles the login process, and manages session initialization.
 */

const loginUsernameInput = document.getElementById('login-username');
const loginButton = document.getElementById('login-button');
const errorMessageElement = document.getElementById('error-message');

/**
 * Displays a message in the error message container.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    errorMessageElement.textContent = message;
}

/**
 * Initializes the page. If a user is already logged in and active,
 * it redirects them to the mode selection page.
 */
function initialize() {
    try {
        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };
        if (data.currentUser && data.users[data.currentUser]) {
            window.location.href = 'mode.html?t=' + new Date().getTime();
        }
    } catch (e) {
        displayError('Error checking your session.');
        console.error('Session check failed:', e);
    }
}

/**
 * Handles the user login attempt when the login button is clicked.
 */
loginButton.addEventListener('click', () => {
    try {
        displayError('');
        const username = loginUsernameInput.value.trim();

        if (username === '') {
            displayError('Please enter a username.');
            return;
        }

        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (data.archivedUsers[username]) {
            displayError('This username has been archived due to inactivity.');
            return;
        }

        const user = data.users[username];

        if (user) {
            // Check for inactivity
            if (Date.now() - user.lastPlayed > oneWeek) {
                data.archivedUsers[username] = user;
                data.archivedUsers[username].archiveDate = Date.now();
                delete data.users[username];

                localStorage.setItem('math_game_data', JSON.stringify(data));
                displayError('This username has been archived due to over 1 week of inactivity.');
                return;
            }

            // Successful login: Update user data and redirect
            user.lastPlayed = Date.now();
            data.currentUser = username;
            localStorage.setItem('math_game_data', JSON.stringify(data));
            window.location.href = 'mode.html?t=' + new Date().getTime();

        } else {
            displayError('Username not found. Please create a new user.');
        }
    } catch (e) {
        displayError('Error during login. Storage may be disabled.');
        console.error('Login failed:', e);
    }
});

initialize();
