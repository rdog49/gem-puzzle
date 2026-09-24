require('./style.css');

const { initGame } = require('./logic.js');

// шампка & основной контейнер

const mainAppTitle = document.createElement('h1');
mainAppTitle.textContent = 'Gem-puzzle game!';
mainAppTitle.classList.add('App__main-title');

const mainAppContainer = document.createElement('div');
mainAppContainer.classList.add('App__main-container');

const timerMovesPauseContainer = document.createElement('div');
timerMovesPauseContainer.classList.add('Secondary__container');

// время, шаги и кнопка паузы

const appTimer = document.createElement('h2');
appTimer.classList.add('App__timer');
appTimer.textContent = 'Time 00:00';
timerMovesPauseContainer.appendChild(appTimer);

const appMovesCounter = document.createElement('h2');
appMovesCounter.classList.add('App__moves-counter');
appMovesCounter.textContent = 'Moves 0';
timerMovesPauseContainer.appendChild(appMovesCounter);

const appPauseResumeGame = document.createElement('h2');
appPauseResumeGame.classList.add('App_pause-resume');
appPauseResumeGame.textContent = 'Pause game';
timerMovesPauseContainer.appendChild(appPauseResumeGame);

const mainBoardContainer = document.createElement('div');
mainBoardContainer.classList.add('App__board-container');
mainAppContainer.appendChild(mainBoardContainer);

document.body.appendChild(mainAppContainer);
document.body.appendChild(timerMovesPauseContainer);
document.body.appendChild(mainAppTitle);

// структура бургер менюшки

const modalOverlay = document.createElement('div');
modalOverlay.classList.add('App__modal-overlay', 'App__modal-overlay_hidden');

const modalContent = document.createElement('div');
modalContent.classList.add('App__modal-content');

const modalTopBox = document.createElement('div');
modalTopBox.classList.add('App__modal-top-box');

const modalTitle = document.createElement('h3');
modalTitle.classList.add('App__modal-title');
modalTitle.textContent = 'game paused, want to save it?';

const btnSaveGame = document.createElement('button');
btnSaveGame.classList.add('App__modal-btn', 'App__modal-btn_top');
btnSaveGame.textContent = 'save game';

modalTopBox.appendChild(modalTitle);
modalTopBox.appendChild(btnSaveGame);

// кнопки бургер менюшки

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

// победный экран

function createWinScreenContent(minutes, seconds, movesCount, gridSize) {
  const winTitle = document.createElement('h2');
  winTitle.classList.add('App__modal-title', 'App__modal-text_win-title');
  winTitle.textContent = 'Congratulations!';

  const winSubtitle = document.createElement('p');
  winSubtitle.classList.add('App__modal-text', 'App__modal-text_win-subtitle');
  winSubtitle.textContent = 'Outstanding!';

  const winDetails = document.createElement('p');
  winDetails.classList.add('App__modal-text', 'App__modal-text_win-details');
  
  winDetails.textContent = "You won the game in ";

  const spanMoves = document.createElement('span');
  spanMoves.className = 'App__modal-text_highlight'; 
  spanMoves.textContent = movesCount;
  winDetails.appendChild(spanMoves);

  winDetails.append(" moves! You've spent ");

  const spanTime = document.createElement('span');
  spanTime.className = 'App__modal-text_highlight'; 
  spanTime.textContent = `${minutes} min ${seconds} sec`;
  winDetails.appendChild(spanTime);

  winDetails.append(" and you solved ");

  const spanGrid = document.createElement('span');
  spanGrid.className = 'App__modal-text_highlight'; 
  spanGrid.textContent = `${gridSize}x${gridSize}`;
  winDetails.appendChild(spanGrid);

  winDetails.append(" puzzle!");

  return [winTitle, winSubtitle, winDetails];
}

// универсальная кнопка go back для всех менюшек

const btnGoBack = document.createElement('button');
btnGoBack.classList.add('App__modal-btn', 'App__modal-btn_hidden'); 
btnGoBack.textContent = 'go back';
  

modalContent.appendChild(modalTopBox);
modalContent.appendChild(btnNewGame);
modalContent.appendChild(btnSavedGames);
modalContent.appendChild(btnBestScores);
modalContent.appendChild(btnRules);
modalContent.appendChild(btnSettings);
modalContent.appendChild(btnGoBack);

modalOverlay.appendChild(modalContent);
mainBoardContainer.appendChild(modalOverlay);

// экспорт в логику
initGame({
  mainBoardContainer,
  modalOverlay,
  modalContent,
  modalTopBox,
  btnNewGame,
  appTimer,
  appMovesCounter,
  appPauseResumeGame,
  btnSaveGame,
  btnSavedGames,
  btnBestScores,
  btnRules,
  btnSettings,
  btnGoBack,
  createWinScreenContent
});