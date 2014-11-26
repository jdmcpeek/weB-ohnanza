var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bean_model = require('./bean');
var bean_schema = bean_model.schema;
var player_model = require('./player');
var player_schema = player_model.schema;
var game_schema = new Schema({
  channel:        String,
  round:          {type: Number, default: 0},
  current_player: {type: Number, default: 0},
  deck:           {type: [bean_schema], default: []},
  discard:        {type: [bean_schema], default: []},
  players:        [player_schema]
});

//Alternate Constructor
game_schema.statics.create = function(params) {
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
  var deck = [];
  for (var bean_type in totals) {
    for (var i=0; i < totals[bean_type]; i++) {
      var new_bean = new bean_model({type: bean_type});
      deck.push(new_bean);
    }
  }
  var new_game = new this(params);
  new_game.deck = deck;
  return new_game;
};

//Shuffles this.deck
game_schema.methods.shuffle_deck = function () {
  //http://goo.gl/Uh6MLE
  var index = this.deck.length, temp, rnd_index;

  while(0 !== index){
    rnd_index = Math.floor(Math.random() * index);
    index -=1;

    temp = this.deck[index];
    this.deck[index] = this.deck[rnd_index];
    this.deck[rnd_index] = temp;
  }
};

//Pops the first n cards off the deck and returns them in an array
game_schema.methods.draw_n = function(number) {
    var return_array = [];
    if(this.deck.length < number) {
      //In practice this should resolve the problem...
      this.recycle();
      this.shuffle_deck();
    }

    for(var i=0; i<number; i++) {
      return_array.push(this.deck.shift());
    }
    return return_array;
};

//Takes the all the beans in the discard pile moves them into the deck again
game_schema.methods.recycle = function() {
  while(this.discard.length > 0) {
    this.deck.push(this.discard.shift());
  }
  this.round++;
};

//Hand to hand swap
game_schema.methods.trade_to_hand = function(p1, index_p1, p2, index_p2){
  var player1 = this.players[p1];
  var player2 = this.players[p2];
  var card1 = player1.get_from_hand(index_p1);
  var card2 = player2.get_from_hand(index_p2);
  player1.add_to_hand([card2]);
  player2.add_to_hand([card1]);
};

//Hand to plot donate
game_schema.methods.donate_to_plot = function(p1, index_p1, p2, plot_index){
  var player1 = this.players[p1];
  var player2 = this.players[p2];
  var card = player1.get_from_hand(index_p1);
  player2.plots[plot_index].plant([card]);
};

//Hand to hand donate
game_schema.methods.donate_to_hand = function(p1, index_p1, p2){
  var player1 = this.players[p1];
  var player2 = this.players[p2];
  var card = player1.get_from_hand(index_p1);
  player2.add_to_hand([card]);
};

module.exports = mongoose.model('Game', game_schema);
