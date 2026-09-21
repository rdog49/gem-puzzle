function newGameTemp() {
  let arr = [];
  for (i = 0; i < 4; ++i) {
    arr[i] = [];
    for (j = 0; j < 4; ++j) {
      if (i + j != 6)
        arr[i][j] = i * 4 + j + 1;
      else
        arr[i][j] = "";
    }
  }
}