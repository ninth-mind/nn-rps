import {determineWinner, chooseRandom, p} from '../../helpers';

let sessionId = 0
let slackURI = "https://hooks.slack.com/services/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"


const stats = {
  win: 0,
  tie: 0,
  loss: 0,
  total: 0
}
let counting = false
// ^^^^ prevents multiple votes during countdown

// Event Listeners
const buttons = document.querySelectorAll('button')
buttons.forEach(b=>b.addEventListener('click', (e)=>{
  e.preventDefault()
  let val = e.target.value
  if(!counting) handleVote(val)
}))

window.addEventListener('keydown', e=>{
  const key = {37: 'rock',82:'rock',
            80: 'paper', 40: 'paper',
            83: 'scissors', 39: 'scissors'}
  const vote = key[e.keyCode]
  if(vote && !counting) handleVote(vote)
})

// Runner Functions
function handleVote(hv){
  if(!counting){
    let cv = chooseRandom()
    let r = determineWinner(hv, cv)
    updateStats(r)
    sendResults(hv, cv)
    countDown(hv, cv, r)
  }
}

function countDown(humanVote, compVote, result){
  counting = true
  let count = 3
  updateWinLossColors(0)
  const id = setInterval(run, 700)
  run()
  function run(){
    if(count == 0){
      window.clearInterval(id)
      finishScreen(humanVote, compVote, result)
      counting = false
    } else {
      document.querySelector('.choice.human').innerText = count
      document.querySelector('.choice.computer').innerText = count
    }
    count -= 1
  }
}

function finishScreen(humanVote, compVote, result){
  updateStatsScreen(result)
  updateMoves(humanVote, compVote, result)
}

function sendResults(hv,cv){
  let payload = JSON.stringify({
    game: [hv, cv],
    sessionId,
    stats
  })
  let myInit = { 
    method: 'POST',
    headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
    body: payload,
    mode: 'cors',
    cache: 'default'
  };

  fetch('/api/entry', myInit)
  .then((res)=>{
    return res.json()
  })
  .then((json)=>{
    console.log(json)
    if(!json.success) handleServerError(json.msg)
  })
  .catch(err => handleServerError(err))
}

function updateStats(result){
  if(result >= 1) stats.win +=1;
  else if(result == 0) stats.tie +=1;
  else stats.loss +=1;
  stats.total +=1
}

function updateStatsScreen(){
  document.querySelector('.stat--number.win').innerText = stats.win
  document.querySelector('.stat--number.tie').innerText = stats.tie
  document.querySelector('.stat--number.loss').innerText = stats.loss

  document.querySelector('.stat--percentage.win').innerText = p(stats.win, stats.total)
  document.querySelector('.stat--percentage.tie').innerText = p(stats.tie, stats.total)
  document.querySelector('.stat--percentage.loss').innerText = p(stats.loss, stats.total)
}

// Change the Colors of the Play depending on WIN or LOSS
function updateWinLossColors(r){
  let hv = document.querySelector('.choice.human')
  let cv = document.querySelector('.choice.computer')
  if(r >=1){ 
    hv.classList.remove('loss')
    hv.classList.add('win')
    cv.classList.remove('win')
    cv.classList.add('loss')
  } else if(r ==0) {
    hv.classList.remove('loss')
    hv.classList.remove('win')
    cv.classList.remove('win')
    cv.classList.remove('loss')
  } else {
    hv.classList.remove('win')
    hv.classList.add('loss')
    cv.classList.remove('loss')
    cv.classList.add('win')
  }
}

// Update Previous Moves List
function updateMoves(h,c,r){
  h = h.toUpperCase()
  c = c.toUpperCase()
  updateWinLossColors(r)
  document.querySelector('.choice.human').innerText = h
  document.querySelector('.choice.computer').innerText = c
  
  let hc = document.createElement('li')
  hc.innerText = h
  let cc = document.createElement('li')
  cc.innerText = c

  let hl = document.querySelector('.move-list.human')
  let cl = document.querySelector('.move-list.computer')

  //cap the moves list to 10
  if(hl.childElementCount >= 10){
    hl.children[9].remove()
    cl.children[9].remove()
  }
  hl.prepend(hc)
  cl.prepend(cc)
}

function fetchSessionId(){
  let myInit = { 
    method: 'GET',
    headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
    mode: 'cors',
    cache: 'default'
  };
  fetch('/api/session', myInit)
    .then(r=>r.json())
    .then(r=>{
      sessionId = r.sessionId
      slackURI = r.slackURI
    })
}

function handleServerError(err){
  alert('There was a problem connecting to the server.')
  console.log(err)
}
fetchSessionId()