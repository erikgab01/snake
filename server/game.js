const GRIDSIZE = 20;

function initGameState() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 2,
                y: 10,
            },
            dir: {
                x: 1,
                y: 0,
            },
            snake: [
                { x: 0, y: 10 },
                { x: 1, y: 10 },
                { x: 2, y: 10 },
            ],
        }, {
            pos: {
                x: 17,
                y: 5,
            },
            dir: {
                x: -1,
                y: 0,
            },
            snake: [
                { x: 19, y: 5 },
                { x: 18, y: 5 },
                { x: 17, y: 5 },
            ],
        }],
        food: {},
        gridSize: GRIDSIZE,
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.dir.x;
    playerOne.pos.y += playerOne.dir.y;

    playerTwo.pos.x += playerTwo.dir.x;
    playerTwo.pos.y += playerTwo.dir.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRIDSIZE - 1 || playerOne.pos.y < 0 || playerOne.pos.y > GRIDSIZE - 1) {
        return 2;
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRIDSIZE - 1 || playerTwo.pos.y < 0 || playerTwo.pos.y > GRIDSIZE - 1) {
        return 1;
    }

    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.dir.x;
        playerOne.pos.y += playerOne.dir.y;
        randomFood(state);
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.dir.x;
        playerTwo.pos.y += playerTwo.dir.y;
        randomFood(state);
    }

    if (playerOne.dir.x || playerOne.dir.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }

        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if (playerTwo.dir.x || playerTwo.dir.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1;
            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return 0;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRIDSIZE),
        y: Math.floor(Math.random() * GRIDSIZE),
    }

    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    state.food = food;
}

function getUpdatedDirection(keyCode) {
    switch (keyCode) {
        case 37: { // left
            return { x: -1, y: 0 };
        }
        case 38: { // down
            return { x: 0, y: -1 };
        }
        case 39: { // right
            return { x: 1, y: 0 };
        }
        case 40: { // up
            return { x: 0, y: 1 };
        }
    }
}

module.exports = { initGameState, gameLoop, getUpdatedDirection };