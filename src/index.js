import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, compose, applyMiddleware } from 'redux';
import { logger } from 'redux-logger'
import './index.css';

const NEW_GAME = {
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

const changeState = (state = NEW_GAME, action) => {
  switch (action.type) {
    case 'MOVE':
      const history = state.history.slice(0, state.stepNumber + 1);
      const squares = history[history.length - 1].squares.slice();
      const index = action.id;

      squares[index] = state.xIsNext ? 'X' : 'O';

      return {
        history: [
          ...history,
          { squares: squares, location: [index % 3, Math.floor(index / 3)] },
        ],
        stepNumber: history.length,
        xIsNext: !state.xIsNext,
        ascending: state.ascending,
      }
    case 'CHANGE_ORDER':
      return {
        ...state,
        ascending: !state.ascending,
      }
    case 'JUMP_TO_MOVE':
      const move = action.move;
      return {
        ...state,
        stepNumber: move,
        xIsNext: move % 2 === 0
      }
    default:
      return state
  }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(changeState,
  composeEnhancers(applyMiddleware(logger)));


function Square(props) {
  const cName = props.winner ? 'square winner' : 'square';
  return (
    <button onClick={props.onClick} className={cName}>
      {props.value}
    </button>
  );
}

function ToggleButton(props) {
  return (
    <div className="toggle-button">
      <button className={props.ordering ? 'toggled' : ''} onClick={() => props.onClick()} disabled={props.ordering}>
        Ascending
      </button>
      <button className={props.ordering ? '' : 'toggled'} onClick={() => props.onClick()} disabled={!props.ordering}>
        Descending
      </button>
    </div>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        winner={this.props.winner.includes(i)}
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

class Game extends React.Component {

  render() {
    const {
      history,
      ascending,
      stepNumber,
      xIsNext
    } = this.props;
    const current = history[stepNumber];
    const winner = calculateWinner(current.squares) || [];

    const moves = history.map((step, move) => {
      const [col, row] = step.location;
      const description = move
        ? `Go to move #${move} - (${col}, ${row})`
        : 'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => store.dispatch({ type: 'JUMP_TO_MOVE', move: move })}>
            {move === stepNumber ? (
              <b>{description}</b>
            ) : (
                description
              )}
          </button>
        </li>
      );
    });

    let status;
    if (winner.length) {
      status = `Winner: ${current.squares[winner[0]]}`;
    } else {
      if (current.squares.includes(null)) {
        status = `Next player: ${xIsNext ? 'X' : 'O'}`;
      } else {
        status = "Draw";
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            numRows={3}
            numCols={3}
            winner={winner}
            squares={current.squares}
            onClick={(i) => {
              if (calculateWinner(current.squares) || current.squares[i]) {
                return;
              }
              store.dispatch({ type: 'MOVE', id: i });
            }}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ToggleButton
            ordering={ascending}
            onClick={() => store.dispatch({ type: 'CHANGE_ORDER' })}
          />
          <ul>{ascending ? moves : moves.reverse()}</ul>
        </div>
      </div>
    );
  }
}

// ========================================
const render = () => {
  ReactDOM.render(<Game {...store.getState()} />, document.getElementById('root'));
}
store.subscribe(render);
render();

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
      return lines[i];
    }
  }
  return null;
}
