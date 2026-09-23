require('./style.css');

const mainAppTitle = document.createElement('h1'); // тайтл
mainAppTitle.textContent = 'Gem-puzzle game!';
mainAppTitle.classList.add('App__main-title');

const mainAppContainer = document.createElement('div');
mainAppContainer.classList.add('App__main-container'); // основной контейнер

const timerMovesPauseContainer = document.createElement('div'); // контейнер таймера, шагов и паузы
timerMovesPauseContainer.classList.add('Secondary__container');

const appTimer = document.createElement('h2');
appTimer.classList.add('App__timer');
appTimer.textContent = 'Time 00:00'; // Текст поменять потом
timerMovesPauseContainer.appendChild(appTimer);

const appMovesCounter = document.createElement('h2');
appMovesCounter.classList.add('App__moves-counter');
appMovesCounter.textContent = 'Moves 0'; // Текст поменять потом
timerMovesPauseContainer.appendChild(appMovesCounter);

const appPauseResumeGame = document.createElement('h2');
appPauseResumeGame.classList.add('App_pause-resume');
appPauseResumeGame.textContent = 'Pause game'; // Текст поменять потом
timerMovesPauseContainer.appendChild(appPauseResumeGame);




const mainBoardContainer = document.createElement('div');
mainBoardContainer.classList.add('App__board-container');
mainAppContainer.appendChild(mainBoardContainer); // контейнер для борды

document.body.appendChild(mainAppContainer);
document.body.appendChild(timerMovesPauseContainer);
document.body.appendChild(mainAppTitle);

const modalOverlay = document.createElement('div'); //бургер менюшка
modalOverlay.classList.add('App__modal-overlay', 'App__modal-overlay_hidden');

const modalContent = document.createElement('div');
modalContent.classList.add('App__modal-content');

// топ бокс с сохранением и надписью

const modalTopBox = document.createElement('div');
modalTopBox.classList.add('App__modal-top-box');

const modalTitle = document.createElement('h3');
modalTitle.classList.add('App__modal-title');
modalTitle.textContent = 'game paused, want to save it?';

const btnSaveGame = document.createElement('button');
btnSaveGame.classList.add('App__modal-btn');
btnSaveGame.classList.add('App__modal-btn_top');
btnSaveGame.textContent = 'save game';

modalTopBox.appendChild(modalTitle);
modalTopBox.appendChild(btnSaveGame);

// 2. Остальные кнопки
const btnNewGame = document.createElement('button');
btnNewGame.classList.add('App__modal-btn');
btnNewGame.textContent = 'New Game';

const btnSavedGames = document.createElement('button');
btnSavedGames.classList.add('App__modal-btn');
btnSavedGames.textContent = 'Saved games';

const btnBestScores = document.createElement('button');
btnBestScores.classList.add('App__modal-btn');
btnBestScores.textContent = 'Best scores';

const btnRules = document.createElement('button');
btnRules.classList.add('App__modal-btn');
btnRules.textContent = 'Rules';

const btnSettings = document.createElement('button');
btnSettings.classList.add('App__modal-btn');
btnSettings.textContent = 'Settings';

modalContent.appendChild(modalTopBox);
modalContent.appendChild(btnNewGame);
modalContent.appendChild(btnSavedGames);
modalContent.appendChild(btnBestScores);
modalContent.appendChild(btnRules);
modalContent.appendChild(btnSettings);

modalOverlay.appendChild(modalContent);

let isPaused = false; // логика бургер менюшки

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    modalOverlay.classList.remove('App__modal-overlay_hidden');
    appPauseResumeGame.textContent = 'Resume game';
  } else {
    modalOverlay.classList.add('App__modal-overlay_hidden');
    appPauseResumeGame.textContent = 'Pause game';
  }
}

appPauseResumeGame.addEventListener('click', togglePause);

const { // логика движения тайлов и каунтер
  moveTile,
  generateSolvableBoard
} = require('./logic.js');

let movesCount = 0;
const movesCounterElement = appMovesCounter;

let boardState = generateSolvableBoard(4);

function renderBoard() {
  mainBoardContainer.innerHTML = '';

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
          if (movesCounterElement) {
            movesCounterElement.textContent = `Moves ${movesCount}`;
          }
          renderBoard();
        }
      });

    } else {
      tile.textContent = value;
      tile.classList.add('App__tile_number');
      tile.setAttribute('draggable', 'true');

      //dragstart

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

      // dragend

      tile.addEventListener('dragend', () => {
        tile.classList.remove('App__tile_dragging');
      });

      // click

      tile.addEventListener('click', () => {
        if (isPaused) return;
        const moved = moveTile(boardState, index);
        if (moved) {
          movesCount++;
          if (movesCounterElement) {
            movesCounterElement.textContent = `Moves ${movesCount}`;
          }
          renderBoard();
        }
      });
    }

    mainBoardContainer.appendChild(tile);
  });
  mainBoardContainer.appendChild(modalOverlay);
}

renderBoard();