const BG_COLOR = '#000';
const SNAKE_ONE_COLOR = '#2f2';
const SNAKE_TWO_COLOR = '#f22';
const FOOD_COLOR = '#e96';

const socket = io('http://localhost:3000');

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const countdown = document.getElementById('countdown');

let canvas, ctx;
let playerNumber;
let gameActive = false;

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

socket.on('gameState', (gameState) => {
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
});

socket.on('gameOver', (data) => {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);
    if (data.winner === playerNumber) {
        alert('You win');
    }
    else {
        alert('You lose');
    }
    gameActive = false;
});

socket.on('init', (number) => {
    playerNumber = number;
});

socket.on('gameCode', (gameCode) => {
    gameCodeDisplay.innerText = gameCode;
});

socket.on('unknownGame', () => {
    resetGame();
    alert('Unknown game code');
})

socket.on('tooManyPlayers', () => {
    resetGame();
    alert('This game is already in progress')
})

socket.on('startCountdown', (count) => {
    countdown.style.display = 'block'
    const interval = setInterval(() => {
        countdown.innerText = `Your game will start in ${count}`;
        count--;
        if (count < 0) {
            clearInterval(interval);
        }
    }, 1000);
})

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
  
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(event) {
    socket.emit('keydown', event.keyCode);
}

function paintGame(state) {
    console.log('print');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize;

    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_ONE_COLOR)
    paintPlayer(state.players[1], size, SNAKE_TWO_COLOR) 
}

function paintPlayer(player, size, color) {
    const snake = player.snake;
    ctx.fillStyle = color;

    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size)
    }
}

function resetGame() {
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none';
}