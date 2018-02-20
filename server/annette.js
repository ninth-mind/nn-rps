const EntryModel = require('./entryModel')

const {Architect,
      Network,
      Neuron,
      Layer,
      Trainer} = require('synaptic');


//create Annette to predict users next move
function createAndTrain(games, toRemember){
  let annette = new Architect.LSTM(toRemember * 3, Math.ceil(0.75*toRemember),3)
  for(let i = toRemember; i<games.length; i++){
    let inputs = []
    for(let j = toRemember; j>0;j--){
      //[0] position is the PLAYERS GAME
      inputs = inputs.concat(games[i-j][0])
    }
    annette.activate(...inputs)
    annette.propagate(...games[i][0])
  }
  return annette
}

//AS OF 2/19/18:
// let results = {
//   "wins":602,
//   "losses":657,
//   "ties":612,
//   "total":1871,
//   "rock":639,
//   "paper":590,
//   "scissors":642,
//   "rockWins":193,
//   "paperWins":207,
//   "scissorsWins":202,
//   "longestStreak":7
// }

// //aux results 
// let auxResults = {
//   winPercentage: 32.18,
//   tiePercentage: 32.71,
//   lossPercentage: 35.11,
// }

// module.exports = analyzeResults