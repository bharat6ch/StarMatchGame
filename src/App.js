
import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

const StarsDisplay = props => (
  <>
    {utils.range(1, props.count).map(starId =>
      <div className='star' key={starId}>
      </div>
    )}
  </>
);

const PlayButton = props => (
  <button className='number'
    style={{ backgroundColor: colors[props.status] }}
    onClick={() => props.onClick(props.number, props.status)}>
    {props.number}
  </button>
);

const PlayAgain = props => {
  return (
    <div className='game-done'>
      <div className='message'
        style={{ color: props.gameStatus === 'won' ? 'green' : 'red' }}>
        {props.gameStatus === 'won' ? 'Nice' : 'Game Over'}
      </div>
      <button onClick={props.onClick}> Play Again </button>
    </div>
  );
};

//Custom Hook - Function to manage state objects for simplification
const useGameState = () => {
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1)
      }, 1000);
      return () => clearTimeout(timerId);
    }
  });

  const setGameState = (newCandidateNums) => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    }
    else {
      const newAvailableNums = availableNums.filter(n => !newCandidateNums.includes(n));
      //Redraw stars with available count
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };

  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
};

const Game = (props) => {
  const { stars, availableNums, candidateNums, secondsLeft, setGameState } = useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars;
  const gameStatus = availableNums.length === 0 ? 'won' : secondsLeft === 0 ? 'lost' : 'active';


  const numberStatus = number => {
    if (!availableNums.includes(number)) {
      return "used";
    }
    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? "wrong" : "candidate";
    }
    return "available";
  };

  //Replacing below with Unmount and Remount component concept form Game tag level itself  
  /*  
    const resetGame = () => {
      setAvailableNums(utils.range(1, 9));
      setCandidateNums([]);
      setStars(utils.random(1,9));
      setSecondsLeft(10);
    };
    */
  const onNumberClick = (number, currentStatus) => {
    if (gameStatus !== 'active' || currentStatus === 'used')
      return;
    const newCandidateNums =
      currentStatus === 'available'
        ? candidateNums.concat(number)
        : candidateNums.filter(n => n !== number);

    setGameState(newCandidateNums);
  };

  return (
    <div className='game'>
      <div className='help'>
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className='body'>
        <div className='left'>
          {gameStatus !== 'active' ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          )
            : (<StarsDisplay count={stars} />)
          }
        </div>
        <div className='right'>
          {utils.range(1, 9).map(number =>
            <PlayButton
              number={number}
              status={numberStatus(number)}
              key={number}
              onClick={onNumberClick}
            />
          )}
        </div>
      </div>
      <div className='timer'>Time Remaining:{secondsLeft}</div>
    </div>
  );
};

// Color Theme
const colors = {
  available: "#88c1ff ",
  used: "#007bff",
  wrong: "#c82333",
  candidate: "#28a745"
};

// Math science
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  }
};

const StarMatch = () => {
  const [gameId, setGameId] = useState(1);
  return (
    <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />
  );
};

//const rootElement = document.getElementById("mountNode");
//ReactDOM.render(<StarMatch />, rootElement);


export default StarMatch;