document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.mode-btn');

    // First, check if a user is even logged in. If not, back to index.
    if (!localStorage.getItem('math_game_currentUser')) {
        window.location.href = 'index.html';
        return;
    }

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedMode = button.getAttribute('data-mode');
            localStorage.setItem('math_game_currentMode', selectedMode);
            window.location.href = 'game.html?t=' + new Date().getTime();
        });
    });
});
