var http = require("http"),
	socketio = require("socket.io"),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	fs = require("fs"),
	bcrypt = require('bcrypt'),
	mongoose = require("mongoose"),
	SALT_WORK_FACTOR = 10,
	autoIncrement = require('mongoose-auto-increment');

monCon = mongoose.connect("mongodb://localhost/scat", function(err){
	if(err){
		console.log(err +"");
	}
	console.log("connected to mongo");
});

autoIncrement.initialize(monCon);

var db = mongoose.connection;

var UserSchema = mongoose.Schema({
	un: {type: String, required: true},
	pw: {type: String, required: true},
	score: {type: Number, required: true},
});

UserSchema.plugin(autoIncrement.plugin, 'Users');

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('pw')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.pw, salt, function(err, hash) {
			if (err) return next(err);

            // override the cleartext password with the hashed one
            user.pw = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.pw, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var Users = mongoose.model("Users", UserSchema);
/*
var testUser = new Users({un: "mikef", pw: "abc", score: 0});

testUser.save(function(err, usr){
	if(err){
		console.log(err);
	}
	console.log(usr);
});

Users.findOne({ _id: 16 }, function(err, auser){
	if (err) return handleError(err);

	auser.comparePassword('abc', function(err, isMatch) {
        if (err) throw err;
        console.log('abc:', isMatch); // -&gt; Password123: true
    });

});
*/
// Retrieve
var app = http.createServer(function(req, resp){
	var filename = path.join(__dirname, "", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function(exists){
		if (exists) {
			fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}

				// File exists and is readable
				var mimetype = mime.lookup(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		}else{
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: "+filename);
			resp.end();
			return;
		}
	});
});
app.listen(3456);

var io = socketio.listen(app);
var cats = ["A boy’s name", "A river", "An animal", "Things that are cold", "Insects", "TV Shows", "Things that grow", "Fruits", "Things that are black", "School subjects", "Movie titles", "Musical Instruments", "Authors", "Bodies of water", "A bird", "Countries", "Cartoon characters", "Holidays", "Things that are square", "In the NWT (Northwest Territories, Canada)", "Clothing", "A relative", "Games", "Sports Stars", "School supplies", "Things that are hot", "Heroes", "A girl’s name", "Fears", "TV Stars", "Colors", "A fish", "Fruits", "Provinces or States", "Sports equipment", "Tools", "Breakfast foods", "Gifts", "Flowers", "Ice cream flavors", "A drink", "Toys", "Cities", "Things in the kitchen", "Ocean things", "Nicknames", "Hobbies", "Parts of the body", "Sandwiches", "Items in a catalog", "World leaders/Poloticians", "School subjects", "Excuses for being late", "Ice cream flavors", "Things that jump/bounce", "Television stars", "Things in a park", "Foriegn cities", "Stones/Gems", "Musical instruments", "Nicknames", "Things in the sky", "Pizza toppings", "Colleges/Universities", "Fish", "Countries", "Things that have spots", "Historical Figures", "Something you’re afraid oF", "Terms of endearment", "Items in this room", "Drugs that are abused", "Fictional characters", "Menu items", "Magazines", "Capitals", "Kinds of candy", "Items you save up to buy", "Footware", "Something you keep hidden", "Items in a suitcase", "Things with tails", "Sports equiptment", "Crimes", "Things that are sticky", "Awards/ceremonies", "Cars", "Spices/Herbs", "Bad habits", "Cosmetics/Toiletries", "Celebrities", "Cooking utensils", "Reptiles/Amphibians", "Parks", "Leisure activities", "Things you’re allergic to", "Restaurants", "Notorious people", "Fruits", "Things in a medicine cabinet", "Toys", "Household chores", "Bodies of water", "Authors", "Halloween costumes", "Weapons", "Things that are round", "Words associated with exercise", "Sports", "Song titles", "Parts of the body", "Ethnic foods", "Things you shout", "Birds", "A girl’s name", "Ways to get from here to there", "Items in a kitchen", "Villains", "Flowers", "Things you replace", "Baby foods", "Famous duos and trios", "Things found in a desk", "Vacation spots", "Diseases", "Words associated with money", "Items in a vending machine", "Movie Titles", "Games", "Things you wear", "Beers", "Things at a circus", "Vegetables", "States", "Things you throw away", "Occupations", "Appliances", "Cartoon characters", "Types of drinks", "Musical groups", "Store names", "Things at a football game", "Trees", "Personality traits", "Video games", "Electronic gadgets", "Board games", "Things that use a remote", "Card games", "Internet lingo", "Offensive words", "Wireless things", "Computer parts", "Software", "Websites", "Game terms", "Things in a grocery store", "Reasons to quit your job", "Things that have stripes", "Tourist attractions", "Diet foods", "Things found in a hospital", "Food/Drink that is green", "Weekend Activities", "Acronyms", "Seafood", "Christmas songs", "Words ending in “-n”", "Words with double letters", "Children’s books", "Things found at a bar", "Sports played outdoors", "Names used in songs", "Foods you eat raw", "Places in Europe", "Olympic events", "Things you see at the zoo", "Math terms", "Animals in books or movies", "Things to do at a party", "Kinds of soup", "Things found in New York", "Things you get tickets for", "Things you do at work", "Foreign words used in English", "Things you shouldn’t touch", "Spicy foods", "Things at a carnival", "Things you make", "Places to hangout", "Animal noises", "Computer programs", "Honeymoon spots", "Things you buy for kids", "Things that can kill you", "Reasons to take out a loan", "Words associated with winter", "Things to do on a date", "Historic events", "Things you store items in", "Things you do everyday", "Things you get in the mail", "Things you save up to buy", "Things you sit/on", "Reasons to make a phone call", "Types of weather", "Titles people can have", "Things that have buttons", "Items you take on a road trip", "Things that have wheels", "Reasons to call 911", "Things that make you smile", "Ways to kill time", "Things that can get you fired", "Hobbies", "Holiday Activities"]; //http://scattergorieslists18.blogspot.com/
var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "w"];
var players = {};
var games = {};
//GAME PARAMS
var gameTimeLimit = 30 * 1000; //seconds * 1000 = miliseconds
var reviewTimeLimit = 100 * 1000;
var maxPlayers = 6;
var MIN_PLAYERS = 3;
var SIMILARITY_THRESHOLD = 0.75;
var VOTE_RATIO = .5; //percentage of other players that must downvote
//indexes
var cgid = 0; //game id
var pid = 0; //player id


//picks a random letter from the list. returns it. There are 20
function pickLetter(){
	return letters[parseInt(Math.floor(Math.random() * 20))];
}
//picks a random cattegory from the list. returns it. There are 216
function pickCat(){
	return cats[parseInt(Math.floor(Math.random() * 216))];
}

//function to return the list of current games and number of players in it
function getOpenGames(){
	xgdata = {};
	for (var xgid in games) {
		 if (games.hasOwnProperty(xgid)) {
			  if(Object.keys(games[xgid + ""].members).length + Object.keys(games[xgid + ""].waits).length < maxPlayers){
				  xgdata[xgid + ""] = Object.keys(games[xgid + ""].members).length + Object.keys(games[xgid + ""].waits).length;
			  }
		 }
	}
	return xgdata;
}

//an object that represents the game. A player can create a game. when a player creates and/or joins a game, set the game they joined to socket.game.
//xgid is the id of the new game
function game(xgid){
	this.gid = xgid;//game ID
	this.members = {}; //the sockets in the game
	this.waits = {};
	this.curLetter = null;
	this.curCat = null;
	this.curSubmissions = null;
	this.state = 0 //0 is waiting for enough members. 1 is round is going on. 2 is answer review period.
	this.timeFunction = null;
	this.readyToContinue = 0;

	games[xgid + ""] = this;
	console.log("New game created. Current list of games:");
	console.log(games);
	this.addMember = function(xplayer){//a socket
		if(Object.keys(this.members).length + Object.keys(this.waits).length < maxPlayers){
			console.log("Current number of members before addMember: " + Object.keys(this.members).length);
			console.log("Current number of waits before addMember: " + Object.keys(this.waits).length);
			if(Object.keys(this.members).length >= MIN_PLAYERS){//add to waiting list because a round is in progress
				this.waits[xplayer.pid + ""] = xplayer;
				io.sockets.emit("updateGameList", getOpenGames());
				xplayer.emit("joined_wait");
				console.log(xplayer.username + " was waitlisted");
			}else{//add to the game
				this.members[xplayer.pid + ""] = xplayer;
				xplayer.cgame = this;
				io.sockets.to(this.gid + "").emit("playerAdded", {xpid: xplayer.pid, xun: xplayer.username, xscore: xplayer.score});

				xplayer.leave(xplayer.room);
				xplayer.join(this.gid + "");
				xplayer.room = this.gid + "";
				xplayer.emit("updatePlayerList", this.getPlayerList());
				io.sockets.emit("updateGameList", getOpenGames());

				if(Object.keys(this.members).length == MIN_PLAYERS){
					//game has reached enough people to start
					this.startRound();
				}else if(Object.keys(this.members).length < MIN_PLAYERS){
					//too few people to start game -> tell all sockets to display the waiting screen.
					xplayer.emit("joined_wait");
				}
				console.log(xplayer.username + " was added");
				return true;//says that the player was added
			}
		}else{
			io.sockets.emit("updateGameList", getOpenGames());
			return false;//says the player was not added
		}
	}

	this.removeMember = function(xplayer){
		//remove the player from the game
		delete this.members[xplayer.pid + ""];
		xplayer.leave(xplayer.room);
		delete xplayer.room;
		//tell everyone he left
		io.sockets.to(this.gid + "").emit("playerLeft", xplayer.pid + "");
		//if there are too few people to play now
		if(Object.keys(this.members).length < MIN_PLAYERS){
				//end the round
				io.sockets.to(this.gid + "").emit("insufficientPlayers");
				clearTimeout(this.timeFunction);
				//see if there are any players waiting to play
				if(Object.keys(this.waits).length > 0){
					this.mergeWaits();
				}
				//if there are enough players now
				if(Object.keys(this.members).length >= MIN_PLAYERS){
					this.startRound();
				}
		}
		if(Object.keys(this.members).length == 0){
			delete games[this.gid + ""];
			delete this;
			console.log(games);
		}
		io.sockets.emit("updateGameList", getOpenGames());
	}
	this.mergeWaits = function(){
		for (var xpid in this.waits){
			if(this.waits.hasOwnProperty(xpid))
			{
				if(Object.keys(this.members).length > maxPlayers){
					console.log("error: too many players");
					return false;
				}else if(this.waits.hasOwnProperty(xpid)) {
					xplayer = this.waits[xpid + ""];
					this.members[xpid + ""] = xplayer;
					xplayer.cgame = this;
					io.sockets.to(this.gid + "").emit("playerAdded", {xpid: xplayer.pid, xun: xplayer.username, xscore: xplayer.score});

					xplayer.leave(xplayer.room);
					xplayer.join(this.gid + "");
					xplayer.room = this.gid + "";
					xplayer.emit("updatePlayerList", this.getPlayerList());

					console.log(xplayer.username + " was moved from the waitlist to the game");
				}
			}

		}
		this.waits = {};
		console.log("waits merged");
	}
	this.getPlayerList = function(){
		var playerInfo = {};
		for (var xpid in this.members) {
			 if (this.members.hasOwnProperty(xpid)) {
				  playerInfo[xpid + ""] = {
					  un: this.members[xpid + ""].username,
					  score: this.members[xpid + ""].score
				  }
			 }
		}
		return playerInfo;
	}
	this.startRound = function(){
		console.log("round started. The number of members is: " + Object.keys(this.members).length);
		console.log("round started. The number of waits is: " + Object.keys(this.waits).length);
		//if this.curSubmissions isn't empty (i.e. not the first round) go through each answer in this.curSubmissions and add the points to this.members[xplayer.pid + ""].score
		//clear curSubmissions
		this.curSubmissions = {};
		this.readyToContinue = 0;
		//calculate and save the scores based on validity and number of keywords
		var _this = this;
		for (var xpid in this.members) {
			 if (this.members.hasOwnProperty(xpid)) {
				 if(typeof this.members[xpid + ""].cAnswer !== 'undefined'){
					  pScore = scoreAnswer(this.members[xpid + ""].cAnswer);
					  console.log(this.members[xpid + ""].cAnswer.answer + " scored " + pScore);

					  //save new score to the database
					  Users.findOne({_id: parseInt(xpid)}, function(err, mUser){
					  		nscore = mUser.score + pScore;
							_this.members[xpid + ""].score = nscore;
							Users.update({_id: parseInt(xpid)}, {score: nscore}, function(err){
								if(err){console.log(err);}
								delete _this.members[xpid + ""].cAnswer;
								io.sockets.to(_this.gid + "").emit("updatePlayerList", _this.getPlayerList());
							});
					  });

				 }
			 }
		}
		//merge the waits into the members list
		this.mergeWaits();
		//emit to all sockets in the room (whose namespace = the game's id) to start a new round
		//->in the data parameter of the function, tell them a random letter and cattegory. Also, include an associative array where the key is the player's id and the value is an object with their score and username
		this.curLetter = pickLetter();
		this.curCat = pickCat();
		io.sockets.to(this.gid + "").emit("startRound", {letter: this.curLetter, cat: this.curCat, dur: gameTimeLimit});

		//if there are any players waiting to join, let them in now.
		this.timeFunction = setTimeout(function(){_this.endRound();}, gameTimeLimit);//calls the end round function after the time limit
	}
	this.submitAnswer = function(xplayer, xanswer, xnoresponse){
		var pAns = new answer(this.members[xplayer.pid + ""], xanswer, this.curLetter);
		this.curSubmissions[xplayer.pid + ""] = pAns;
		xplayer.cAnswer = pAns;

		if(!xnoresponse && Object.keys(this.curSubmissions).length == Object.keys(this.members).length){
			clearTimeout(this.timeFunction);
			this.endRound();
		}else{
			xplayer.emit("reviewScreen");
		}
		//this is object becuase it will be used later on to store information about points, uniqueness etc. also needs to carry informaton to send to clients to display e.g. usernames
	}
	this.endRound = function(){
		console.log("round ended");
		//deal with players who did not submit an answer
		for (var xpid in this.members) {
			 if (this.members.hasOwnProperty(xpid)) {
				  if(typeof this.members[xpid + ""].cAnswer === 'undefined'){
					  console.log("no answer");
					  var pAns = this.members[xpid + ""];
					  this.submitAnswer(pAns, "", true);
					  console.log(pAns.cAnswer + "");
				  }

			 }
		}
		console.log(this.curSubmissions);
		//console.time('checkAnswers');
		this.curSubmissions = checkAnswers(this.curSubmissions, this.curLetter);//check the answers
		//console.timeEnd('checkAnswers');
		//emit to all sockets in the room that the round is over.
		//->emit curSubmissions to users. curSubmissions has all data needed to display
		console.log(this.curSubmissions);
		io.sockets.to(this.gid + "").emit("roundOver", {roundSubmissions: this.curSubmissions, reviewDuration: reviewTimeLimit});
		var _this = this;
		this.timeFunction = setTimeout(function(){_this.startRound();}, reviewTimeLimit);
	}
	this.downvote = function(xplayerID){
		this.curSubmissions[xplayerID + ""].downvotes++;
		console.log(xplayerID + " is downvoted x " + this.curSubmissions[xplayerID + ""].downvotes);
		if(this.curSubmissions[xplayerID + ""].downvotes > ((Object.keys(this.members).length-1) * VOTE_RATIO)){
			//at least half of the players voted no
			this.curSubmissions[xplayerID + ""].isInvalid = true;
			this.curSubmissions[xplayerID + ""].points = 0;
			this.curSubmissions[xplayerID + ""].downvotes = Object.keys(this.members).length-1;
			//emit to all sockets that this is now invalid
		}
		io.sockets.to(this.gid + "").emit("updateVotes", {xpid: xplayerID, downvotes: this.curSubmissions[xplayerID + ""].downvotes, invalid: this.curSubmissions[xplayerID + ""].isInvalid});
	}
	this.playerDoneReviewing = function(){
		this.readyToContinue ++;
		if(this.readyToContinue >= Object.keys(this.members).length){
			clearTimeout(this.timeFunction);
			this.startRound();
		}
	}
}

//function to check answers. takes an array of answer objects and the current letter
function checkAnswers(xanswers, xletter){
	//check through each answer to make sure it is not null, starts with the letter. otherwise set isInvalid to true
	//if it is good, calculate the potential points by counting the number of words longer than 1 letter that start with the letter
	//
	//once all the invalid answers have been weeded out, loop through the answers again. For each one (that is valid), loop through the rest of the answers (that are valid) (index of current one + 1 to length of array) and do string compare on the lowercase version of the string.
	//->There are a few considerations for desiging this algorithm.
	//--->we should only be paying attention to words in the answer starting with the letter. This will make life easier for us
	//--->I think we should start with calculating the Damerau–Levenshtein distance https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance .
	//--->we also need to be able to account for different ordering if there is more than one word. I would create an array for each of the two answers of the words from those answers starting with the letter and somehow run the string compare function to see if the answers are the same but in a different order (accounting for slight spelling variations)
	//->if they are too similar (threshold TBD) set hasSimilar for both to true. The threshold should be a percentage calculated from the difference and the (average?) length i.e. 5% of the characters are different. This algorithm will be the most complicated part because we'll also have to check for things such as different orders etc.
	//return the array
	for(var xpid in xanswers){
		var oAns = xanswers[xpid + ""]; //object
		var tAns = oAns.answer.toLowerCase(); //text
		if(tAns.charAt(0) != xletter || tAns.replace(/\s/g, '') == "" || tAns == null ){
			if(tAns.charAt(0) != xletter){
				oAns.isInvalid = true;
				console.log("Answer " + tAns + " is invalid because it doesnt start with " + xletter);
			}else if(tAns.replace(/\s/g, '') == ""){
				oAns.isInvalid = true;
				console.log("Answer " + tAns + " is invalid because it is an empty answer");
			}else if(tAns == null){
				oAns.isInvalid = true;
				console.log("Answer " + tAns + " is invalid because it is a null answer");
			}
		}
	}
	outerAnswerLoop:
	for(var xpida in xanswers){
		var oAnsa = xanswers[xpida + ""]; //object a
		var tAnsa = oAnsa.answer.toLowerCase().replace(/[^\w\s]|_/g, ""); //text a without punctuation etc.
		var aAnsa = tAnsa.split(" "); //array of words a
		var fAnsa = aAnsa.filter(function(val){ //Array of words with non xletters filtered out a
			return val.charAt(0) == xletter
		});

		if(!oAnsa.isInvalid){ //if the answer is valid

			innerAnswerLoop:
			for(var xpidb in xanswers){ //loop through all the answers again
				if(xanswers[xpidb + ""] != oAnsa && !xanswers[xpidb + ""].isInvalid){ //answer b is not answer a and answer b is valid
					var oAnsb = xanswers[xpidb + ""]; //object b
					var tAnsb = oAnsb.answer.toLowerCase().replace(/[^\w\s]|_/g, ""); //text b without punctuation etc.
					var aAnsb = tAnsb.split(" "); //array of words b
					var fAnsb = aAnsb.filter(function(val){ //Array of words with non xletters filtered out b
						return val.charAt(0) == xletter
					});

					//if the answers are exactly equal or at least have the same main words, set them both to invalid eg "apple" and "apple" or "Berenstein Bears" and "The Berenstein Bears"
					if(tAnsa == tAnsb || fAnsa.join('') == fAnsb.join('')){
						oAnsa.isInvalid = true;
						oAnsb.isInvalid = true;
						console.log("Answer " + tAnsa + " is invalid because it has the same key words in the same order as tAnsb " + tAnsb);

					}

					//if the answers are more than 75% alike then flag them as posible similars
					if(ldComp(tAnsa, tAnsb) > .75 || ldComp(fAnsa.join(''), fAnsb.join('')) > .75){
						oAnsa.hasSimilar = true;
						oAnsb.hasSimilar = true;
						console.log("Answer " + tAnsa + " is more than 75% similar to " + tAnsb);
						/*if(oAnsa.similars.filter(function(val){return val == oAnsb;}).length == 0){
							oAnsa.similars.push(oAnsb);
							oAnsb.similars.push(oAnsa);
						}*/
					}

					if(fAnsa.length > 1 || fAnsb.length > 1){ //has more than one key word, check different orders
						tmpB = fAnsb;
						var matches = 0;
						var almostMatches = 0;
						for(var i = 0; i < fAnsa.length; i++){//for each word in a
							for(var j = 0; j < fAnsb.length; j++){//check agains each word in b
								if(fAnsa[i] == fAnsb[j]){//if they're the same
									matches++;
								}else if(ldComp(fAnsa[i], fAnsb[j]) >= SIMILARITY_THRESHOLD){ //if they're similar
									almostMatches++;
								}
							}
						}
						minLen = Math.min(fAnsa.length, fAnsb.length);
						if(fAnsa.length == fAnsb.length && matches == fAnsa.length){ //there's a match in b for each a
							oAnsa.isInvalid = true;
							oAnsb.isInvalid = true;
							console.log("Answer " + tAnsa + " is invalid because it is the same as tAnsb " + tAnsb);
						}else if(almostMatches >= minLen || matches + almostMatches >= minLen){
							oAnsa.hasSimilar = true;
							oAnsb.hasSimilar = true;
							/*if(oAnsa.similars.filter(function(val){return val == oAnsb;}).length == 0){
								oAnsa.similars.push(oAnsb);
								oAnsb.similars.push(oAnsa);
							}*/
						}
					}
				}
			}
		}
	}

	return xanswers;
}
//performs operation to calculate how similar two strings are as a percent of their average length
//uses Damerau–Levenshtein distance https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
function ldComp(stringA, stringB){
	var ldDist = levenshteinWeighted(stringA, stringB);
	console.log("ld is " + ldDist);
	bigger = Math.max(stringA.length, stringB.length)
	return (bigger - ldDist) / bigger;

}

//An awnser object - xplayer is the socket
function answer(xplayer, xanswer, xletter){
	//console.log(xplayer.username + " said " + xanswer + " for letter " + xletter);
	this.playerUN = xplayer.username;
	this.playerID = xplayer.pid;
	this.playerScore = xplayer.score;
	this.answer = xanswer;
	this.letter = xletter;

	this.points = 0;
	this.downvotes = 0;
	this.isInvalid = false;
	this.hasSimilar = false;
	//this.similars = [];
}
//function to score an answer
//returns a numerical score value
function scoreAnswer(xans){
		var xpoints = 0;
		if(xans.isInvalid){
			xpoints = 0;
			console.log(xans.playerUN + " scored " + 0 + " points (invalid)");
		}else if(xans.answer.split(" ").length == 1){
			xpoints = 1;
			console.log(xans.playerUN + " scored " + xpoints + " points (1 word)");
		}else{
			xpoints = xans.answer.toLowerCase().split(" ").filter(function(val){ //Array of words with non xletters filtered out
				return val.charAt(0) == xans.letter;
			}).length;
			console.log(xans.playerUN + " scored " + xpoints + " points (multi word)");
		}
		return xpoints;
}
//function to give high scores list returns an array of objects with usernames and scores ordered first to last
function giveHighScoresList(xusr, num){
	Users.find().limit(parseInt(num)).sort("-score").select("un score").exec(function(err, xusrs){
		if(err){console.log(err);}
		else{
			console.log(xusrs);
			xusr.emit("highScores", xusrs);
		}
	});
}

io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
	console.log("connect: ");
	console.log(socket.id);

	//call that function on connection
	socket.emit("updateGameList", getOpenGames());

	//handle register
	socket.on("register", function(data){
		Users.findOne({ un: data.un + "" }, function(err, xuser){
			if (err) return handleError(err);
			if(xuser){
				socket.emit("unTaken");
			}else{
				var newUser = new Users({un: data.un + "", pw: data.pw + "", score: 0});
				newUser.save(function(err, usr){
					if(err){
						console.log(err);
					}else{
						socket.emit("registerSuccess", {id: usr._id, un: usr.un, score: usr.score});
						socket.pid = parseInt(usr._id);
						players[socket.pid + ""] = socket;
						socket.username = usr.un;
						socket.score = parseInt(usr.score);
					}
				});
			}
		});
	});

	//handle login
	socket.on("login", function(data){
		Users.findOne({ un: data.un }, function(err, auser){
			if (err) return handleError(err);

			if(auser){
				auser.comparePassword(data.pw, function(err, isMatch) {
					if (err) throw err;
					if(isMatch){
						socket.emit("loginSuccess", {id: auser._id, un: auser.un, score: auser.score});
						socket.pid = parseInt(auser._id);
						players[socket.pid + ""] = socket;
						socket.username = auser.un;
						socket.score = parseInt(auser.score);
					}else{
						socket.emit("badLogin");
					}
				});
			}else{
				socket.emit("badLogin");
			}

		});
	});

	//handle logout
	socket.on("logout", function(){
		if(typeof socket.cgame !== 'undefined'){
			socket.cgame.removeMember(socket);
		}
		delete socket.pid;
		delete socket.username;
		delete socket.score;
		socket.emit("logoutSuccess");
	});

	//function to handle joining a game
	//->must tell all other players this
	socket.on("joinGame", function(data){
		if(!(typeof games[data + ""] === 'undefined') && games[data + ""].addMember(socket)){

		}else{
			io.sockets.emit("updateGameList", getOpenGames());
		}
	});

	//function to handle creating a game
	//->must tell all other players this
	socket.on("createNewGame", function(data){
		g = new game(cgid);
		cgid++;
		if(g.addMember(socket)){
			//if the player is added to his game
			io.sockets.emit("updateGameList", getOpenGames());
		}else{
			console.log("Error: the cost couldnt join the game");
		}
	});

	//function to handle ending/ deleting a game

	//function to handle a player submitting an answer
	socket.on("subAnswer", function(data){
		console.log("answer submitted: " + data);
		socket.cgame.submitAnswer(socket, data + "", false);
	});
	//function to handle a player voting down an answer
	socket.on("downvote", function(data){
		socket.cgame.downvote(data);
	});

	//function to handle a player leaving a game
	socket.on('disconnect', function(){
		if(typeof socket.cgame !== 'undefined'){
			socket.cgame.removeMember(socket);
		}
		console.log("disconnect: ");
		console.log(socket.id);
	});

	socket.on("getHighScores", function(){
		giveHighScoresList(socket, 50);
	});

	socket.on("goback", function(){
		socket.cgame.removeMember(socket);
	});

	socket.on("doneReviewing", function(){
		socket.cgame.playerDoneReviewing();
	});
});

//Algorithm form http://stackoverflow.com/questions/22308014/damerau-levenshtein-distance-implementation
//
function levenshteinWeighted(seq1,seq2){
    var len1=seq1.length;
    var len2=seq2.length;
    var i, j;
    var dist;
    var ic, dc, rc;
    var last, old, column;

    var weighter={
        insert:function(c) { return 1; },
        delete:function(c) { return 1; },
        replace:function(c, d) { return 1; }
    };

    /* don't swap the sequences, or this is gonna be painful */
    if (len1 == 0 || len2 == 0) {
        dist = 0;
        while (len1)
            dist += weighter.delete(seq1[--len1]);
        while (len2)
            dist += weighter.insert(seq2[--len2]);
        return dist;
    }

    column = []; // malloc((len2 + 1) * sizeof(double));
    //if (!column) return -1;

    column[0] = 0;
    for (j = 1; j <= len2; ++j)
        column[j] = column[j - 1] + weighter.insert(seq2[j - 1]);

    for (i = 1; i <= len1; ++i) {
        last = column[0]; /* m[i-1][0] */
        column[0] += weighter.delete(seq1[i - 1]); /* m[i][0] */
        for (j = 1; j <= len2; ++j) {
            old = column[j];
            if (seq1[i - 1] == seq2[j - 1]) {
                column[j] = last; /* m[i-1][j-1] */
            } else {
                ic = column[j - 1] + weighter.insert(seq2[j - 1]);      /* m[i][j-1] */
                dc = column[j] + weighter.delete(seq1[i - 1]);          /* m[i-1][j] */
                rc = last + weighter.replace(seq1[i - 1], seq2[j - 1]); /* m[i-1][j-1] */
                column[j] = ic < dc ? ic : (dc < rc ? dc : rc);
            }
            last = old;
        }
    }

    dist = column[len2];
    return dist;
}