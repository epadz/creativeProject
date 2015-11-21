var http = require("http"),
	socketio = require("socket.io"),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	fs = require("fs");

var cats = ["A boy’s name", "A river", "An animal", "Things that are cold", "Insects", "TV Shows", "Things that grow", "Fruits", "Things that are black", "School subjects", "Movie titles", "Musical Instruments", "Authors", "Bodies of water", "A bird", "Countries", "Cartoon characters", "Holidays", "Things that are square", "In the NWT (Northwest Territories, Canada)", "Clothing", "A relative", "Games", "Sports Stars", "School supplies", "Things that are hot", "Heroes", "A girl’s name", "Fears", "TV Stars", "Colors", "A fish", "Fruits", "Provinces or States", "Sports equipment", "Tools", "Breakfast foods", "Gifts", "Flowers", "Ice cream flavors", "A drink", "Toys", "Cities", "Things in the kitchen", "Ocean things", "Nicknames", "Hobbies", "Parts of the body", "Sandwiches", "Items in a catalog", "World leaders/Poloticians", "School subjects", "Excuses for being late", "Ice cream flavors", "Things that jump/bounce", "Television stars", "Things in a park", "Foriegn cities", "Stones/Gems", "Musical instruments", "Nicknames", "Things in the sky", "Pizza toppings", "Colleges/Universities", "Fish", "Countries", "Things that have spots", "Historical Figures", "Something you’re afraid oF", "Terms of endearment", "Items in this room", "Drugs that are abused", "Fictional characters", "Menu items", "Magazines", "Capitals", "Kinds of candy", "Items you save up to buy", "Footware", "Something you keep hidden", "Items in a suitcase", "Things with tails", "Sports equiptment", "Crimes", "Things that are sticky", "Awards/ceremonies", "Cars", "Spices/Herbs", "Bad habits", "Cosmetics/Toiletries", "Celebrities", "Cooking utensils", "Reptiles/Amphibians", "Parks", "Leisure activities", "Things you’re allergic to", "Restaurants", "Notorious people", "Fruits", "Things in a medicine cabinet", "Toys", "Household chores", "Bodies of water", "Authors", "Halloween costumes", "Weapons", "Things that are round", "Words associated with exercise", "Sports", "Song titles", "Parts of the body", "Ethnic foods", "Things you shout", "Birds", "A girl’s name", "Ways to get from here to there", "Items in a kitchen", "Villains", "Flowers", "Things you replace", "Baby foods", "Famous duos and trios", "Things found in a desk", "Vacation spots", "Diseases", "Words associated with money", "Items in a vending machine", "Movie Titles", "Games", "Things you wear", "Beers", "Things at a circus", "Vegetables", "States", "Things you throw away", "Occupations", "Appliances", "Cartoon characters", "Types of drinks", "Musical groups", "Store names", "Things at a football game", "Trees", "Personality traits", "Video games", "Electronic gadgets", "Board games", "Things that use a remote", "Card games", "Internet lingo", "Offensive words", "Wireless things", "Computer parts", "Software", "Websites", "Game terms", "Things in a grocery store", "Reasons to quit your job", "Things that have stripes", "Tourist attractions", "Diet foods", "Things found in a hospital", "Food/Drink that is green", "Weekend Activities", "Acronyms", "Seafood", "Christmas songs", "Words ending in “-n”", "Words with double letters", "Children’s books", "Things found at a bar", "Sports played outdoors", "Names used in songs", "Foods you eat raw", "Places in Europe", "Olympic events", "Things you see at the zoo", "Math terms", "Animals in books or movies", "Things to do at a party", "Kinds of soup", "Things found in New York", "Things you get tickets for", "Things you do at work", "Foreign words used in English", "Things you shouldn’t touch", "Spicy foods", "Things at a carnival", "Things you make", "Places to hangout", "Animal noises", "Computer programs", "Honeymoon spots", "Things you buy for kids", "Things that can kill you", "Reasons to take out a loan", "Words associated with winter", "Things to do on a date", "Historic events", "Things you store items in", "Things you do everyday", "Things you get in the mail", "Things you save up to buy", "Things you sit/on", "Reasons to make a phone call", "Types of weather", "Titles people can have", "Things that have buttons", "Items you take on a road trip", "Things that have wheels", "Reasons to call 911", "Things that make you smile", "Ways to kill time", "Things that can get you fired", "Hobbies", "Holiday Activities"];
var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "W"]; 
var players = [];
var games = [];
//GAME PARAMS
var gameTimeLimit = 20 * 1000; //seconds * 1000 = miliseconds
var reviewTimeLimit = 30 * 1000;
var maxPlayers = 6;
var minPlaters = 3;

//indexes
var gid = 0; //game id
var pid = 0; //player id


//picks a random letter from the list. returns it. There are 20
function pickLetter(){
	return letters[parseInt(Math.floor(Math.random() * 20))];
}
//picks a random cattegory from the list. returns it. There are 216
function pickCat(){
	return cats[parseInt(Math.floor(Math.random() * 216))];
}
console.log(pickCat() + " " + pickCat() + " " + pickCat() + " " + pickCat() + " " + pickCat() + " " + pickCat() + " " + pickCat() + " " + pickCat() + " ");
//an object that represents the game. A player can create a game. when a player creates and/or joins a game, set the game they joined to socket.game.
//xgid is the id of the new game
//xhost is the socket of the person who started the game
function game(xgid, xhost){
	this.gid = xgid;//game ID
	this.host = xhost; //the socket that created it
	this.members = {}; //the sockets in the game
	this.members[xhost.pid + ""] = xhost; //add the host to that list
	this.curLetter = null; 
	this.curCat = null;
	this.curSubmissions = null;
	this.state = 0 //0 is waiting for enough members. 1 is round is going on. 2 is answer review period.
	
	this.addMember = function(xplayer){//a socket
		if(this.members.length < maxPlayers - 1){
			this.members[xplayer.pid + ""] = xplayer;
			if(members.length == minPlaters){
				this.startRound();
			}else if(members.length < minPlaters){
				//tell all sockets to display the waiting screen.
			}else{
				//show xplayer the waiting screen
			}
			return true;//says that the player was added
		}
		else{
			return false;//says the player was not added
		}
	}
	this.removeMember = function(xplayerID){
		//if now the number of platers is bellow 3, show the waiting screen
		//if the member that left is the host, either one of the other members becomes the host or everyone is sent back to the current games listing page
	}
	this.startRound = function(){
		//if this.curSubmissions isn't empty (i.e. not the first round) go through each answer in this.curSubmissions and add the points to this.members[xplayer.pid + ""].score
		//clear curSubmissions
		
		//emit to all sockets in the room (whose namespace = the game's id) to start a new round
		//->in the data parameter of the function, tell them a random letter and cattegory. Also, include an associative array where the key is the player's id and the value is an object with their score and username
		
		//if there are any players waiting to join, let them in now.
			
		setTimeout(this.endRound, gameTimeLimit);//calls the end round function after the time limit
	}
	this.submitAnswer = function(xplayerID, xanswer){
		this.curSubmissions[xplayerID + ""] = new answer(this.members[xplayerID + ""], xanswer);
		//this is object becuase it will be used later on to store information about points, uniqueness etc. also needs to carry informaton to send to clients to display e.g. usernames
	}
	this.endRound = function(){
		this.curSubmissions = checkAnswers(this.curSubmissions);
		//emit to all sockets in the room that the round is over.
		//->emit curSubmissions to users. curSubmissions has all data needed to display
		
		setTimeout(this.startRound, reviewTimeLimit);
	}
	this.downvote = function(xplayerID){
		this.curSubmissions[xplayerID + ""].downvotes++;
		if(this.curSubmissions[xplayerID + ""].downvotes >= ((this.members.length-1)/2)){
			//more than half of the players voted no
			this.curSubmissions[xplayerID + ""].isInvalid = true;
			this.curSubmissions[xplayerID + ""].points = 0;
			//emit to all sockets that this is now invalid
		}
	}
}

//function to check answers. takes an array of answer objects and the current letter
function checkAnswers(xanswers, xletter){
	//check through each answer to make sure it is not null, starts with the letter. otherwise set isInvalid to true
	//if it is good, calculate the potential points by counting the number of words longer than 1 letter that start with the letter
	//
	//once all the invalid answers have been weeded out, loop through the answers again. For each one (that is valid), loop through the rest of the answers (that are valid) (index of current one + 1 to length of array) and do string compare on the lowercase version of the string. 
	//->if they are too similar (threshold TBD) set hasSimilar for both to true. The threshold should be a percentage calculated from the difference and the (average?) length i.e. 5% of the characters are different. This algorithm will be the most complicated part because we'll also have to check for things such as different orders etc.
	//return the array	
}

//An awnser object - xplayer is the socket
function answer(xplayer, xanswer){
	this.playerUN = xplayer.username;
	this.playerScore = xplayer.score;
	this.answer = xanswer; 
	
	this.points = 0;
	this.downvotes = 0;
	this.isInvalid = false;
	this.hasSimilar = false;
}

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
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
	console.log("connect: ");
	console.log(socket.id);
	
	socket.username = "";
	socket.score = 0;
	socket.pid = pid;
	pid++;
	
	
	//function to send the list of current games and number of players in it
	//call that function on connection
	
	//function to handle joining a game
	
	//function to handle creating a game
	
	//function to handle ending/ deleting a game
	
	//function to handle a player submitting an answer
	
	//function to handle a player voting down an answer
	
	//function to handle a player leaving a game
	
});