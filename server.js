// server init + mods
var express = require('express');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var server = app.listen(3333, function(){})
var io = require('socket.io').listen(server);


//serve html/javascript files
app.use( express.static(__dirname + '/public' ));


// server route handler
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'public' ,'index.html'));
})


//global array of JSON objects to hold game data
var globalGameInfo = [];


//Database Settings

var killerSchema = mongoose.Schema({
    data:{
        type: String,
        get: function(data){
            try {
                return JSON.parse(data);
            } catch (err){
                return data;
            }        
        },
        set: function(data){
            return JSON.stringify(data);
        }
    }
});

var playerSchema = mongoose.Schema({
    data:{
        type: String,
        get: function(data){
            try {
                return JSON.parse(data);
            } catch (err){
                return data;
            }        
        },
        set: function(data){
            return JSON.stringify(data);
        }
    }
});

var killerboard = mongoose.model('killerboard', killerSchema);
var playerboard = mongoose.model('playerboard', playerSchema);

//Database load functions

function loadKillerScore( score, res ){
  killerboard.create({
    data : score
  });
}

function loadPlayerScore( score, res ){
  playerboard.create({
    data : score
  });
}

// user connected even handler
io.sockets.on('connection', function(socket){
  	
  //TEST
  // function f1(){
  //   var room = "abc123";
  //   console.log("sending to room");
  //   io.sockets.in(room).emit('testMsg', 'Hello World!');
  // }

  // socket.on('room', function(room){
  //   console.log("recieved room, joining");
  //   socket.join(room);

  //   setTimeout(f1, 3000);

  // });
  //TEST

  // log & brodcast connect event
  console.log('a user connected');

  //broadcast connected back to the client
  socket.emit('connected', {message: "Connected to EMFH successfully"});

  //Host events server-side
  socket.on('newGame', newGame);
  socket.on('playersReady', playersReady);

  //player events server-side
  socket.on('playerEnter', playerEnter);
  
  //player choices
  socket.on('trapperChoice', trapperChoice);
  socket.on('prisonerChoice', prisonerChoice);


  // log disconnect event
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  //fire when we get parameters from client
  socket.on('params', function(params){
	  console.log("got paramters");
  })

  //client asked to create a lobby. Generate lobby id, and join lobby
  function newGame(data) {

    //create unique lobby ID by generating random number
    //var lobbyID = Math.floor((Math.random() * 99999) + 1);
    var lobbyID = 1;

    //create gameInfo object to store data about current game
    var currGameInfo = {
      "socket":  this.id,
      "trapper": data["trapper"],
      "trapperChoices": [],
      "maxRounds": data["maxRounds"],
      "maxPlayers": data["maxPlayers"],
      "maxTraps": data["maxTraps"],
      "prisoners": [],
      "currentRound": 0
    }
    //add to global gameInfo Array

    var lobbyIDStr = lobbyID.toString();

    globalGameInfo[lobbyIDStr] = currGameInfo;

    console.log("globalGameInfo");
    //console.log(globalGameInfo);

    console.log(globalGameInfo[lobbyIDStr]);

    console.log("lobbyIDStr");
    console.log(lobbyIDStr)

    // send lobby and socket back to client
    

    socket.join(lobbyIDStr);


    //io.sockets.in(lobbyIDStr).emit('lobbyCreated', { "lobbyID": lobbyID, "socket": this.id});
    
    //wait a sec to make sure join completes
    function waitForJoin(){
      io.sockets.in(lobbyIDStr).emit('playerEnteredLobby', { "lobbyID": lobbyIDStr, 
                                                           "socket": this.id, 
                                                           "trapper": globalGameInfo[lobbyIDStr]["trapper"], 
                                                           "prisoners": globalGameInfo[lobbyIDStr]["prisoners"] });

    }

    setTimeout(waitForJoin, 500);

    

  }

  // All players are ready, let the host know
  function playersReady(gameInfo){

    //create object to hold game information
    // var gameInfo = {
    //   "socket" : this.id,
    //   "lobbyID" : this.lobbyID    
    // };

    console.log("gameInfo from playersReady");
    console.log(gameInfo);

    //send this object to all client plays to signal the start of the game
    io.sockets.in(gameInfo["lobbyID"]).emit('startGame', {message: "starting game"});

  }


  //Player events!

  //function to handle player entering lobby 
  function playerEnter(data) {

    //var to save the player's socket
    var playerSocket = this;

    // get the correct lobby from socket io manager 

    // console.log("In playerEnter");
    // console.log("data lobbyID");
    // console.log(data["lobbyID"]);


    // console.log("ROOMS1");
    // console.log(io.sockets.adapter.rooms);

    var lobby = io.sockets.adapter.rooms[ data["lobbyID"] ];

    //If the lobby was created
    if( lobby != undefined ){
      
      //set the id of the socket to the data object
      data["socket"] = playerSocket.id;

      //connect to the socket
      socket.join(data["lobbyID"]);

      //Add to global object 

      //@HERE I should check for duplicate name

      //create object of prisoner and thier current choice
      var prisonerObj = { "name": data["user_name"],
                           "doorChoice": -1, "alive": true } 

      globalGameInfo[data["lobbyID"]]["prisoners"].push(prisonerObj);

      data["prisoners"] = globalGameInfo[ data["lobbyID"] ]["prisoners"];
      data["trapper"] = globalGameInfo[ data["lobbyID"] ]["trapper"];

      //@HERE I should check if lobby is full

      //@HERE test output
      console.log("Player " + data["user_name"] + " joined");

      //let all players know that the player has joined the lobby


      //use setTimeout to ensure join completes
      function waitForJoin(){
        // console.log("ROOMS2");
        // console.log(io.sockets.adapter.rooms);
        io.sockets.in(data["lobbyID"]).emit('playerEnteredLobby', data);  
      }
      setTimeout(waitForJoin, 500);


    }
    else{

      console.log("room not found");

      io.to(socket.id).emit('LobbyIDError', { "message": "The room with this id has not been created." } );

    }
  }


  //get trapper choice and update global array
  function trapperChoice(data){

    console.log(data);
    var lobbyID = data["lobbyID"].toString();

    console.log(globalGameInfo[data["lobbyID"]]);

    globalGameInfo[lobbyID]["trapperChoices"] = data["trapperChoices"]; 

    console.log('globalGameInfo[lobbyID]["trapperChoices"]');
    console.log(globalGameInfo[lobbyID]["trapperChoices"]);

    //var lobbyID = data["lobbyID"];
    checker(lobbyID);

  }

  //firest when a prisoner chooses a door
  function prisonerChoice(data){

    console.log("in prisoner choice");

    console.log(data);
    var lobbyID = data["lobbyID"].toString();
    console.log(globalGameInfo[lobbyID]);

    var currPrisoner = data["name"];
    var currPrisonerChoice = data["doorChoice"]; 


    //Loop over prisoners in the game
    for(var i = 0; i < globalGameInfo[lobbyID]["prisoners"].length; i++ ){

      //if this is the user that sent the message
      if(globalGameInfo[lobbyID]["prisoners"][i]["name"] == currPrisoner){
        
        //set the door choice of this user
        globalGameInfo[lobbyID]["prisoners"][i]["doorChoice"] = currPrisonerChoice;
        break;
      }

    }

    


    console.log("globalGameInfo[data['lobbyID']]['prisoners']['doorChoice']");
    console.log(globalGameInfo[lobbyID]["prisoners"]["doorChoice"]);

    //check if all players chose a door, and see who died
    
    checker(lobbyID);



  }

  //checks to see if all players 
  function checker(lobbyID){

    console.log("IN CHECKER");

    //Check if trapper has made choices
    if ( globalGameInfo[lobbyID]["trapperChoices"].length == 0 ){
      console.log("trapperChoices empty");
      return;
    }

    //check if all prisoners made choices. if not return
    for (var i = 0; i < globalGameInfo[lobbyID]["prisoners"].length; i++) {
      if (globalGameInfo[lobbyID]["prisoners"][i]["doorChoice"] == -1){
        console.log("trapper picked but at least 1 prisoner didn't");
        return;
      } else {
        for(var j = 0; j < globalGameInfo[lobbyID]["trapperChoices"].length; j++){
          //if prisoner chose a trap door
          if(globalGameInfo[lobbyID]["trapperChoices"][j] == globalGameInfo[lobbyID]["prisoners"][i]["doorChoice"]){
            //kill the prisoner
            console.log("Setting prisoner to dead");
            globalGameInfo[lobbyID]["prisoners"][i]["alive"] = false;
          }
        }
      }
    }

    endTurn(lobbyID);

  }


  //send out to users who died
  function endTurn(lobbyID){


    console.log("In end turn");

    //loop through all prisoners 
    var killedList = [];
    var allDead = true;
    for(var i = 0; i < globalGameInfo[lobbyID]["prisoners"].length; i++){

      if(globalGameInfo[lobbyID]["prisoners"][i]["alive"] == false){
        killedList.push(globalGameInfo[lobbyID]["prisoners"][i]["name"]);
      }
      else{
        allDead = false;
      }
    }

    //send killed list to all players
    io.sockets.in(lobbyID).emit('playersKilled', killedList);

    //increment round number
    globalGameInfo[lobbyID]["currentRound"]++;

    //See if we should end game
    if(globalGameInfo[lobbyID]["currentRound"] > globalGameInfo[lobbyID]["maxRounds"] || allDead){

      io.sockets.in(lobbyID).emit('endGame');

    }
    else{
      io.sockets.in(lobbyID).emit('nextTurn');      
    }

  }



});


