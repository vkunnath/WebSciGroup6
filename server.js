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
  
    // log disconnect event
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    //fire when we get parameters from client
    socket.on('params', function(params){

    	
		 console.log("got paramters");
	    

	})
  
    


});









