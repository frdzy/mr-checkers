CheckersPlayers = {
  P1: 0,
  P2: 1
};

CheckersColors = {};
CheckersColors[CheckersPlayers.P1] = {
  fill: '#f00',
  border: '#000'
};
CheckersColors[CheckersPlayers.P2] = {
  fill: '#000',
  border: '#fff'
};

CheckersLevels = {
  MAN: 0,
  KING: 1
};

CheckersGames = new Meteor.Collection('checkers_games');

CheckersGames.deny({
  remove: function(userId, doc) {
    return false;
  }
});

CheckersGames.allow({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc) {
    return true;
  }
});

