import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button onClick={props.onClick} className="square">
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderBoard() {
    const helper = (size) => Array.from(new Array(size), (v, i) => i);

    return helper(this.props.numRows).map((row) => (
      <div key={row} className="board-row">
        {helper(this.props.numCols).map((col) =>
          this.renderSquare(this.props.numCols * row + col),
        )}
      </div>
    ));
  }

  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function ToggleButton(props) {
  return (
    <div className="toggle-button">
      <button onClick={() => props.onClick(true)}
        disabled={props.ordering} > Ascending </button>
      <button onClick={() => props.onClick(false)}
        disabled={!props.ordering} > Descending </button>
    </div>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: [],
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const squares = history[history.length - 1].squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: [
        ...history,
        { squares: squares, location: [i % 3, Math.floor(i / 3)] },
      ],
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(move) {
    this.setState({ stepNumber: move, xIsNext: move % 2 === 0 });
  }

  render() {
    const ordering = this.state.ascending;
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const [col, row] = step.location;
      const description = move
        ? `Go to move #${move} - (${col}, ${row})`
        : 'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? (
              <b>{description}</b>
            ) : (
                description
              )}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            numRows={3}
            numCols={3}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ToggleButton ordering={ordering} onClick={(order) => this.setState({ ascending: order })} />
          <ol>{ordering ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
