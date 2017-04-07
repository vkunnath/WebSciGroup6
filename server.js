// server init + mods
var express = require('express');
var app = express();
var http = require('http').Server(app);


var server = app.listen(3333, function(){})
var io = require('socket.io').listen(server);


//serve html/javascript files
app.use( express.static(__dirname + '/public' ));


// server route handler
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'public' ,'index.html'));
})



// user connected even handler
io.on('connection', function(socket){
  	
  // log & brodcast connect event
  console.log('a user connected');

  //broadcast connected back to the client
  socket.emit('connected', {message, "Connected to EMFH successfully"})

  //Host events server-side
  socket.on('newGame', newGame);
  socket.on('playersReady', playersReady);
  socket.on('timerDone', beginGame);
  socket.on('nextChoice', nextChoice);

  //player events server-side
  socket.on('playerEnter', playerEnter);
  socket.on('playerChoice', playerChoice);
  socket.on('playerRestart', playerRestart);


  // log disconnect event
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  //fire when we get parameters from client
  socket.on('params', function(params){

  	
	 console.log("got paramters");
	    
})

//client asked to create a lobby. Generate lobby id, and join lobby
function newGame() {

  //create unique lobby ID by generating random number
  var lobbyID = Math.floor((Math.random() * 99999) + 1);

  // send lobby and socket back to client
  this.emit('lobbyCreated', {myLobbyID: lobbyID, mySocket: this.id});

  var lobbyIDStr = lobbyID.toString();

  this.join(lobbyID.toString());


}

// All players are ready, let the host know
function playersReady(lobbyID){

  //create object to hold game information
  var gameInfo = {
    mySocket : this.id,
    myLobbyID : this.lobbyID    
  };

  //send this object to all client plays to signal the start of the game
  io.sockets.in(gameInfo.myLobbyID).emit('startGame', gameInfo);

}

//starts game by calling game logic function(s)
function beginGame(lobbyID){
  console.log("beginning game");

  //call function that performs game logic
  gameLogic(lobbyID);

}

//Here we will put the logic of the game. For example seeing if the 
function gameLogic(lobbyID){

  console.log("Game logic goes here");

}

// Function to check if game should end or go for more rounds
function nextChoice(gameInfo){

  //if we are under the max number of rounds
  if(gameInfo.round < gameInfo.roundLimit){

    //perform game logic
    gameLogic(lobbyID);

  }
  else{
    io.sockets.in(gameInfo.myLobbyID).emit('endGame', gameInfo);
  }

}


//Player events!

//function to handle player entering lobby 
function playerEnter(data) {

  //var to save the player's socket
  var playerSocket = this;

  // get the correct lobby from socket io manager 
  //var lobby = 



}


});









