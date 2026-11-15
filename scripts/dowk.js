(function() {
  const COLS = 5;
  const ROWS = 5;
  const CHEESE_BOARD = 1;
  const GREG_BOARD = -1;

  const getOpenSpots = (gregPos, cheeseSpot = -1) => {
    // greg's position, above, below
    const openSpots = new Set();
    const aboveGreg = gregPos - COLS;
    const belowGreg = gregPos + COLS;
    const leftGreg = gregPos - 1;
    const rightGreg = gregPos + 1;

    // if we are NOT in the first row, there's a cell above
    if (aboveGreg > 0 && cheeseSpot !== aboveGreg) {
      openSpots.add(aboveGreg);
    }

    if (belowGreg < COLS * ROWS && cheeseSpot !== belowGreg) {
      openSpots.add(belowGreg);
    }

    // If we're in the first cell of a row, there is no left position
    if (gregPos % COLS !== 0 && leftGreg !== cheeseSpot) {
      openSpots.add(leftGreg);
    }

    // If we're in the last cell of a row, there is no right position
    if (gregPos % COLS !== COLS - 1 && rightGreg !== cheeseSpot) {
      openSpots.add(rightGreg);
    }

    return openSpots;
  };

  const createBoard = (gregPos, cheesePos, setGregPos) => {
    const gameTable = document.createElement('table');
    const openSpots = getOpenSpots(gregPos, cheesePos);

    for (let i = 0; i < ROWS; i++) {
      const row = document.createElement('tr');
      const rowStart = i * COLS;

      for (let j = 0; j < COLS; j++) {
        const cell = document.createElement('td');
        const cellNum = rowStart + j;
        let img;

        if (cellNum === gregPos) {
          img = 'greg';
        } else if (cellNum === cheesePos) {
          img = 'cheese';
        }

        if (img) {
          const playerImage = document.createElement('img');
          playerImage.src = `./images/DOWK/game/${img}.png`;
          cell.appendChild(playerImage);
        } else if (openSpots.has(cellNum)) {
          cell.classList.add('open-spot');
          cell.setAttribute('data-cell-num', `${cellNum}`);
          cell.addEventListener('click', setGregPos);
        }

        if (!img) {
          cell.appendChild(document.createTextNode(cellNum));
        }

        row.appendChild(cell);
      }

      gameTable.appendChild(row);
    }

    return gameTable;
  };

  const getRandomSpot = () => Math.floor(Math.random() * (COLS * ROWS));

  const getCheeseStartSpot = (gregPos) => {
    // greg's position, above, below
    const badPositions = getOpenSpots(gregPos);
    const getIsNearGreg = (position) =>
      position === gregPos ||
      badPositions.has(position);

    let cheeseStart = getRandomSpot();

    while (getIsNearGreg(cheeseStart)) {
      cheeseStart = getRandomSpot();
    }

    return cheeseStart;
  };

  /*
    |  0 |  1 |  2 |  3 |  4 |
    |  5 |  6 |  7 |  C |  9 |
    | 10 |  G | 12 | 13 | 14 |
    | 15 | 16 | 17 | 18 | 19 |
    | 20 | 21 | 22 | 23 | 24 |

    G = 11
    C = 8
    s(G) = 6, 10, 12, 16
    s(C) = 3, 7, 9, 13

    - figure out greg's best move
    - figure out next move vs greg's best move

    row_start = i * COLS
    cell_num = row_start + j

    i = floor(cell_num / COLS)
    j = cell_num - (i * COLS)

    ng = 6, c = 8
      row = floor(ng / 5)
      col = ng - row
  */
  const getCoords = (position) => {
    const i = Math.floor(position / COLS);
    const j = position - (i * COLS);

    return [i, j];
  };

  const getOpenCoords = (position) => {
    const openSpots = getOpenSpots(position);
    const openCoords = [];

    for (const spot of openSpots) {
      openCoords.push(getCoords(spot));
    }

    return openCoords;
  }

  const getNextCheesePos = (cheesePos, gregPos) => {
    const cheeseSpots = getOpenCoords(cheesePos, gregPos);
    const gregSpots = getOpenCoords(gregPos, cheesePos);
    const scores = Array(cheeseSpots.length).fill(0);
    // G -> 11 -> [2, 1]
    //  [6, 10, 12, 16] -> [[1, 1], [2, 0], [2, 2], [3, 1]]
    // C -> 8 -> [1, 3] ->
    //  [3,  7,  9, 13] -> [[0, 3], [1, 2], [1, 4], [2, 3]]
    // [1, 1]
    //    [0, 3] = [-1, +2] = 3
    //    [1, 2] = [ 0, +1] = 1
    //    [1, 4] = [ 0, +3] = 3
    //    [2, 3] = [+1, +2] = 3
    // [2, 0]
    //    [0, 3] = [-2, +3] = 5 *
    //    [1, 2] = [-1, +2] = 3
    //    [1, 4] = [-1, +4] = 5 *
    //    [2, 3] = [ 0, +3] = 3
    // [2, 2]
    //    [0, 3] = [-2, +1] = 3
    //    [1, 2] = [-1,  0] = 1
    //    [1, 4] = [-1, +2] = 3
    //    [2, 3] = [ 0, +1] = 1
    // [3, 1]
    //    [0, 3] = [-3, +2] = 5 *
    //    [1, 2] = [-2, +1] = 3
    //    [1, 4] = [-2, +3] = 5 *
    //    [2, 3] = [-1, +2] = 3

    // [0, 3] = 3 + 5 + 3 + 5 = 16
    // [1, 2] = 1 + 3 + 1 + 3 = 8
    // [1, 4] = 3 + 5 + 3 + 5 = 16
    // [2, 3] = 3 + 3 + 1 + 3 = 10
    for (const gregCoords of gregSpots) {
      for (let i = 0; i < cheeseSpots.length; i++) {
        const cheeseCoords = cheeseSpots[i];
        const xDiff = gregCoords[0] - cheeseCoords[0];
        const yDiff = gregCoords[1] - cheeseCoords[1];

        scores[i] += Math.abs(xDiff) + Math.abs(yDiff);
      }
    }

    let maxIndex = 0;

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[maxIndex]) {
        maxIndex = i;
      }
    }

    const nextCheese = cheeseSpots[maxIndex];

    const rowStart = nextCheese[0] * COLS;

    return rowStart + nextCheese[1];
  };

  const runGame = (selector) => {
    const gameContainer = document.querySelector(selector);
    const board = new Array(ROWS * COLS).fill(0);
    let gregPos = getRandomSpot();
    let cheesePos = getCheeseStartSpot(gregPos);

    board[gregPos] = GREG_BOARD;
    board[cheesePos] = CHEESE_BOARD;

    /*
      - Move up/down/left/right (NO DIAGONAL)
      - Only move 1 spot
    */

    const updatePositions = (nextGregPos) => {
      const lastGregPos = gregPos;
      const lastCheesePos = cheesePos;

      cheesePos = getNextCheesePos(cheesePos, gregPos);
      gregPos = nextGregPos;

      board[lastGregPos] = 0;
      board[lastCheesePos] = 0;
      board[gregPos] = GREG_BOARD;
      board[cheesePos] = CHEESE_BOARD;
    }
    const setGregPos = (event) => {
      const cellNum = event.target.getAttribute('data-cell-num');

      updatePositions(Number(cellNum));
      drawBoard();
    };
    const drawBoard = () => {
      gameContainer.innerHTML = '';

      const board = createBoard(gregPos, cheesePos, setGregPos);

      gameContainer.appendChild(board);
    };

    drawBoard();
  };

  window.dowk = {
    runGame,
  };
})();
