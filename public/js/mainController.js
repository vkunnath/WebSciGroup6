//Angular Controller for the EMFH game applicaiton. Created by RPI Webscience group 6 Spring 2017.


// Instantiate the myApp Angular application that we attached to out html tag
// Here is the Javascript for our controller which we linked (scoped) to the body tag
angular.module("myApp", []).controller("mainController", ['$scope','$http', function($scope, $http){

	//start on home page
	$scope.view = 0;

	//default values for form
	$scope.maxPlayers = 4;
	$scope.maxRounds = 5;
	$scope.maxTraps = 7;

	$scope.currentRound = 0;

	$scope.currentTrapper = "";
	$scope.currentPrisoners = [];


	var choseThisRound = false;

	$scope.waitingToStart = false;
	$scope.waitingForNextTurn = false;

	var alreadyPlayedGame = false;

	//reset the values after a game ends
	function resetValues(){
		//start on home page
		$scope.view = 0;

		//default values for form
		$scope.maxPlayers = 4;
		$scope.maxRounds = 5;
		$scope.maxTraps = 7;

		//$scope.currentRound = 0;

		$scope.currentTrapper = "";
		$scope.currentPrisoners = [];


		var choseThisRound = false;

		$scope.waitingToStart = false;
		$scope.waitingForNextTurn = false;

		$scope.lobbyID = -1;
		$scope.playerName = "";

	}


	//initialize socketIO
	var socket = io.connect();


	//when a player joins the current Lobby
	socket.on('playerEnteredLobby', function(msg){

		//Scoee.apply refreshes scope to update front-end
		$scope.$apply(function(){

			//set current lobby attributes
			$scope.currentTrapper = msg["trapper"];
			$scope.currentPrisoners = msg["prisoners"];
			$scope.lobbyID = msg["lobbyID"];



			//show start game button if we have at least 1 trapper and 1 prisoner
			if($scope.currentPrisoners.length > 0 && $scope.playerName == $scope.currentTrapper){
				$scope.showStartGameButton = true;
			}

			if($scope.playerName != $scope.currentTrapper){
				$scope.waitingToStart = true;
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

		$scope.killedListStr = "";

		//if anyone dies, prepare string
		if(msg.length > 0){
			$scope.killedListStr = "The following prisoners have died: ";			
		}

		//loop over death array and add players to the string
		for(var i = 0; i < msg.length; i++){

			$scope.$apply(function(){
				if(i != msg.length - 1){
					$scope.killedListStr += msg[i] + ", ";	
				}
				else{
					$scope.killedListStr += msg[i];	
				}
			});


			if(msg[i] == $scope.playerName){
				//the current player is dead, display the game over screen
				$scope.$apply(function(){
					$scope.view = 10;
				});
			}
		}

	});

	//when the server returns that there should be a next turn
	socket.on('nextTurn', function(msg){
		
		//increment the round number and allow players to input a new choice
		$scope.$apply(function(){
			$scope.currentRound++;
			$scope.waitingForNextTurn = false;
		});

		choseThisRound = false;

		closeAllDoors();

	}); 


	//When the server says the game has ended
	socket.on('endGame', function(msg){

		alreadyPlayedGame = true;

		resetValues();
		
		//display victory screen for winners, gameover for losers

		//check if this player's name is in the array
		for (var i = 0; i < msg["winners"].length; i++) {
			if(msg["winners"][i] == $scope.playerName){

				//display victory page for the current user
				$scope.$apply(function(){
					$scope.view = 9;	
				});
			
				return;
			}
		}

		//if we reach here, they are a loser
		$scope.$apply(function(){
			$scope.view = 10;
		});



	});


	//When the server returns database information
	socket.on('leaderboardInfo', function(msg){

		msg = JSON.parse(msg);

		$scope.$apply(function(){
			$scope.killerLeaderboard = msg['killerLeaderboard'];

			//sort
			$scope.killerLeaderboard.sort(function(a, b){
				return a['round'] - b['round'];
			});

			$scope.prisonerLeaderboard = msg['prisonerLeaderboard'];

			//sort
			$scope.prisonerLeaderboard.sort(function(a, b){
				return b['round'] - a['round'];
			});

		});

	});

	//when the user picks a name already in the lobby
	socket.on('duplicateNameError', function(msg){

		$scope.$apply(function(){
			$scope.duplicateNameError = msg["message"];
		});

	});


	//tell server to create new lobby if not already in one
	$scope.createGame = function(){

		if(alreadyPlayedGame){

			$scope.refreshMessage = "To create another new game, the page must be refreshed. Refreshing in 3 seconds";

			setTimeout(function(){ location.reload(); }, 3000);
			
		}

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

		if(alreadyPlayedGame){

			$scope.refreshMessage = "To join another new game, the page must be refreshed. Refreshing in 3 seconds...";

			setTimeout(function(){ location.reload(); }, 3000);
		}


		$scope.duplicateNameError = "";
		$scope.nameError = "";

		//check for empty string as name
		if($scope.playerName == "" || $scope.playerName == undefined || $scope.playerName.length < 1){

			$scope.nameError = "Please enter a valid name into the field.";		
			return;
			
		}

		socket.emit('playerEnter', { "lobbyID": $scope.playerCode,
									 "user_name": $scope.playerName });
	}


	//called when trapper indicates to start the game
	$scope.playersReady = function(){

		socket.emit('playersReady', {"lobbyID": $scope.lobbyID, "user_name": $scope.playerName });

	}

	//called when trapper picks a door
	$scope.trapperChoice = function(trapperDoorChoice){

		if(choseThisRound == false){
			choseThisRound = true;

			socket.emit('trapperChoice', { "trapperChoice": trapperDoorChoice, "lobbyID": $scope.lobbyID });	
			//$scope.$apply(function(){
				$scope.waitingForNextTurn = true;
			//});
		}

		
	}

	$scope.prisonerChoice = function(prisonerDoorChoice){

		if(choseThisRound == false){
			choseThisRound = true;

			socket.emit('prisonerChoice', {"name": $scope.playerName, "doorChoice": prisonerDoorChoice, "lobbyID": $scope.lobbyID })
			
			//$scope.$apply(function(){
				$scope.waitingForNextTurn = true;
			//});
		}
		
	}

	//send messge to server to send back updated leaderboard
	$scope.refreshLeaderboards = function(){
		socket.emit('refreshLeaderboards', $scope.lobbyID);

	}

	//call to get leadboard on first load
	$scope.refreshLeaderboards();

	$scope.goToLeaderboard = function(){


		//$scope.$apply(function(){
			$scope.view=6;
		//});

	$scope.refreshLeaderboards();		

	}



}]);



