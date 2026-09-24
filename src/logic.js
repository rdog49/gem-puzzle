let isPaused = false;
let isGameStarted = false;
let timerInterval = null;
let secondsElapsed = 0;
let gridSize = 4;
let boardState = Array.from({ length: gridSize * gridSize }, (_, i) => i === gridSize * gridSize - 1 ? 0 : i + 1);

let elements = {};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return 'Time ' + minutes + ':' + seconds;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    elements.appTimer.textContent = formatTime(secondsElapsed);
    saveCurrentSession();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  secondsElapsed = 0;
  elements.appTimer.textContent = 'Time 00:00';
}

function canMove(tileIndex, emptyIndex, gridSize = 4) {
  const row = Math.floor(tileIndex / gridSize);
  const col = tileIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
}

function moveTile(board, tileIndex) {
  const emptyIndex = board.indexOf(0);

  if (canMove(tileIndex, emptyIndex)) {
    [board[emptyIndex], board[tileIndex]] = [board[tileIndex], board[emptyIndex]];
    return true;
  }
  return false;
  saveCurrentSession();
}

function isSolvable(board, gridSize = 4) {
  let inversions = 0;
  const nums = board.filter(n => n !== 0);

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) {
        inversions++;
      }
    }
  }

  if (gridSize % 2 !== 0) {
    return inversions % 2 === 0;
  } else {
    const emptyIndex = board.indexOf(0);
    const rowFromBottom = gridSize - Math.floor(emptyIndex / gridSize);
    if (rowFromBottom % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      return inversions % 2 !== 0;
    }
  }
}

function isWinningBoard(board) {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

function generateSolvableBoard(gridSize = 4) {
  const totalTiles = gridSize * gridSize;
  let board;

  do {
    board = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board, gridSize) || isWinningBoard(board));

  return board;
}

function renderBoard() {
  elements.mainBoardContainer.innerHTML = '';

  boardState.forEach((value, index) => {
    const tile = document.createElement('div');
    tile.classList.add('App__tile');

    if (value === 0) {
      tile.classList.add('App__tile_empty');

      tile.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      tile.addEventListener('drop', (e) => {
        e.preventDefault();
        if (isPaused) return;

        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const moved = moveTile(boardState, draggedIndex);
        if (moved) {
          movesCount++;
          elements.appMovesCounter.textContent = `Moves ${movesCount}`;
          renderBoard();

          if (isWinningBoard(boardState)) {
            showWinScreen();
          }
        }
      });
    } else {
      tile.textContent = value;
      tile.classList.add('App__tile_number');
      tile.setAttribute('draggable', 'true');

      tile.addEventListener('dragstart', (e) => {
        if (isPaused) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', index);
        setTimeout(() => {
          tile.classList.add('App__tile_dragging');
        }, 0);
      });

      tile.addEventListener('dragend', () => {
        tile.classList.remove('App__tile_dragging');
      });

      tile.addEventListener('click', () => {
        if (isPaused) return;
        const moved = moveTile(boardState, index);
        if (moved) {
          movesCount++;
          elements.appMovesCounter.textContent = `Moves ${movesCount}`;
          renderBoard();

          if (isWinningBoard(boardState)) {
            showWinScreen();
          }
        }
      });
    }

    elements.mainBoardContainer.appendChild(tile);
  });
  elements.mainBoardContainer.appendChild(elements.modalOverlay);
}

function togglePause() {
  if (!isGameStarted) return;

  isPaused = !isPaused;
  if (isPaused) {
    elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
    elements.appPauseResumeGame.textContent = 'Resume game';
    stopTimer();
  } else {
    elements.modalOverlay.classList.add('App__modal-overlay_hidden');
    elements.appPauseResumeGame.textContent = 'Pause game';
    startTimer();
  }
}

function startNewGame() {
  localStorage.removeItem('gemPuzzle_currentSession');
  isGameStarted = true;
  isPaused = false;

  elements.modalOverlay.classList.add('App__modal-overlay_hidden');
  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.remove('App_pause-resume_disabled');

  movesCount = 0;
  elements.appMovesCounter.textContent = `Moves ${movesCount}`;

  boardState = generateSolvableBoard(gridSize);
  renderBoard();

  resetTimer();
  startTimer();
  saveCurrentSession();
}

// вин скрин

function showWinScreen() {
  stopTimer();
  isGameStarted = false;
  localStorage.removeItem('gemPuzzle_currentSession');

  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.add('App_pause-resume_disabled');
  elements.modalContent.innerHTML = '';

  const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
  const seconds = (secondsElapsed % 60).toString().padStart(2, '0');

  const winElements = elements.createWinScreenContent(
    minutes, 
    seconds, 
    movesCount, 
    gridSize
  );

  winElements.forEach(el => {
    elements.modalContent.appendChild(el);
  });

  elements.modalContent.appendChild(elements.btnGoBack);
  elements.btnGoBack.classList.remove('App__modal-btn_hidden'); // показываем кнопку

  elements.btnGoBack.onclick = () => {
    resetToMainMenu();
  };

  elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
}

// Функция возврата в главное меню 
function resetToMainMenu() {

  elements.modalContent.innerHTML = '';
  
  elements.modalContent.appendChild(elements.modalTopBox);
  elements.modalContent.appendChild(elements.btnNewGame);
  elements.modalContent.appendChild(elements.btnSavedGames);
  elements.modalContent.appendChild(elements.btnBestScores);
  elements.modalContent.appendChild(elements.btnRules);
  elements.modalContent.appendChild(elements.btnSettings);
  
  elements.btnGoBack.classList.add('App__modal-btn_hidden');

  boardState = Array.from({ length: gridSize * gridSize }, (_, i) => i === gridSize * gridSize - 1 ? 0 : i + 1);
  renderBoard();
  
  elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.add('App_pause-resume_disabled');
}

function initGame(domElements) {
  elements = domElements;

  elements.btnNewGame.addEventListener('click', startNewGame);
  elements.appPauseResumeGame.addEventListener('click', togglePause);

  // Стартовое состояние
  renderBoard();
  elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.add('App_pause-resume_disabled');
}

function saveCurrentSession() {
  const sessionData = {
    boardState,
    secondsElapsed,
    movesCount,
    gridSize,
    isGameStarted
  };
  localStorage.setItem('gemPuzzle_currentSession', JSON.stringify(sessionData));
}

module.exports = { initGame, moveTile, generateSolvableBoard, isWinningBoard };