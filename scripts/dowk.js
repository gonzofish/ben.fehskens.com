(function() {
  const COLS = 5;
  const ROWS = 5;
  const CHEESE_BOARD = 1;
  const GREG_BOARD = -1;

  const getSurroundingSpots = (gregPos) => {
    const up = gregPos - COLS;
    const down = gregPos + COLS;
    const left = gregPos - 1;
    const right = gregPos + 1;

    return { up, down, left, right };
  }

  const getOpenSpots = (gregPos) => {
    // greg's position, above, below
    const openSpots = new Set();
    const spots = getSurroundingSpots(gregPos);

    // if we are NOT in the first row, there's a cell above
    if (spots.up >= 0) {
      openSpots.add(spots.up);
    }

    if (spots.down < COLS * ROWS) {
      openSpots.add(spots.down);
    }

    // If we're in the first cell of a row, there is no left position
    if (gregPos % COLS !== 0) {
      openSpots.add(spots.left);
    }

    // If we're in the last cell of a row, there is no right position
    if (gregPos % COLS !== COLS - 1) {
      openSpots.add(spots.right);
    }

    return openSpots;
  };

  const getDirectionText = (gregPos, cellNum) => {
    const spots = getSurroundingSpots(gregPos);
    const directionTexts = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️'};
    const match = Object.entries(spots).find(([__direction, position]) => position === cellNum);
    const direction = match?.[0];

    return directionTexts[direction] ?? '';

  };

  const createBoard = (gregPos, cheesePos, setGregPos) => {
    const gameTable = document.createElement('table');
    const openSpots = getOpenSpots(gregPos);

    for (let i = 0; i < ROWS; i++) {
      const row = document.createElement('tr');
      const rowStart = i * COLS;

      for (let j = 0; j < COLS; j++) {
        const cell = document.createElement('td');
        const cellNum = rowStart + j;
        const isGreg = cellNum === gregPos;
        const isOpenSpot = openSpots.has(cellNum);
        let img;

        cell.setAttribute('data-cell-num', `${cellNum}`);

        if (isOpenSpot || isGreg) {
          cell.classList.add('open-spot');
          cell.setAttribute('role', 'button');
          cell.addEventListener('click', setGregPos);
        }

        if (isGreg) {
          img = 'greg';
        } else if (cellNum === cheesePos) {
          img = 'cheese';
        }

        if (img) {
          const playerImage = document.createElement('img');
          playerImage.src = `./images/DOWK/game/${img}.png`;
          playerImage.setAttribute('data-cell-num', `${cellNum}`);
          cell.appendChild(playerImage);
          cell.setAttribute('role', 'button');
          cell.addEventListener('click', setGregPos);
        } else if (isOpenSpot) {
          cell.appendChild(document.createTextNode(getDirectionText(gregPos, cellNum)));
        }

        row.appendChild(cell);
      }

      gameTable.appendChild(row);
    }

    return gameTable;
  };

  const createCheeseTouch = (restartGame) => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const button = document.createElement('button');

    div.classList.add('cheese-touch');

    p.appendChild(document.createTextNode('You lost! You got the cheese touch!'));
    div.appendChild(p);

    button.addEventListener('click', restartGame);
    button.appendChild(document.createTextNode('Play again'));
    div.appendChild(button);

    img.src = './images/DOWK/game/cheese-touch.jpg';
    div.appendChild(img);

    return div;
  }

  const getRandomInt = (max) => Math.floor(Math.random() * max);
  const getRandomSpot = () => getRandomInt(COLS * ROWS);

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

  const getRandomNextCheesePos = (cheesePos) => {
    const cheeseSpots = Array.from(getOpenSpots(cheesePos));
    const index = getRandomInt(cheeseSpots.length);

    return cheeseSpots[index];
  };

  const getNextCheesePos = (cheesePos, gregPos) => {
    const cheeseSpots = getOpenCoords(cheesePos, gregPos);
    const gregSpots = getOpenCoords(gregPos, cheesePos);
    const scores = Array(cheeseSpots.length).fill(0);

    for (const gregCoords of gregSpots) {
      for (let i = 0; i < cheeseSpots.length; i++) {
        const cheeseCoords = cheeseSpots[i];
        const xDiff = gregCoords[0] - cheeseCoords[0];
        const yDiff = gregCoords[1] - cheeseCoords[1];

        scores[i] += Math.abs(xDiff) + Math.abs(yDiff);
      }
    }

    let minValue = Infinity;
    let indexes = [];

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < minValue) {
        minValue = scores[i];
        indexes = [i];
      } else if (scores[i] === minValue) {
        indexes.push(i);
      }
    }

    const minIndex = indexes.length > 1 ? getRandomInt(indexes.length) : 0;
    const nextCheese = cheeseSpots[indexes[minIndex]];

    const rowStart = nextCheese[0] * COLS;

    return rowStart + nextCheese[1];
  };

  const runGame = (selector) => {
    const gameContainer = document.querySelector(selector);
    const board = new Array(ROWS * COLS).fill(0);
    let chasing = 0;
    let gregPos;
    let cheesePos;

    const setGameContainerContents = (contents) => {
      gameContainer.innerHTML = '';
      gameContainer.appendChild(contents);
    }

    const restartGame = () => {
      gregPos = getRandomSpot();
      cheesePos = getCheeseStartSpot(gregPos);

      board[gregPos] = GREG_BOARD;
      board[cheesePos] = CHEESE_BOARD;

      drawBoard();
    };

    const checkAreOneApart = () => {
      const [cheeseX, cheeseY] = getCoords(cheesePos);
      const [gregX, gregY] = getCoords(gregPos);

      if (cheeseX === gregX || cheeseX - 1 === gregX || cheeseY + 1 === gregX) {
        return cheeseY === gregY - 1 ||
          cheeseY === gregY + 1;
      }

      if (cheeseY === gregY || cheeseY - 1 === gregY || cheeseY + 1 === gregY) {
        return cheeseX === gregX - 1 ||
          cheeseX === gregX + 1;
      }

      return false;
    };

    const updatePositions = (nextGregPos) => {
      const lastGregPos = gregPos;
      const lastCheesePos = cheesePos;

      if (checkAreOneApart()) {
        chasing += 1;
      } else {
        chasing = 0;
      }

      if (chasing >= 3) {
        cheesePos = getRandomNextCheesePos(cheesePos);
        chasing = 0;
      } else {
        cheesePos = getNextCheesePos(cheesePos, gregPos);
      }

      gregPos = nextGregPos;

      board[lastGregPos] = 0;
      board[lastCheesePos] = 0;
      board[gregPos] = GREG_BOARD;
      board[cheesePos] = CHEESE_BOARD;
    }
    const setGregPos = (event) => {
      const cellNum = event.target.getAttribute('data-cell-num');

      updatePositions(Number(cellNum));

      if (cheesePos === gregPos) {
        setGameContainerContents(createCheeseTouch(restartGame));
      } else {
        drawBoard();
      }

    };
    const drawBoard = () => {
      const board = createBoard(gregPos, cheesePos, setGregPos);

      setGameContainerContents(board);
    };

    restartGame();
  };

  window.dowk = {
    runGame,
  };
})();
