let isPaused = false;
let isGameStarted = false;
let timerInterval = null;
let secondsElapsed = 0;
let movesCount = 0;
let gridSize = 4;
let pendingGridSize = 4;
let isAnimating = false;
let boardState = Array.from({
  length: gridSize * gridSize
}, (_, i) => i === gridSize * gridSize - 1 ? 0 : i + 1);

let elements = {};

let isSoundEnabled = true;

function playTileSound() {
  if (!isSoundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    console.error(e);
  }
}

function updateSoundButtonState() {
  if (isSoundEnabled) {
    elements.btnSound.classList.add('App__modal-btn_sound-on');
    elements.btnSound.classList.remove('App__modal-btn_sound-off');
  } else {
    elements.btnSound.classList.add('App__modal-btn_sound-off');
    elements.btnSound.classList.remove('App__modal-btn_sound-on');
  }
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  localStorage.setItem('gemPuzzle_sound', isSoundEnabled ? 'on' : 'off');
  updateSoundButtonState();
}

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

function canMove(tileIndex, emptyIndex, currentGridSize = gridSize) {
  const row = Math.floor(tileIndex / currentGridSize);
  const col = tileIndex % currentGridSize;
  const emptyRow = Math.floor(emptyIndex / currentGridSize);
  const emptyCol = emptyIndex % currentGridSize;

  return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
}

function moveTile(board, tileIndex) {
  const emptyIndex = board.indexOf(0);

  if (canMove(tileIndex, emptyIndex, gridSize)) {
    [board[emptyIndex], board[tileIndex]] = [board[tileIndex], board[emptyIndex]];
    playTileSound();
    saveCurrentSession();
    return true;
  }
  return false;
}

function handleTileClick(tileIndex) {
  if (isAnimating || isPaused || !isGameStarted) return;

  const emptyIndex = boardState.indexOf(0);

  if (canMove(tileIndex, emptyIndex, gridSize)) {
    const tileElement = elements.mainBoardContainer.children[tileIndex];
    const emptyElement = elements.mainBoardContainer.children[emptyIndex];

    if (!tileElement || !emptyElement) return;

    isAnimating = true;

    const tileRect = tileElement.getBoundingClientRect();
    const emptyRect = emptyElement.getBoundingClientRect();

    const deltaX = emptyRect.left - tileRect.left;
    const deltaY = emptyRect.top - tileRect.top;

    playTileSound();

    tileElement.classList.add('App__tile_moving');
    tileElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
      tileElement.classList.remove('App__tile_moving');
      tileElement.style.transform = '';

      [boardState[emptyIndex], boardState[tileIndex]] = [boardState[tileIndex], boardState[emptyIndex]];
      movesCount++;
      elements.appMovesCounter.textContent = 'Moves ' + movesCount;

      saveCurrentSession();
      renderBoard();

      isAnimating = false;

      if (isWinningBoard(boardState)) {
        showWinScreen();
      }
    }, 150);
  }
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
    board = Array.from({
      length: totalTiles
    }, (_, i) => i);
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board, gridSize) || isWinningBoard(board));

  return board;
}

function renderMainMenu() {
  elements.modalContent.innerHTML = '';
  elements.modalContent.appendChild(elements.modalTopBox);
  elements.modalContent.appendChild(elements.btnNewGame);
  elements.modalContent.appendChild(elements.btnSavedGames);
  elements.modalContent.appendChild(elements.btnBestScores);
  elements.modalContent.appendChild(elements.btnRules);
  elements.modalContent.appendChild(elements.btnSettings);
  elements.modalContent.appendChild(elements.btnSound);
  elements.btnGoBack.classList.add('App__modal-btn_hidden');
}

function renderBoard() {
  elements.mainBoardContainer.innerHTML = '';

  elements.mainBoardContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  elements.mainBoardContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  let fontSize = '32px';
  if (gridSize === 5) fontSize = '26px';
  if (gridSize === 6) fontSize = '22px';
  if (gridSize === 7) fontSize = '18px';
  if (gridSize === 8) fontSize = '15px';

  boardState.forEach((value, index) => {
    const tile = document.createElement('div');
    tile.classList.add('App__tile');
    tile.style.fontSize = fontSize;

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
        handleTileClick(index);
      });
    }

    elements.mainBoardContainer.appendChild(tile);
  });
  elements.mainBoardContainer.appendChild(elements.modalOverlay);
}

function startNewGame() {
  gridSize = pendingGridSize;

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
  saveBestScore(gridSize, secondsElapsed, movesCount);

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
  renderMainMenu();

  boardState = Array.from({
    length: gridSize * gridSize
  }, (_, i) => i === gridSize * gridSize - 1 ? 0 : i + 1);
  renderBoard();

  elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.add('App_pause-resume_disabled');
}

function initGame(domElements) {
  elements = domElements;

  const savedPendingSize = localStorage.getItem('gemPuzzle_pendingGridSize');
  if (savedPendingSize) {
    pendingGridSize = parseInt(savedPendingSize, 10);
  }

  const savedSound = localStorage.getItem('gemPuzzle_sound');
  if (savedSound !== null) {
    isSoundEnabled = savedSound === 'on';
  }
  updateSoundButtonState();

  elements.btnNewGame.addEventListener('click', startNewGame);
  elements.appPauseResumeGame.addEventListener('click', togglePause);
  elements.btnSettings.addEventListener('click', showSettingsScreen);
  elements.btnSavedGames.addEventListener('click', showSavedGamesScreen);
  elements.btnBestScores.addEventListener('click', showBestScoresScreen);
  elements.btnRules.addEventListener('click', showRulesScreen);
  elements.btnSound.addEventListener('click', toggleSound);
  if (elements.btnSaveGame) {
    elements.btnSaveGame.addEventListener('click', saveGameToStorage);
  }

  elements.selectSize.addEventListener('change', (e) => {
    pendingGridSize = parseInt(e.target.value, 10);
    elements.settingsMessage.style.display = 'block';
    localStorage.setItem('gemPuzzle_pendingGridSize', pendingGridSize);
  });

  const sessionRestored = initSavedSession();

  if (!sessionRestored) {
    elements.modalContent.innerHTML = '';
    elements.modalContent.appendChild(elements.modalTopBox);
    elements.modalContent.appendChild(elements.btnNewGame);
    elements.modalContent.appendChild(elements.btnSavedGames);
    elements.modalContent.appendChild(elements.btnBestScores);
    elements.modalContent.appendChild(elements.btnRules);
    elements.modalContent.appendChild(elements.btnSettings);

    elements.btnGoBack.classList.add('App__modal-btn_hidden');

    boardState = Array.from({
      length: gridSize * gridSize
    }, (_, i) => i === gridSize * gridSize - 1 ? 0 : i + 1);
    renderBoard();

    elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
    elements.appPauseResumeGame.textContent = 'Pause game';
    elements.appPauseResumeGame.classList.add('App_pause-resume_disabled');
  }
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

function initSavedSession() {
  const savedData = localStorage.getItem('gemPuzzle_currentSession');

  if (!savedData) {
    return false;
  }

  try {
    const session = JSON.parse(savedData);

    if (session.isGameStarted) {
      boardState = session.boardState;
      secondsElapsed = session.secondsElapsed;
      movesCount = session.movesCount;
      gridSize = session.gridSize || 4;
      isGameStarted = true;

      elements.appMovesCounter.textContent = `Moves ${movesCount}`;
      elements.appTimer.textContent = formatTime(secondsElapsed);

      renderBoard();

      startTimer();

      elements.modalOverlay.classList.add('App__modal-overlay_hidden');
      elements.appPauseResumeGame.textContent = 'Pause game';
      elements.appPauseResumeGame.classList.remove('App_pause-resume_disabled');

      return true;
    }
  } catch (e) {
    console.error('Ошибка при загрузке сессии:', e);
    localStorage.removeItem('gemPuzzle_currentSession');
  }

  return false;
}

// логика сохранения и экран
function showSettingsScreen() {
  elements.modalContent.innerHTML = '';
  elements.selectSize.value = pendingGridSize.toString();

  elements.settingsMessage.classList.add('App__modal-btn_hidden');

  elements.modalContent.appendChild(elements.settingsTitle);
  elements.modalContent.appendChild(elements.fieldSizeLabel);
  elements.modalContent.appendChild(elements.selectSize);
  elements.modalContent.appendChild(elements.settingsMessage);
  elements.modalContent.appendChild(elements.btnGoBack);

  elements.btnGoBack.classList.remove('App__modal-btn_hidden');
  elements.btnGoBack.onclick = () => {
    if (isPaused) {
      renderMainMenu();
    } else {
      resetToMainMenu();
    }
  };
}

function togglePause() {
  if (!isGameStarted) return;

  isPaused = !isPaused;
  if (isPaused) {
    stopTimer();
    renderMainMenu();
    elements.modalOverlay.classList.remove('App__modal-overlay_hidden');
    elements.appPauseResumeGame.textContent = 'Resume game';
  } else {
    elements.modalOverlay.classList.add('App__modal-overlay_hidden');
    elements.appPauseResumeGame.textContent = 'Pause game';
    startTimer();
  }
}

function saveGameToStorage() {
  if (!isGameStarted) return;

  const savedGames = JSON.parse(localStorage.getItem('gemPuzzle_savedGames') || '[]');

  const newSave = {
    id: Date.now(),
    boardState: [...boardState],
    secondsElapsed,
    movesCount,
    gridSize
  };

  savedGames.unshift(newSave);
  if (savedGames.length > 10) {
    savedGames.pop();
  }

  localStorage.setItem('gemPuzzle_savedGames', JSON.stringify(savedGames));

  elements.btnSaveGame.textContent = 'Saved!';
  setTimeout(() => {
    elements.btnSaveGame.textContent = 'save game';
  }, 1500);
}

function deleteSavedGame(id) {
  let savedGames = JSON.parse(localStorage.getItem('gemPuzzle_savedGames') || '[]');
  savedGames = savedGames.filter(save => save.id !== id);
  localStorage.setItem('gemPuzzle_savedGames', JSON.stringify(savedGames));
  showSavedGamesScreen();
}

function showSavedGamesScreen() {
  elements.modalContent.innerHTML = '';
  elements.modalContent.appendChild(elements.savedGamesTitle);

  const savedGames = JSON.parse(localStorage.getItem('gemPuzzle_savedGames') || '[]');

  if (savedGames.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.classList.add('App__modal-text');
    emptyMsg.textContent = 'No saved games yet';
    elements.modalContent.appendChild(emptyMsg);
  } else {
    const list = document.createElement('div');
    list.classList.add('App__saved-list');

    savedGames.forEach((save, index) => {
      const mins = Math.floor(save.secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (save.secondsElapsed % 60).toString().padStart(2, '0');
      const text = (index + 1) + '. [' + save.gridSize + 'x' + save.gridSize + '] Time ' + mins + ':' + secs + ' | Moves:  ' + save.movesCount;

      const {
        row,
        item,
        btnDelete
      } = elements.createSavedGameRow(text);

      item.onclick = () => {
        loadSavedGame(save);
      };

      btnDelete.onclick = (e) => {
        e.stopPropagation();
        deleteSavedGame(save.id);
      };

      list.appendChild(row);
    });

    elements.modalContent.appendChild(list);
  }

  elements.modalContent.appendChild(elements.btnGoBack);
  elements.btnGoBack.classList.remove('App__modal-btn_hidden');
  elements.btnGoBack.onclick = () => {
    if (isPaused) {
      renderMainMenu();
    } else {
      resetToMainMenu();
    }
  };
}

function loadSavedGame(save) {
  boardState = [...save.boardState];
  secondsElapsed = save.secondsElapsed;
  movesCount = save.movesCount;
  gridSize = save.gridSize;
  isGameStarted = true;
  isPaused = false;

  elements.appMovesCounter.textContent = `Moves` + movesCount;
  elements.appTimer.textContent = formatTime(secondsElapsed);

  renderBoard();

  stopTimer();
  startTimer();

  elements.modalOverlay.classList.add('App__modal-overlay_hidden');
  elements.appPauseResumeGame.textContent = 'Pause game';
  elements.appPauseResumeGame.classList.remove('App_pause-resume_disabled');

  saveCurrentSession();
}

function saveBestScore(gridSize, secondsElapsed, movesCount) {
  const scores = JSON.parse(localStorage.getItem('gemPuzzle_bestScores') || '[]');

  scores.push({
    gridSize,
    secondsElapsed,
    movesCount,
    id: Date.now()
  });

  scores.sort((a, b) => a.movesCount - b.movesCount || a.secondsElapsed - b.secondsElapsed);

  const top10 = scores.slice(0, 10);
  localStorage.setItem('gemPuzzle_bestScores', JSON.stringify(top10));
}

function showBestScoresScreen() {
  elements.modalContent.innerHTML = '';

  const title = document.createElement('p');
  title.classList.add('App__modal-text', 'App__modal-text_win-subtitle');
  title.textContent = 'Top 10 Best Scores:';
  elements.modalContent.appendChild(title);

  const scores = JSON.parse(localStorage.getItem('gemPuzzle_bestScores') || '[]');

  if (scores.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.classList.add('App__modal-text');
    emptyMsg.textContent = 'No records yet. Win a game!';
    elements.modalContent.appendChild(emptyMsg);
  } else {
    const list = document.createElement('div');
    list.classList.add('App__scores-list');

    scores.forEach((score, index) => {
      const mins = Math.floor(score.secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (score.secondsElapsed % 60).toString().padStart(2, '0');
      const timeStr = `${mins}:${secs}`;

      const scoreRow = elements.createBestScoreRow(
        index + 1,
        score.gridSize,
        timeStr,
        score.movesCount
      );

      list.appendChild(scoreRow);
    });

    elements.modalContent.appendChild(list);
  }

  elements.modalContent.appendChild(elements.btnGoBack);
  elements.btnGoBack.classList.remove('App__modal-btn_hidden');
  elements.btnGoBack.onclick = () => {
    if (isPaused) {
      renderMainMenu();
    } else {
      resetToMainMenu();
    }
  };
}

function showRulesScreen() {
  elements.modalContent.innerHTML = '';
  elements.modalContent.appendChild(elements.rulesTitle);
  elements.modalContent.appendChild(elements.rulesText);
  elements.modalContent.appendChild(elements.btnGoBack);

  elements.btnGoBack.classList.remove('App__modal-btn_hidden');
  elements.btnGoBack.onclick = () => {
    if (isPaused) {
      renderMainMenu();
    } else {
      resetToMainMenu();
    }
  };
}

module.exports = {
  initGame,
  moveTile,
  generateSolvableBoard,
  isWinningBoard
};