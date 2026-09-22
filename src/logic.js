let emptyRow = 3;
let emptyCol = 3;


function createInitialBoard() {
    const board = [];
    let counter = 1;
    for (let i = 0; i < 4; i++) {
        board[i] = [];
        for (let j = 0; j < 4; j++) {
            if (i === 3 && j === 3) {
                board[i][j] = '';
            } else {
                board[i][j] = counter++;
            }
        }
    }
    return board;
}

function swapTiles(arr, r1, c1, r2, c2) {
    const temp = arr[r1][c1];
    arr[r1][c1] = arr[r2][c2];
    arr[r2][c2] = temp;
}


function shuffleBoard(arr) {
    emptyRow = 3;
    emptyCol = 3;

    for (let i = 0; i < 100; i++) {
        const directions = [{
                r: -1,
                c: 0
            },
            {
                r: 1,
                c: 0
            },
            {
                r: 0,
                c: -1
            },
            {
                r: 0,
                c: 1
            }
        ];

        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newRow = emptyRow + randomDir.r;
        const newCol = emptyCol + randomDir.c;

        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            swapTiles(arr, emptyRow, emptyCol, newRow, newCol);
            emptyRow = newRow;
            emptyCol = newCol;
        }
    }
    return arr;
}

function checkWin(arr) {
    let counter = 1;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i === 3 && j === 3) {
                return arr[i][j] === '';
            }
            if (arr[i][j] !== counter++) {
                return false;
            }
        }
    }
    return true;
}

function makeMove(arr, row, col) {
    const isAdjacent =
        (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
        (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (isAdjacent) {
        swapTiles(arr, emptyRow, emptyCol, row, col);
        emptyRow = row;
        emptyCol = col;
        return true;
    }
    return false;
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
}

// блок с логикой рандомной генерации и проверки на решаемость
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
    // Для нечетного размера (3x3, 5x5)
    return inversions % 2 === 0;
  } else {
    // Для четного размера (4x4, 6x6)
    const emptyIndex = board.indexOf(0);
    const rowFromBottom = gridSize - Math.floor(emptyIndex / gridSize);
    if (rowFromBottom % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      return inversions % 2 !== 0;
    }
  }
}

// Генерация случайного перемешанного и гарантированно решаемого поля
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

// Проверка на победу, потом надо будет
function isWinningBoard(board) {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

module.exports = { canMove, moveTile, generateSolvableBoard, isWinningBoard };