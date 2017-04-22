// Instantiate the myApp Angular application that we attached to out html tag
// Here is the Javascript for our controller which we linked (scoped) to the body tag
angular.module("myApp", []).controller("mainController", ['$scope','$http', function($scope, $http){

	//start on home page
	$scope.view = 0;

	console.log("controller working");

	//default values for form
	$scope.maxPlayers = 4;
	$scope.maxRounds = 5;
	$scope.maxTraps = 7;

	$scope.currentRound = 0;

	$scope.currentTrapper = "";
	$scope.currentPrisoners = [];

	//initialize socketIO
	var socket = io.connect();


	//TEST
	// var room = "abc123";
	// socket.on('connect', function(){
	// 	console.log("connected and sending room")
	// 	socket.emit('room', room);
	// });

	// socket.on("testMsg", function(data){
	// 	console.log('Incoming message:', data);
	// });
	//TEST

	//when a player joins the current Lobby
	socket.on('playerEnteredLobby', function(msg){

		console.log("we got it playerEnteredLobby");

		$scope.$apply(function(){
			$scope.currentTrapper = msg["trapper"];
			$scope.currentPrisoners = msg["prisoners"];
			$scope.lobbyID = msg["lobbyID"];

			console.log("LobbyID!!!!");
			console.log($scope.lobbyID);			

			//show start game button if we have at least 1 trapper and 1 prisoner
			console.log("$scope.currentPrisoners.length: " + $scope.currentPrisoners.length);
			console.log("$scope.playerName: " + $scope.playerName + " $scope.currentTrapper: " + $scope.currentTrapper );
			if($scope.currentPrisoners.length > 0 && $scope.playerName == $scope.currentTrapper){
				$scope.showStartGameButton = true;
			}

			$scope.view = 4;
		});

	});


	//current lobby number
	$scope.lobbyID = -1;

	//socket events

	//when connected
	socket.on('connected', function(msg){
		console.log(msg);
	});



	//When wrong player ID
	socket.on('LobbyIDError', function(msg){
		
		$scope.$apply(function(){
			$scope.view = 5;
			$scope.errorMsg = msg["message"];
		});
		
	});	


	//when the server says it's ready for game, switch all users to the game view
	socket.on('startGame', function(msg){

		console.log("revieved startGame");
		console.log(msg);

		$scope.currentRound = 1;

		$scope.$apply(function(){

			if($scope.playerName == $scope.currentTrapper){
				$scope.view = 7;	
			}
			else{
				$scope.view = 8;	
			}
			
		});


	});

	//When a the list of killed players is returned
	socket.on('playersKilled', function(msg){
		console.log("playersKilled");
		console.log(msg);
		for(var i = 0; i < msg.length; i++){
			console.log(msg[i]);

			if(msg[i] == $scope.playerName){
				//the current player is dead, display the game over screen
				window.location.href = 'gameover.html';
			}

		}

	});

	//when the server returns that there should be a next turn
	socket.on('nextTurn', function(msg){
		console.log('nextTurn');
		
		//increment the round number and allow players to input a new choice
		$scope.currentRound++;

	}); 


	//When the server says the game has ended
	socket.on('endGame', function(msg){
		console.log('recieved endGame');

		//display victory screen for winners, gameover for loosers

	});


	//tell server to create new lobby if not already in one
	$scope.createGame = function(){

		console.log("called create game");

		if($scope.lobbyID == -1){
			socket.emit('newGame', { "trapper": $scope.trapperUserName, 
									 "maxRounds": $scope.maxRounds,
									 "maxPlayers": $scope.maxPlayers,
									 "maxTraps": $scope.maxTraps } );	
			$scope.playerName = $scope.trapperUserName;
		}
		else{
			console.log('Already in lobby');
		}
		
	}

	$scope.addPlayer = function(){
		socket.emit('playerEnter', { "lobbyID": $scope.playerCode,
									 "user_name": $scope.playerName });
	}


	//called when trapper indicates to start the game
	$scope.playersReady = function(){

		console.log("Asking server to start game");
		socket.emit('playersReady', {"lobbyID": $scope.lobbyID, "user_name": $scope.playerName });

	}

	//called when trapper picks a door
	$scope.trapperChoice = function(trapperDoorChoice){

		console.log("$scope.trapperDoorChoice: " + trapperDoorChoice);

		var choiceList = [];
		choiceList.push(trapperDoorChoice);

		socket.emit('trapperChoice', { "trapperChoices": choiceList, "lobbyID": $scope.lobbyID });

	}

	$scope.prisonerChoice = function(prisonerDoorChoice){


		socket.emit('prisonerChoice', {"name": $scope.playerName, "doorChoice": prisonerDoorChoice, "lobbyID": $scope.lobbyID })

	}
	



}]);



