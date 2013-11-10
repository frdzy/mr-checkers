/**
 * @jsx React.DOM
 */
var CheckersPlayers = {
  P1: 0,
  P2: 1
};

var CheckersColors = {};
CheckersColors[CheckersPlayers.P1] = {
  fill: '#f00',
  border: '#000'
};
CheckersColors[CheckersPlayers.P2] = {
  fill: '#000',
  border: '#fff'
};

var CheckersLevels = {
  MAN: 0,
  KING: 1
};

var CheckersApp = React.createClass({

  mixins: [MeteorMixin],

  getMeteorState: function() {
    var games = CheckersGames.find().fetch();
    var curGameID = Session.get('current_game_id');
    var curGame = null;
    if (curGameID) {
      games.forEach(function(game) {
        if (game._id === curGameID) {
          curGame = game;
          return false;
        }
      });
    }

    return {
      currentGameID: curGameID,
      currentGame: _.extend(
        {
          height: 8,
          width: 8,
          initialized: !!curGame,
        },
        curGame
      ),
      games: games
    };
  },

  onSelectGame: function(gameID) {
    Session.set('current_game_id', gameID);
  },

  render: function() {
    return (
      <div className="checkersApp">
        <CheckersGamesList
          onSelectGame={this.onSelectGame}
          currentGameID={this.state.currentGameID}
          games={this.state.games}
        />
        <CheckersStage
          gameData={this.state.currentGame}
        />
      </div>
    );
  }
});

var CheckersGamesList = React.createClass({

  onCreateNewGame: function(evt) {
    Meteor.call(
      'createGame',
      'MyGame',
      function(error, newGameID) {
        if (error) {
          console.error('Failed to create game: ' + error.reason);
          return;
        }
        this.props.onSelectGame(newGameID);
      }.bind(this)
    );
  },

  onSelectGame: function(evt) {
    this.props.onSelectGame(evt.target.value);
  },

  render: function() {
    var gameList = [];
    this.props.games.forEach(function(game) {
      var gameKey = "checkersCurrentGame." + game._id;
      gameList.push(
        <li key={gameKey}>
          <input
            checked={game._id === this.props.currentGameID}
            onChange={this.onSelectGame}
            name="checkersCurrentGame"
            type="radio"
            value={game._id}
          />
          {game.name}
        </li>
      );
    }.bind(this));

    return (
      <div className="checkersGamesPanel">
        All Games:
        <ul className="checkersGamesList">
          {gameList}
          <li>
            <input
              onClick={this.onCreateNewGame}
              type="submit"
              value="Create New Game"
            />
          </li>
        </ul>
      </div>
    );
  }
});

CheckersGames = new Meteor.Collection("checkers_games");

var CheckersStage = React.createClass({

  render: function() {
    return (
      <div className="checkersStage">
        <CheckersBoard
          data={this.props.gameData}
        />
      </div>
    );
  }
});

var CheckersBoard = React.createClass({

  getPieceAtLocation: function(r, c) {
    var row, pieceData;
    var pieces = this.props.data.pieces;
    if (!pieces) {
      return null;
    }
    if (row = pieces[r]) {
      if (pieceData = row[c]) {
        return (
          <CheckersPiece
            player={pieceData.player}
            level={pieceData.level}
          />
        );
      }
    }
    return null;
  },

  getInitializingMessage: function() {
    if (!this.props.data.initialized) {
      return (
        <div className="checkersLoading">
          Select a Game
        </div>
      );
    }
  },

  render: function() {
    var data = this.props.data;
    var width = data.width;
    var height = data.height;
    var rows = [];
    var parity = true;
    for (var i = 0; i < height; i++) {
      var checkersCells = [];
      for (var j = 0; j < width; j++) {
        checkersCells.push(
          <CheckersCell
            key={'cell.' + i + '.' + j}
            piece={this.getPieceAtLocation(i, j)}
            parity={(parity = !parity)}
          />
        );
      }
      parity = !parity;
      rows.push(
        <CheckersRow
          key={'row.' + i}
          cells={checkersCells}
        />
      );
    }
    return (
      <div className="checkersBoard">
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
        {this.getInitializingMessage()}
      </div>
    );
  }
});

var CheckersRow = React.createClass({

  render: function() {
    return (
      <tr className="checkersRow">
        {this.props.cells}
      </tr>
    );
  }
});

var CheckersCell = React.createClass({

  render: function() {
    var classNameSuffix = this.props.parity
      ? "odd"
      : "even";
    return (
      <td className={['checkersCell', classNameSuffix].join(' ')}>
        {this.props.piece}
      </td>
    );
  }
});

var CheckersPiece = React.createClass({

  getBorderColorCode: function() {
    var checkersPlayer = this.props.player;
    return CheckersColors[checkersPlayer].border;
  },

  getFillColorCode: function() {
    var checkersPlayer = this.props.player;
    return CheckersColors[checkersPlayer].fill;
  },

  getDesign: function() {
    var checkersLevel = this.props.level;
    switch (checkersLevel) {
      case CheckersLevels.MAN:
        return (
          <circle
            cx="25"
            cy="25"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
            r="20"
            fill={this.getFillColorCode()}
          />
        );
      case CheckersLevels.KING:
        return [
          <circle
            cx="25"
            cy="25"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
            r="23"
            fill={this.getFillColorCode()}
          />,
          <circle
            cx="25"
            cy="25"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
            r="20"
            fill={this.getFillColorCode()}
          />,
          <line
            x1="20"
            y1="30"
            x2="15"
            y2="19"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
          />,
          <line
            x1="25"
            y1="30"
            x2="25"
            y2="15"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
          />,
          <line
            x1="30"
            y1="30"
            x2="35"
            y2="19"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
          />
        ];
    }
    console.error('Invalid level ' + checkersLevel);
    return null;
  },

  render: function() {
    var colorCode = this.getFillColorCode();
    return (
      <div className="checkersPiece">
        <svg>
          <circle
            cx="25"
            cy="25"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
            r="25"
            fill={colorCode}
          />
          {this.getDesign()}
        </svg>
      </div>
    );
  }
});

if (Meteor.isClient) {
  Meteor.startup(function() {
    React.renderComponent(
      <CheckersApp />,
      document.getElementById('checkers_stage')
    );
  });
}

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
  }
});

if (Meteor.isServer) {
  Meteor.startup(function() {
    if (CheckersGames.find().count() === 0) {
      Meteor.call('createGame', 'MyGame');
    }
  });
}
