var vertx = require('vertx');
// We see the API is often chained. This is typical in environments
// that support async features

var players = []
var timeLeft = 25

// Handles updates from the player
vertx.eventBus.registerHandler("game", function(message) {
	for (i = 0; i < players.length; i++) {
		if (players[i] && players[i].name == message.name) {
			players[i] = message;
			return;
		}
	}
	players.push(message)
});

// Get the game moving
vertx.setPeriodic(1000, function(timerID) {
    timeLeft--;
    if (timeLeft == 0) {
    	timeLeft = 25;
    	vertx.eventBus.publish("game.updates", {
    		"state": "done",
    		"players": players
    	});
    	// reset the players for next round
    	players = [];
    }
    if (timeLeft < 10 && timeLeft > 3) {
    	vertx.eventBus.publish("game.updates", {
    		"state": "hint",
    		"players": players
    	});
    }
});
