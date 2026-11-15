(function() {
  const COLS = 5;
  const ROWS = 5;
  const DIRECTION_CHARS = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️'};

  const getSurroundingSpots = (gregPos) => {
    const up = gregPos - COLS;
    const down = gregPos + COLS;
    const left = gregPos - 1;
    const right = gregPos + 1;

    return { up, down, left, right };
  }

  const getMovablePositions = (gregPosition) => {
    // greg's position, above, below
    const openSpots = new Set();
    const spots = getSurroundingSpots(gregPosition);

    // if we are NOT in the first row, there's a cell above
    if (spots.up >= 0) {
      openSpots.add(spots.up);
    }

    if (spots.down < COLS * ROWS) {
      openSpots.add(spots.down);
    }

    // If we're in the first cell of a row, there is no left position
    if (gregPosition % COLS !== 0) {
      openSpots.add(spots.left);
    }

    // If we're in the last cell of a row, there is no right position
    if (gregPosition % COLS !== COLS - 1) {
      openSpots.add(spots.right);
    }

    return openSpots;
  };

  const getDirectionText = (gregPosition, cellNum) => {
    const spots = getSurroundingSpots(gregPosition);
    const match = Object.entries(spots)
      .find(([__direction, position]) => position === cellNum);
    const direction = match?.[0];

    return DIRECTION_CHARS[direction] ?? '';
  };

  const createBoard = ({ cheese, greg }, setGregPos) => {
    const gameTable = document.createElement('table');
    const openSpots = getMovablePositions(greg);

    for (let i = 0; i < ROWS; i++) {
      const row = document.createElement('tr');
      const rowStart = i * COLS;

      for (let j = 0; j < COLS; j++) {
        const cell = document.createElement('td');
        const cellNum = rowStart + j;
        const isGreg = cellNum === greg;
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
        } else if (cellNum === cheese) {
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
          cell.appendChild(document.createTextNode(getDirectionText(greg, cellNum)));
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

  const getCheeseStartSpot = (greg) => {
    // greg's position, above, below
    const badPositions = getMovablePositions(greg);
    const getIsNearGreg = (position) =>
      position === greg ||
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
    const openSpots = getMovablePositions(position);
    const openCoords = [];

    for (const spot of openSpots) {
      openCoords.push(getCoords(spot));
    }

    return openCoords;
  }

  const getRandomNextCheesePos = (cheese) => {
    const cheeseSpots = Array.from(getMovablePositions(cheese));
    const index = getRandomInt(cheeseSpots.length);

    return cheeseSpots[index];
  };

  const calculateScores = (cheese, greg) => {
    const scores = Array(cheese.length).fill(0);

    for (const gregCoords of greg) {
      for (let i = 0; i < cheese.length; i++) {
        const cheeseCoords = cheese[i];
        const xDiff = gregCoords[0] - cheeseCoords[0];
        const yDiff = gregCoords[1] - cheeseCoords[1];

        scores[i] += Math.abs(xDiff) + Math.abs(yDiff);
      }
    }

    return scores;
  };

  const getMinScoreIndex = (scores) => {
    let minValue = Infinity;
    let indexes = [];

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] < minValue) {
        minValue = scores[i];
        indexes = [i];
      } else if (scores[i] === minValue) {
        indexes.push(i);
      }
    }

    const index = indexes.length > 1 ? getRandomInt(indexes.length) : 0;

    return indexes[index];
  };

  const getNextCheesePos = ({ cheese, greg }) => {
    const cheeseCoords = getOpenCoords(cheese, greg);
    const gregCoords = getOpenCoords(greg, cheese);
    const scores = calculateScores(cheeseCoords, gregCoords);
    const minIndex = getMinScoreIndex(scores);
    const nextCheese = cheeseCoords[minIndex];
    const rowStart = nextCheese[0] * COLS;

    return rowStart + nextCheese[1];
  };

  const replaceContents = (container, contents) => {
    container.innerHTML = '';
    container.appendChild(contents);
  };

  const getDimensionIsOneApart = (cheese, greg) =>
    cheese === greg ||
    cheese - 1 === greg ||
    cheese + 1 === greg;

  const checkIsOneApart = (state) => {
    const [cheeseX, cheeseY] = getCoords(state.cheese);
    const [gregX, gregY] = getCoords(state.greg);
    const xIsOneApart = getDimensionIsOneApart(cheeseX, gregX);
    const yIsOneApart = getDimensionIsOneApart(cheeseY, gregY);

    return xIsOneApart && yIsOneApart;
  };

  const moveCheese = (state) => {
    let chases = 0;

    if (checkIsOneApart(state)) {
      chases = state.chases + 1;
    }

    if (chases >= 3) {
      return {
        chases: 0,
        cheese: getRandomNextCheesePos(state.cheese)
      };
    }

    return {
      chases,
      cheese: getNextCheesePos(state),
    };
  };

  const drawGame = (state, updateState) => {
    const onMoveGreg = (event) => {
      const cellNum = event.target.getAttribute('data-cell-num');
      const cheese = moveCheese(state);

      updateState({ ...cheese, greg: Number(cellNum) });
    };

    return createBoard(state, onMoveGreg);
  };

  const runGame = (selector) => {
    const gameContainer = document.querySelector(selector);

    const draw = (state) => {
      const isGameOver = state.cheese === state.greg;

      if (isGameOver) {
        replaceContents(gameContainer, createCheeseTouch(restartGame));
      } else {
        replaceContents(gameContainer, drawGame(state, draw));
      }
    };
    const restartGame = () => {
      const greg = getRandomSpot();
      const state = {
        chases: 0,
        greg,
        cheese: getCheeseStartSpot(greg),
      }

      draw(state);
    };

    restartGame();
  };

  window.dowk = {
    runGame,
  };
})();
