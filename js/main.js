$(function() {

	var canvas = document.getElementById('snake-canvas');
	var ctx = canvas.getContext('2d');
	var width = $(canvas).width();
	var height = $(canvas).height();

	var levels = $('.level');
	var cellSize = 10;
	var running = false;
	var level, tickIntervall, direction, apple, score;

	if(sessionStorage.getItem('level')) {
		level = sessionStorage.getItem('level');
	} else {
		level = 5;
	}

	//the snake is an array of cells
	var snake = [];
	var highScores = [];

	function initSnake() {
		var length = 6;
		snake = [];

		for(var i = length; i>0; i--){
			snake.push({
				x: i,
				y: 0
			});
		}
	}

	function initApple() {
		var x = Math.round(Math.random()*(width-cellSize)/cellSize);
		var y = Math.round(Math.random()*(height-cellSize)/cellSize);
		//check snake collision so it wont init an apple over the snake
		!checkSnakeCollisions(x, y, snake) ? apple = {x: x, y: y} : initApple();
	}

	function paintSnake() {
		for(var i = 0; i < snake.length; i++) {
			var cell = snake[i];
			paintSingleCell(cell.x, cell.y, 'red');
		}
	}

	function paintSingleCell(x, y, color) {
		var c = cellSize;
		ctx.fillStyle = color;
		ctx.fillRect(x*c, y*c, c, c);
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x*c, y*c, c, c);
	}

	function checkAppleCollisions(x, y) {

		//if snake collides with an apple
		//create a new head so snake grows
		if(x == apple.x && y == apple.y) {
			var tailCell = {
				x: x,
				y: y
			};
			score += 1*level;
			initApple();

		//else pop out last cell
		//so snake wont grow
		} else {
			var tailCell = snake.pop();
			tailCell = {
				x: x,
				y: y
			};
		}
		snake.unshift(tailCell);
	}

	function checkSnakeCollisions(x, y, arr) {

		//check if x/y collides with snake
		for(var i=0; i<arr.length; i++){
			if(arr[i].x == x && arr[i].y == y){
				return true;
				break;
			}
		}
		//check if x/y is out of canvas bounds
		if(x == -1 || x == (width/cellSize) || y == -1 || y == (height/cellSize)) {
			return true;
		}

		return false;
	}


	function gameOver() {

		running = false;

		var user = prompt('Peli päättyi, syötä nimi:');
		var userscore = score;
		highScores = JSON.parse(localStorage.getItem('highScores'));

		if(highScores != null) {
			highScores.push({
				user: user,
				score: userscore
			});
		} else {
			highScores = [{
				user: user,
				score: userscore
			}];
		}
		
		localStorage.setItem('highScores', JSON.stringify(highScores));
		location.reload();
	}


	//tick is the game loop
	function tick() {

		//console.log('tick');
		//debugger;

		ctx.fillStyle = 'white';
		ctx.fillRect(0,0,width,height);

		//snake is made of cells, so the movement
		//is done by moving the tail in front of the head
		//get the head's position
		var newX = snake[0].x;
		var newY = snake[0].y;

		switch(direction) {
			case 'right':
			newX++;
			break;
			case 'left':
			newX--;
			break;
			case 'down':
			newY++;
			break;
			case 'up':
			newY--;
			break;
			default:
			break;
		}

		//check if snake collides with itself/walls
		if(checkSnakeCollisions(newX, newY, snake)){
			//todo start game again
			//alert('game over');
			gameOver();
		}

		checkAppleCollisions(newX, newY);

		paintSnake();

		//paint the apple
		paintSingleCell(apple.x, apple.y, 'green');

		var scoreString = 'Score: ' + score;
		ctx.fillStyle = 'black';
		ctx.fillText(scoreString, 5, height-5);

	}


	function init() {

		direction = 'right';
		initSnake();
		initApple();
		score = 0;
		tickIntervall = 100/level*3;
		running = true;

		//set tick interval and size
		if(typeof loop != 'undefined') {
			clearInterval(loop);
		}
		loop = setInterval(tick, tickIntervall);
	}


	function initLevels() {
		$.each(levels, function(i, lvl) {

			var num = $(lvl).attr('data-lvl');

			if(num <= level) {
				$(lvl).css('background-color', 'black');
			} else {
				$(lvl).css('background', 'transparent');
			}

			$(lvl).css('padding-top', num*7-7);

			$(lvl).on('mouseover', function() {
				$(lvl).css('background-color', 'yellow');
			});

			$(lvl).on('mouseout', function() {
				if(num > level) {
					$(lvl).css('background', 'transparent');
				} else {
					$(lvl).css('background-color', 'black');
				}				
			})
		});
	}
	initLevels();

	function initHighScores() {

		highScores = JSON.parse(localStorage.getItem('highScores'));
		
		if(highScores != null) {
			//sort the high scores
			highScores.sort(function(a, b) {
				return b.score-a.score;
			});

			for(var i = 0; i<5; i++) {
				if(highScores[i] != undefined) {
					$('#top5').append('<li><strong>' + 
						highScores[i].user +
						'</strong>: ' +
						highScores[i].score +
						'</li>');
				} else {
					break;
				}

			}
		}
	}
	initHighScores();

	//kb controlls
	$(document).keydown(function(ev) {
		var key = ev.which;
		var left = '37';
		var up = '38';
		var right = '39';
		var down = '40';

		if(key == left && direction != 'right') {
			direction = 'left';
		} else if (key == up && direction != 'down') {
			direction = 'up';
		} else if (key == right && direction != 'left') {
			direction = 'right';	
		} else if (key == down && direction != 'up') {
			direction = 'down';
		}
	});

	$('#start-game').click(function() {
		init();
	});

	$('.level').click(function() {
		var self = this;
		if(running == false) {
			level = $(self).attr('data-lvl');
			sessionStorage.setItem('level', level);
			initLevels();
		}
	});
});
