/**
 * @jsx React.DOM
 */
var CheckersColors = {
  BLACK: 0,
  WHITE: 1
};

var CheckersLevels = {
  MAN: 0,
  KING: 1
};

var CheckersStage = React.createClass({
  getInitialState: function() {
    var blacks = [
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
    var whites = [
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
    function add(color, piece) {
      var r = piece[0];
      var c = piece[1];
      var curRow = pieces[r] || (pieces[r] = {});
      curRow[c] = {
        color: color,
        level: CheckersLevels.MAN
      };
    }
    blacks.forEach(add.bind(null, CheckersColors.BLACK));
    whites.forEach(add.bind(null, CheckersColors.WHITE));
    return {
      pieces: pieces
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
            color={pieceData.color}
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
  render: function() {
    return (
      <div>
        {this.props.color}
        <br />
        {this.props.level}
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
