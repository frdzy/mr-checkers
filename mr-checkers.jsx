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

var CheckersStage = React.createClass({
  getInitialState: function() {
    return {
      pieces: getInitialBoardPieces()
    };
  },

  render: function() {
    var gameData = {
      width: 8,
      height: 8,
      pieces: this.state.pieces
    };
    return (
      <CheckersBoard
        data={gameData}
      />
    );
  }
});

var CheckersBoard = React.createClass({
  getPieceAtLocation: function(r, c) {
    var row, pieceData;
    var pieces = this.props.data.pieces;
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
      <table className="checkersBoard">
        <tbody>
          {rows}
        </tbody>
      </table>
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
        return null;
      case CheckersLevels.KING:
        return [
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
          <circle
            cx="25"
            cy="25"
            stroke={this.getBorderColorCode()}
            stroke-width="1"
            r="20"
            fill={this.getFillColorCode()}
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
      <CheckersStage />,
      document.getElementById('checkers_stage')
    );
  });
}
