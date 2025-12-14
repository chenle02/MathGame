function initModePage() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const errorMessageElement = document.getElementById('error-message');
    const usernameElement = document.getElementById('current-username');
    const logoutButton = document.getElementById('mode-logout');

    function displayError(message) {
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }

    let storedData = { users: {}, archivedUsers: {}, currentUser: null };

    try {
        storedData = JSON.parse(localStorage.getItem('math_game_data')) || storedData;
        const currentUser = storedData.currentUser;
        if (!currentUser || !storedData.users[currentUser]) {
            window.location.href = 'index.html?t=' + new Date().getTime();
            return;
        }

        if (usernameElement) {
            usernameElement.innerHTML = `SIGNED IN AS <span class="username">${currentUser}</span>`;
        }

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                try {
                    const selectedMode = button.getAttribute('data-mode');
                    localStorage.setItem('math_game_currentMode', selectedMode);
                    window.location.href = 'game.html?t=' + new Date().getTime();
                } catch (e) {
                    displayError('Could not save your selection. Storage may be disabled.');
                    console.error('Failed to save mode:', e);
                }
            });
        });
    } catch (e) {
        displayError('Error on mode page: ' + e.message);
        console.error('Mode page loading failed:', e);
    }

    function handleLogout() {
        try {
            const sessionData = JSON.parse(localStorage.getItem('math_game_data')) || { users: {}, archivedUsers: {}, currentUser: null };
            sessionData.currentUser = null;
            localStorage.setItem('math_game_data', JSON.stringify(sessionData));
            localStorage.removeItem('math_game_currentMode');
            window.location.href = 'index.html?t=' + new Date().getTime();
        } catch (err) {
            displayError('Unable to log out. Please refresh and try again.');
            console.error('Mode logout failed:', err);
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModePage);
} else {
    initModePage();
}
