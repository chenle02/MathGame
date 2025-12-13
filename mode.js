document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const errorMessageElement = document.getElementById('error-message');

    function displayError(message) {
        errorMessageElement.textContent = message;
    }

    try {
        if (!localStorage.getItem('math_game_currentUser')) {
            window.location.href = 'index.html?t=' + new Date().getTime();
            return;
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
});
