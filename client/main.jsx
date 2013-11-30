/**
 * @jsx React.DOM
 */

var CheckersApp = React.createClass({

  mixins: [MeteorMixin],

  getCurrentGameID: function() {
    return Session.get('current_game_id');
  },

  getCurrentGame: function() {
    var curGameID = this.getCurrentGameID();
    var curGame = null;
    if (curGameID) {
      curGame = CheckersGames.findOne({
        _id: curGameID
      });
    }
    return curGame;
  },

  getAllGames: function() {
    return CheckersGames.find().fetch();
  },

  getMeteorState: function() {
    var curGame = this.getCurrentGame();
    return {
      currentGameID: this.getCurrentGameID(),
      currentGame: _.extend(
        {
          height: 8,
          width: 8,
          initialized: !!curGame,
        },
        curGame
      ),
      games: this.getAllGames()
    };
  },

  onSelectGame: function(gameID) {
    Session.set('current_game_id', gameID);
  },

  onPieceSelect: function(piece) {
    var currentGameID = this.getCurrentGameID();
    CheckersGames.update(
      currentGameID,
      {$set: {selected: piece}}
    );
  },

  onPieceUnselect: function() {
    var currentGameID = this.getCurrentGameID();
    CheckersGames.update(
      currentGameID,
      {$set: {selected: null}}
    );
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
          data={this.state.currentGame}
          onPieceSelect={this.onPieceSelect}
          onPieceUnselect={this.onPieceUnselect}
        />
      </div>
    );
  }
});

var CheckersGamesList = React.createClass({

  getInitialState: function() {
    return {
      newGameName: ''
    };
  },

  onCreateNewGame: function(evt) {
    if (!this.state.newGameName.length) {
      return;
    }
    Meteor.call(
      'createGame',
      this.state.newGameName,
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

  onDeleteGame: function(gameID, evt) {
    Meteor.call('deleteGame', gameID);
  },

  onGameNameChange: function(evt) {
    this.setState({
      newGameName: evt.target.value
    });
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
          <input
            type="submit"
            onClick={this.onDeleteGame.bind(this, game._id)}
            value="X"
          />
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
              type="text"
              onChange={this.onGameNameChange}
              value={this.state.newGameName}
            />
            <input
              onClick={this.onCreateNewGame}
              type="submit"
              value="Create"
            />
          </li>
        </ul>
      </div>
    );
  }
});

var CheckersStage = React.createClass({

  render: function() {
    return (
      <div className="checkersStage">
        {this.transferPropsTo(<CheckersBoard />)}
      </div>
    );
  }
});

var CheckersBoard = React.createClass({

  getPieceAtLocation: function(r, c) {
    var row, pieceData;
    var pieces = this.props.data.pieces;
    var selected = this.props.data.selected;
    if (!pieces) {
      return null;
    }
    if (row = pieces[r]) {
      if (pieceData = row[c]) {
        var isSelected =
          selected &&
          (selected.y === r && selected.x === c);
        return (
          <CheckersPiece
            position={{y: r, x: c}}
            onSelect={this.props.onPieceSelect}
            onUnselect={this.props.onPieceUnselect}
            isSelected={isSelected}
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

  onSelect: function(evt) {
    if (this.props.isSelected) {
      this.props.onUnselect(this.props.position);
    } else {
      this.props.onSelect(this.props.position);
    }
  },

  render: function() {
    var colorCode = this.getFillColorCode();
    var renderClass = (this.props.isSelected)
      ? 'checkersPieceSelected'
      : 'checkersPiece';
    return (
      <div className={renderClass} onClick={this.onSelect}>
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

Meteor.startup(function() {
  React.renderComponent(
    <CheckersApp />,
    document.getElementById('checkers_stage')
  );
});

