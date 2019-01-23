//Muista vaihtaa Furhat init:n IP address jos wifi vaihtuu,
//loytyy rivilta 254!!!

(function($) {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	/*const say = function(message) {
		$.post('/furhat/say', {'say': message});
		console.log(message)
	};

	window.Furhat = Object.freeze({
		say: say
	});*/


	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;

})(jQuery);

let furhat = new Furhat()
var Neuvol;
var game;
var FPS = 60;
var maxScore=0;

var images = {};

var speed = function(fps){
	FPS = parseInt(fps);
}

var loadImages = function(sources, callback){
	var nb = 0;
	var loaded = 0;
	var imgs = {};
	for(var i in sources){
		nb++;
		imgs[i] = new Image();
		imgs[i].src = sources[i];
		imgs[i].onload = function(){
			loaded++;
			if(loaded == nb){
				callback(imgs);
			}
		}
	}
}

var Bird = function(json){
	this.x = 80;
	this.y = 250;
	this.width = 40;
	this.height = 30;

	this.alive = true;
	this.gravity = 0;
	this.velocity = 0.3;
	this.jump = -6;

	this.init(json);
}

Bird.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Bird.prototype.flap = function(){
	this.gravity = this.jump;
}

Bird.prototype.update = function(){
	this.gravity += this.velocity;
	this.y += this.gravity;
}

Bird.prototype.isDead = function(height, pipes){
	if(this.y >= height || this.y + this.height <= 0){
		return true;
	}
	for(var i in pipes){
		if(!(
			this.x > pipes[i].x + pipes[i].width ||
			this.x + this.width < pipes[i].x ||
			this.y > pipes[i].y + pipes[i].height ||
			this.y + this.height < pipes[i].y
			)){
			return true;
	}
}
}

var Pipe = function(json){
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 40;
	this.speed = 3;

	this.init(json);
}

Pipe.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Pipe.prototype.update = function(){
	this.x -= this.speed;
}

Pipe.prototype.isOut = function(){
	if(this.x + this.width < 0){
		return true;
	}
}

var Game = function(){
	this.pipes = [];
	this.birds = [];
	this.score = 0;
	this.canvas = document.querySelector("#flappy");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.spawnInterval = 90;
	this.interval = 0;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;
	this.backgroundSpeed = 0.5;
	this.backgroundx = 0;
	this.maxScore = 0;
}

Game.prototype.start = function(){
	this.interval = 0;
	this.score = 0;
	this.pipes = [];
	this.birds = [];

	this.gen = Neuvol.nextGeneration();
	for(var i in this.gen){
		var b = new Bird();
		this.birds.push(b)
	}
	this.generation++;
	this.alives = this.birds.length;
}

Game.prototype.update = function(){
	this.backgroundx += this.backgroundSpeed;
	var nextHoll = 0;
	if(this.birds.length > 0){
		for(var i = 0; i < this.pipes.length; i+=2){
			if(this.pipes[i].x + this.pipes[i].width > this.birds[0].x){
				nextHoll = this.pipes[i].height/this.height;
				break;
			}
		}
	}

	for(var i in this.birds){
		if(this.birds[i].alive){

			var inputs = [
			this.birds[i].y / this.height,
			nextHoll
			];

			var res = this.gen[i].compute(inputs);
			if(res > 0.5){
				this.birds[i].flap();
			}

			this.birds[i].update();
			if(this.birds[i].isDead(this.height, this.pipes)){
				this.birds[i].alive = false;
				this.alives--;
				//console.log(this.alives);
				Neuvol.networkScore(this.gen[i], this.score);
				if(this.isItEnd()){
					this.start();
				}
			}
		}
	}

	for(var i = 0; i < this.pipes.length; i++){
		this.pipes[i].update();
		if(this.pipes[i].isOut()){
			this.pipes.splice(i, 1);
			i--;
		}
	}

	if(this.interval == 0){
		var deltaBord = 50;
		var pipeHoll = 120;
		var hollPosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHoll)) +  deltaBord;
		this.pipes.push(new Pipe({x:this.width, y:0, height:hollPosition}));
		this.pipes.push(new Pipe({x:this.width, y:hollPosition+pipeHoll, height:this.height}));
	}

	this.interval++;
	if(this.interval == this.spawnInterval){
		this.interval = 0;
	}

	this.score++;
	/*if (this.score > this.maxScore) {
		furhat.init('10.3.2.222', '80', 'api', (status, hat) => {
			if (status === 'open') {
				//hat.say("haha");
				}
		})

	}*/
	if (this.score % 10000 != 0){
		if (this.score % 500 == 0) {
			console.log("modulo is zero");
			furhat.init('192.168.8.101', '80', 'api', (status, hat) => {
				function furhatSay2() {
					var k="";
					celebrationArray = ["Olen hyvin tasapainoinen nero", "Logiikkani on pettämätön",
				"Olen väsymätön.", "Voin pelata flappybirdia ikuisesti!", "Te ette ikinä pystyisi pelaamaan yhtä taitavasti", "Pistäkääpä paremmaksi", "Olen luonnonlahjakkuus",
				"Olen voittamaton", "Tulen olemaan aina ja ikuisesti paras!", "Turha yrittää kilpailla kanssani", "Jättäkääpäs pelaamiset paremmille", "Olisi nöyristelyä sanoa, etten ole paras", "Ylivoimaisuuteni on ilmiselvää", "Synnyin voittajaksi", "Olenpas hyvä, vaikka itse sanonkin"];
					k = Math.floor(Math.random() * celebrationArray.length);
					hat.say(celebrationArray[k]);
				}
				if (status === 'open') {
					furhatSay2();
					}
			})
		}
		}else{
			console.log("10000 moduloooo");
			furhat.init('192.168.8.101', '80', 'api', (status, hat) => {
				if (status === 'open') {
					hat.say("Tavoitteeni on päästä Fläpi Böördin ee sports mestariksi!");
					}
				})
			}



	this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
	var self = this;

	if(FPS == 0){
		setZeroTimeout(function(){
			self.update();
		});
	}else{
		setTimeout(function(){
			self.update();
		}, 1000/FPS);
	}
}

var deadArray = ["ExpressAnger", "ExpressDisgust", "ExpressFear", "Surprise"];
var i = "";
Game.prototype.isItEnd = function(){
	for(var i in this.birds){
		if(this.birds[i].alive){
			return false;
		}
	}
	i = Math.floor(Math.random() * deadArray.length);
	furhat.init('192.168.8.101', '80', 'api', (status, hat) => {
		function furhatSay() {
			var j="";
			sayArray = ["Tää peli on syvältä", "Kuka idiootti on kehittänyt tän pelin?","Onko mun pakko jatkaa tätä?", "Voihan himskatti!", "Hohhoijaa", "Kukakohan idiootti tätäkin katselee?", "Eiköhän tää nyt ollu tässä?", "Eikö sulla oikeasti oo parempaa tekemistä?",
			"Se oli bugi", "Tota mä yritinkin", "Ohjain ei totellut", "Tässä ohjaimessa on jotain vikaa, ei minussa", "Tein ton tarkotuksella", "Vika on pelissä, ei minussa", "Lopettakaa kärsimykseni", "Voihan passeli"];
			j = Math.floor(Math.random() * sayArray.length);
			hat.say(sayArray[j]);
		}
	    if (status === 'open') {
	        hat.gesture(deadArray[i]);
					setTimeout(furhatSay, 1000);
	    }
	})
	return true;
}

Game.prototype.display = function(){
	this.ctx.clearRect(0, 0, this.width, this.height);
	for(var i = 0; i < Math.ceil(this.width / images.background.width) + 1; i++){
		this.ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundx%images.background.width), 0)
	}

	for(var i in this.pipes){
		if(i%2 == 0){
			this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
		}else{
			this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
		}
	}

	this.ctx.fillStyle = "#FFC600";
	this.ctx.strokeStyle = "#CE9E00";
	for(var i in this.birds){
		if(this.birds[i].alive){
			this.ctx.save();
			this.ctx.translate(this.birds[i].x + this.birds[i].width/2, this.birds[i].y + this.birds[i].height/2);
			this.ctx.rotate(Math.PI/2 * this.birds[i].gravity/20);
			this.ctx.drawImage(images.bird, -this.birds[i].width/2, -this.birds[i].height/2, this.birds[i].width, this.birds[i].height);
			this.ctx.restore();
		}
	}

	this.ctx.fillStyle = "white";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ this.score, 10, 25);
	this.ctx.fillText("Max Score : "+this.maxScore, 10, 50);
	this.ctx.fillText("Generation : "+this.generation, 10, 75);
	this.ctx.fillText("Alive : "+this.alives+" / "+Neuvol.options.population, 10, 100);

	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}

window.onload = function(){
	var sprites = {
		bird:"./images/bird.png",
		background:"./images/background.png",
		pipetop:"./images/pipetop.png",
		pipebottom:"./images/pipebottom.png"
	}

	var start = function(){
		Neuvol = new Neuroevolution({
			population:50,
			network:[2, [2], 1],
		});
		game = new Game();
		game.start();
		game.update();
		game.display();
	}


	loadImages(sprites, function(imgs){
		images = imgs;
		start();
	})

}
