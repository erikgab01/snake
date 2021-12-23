const io = require('socket.io')({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const { initGameState, gameLoop, getUpdatedDirection } = require('./game')
const FRAMERATE = 10;
const state = {};
const clientRooms = {};

io.on('connection', (client) => {

    client.on('newGame', () => {
        let roomName = makeID(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        state[roomName] = initGameState();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    });

    client.on('joinGame', (gameCode) => {
        const room = io.sockets.adapter.rooms.get(gameCode); // Receive a map object, that have set object as a value

        let numClients = 0;
        if (room) {
            numClients = room.size;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        }
        else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = gameCode;

        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);
        client.emit('gameCode', gameCode);

        startGameInterval(gameCode);
    })

    client.on('keydown', (keyCode) => {
        const roomName = clientRooms[client.id];
        if (!roomName) {
            return;
        }
        const dir = getUpdatedDirection(keyCode);
        const player = state[roomName].players[client.number - 1];
        if (dir && player.dir.x !== -dir.x && player.dir.y !== -dir.y) {
            player.dir = dir;
        }
    })
});

function startGameInterval(roomName) {
    const interval = setInterval(() => {
        const winner = gameLoop(state[roomName]);
        if (!winner) {
            io.to(roomName).emit('gameState', JSON.stringify(state[roomName]));
        }
        else {
            io.to(roomName).emit('gameOver', JSON.stringify({ winner }));
            state[roomName] = null;
            deleteRoom(roomName);
            clearInterval(interval);
        }
    }, 1000 / FRAMERATE)
}

function makeID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function deleteRoom(val) {
    for (var key in clientRooms) {
        if (clientRooms[key] == val) delete clientRooms[key];
    }
}

const PORT = process.env.PORT || 3000

io.listen(PORT);
