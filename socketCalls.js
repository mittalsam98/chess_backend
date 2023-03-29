var io
var gameSocket
var gamesInSession = []
var orientationColor;

const initializeGame = (sio, socket) => {

    io = sio 
    gameSocket = socket 

    gamesInSession.push(gameSocket)
    gameSocket.on("disconnect", onDisconnect)
    gameSocket.on("new move", newMove)
    gameSocket.on("createNewGame", createNewGame)
    gameSocket.on("newGame", newGame)
    gameSocket.on("playerJoinsGame", playerJoinGame)
    gameSocket.on('request username', requestUserName)
    gameSocket.on('recieved userName', recievedUserName)
    videoChatBackend()
}


function videoChatBackend() {
    gameSocket.on("callUser", (data) => {
        console.log('fasdfasdfsafd',data);
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })
    
    gameSocket.on("acceptCall", (data) => {
        console.log('accept',data);
        io.to(data.to).emit('callAccepted', data.signal);
    })
}


function createNewGame(data) {
    orientationColor=data.orientationColor;
    this.emit('createNewGame', {userName:data.userName,gameId: data.gameId, mySocketId: this.id,orientationColor:data.orientationColor});
    this.join(data.gameId)
}

function newGame(data) {
    const gameId = data.gameId;
    io.to(gameId).emit('newGame', data);

}

function playerJoinGame(idData) {
    //Joins the given socket to a session with it's gameId

    var sock = this
    const room= io.sockets.adapter.rooms.get(idData.gameId);

    // If the room exists...
    if (room === undefined) {
        this.emit('status' , "This game session does not exist." );
        return
    }
    if (room.size < 2) {
        // attach the socket id to the data object.
        idData.mySocketId = sock.id;
        idData.orientationColor=orientationColor;
        // Join the room
        sock.join(idData.gameId);

        if (room.size === 2) {
            io.sockets.in(idData.gameId).emit('start game', idData)
        }

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('status' , "There are already 2 people playing in this room." );
    }
}



function newMove(newMove) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */    
    const gameId = newMove.gameId;
    io.to(gameId).emit('opponent move', newMove);
}

function onDisconnect() {
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);

}


function requestUserName(gameId) {
    io.to(gameId).emit('give userName', this.id);
}

function recievedUserName(data) {
    data.socketId = this.id
    io.to(data.gameId).emit('get Opponent UserName', data);
}

exports.initializeGame = initializeGame;
