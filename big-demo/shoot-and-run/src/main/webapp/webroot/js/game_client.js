// Silly program, so we're allowed to mess up the global namespace
var eb;
$(function() {
	/**
	 * Connect to the event bus bridge
	 */
	eb = new vertx.EventBus('/eventbus');
	eb.onopen = function() {
		renderLoginForm();
	};
});

function renderLoginForm() {
	$('#signupButton').click(
			function() {
				eb.send('signup', {
					email : $('#emailSignup').val()
				}, function(reply) {
					$('#emailSignup').val('');
					if (reply.ok) {
						$('#signupMessage').text(
								"Please check your email, and log in below");
					} else {
						$('#signupMessage')
								.text("There was a problem sending.");
					}
				});
				return false;
			});
	$('#loginButton').click(function() {
		eb.login($('#emailLogin').val(), $('#passcode').val(), function(reply) {
			if (reply.status == 'ok') {
				startGame();
				$('#login').empty();
			} else {
				$('#loginMessage').text("Invalid user name or password.");
			}
			console.log("Resp: " + JSON.stringify(reply));
		});
		return false;
	});

}
function startGame() {
	var game = new Game();
	game.status({
		state : 'move'
	});
	eb.registerHandler("game.updates", function(update) {
		console.log(update);
		game.status(update);
	});
}

//
// function startGame() {
// var game = new Game();
// game.status({
// state : 'move'
// });
// var i = 3;
// $('#simulateDone').click(function() {
// game.status({
// state : 'done',
// players : [ {
// location : {
// x : 10,
// y : 10
// },
// target : {
// x : 25,
// y : 25,
// },
// name : "sam"
// }, {
// location : {
// x : 77,
// y : 200
// },
// target : {
// x : 150,
// y : 68,
// },
// name : "bill"
// } ]
// });
// });
// $('#simulateHint').click(function() {
// game.status({
// state : 'hint',
// players : [ {
// location : {
// x : 10,
// y : 10
// },
// target : {
// x : 25,
// y : 25,
// },
// name : "sam"
// }, {
// location : {
// x : 77,
// y : 200
// },
// target : {
// x : 150,
// y : 68,
// },
// name : "bill"
// } ]
// });
// });
// };

function Game() {
	var canvasTag = $('<canvas  id="canvas" width="300" height="300" />');
	var canvas = oCanvas.create({
		canvas : canvasTag[0],
		fps : 20
	});
	var gameArea = canvas.display.rectangle({
		x : 1,
		y : 1,
		zIndex : 'front',
		width : 298,
		height : 250,
		strokeWidth : 1,
		fill : "white"
	}).add();
	var player = new Player(canvas);
	$('#game').empty();
	var nameInput = $('<input type="text" placeholder="Enter nick name">');
	$('#game').append(nameInput);
	nameInput.blur(function() {
		player.name = nameInput.val();
		player.update();
		$('#game').append(canvasTag);
		nameInput.remove();
	});
	var statusText = canvas.display.text({
		x : 5,
		y : 282,
		origin : {
			x : "left",
			y : "top"
		},
		text : 'HEY',
		fill : "#f00"
	}).add();
	var toggle = canvas.display.text({
		x : 298,
		y : 280,
		origin : {
			x : "right",
			y : "top"
		},
		text : "done",
		fill : "#00f"
	}).add();
	var onClick;
	var toggleClick;
	function toggleTarget() {
		onClick = movePlayer;
		statusText.text = "Move your player";
		toggleClick = togglePlayer;
		canvas.redraw();
	}
	function togglePlayer() {
		onClick = target;
		statusText.text = "Choose a target area";
		toggleClick = toggleTarget;
		canvas.redraw();
	}

	function movePlayer(e) {
		player.location.x = e.x;
		player.location.y = e.y;
		player.update();
		canvas.redraw();
	}
	function target(e) {
		player.target.x = e.x;
		player.target.y = e.y;
		player.update();
		canvas.redraw();
	}
	gameArea.bind('click tap', function(e) {
		onClick(e);
	});
	toggle.bind("click tap", function() {
		toggleClick();
	});

	this.status = function(status) {
		if (status.state == 'move') {
			toggleTarget();
			canvas.redraw();
		} else if (status.state == 'hint') {
			var players = new Array();
			$.each(status.players, function(idx, value) {
				players.push(new Player(canvas, value));
			});
			setTimeout(function() {
				for (i = 0; i < players.length; i++) {
					players[i].kill();
				}
			}, 250);
		} else if (status.state == 'done') {
			var players = new Array();
			statusText.text = "Round over";
			onClick = toggleClick = function() {

			};
			canvas.redraw();
			$.each(status.players, function(idx, value) {
				players.push(new Player(canvas, value));
			});
			setTimeout(function() {
				toggleTarget();
				for (i = 0; i < players.length; i++) {
					players[i].kill();
				}
			}, 5000);
		}
	};
}

function Player(canvas, data) {
	this.target = {
		x : 150,
		y : 150
	};
	this.location = {
		x : 150,
		y : 150
	};
	this.name = "";
	if (data) {
		this.target = data.target;
		this.location = data.location;
		this.name = data.name;
	}
	var that = this;
	var playerImage = canvas.display.image({
		x : this.location.x,
		y : this.location.y,
		origin : {
			x : "center",
			y : "center"
		},
		image : "/icon_user.gif"
	}).add();
	var playerText = canvas.display.text({
		x : this.location.x + 10,
		y : this.location.y,
		origin : {
			x : "left",
			y : "center"
		},
		text : this.name,
		fill : "#00f"
	}).add();
	var targ = canvas.display.ellipse({
		x : this.target.x,
		y : this.target.y,
		radius_x : 20,
		radius_y : 20,
		stroke : "1px #f00"
	}).add();
	this.update = function() {
		targ.x = that.target.x;
		targ.y = that.target.y;
		playerImage.x = that.location.x;
		playerImage.y = that.location.y;
		playerText.text = that.name;
		playerText.x = that.location.x + 10;
		playerText.y = that.location.y;
		eb.send("game", {
			"target" : that.target,
			"location" : that.location,
			"name" : that.name
		});
	};
	this.kill = function() {
		targ.remove();
		playerText.remove();
		playerImage.remove();
	}
}
