require('./style.css');

const {
  initGame
} = require('./logic.js');

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

// кнопка звука

const btnSound = document.createElement('button');
btnSound.classList.add('App__modal-btn', 'App__modal-btn_sound-on');
btnSound.textContent = 'sound';

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
btnGoBack.classList.add('App__modal-btn', 'App__modal-btn_hidden', 'App__modal-btn-back');
btnGoBack.textContent = 'go back';

// менюшка Settings
const settingsTitle = document.createElement('h2');
settingsTitle.classList.add('App__modal-title', 'App__modal-text_win-title');
settingsTitle.textContent = 'Settings';

const fieldSizeLabel = document.createElement('p');
fieldSizeLabel.classList.add('App__modal-text', 'App__modal-text_win-subtitle');
fieldSizeLabel.textContent = 'Field size:';

const selectSize = document.createElement('select');
selectSize.classList.add('App__modal-select');

['3x3', '4x4', '5x5', '6x6', '7x7', '8x8'].forEach(sizeStr => {
  const option = document.createElement('option');
  option.value = sizeStr[0]; 
  option.textContent = sizeStr;
  if (sizeStr === '4x4') option.selected = true;
  selectSize.appendChild(option);
});

const settingsMessage = document.createElement('p');
settingsMessage.classList.add('App__modal-text', 'App__modal-text_settings-msg', 'App__modal-btn_hidden');
settingsMessage.innerHTML = 'Changes saved! <br> press go back and start new game to see the changes.';

const pauseText = document.createElement('p');
pauseText.classList.add('App__modal-text');
pauseText.textContent = 'game paused, want to save it?';

const savedGamesTitle = document.createElement('p');
savedGamesTitle.classList.add('App__modal-text', 'App__modal-text_win-subtitle');
savedGamesTitle.textContent = 'your saved games:';

function createSavedGameRow(text) {
  const row = document.createElement('div');
  row.classList.add('App__saved-row');

  const item = document.createElement('button');
  item.classList.add('App__saved-item');
  item.textContent = text;

  const btnDelete = document.createElement('button');
  btnDelete.classList.add('App__saved-delete-btn');
  btnDelete.textContent = '✕';

  row.appendChild(item);
  row.appendChild(btnDelete);

  return { row, item, btnDelete };
}

function createBestScoreRow(rank, gridSize, timeStr, moves) {
  const row = document.createElement('div');
  row.classList.add('App__score-item');

  const infoText = document.createElement('span');
  infoText.textContent = `${rank}. [${gridSize}x${gridSize}] Time: ${timeStr} | Moves: ${moves}`;

  row.appendChild(infoText);
  return row;
}

// Элементы меню Rules
const rulesTitle = document.createElement('h2');
rulesTitle.classList.add('Rules__title');
rulesTitle.textContent = 'Rules of Gem-Puzzle';

const rulesText = document.createElement('p');
rulesText.classList.add('Rules__text');
rulesText.textContent = 'The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space. You can save your game and load it later. Or you can just use pause button. Also you can choose game field size in Settings. Sound can be turned on/off in Pause menu.';

// Элементы выбора режима игры
const modeLabel = document.createElement('p');
modeLabel.classList.add('App__modal-text');
modeLabel.textContent = 'Game Mode:';

const modeToggleBox = document.createElement('div');
modeToggleBox.classList.add('App__mode-toggle');

const btnModeNumbers = document.createElement('button');
btnModeNumbers.classList.add('App__mode-btn', 'App__mode-btn_active');
btnModeNumbers.textContent = 'Numbers';

const btnModeImage = document.createElement('button');
btnModeImage.classList.add('App__mode-btn');
btnModeImage.textContent = 'Picture';

modeToggleBox.appendChild(btnModeNumbers);
modeToggleBox.appendChild(btnModeImage);

const previewsContainer = document.createElement('div');
previewsContainer.classList.add('App__previews-container');

// Обертка для всех настроек в ряд
const settingsRow = document.createElement('div');
settingsRow.classList.add('App__settings-row');

// Группа 1: Размер поля
const settingsGroupSize = document.createElement('div');
settingsGroupSize.classList.add('App__settings-group');
settingsGroupSize.appendChild(fieldSizeLabel);
settingsGroupSize.appendChild(selectSize);

// Группа 2: Режим игры
const settingsGroupMode = document.createElement('div');
settingsGroupMode.classList.add('App__settings-group');
settingsGroupMode.appendChild(modeLabel);
settingsGroupMode.appendChild(modeToggleBox);

settingsRow.appendChild(settingsGroupSize);
settingsRow.appendChild(settingsGroupMode);

modalContent.appendChild(modalTopBox);

modalContent.appendChild(modalTopBox);
modalContent.appendChild(btnNewGame);
modalContent.appendChild(btnSavedGames);
modalContent.appendChild(btnBestScores);
modalContent.appendChild(btnRules);
modalContent.appendChild(btnSettings);
modalContent.appendChild(btnSound);

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
  createWinScreenContent,
  settingsTitle,
  fieldSizeLabel,
  selectSize,
  settingsMessage,
  savedGamesTitle,
  pauseText,
  createSavedGameRow,
  createBestScoreRow,
  rulesTitle,
  rulesText,
  btnSound,
  modeLabel,
  modeToggleBox,
  btnModeNumbers,
  btnModeImage,
  previewsContainer,
  settingsRow
});