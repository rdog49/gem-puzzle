// Координаты пустой ячейки (по умолчанию правый нижний угол)
let emptyRow = 3;
let emptyCol = 3;

// базовый массиив
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