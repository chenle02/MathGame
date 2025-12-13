/**
 * This script handles the logic for the user creation page (createUsername.html).
 * It includes input validation and error handling for the signup process.
 */

const signupUsernameInput = document.getElementById('signup-username');
const signupButton = document.getElementById('signup-button');
const errorMessageElement = document.getElementById('error-message');

/**
 * Displays a message in the error message container.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    errorMessageElement.textContent = message;
}

/**
 * Handles the logic for creating a new user account.
 */
signupButton.addEventListener('click', () => {
    try {
        // 1. Clear previous errors
        displayError('');

        const username = signupUsernameInput.value.trim();
        const usernameRegex = /^[a-zA-Z0-9]+$/; // Alphanumeric characters only

        // 2. Implement robust input validation
        if (username.length < 3 || username.length > 15) {
            displayError('Username must be between 3 and 15 characters.');
            return;
        }
        if (!usernameRegex.test(username)) {
            displayError('Username can only contain letters and numbers.');
            return;
        }

        // 3. Process the validated data
        let data = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };

        if (data.users[username] || data.archivedUsers[username]) {
            displayError('Username already exists. Please choose another one.');
            return;
        }

        data.users[username] = {
            highScore: 0,
            lastPlayed: Date.now()
        };

        localStorage.setItem('math_game_data', JSON.stringify(data));
        
        // 4. On success, use alert as it's a one-time confirmation before redirect
        const welcomeMessage = `Welcome, ${username}! Your account has been successfully created.\n\nIf you do not play in 7 days or more, this username will be deleted.\n\nThis account is being recorded with a real-time recorder...`;
        alert(welcomeMessage);
        window.location.href = 'index.html';

    } catch (e) {
        // 5. Comprehensive error handling
        displayError('Error creating account. Storage may be disabled.');
        console.error('Account creation failed:', e);
    }
});