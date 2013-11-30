function getInitialBoardPieces() {
  var playerOnePositions = [
    [0, 0],
    [0, 2],
    [0, 4],
    [0, 6],
    [1, 1],
    [1, 3],
    [1, 5],
    [1, 7],
    [2, 0],
    [2, 2],
    [2, 4],
    [2, 6]
  ];
  var playerTwoPositions = [
    [5, 1],
    [5, 3],
    [5, 5],
    [5, 7],
    [6, 0],
    [6, 2],
    [6, 4],
    [6, 6],
    [7, 1],
    [7, 3],
    [7, 5],
    [7, 7]
  ];
  var pieces = {};
  function add(player, piece) {
    var r = piece[0];
    var c = piece[1];
    var curRow = pieces[r] || (pieces[r] = {});
    curRow[c] = {
      player: player,
      level: CheckersLevels.MAN
    };
  }
  playerOnePositions.forEach(add.bind(null, CheckersPlayers.P1));
  playerTwoPositions.forEach(add.bind(null, CheckersPlayers.P2));

  return pieces;
}

Meteor.methods({
  createGame: function(name) {
    return CheckersGames.insert({
      name: name,
      pieces: getInitialBoardPieces()
    });
  },

  deleteGame: function(gameID) {
    return CheckersGames.remove({
      _id: gameID
    });
  }
});

