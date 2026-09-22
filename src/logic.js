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