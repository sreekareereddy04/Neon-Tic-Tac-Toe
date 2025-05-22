document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const restartBtn = document.querySelector('#reset-btn');
    const playerXScore = document.querySelector('#player-x .score');
    const playerOScore = document.querySelector('#player-o .score');
    const playerXElement = document.querySelector('#player-x');
    const playerOElement = document.querySelector('#player-o');
    const pvpBtn = document.querySelector('#pvp-btn');
    const pvcBtn = document.querySelector('#pvc-btn');
    
    // Game variables
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let scores = { X: 0, O: 0 };
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize game
    init();
    
    function init() {
        // Set up event listeners
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.classList.remove('x', 'o', 'winner');
            cell.textContent = '';
        });
        
        restartBtn.addEventListener('click', restartGame);
        pvpBtn.addEventListener('click', () => setGameMode('pvp'));
        pvcBtn.addEventListener('click', () => setGameMode('pvc'));
        
        // Reset game state
        gameActive = true;
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        
        // Update UI
        updatePlayerTurn();
        updateActivePlayerUI();
    }
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already used or game not active, ignore
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;
        
        // Process player move
        handlePlayerMove(clickedCell, clickedCellIndex);
        
        // If playing against computer and game is still active, make computer move
        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 800); // Delay for better UX
        }
    }
    
    function handlePlayerMove(cell, index) {
        // Update game state and UI
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        checkResult();
    }
    
    function makeComputerMove() {
        // Simple AI - first try to win, then block, then random
        let move = findWinningMove('O') || findWinningMove('X') || findRandomMove();
        
        if (move !== null) {
            const cell = document.querySelector(`.cell[data-index="${move}"]`);
            handlePlayerMove(cell, move);
        }
    }
    
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const cells = [gameState[a], gameState[b], gameState[c]];
            
            // If two in a row and third is empty
            if (cells.filter(c => c === player).length === 2 && cells.includes('')) {
                return condition[cells.indexOf('')];
            }
        }
        return null;
    }
    
    function findRandomMove() {
        // Find all empty cells
        const emptyCells = gameState.map((cell, index) => cell === '' ? index : null)
                                   .filter(val => val !== null);
        
        // Return random empty cell or null if no moves left
        return emptyCells.length > 0 
            ? emptyCells[Math.floor(Math.random() * emptyCells.length)] 
            : null;
    }
    
    function checkResult() {
        let roundWon = false;
        
        // Check all winning conditions
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                
                // Highlight winning cells
                condition.forEach(index => {
                    document.querySelector(`.cell[data-index="${index}"]`).classList.add('winner');
                });
                
                break;
            }
        }
        
        // If won, update scores and display message
        if (roundWon) {
            scores[currentPlayer]++;
            updateScores();
            statusDisplay.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            return;
        }
        
        // If draw, display message
        if (!gameState.includes('')) {
            statusDisplay.textContent = "Game ended in a draw!";
            gameActive = false;
            return;
        }
        
        // If game continues, change player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerTurn();
        updateActivePlayerUI();
    }
    
    function updatePlayerTurn() {
        statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    }
    
    function updateActivePlayerUI() {
        if (currentPlayer === 'X') {
            playerXElement.classList.add('active');
            playerOElement.classList.remove('active');
        } else {
            playerXElement.classList.remove('active');
            playerOElement.classList.add('active');
        }
    }
    
    function updateScores() {
        playerXScore.textContent = scores.X;
        playerOScore.textContent = scores.O;
    }
    
    function restartGame() {
        scores = { X: 0, O: 0 };
        updateScores();
        init();
    }
    
    function resetGame() {
        init();
    }
    
    function setGameMode(mode) {
        gameMode = mode;
        
        // Update UI
        if (mode === 'pvp') {
            pvpBtn.classList.add('active');
            pvcBtn.classList.remove('active');
        } else {
            pvpBtn.classList.remove('active');
            pvcBtn.classList.add('active');
        }
        
        // Reset game with new mode
        resetGame();
    }
});