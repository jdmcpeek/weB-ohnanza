var mongoose = require('mongoose');
var beans = require('./beans');

var deck = {};
var Schema = mongoose.Schema;
deck.deck_schema = new Schema({
	channel: String,
	cards: [beans.beans_schema]
});

//Adds new cards into the deck (don't forget to shuffle)!
//cards - array of beans
deck.deck_schema.methods.add = function(cards) {
	//This style for-loop acts funny...
	//if cards is an array I would expect card to be an element
	for(var card in cards) {
		this.cards.push(cards[card]);
	}
}

//Pops the first card off the deck and returns it
deck.deck_schema.methods.draw = function() {
		//what happens if there are no cards left in deck?
		return this.cards.pop();
}

//Shuffles this.cards
deck.deck_schema.methods.shuffle = function() {
	//http://goo.gl/Uh6MLE
	var index = this.cards.length, temp, rnd_index;

	while(0 !== index){
		rnd_index = Math.floor(Math.random() * index);
		index -=1;

		temp = this.cards[index];
		this.cards[index] = this.cards[rnd_index];
		this.cards[rnd_index] = temp;
	}
}

//Populates this.cards with the appropriate beans
deck.deck_schema.methods.init = function() {
	totals = {
		"coffee": 24,
		"wax": 22,
		"blue": 20,
		"chili": 18,
		"stink": 16,
		"green": 14,
		"soy": 12,
		"black-eyed": 10,
		"red": 8,
		"garden": 6,
		"cocoa": 4
	};

	for (var bohn in totals) {
		for (var i=0; i < totals[bohn]; i++) {
			var new_card = beans.new(bohn);
			this.cards.push(new_card);
		}
	}
};

deck.model = mongoose.model('Deck', deck.deck_schema);

//I'm not sure this code should live here, but this is demonstrative
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("Instantiating deck.")
	var new_deck = new deck.model;
	console.log("Generating new deck:");
	new_deck.init();
	new_deck.shuffle();
	console.log("Drawing 3 cards");
	var beans = [];
	for(var i=0; i < 3; i++) {
		beans[i] = new_deck.draw();
		console.log(beans[i]);
	}
	console.log("Putting them back");
	new_deck.add(beans);
	for(var i=1; i <= 3; i++) {
		console.log(new_deck.cards[new_deck.cards.length-i]);
	}
	//ignoring error handling
	new_deck.save();
	console.log("Saved new deck.");
});
module.exports = deck;
