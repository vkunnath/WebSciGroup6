// Instantiate the myApp Angular application that we attached to out html tag
// Here is the Javascript for our controller which we linked (scoped) to the body tag
angular.module("myApp", []).controller("mainController", ['$scope','$http', function($scope, $http){


	console.log("controller working");

	//default values for form
	$scope.numPlayers = 4;
	$scope.numRounds = 5;
	$scope.numTraps = 7;

	$scope.currentTrapper = "";

	//initialize socketIO
	var socket = io.connect();


	//TEST
	var room = "abc123";
	socket.on('connect', function(){
		console.log("connected and sendig room")
		socket.emit('room', room);
	});

	socket.on("testMsg", function(data){
		console.log('Incoming message:', data);
	});

	//TEST

	//when a player joins the current Lobby
	socket.on('playerEnteredLobby', function(msg){

		console.log("we got it playerEnteredLobby");

		$scope.$apply(function(){
			$scope.currentTrapper = msg["trapper"];
			$scope.currentPrisoners = msg["prisoners"];
			$scope.lobbyID = msg["lobbyID"];

			$scope.view = 4;
		});

	});


	//current lobby number
	$scope.currLobby = -1;

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


	//tell server to create new lobby if not already in one
	$scope.createGame = function(){

		console.log("called create game");

		if($scope.currLobby == -1){
			socket.emit('newGame', { "trapper": $scope.trapperUserName, 
									 "maxRounds": $scope.maxRounds,
									 "maxPlayers": $scope.maxPlayers,
									 "maxTraps": $scope.maxTraps } );	
		}
		else{
			console.log('Already in lobby');
		}


		//if lobby created server side
		// socket.on('lobbyCreated', function(msg){

		// 	console.log(msg);

		// 	//switch to lobby view
		// 	$scope.view = 4;

		// 	$scope.currLobby = msg["lobbyID"];

		// 	$scope.currentTrapper = $scope.trapperUserName;

		// });
		

	}

	$scope.addPlayer = function(){

		socket.emit('playerEnter', { "lobbyID": $scope.playerCode,
									 "user_name": $scope.playerName });


	}


	



}]);



