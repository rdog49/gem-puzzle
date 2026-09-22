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


let boardState = [
    7, 6, 5, 1,
    8, 2, 14, 3,
    13, 15, 9, 11,
    0, 12, 10, 4
];

function renderBoard() {
    mainBoardContainer.innerHTML = '';

    boardState.forEach((value) => {
        const tile = document.createElement('div');
        tile.classList.add('App__tile');

        if (value === 0) {
            tile.classList.add('App__tile_empty');
        } else {
            tile.textContent = value;
            tile.classList.add('App__tile_number');
        }

        mainBoardContainer.appendChild(tile);
    });
}
const {
    moveTile
} = require('./logic.js');

let movesCount = 0;
const movesCounterElement = appMovesCounter;

function renderBoard() {
    mainBoardContainer.innerHTML = '';

    boardState.forEach((value, index) => {
        const tile = document.createElement('div');
        tile.classList.add('App__tile');

        if (value === 0) {
            tile.classList.add('App__tile_empty');
        } else {
            tile.textContent = value;
            tile.classList.add('App__tile_number');

            tile.addEventListener('click', () => {
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
}

renderBoard();