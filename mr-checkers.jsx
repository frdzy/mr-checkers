/**
 * @jsx React.DOM
 */
var CheckersStage = React.createClass({
  render: function() {
    var gameData = {
      width: 8,
      height: 8,
      pieces: []
    };
    return (
      <CheckersBoard
        data={gameData}
      />
    );
  }
});

var CheckersBoard = React.createClass({
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
      <td className={['checkersCell', classNameSuffix].join(' ')} />
    );
  }
});

var CheckersPiece = React.createClass({
  render: function() {
    return <div />;
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
