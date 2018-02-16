const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./db')
const EntryModel = require('./entryModel')
let sessionId = 0

const app = express()
const apiRouter = express.Router()

apiRouter.use(cors())
apiRouter.use(bodyParser.urlencoded({extended: false}))
apiRouter.use(bodyParser.json())

//FOR BLUEMIX
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use('/', express.static('client'))
app.use('/api', apiRouter)

apiRouter.get('/', (req, res)=>{
  res.send("You've reached the Neural Net API.")
})

apiRouter.post('/test', (req,res)=>{
  console.log(req.body)
  let d = convertRPStoArray(req.body.game)
  res.send(d)
})

apiRouter.get('/session', (req, res)=>{
  sessionId +=1
  res.send({sessionId: sessionId})
})

apiRouter.post('/entry', (req, res)=>{
  let d = req.body
  d.game = convertRPStoArray(d.game)
  let entry = new EntryModel(d)
  EntryModel.findOne({sessionId: d.sessionId})
    .then((resEntry) => {
      if(resEntry){
        resEntry.game.push(entry.game)
        resEntry.stats = entry.stats
        return resEntry.save((e,m)=>handleSave(e,m, res))
      } else {
        entry.game = [entry.game]
        entry.save((e,m) => handleSave(e,m, res))
      }
    })
    .catch(err => handleError(err, res))
                              
})

app.listen(port)
console.log(`listening on ${port}`)

/*
  HELPERS
~~~~~~~~~~~~~~~~~~~~ */
function convertRPStoArray(game){
  let key = {
    'rock': [1,0,0],
    'paper': [0,1,0],
    'scissors': [0,0,1]
  }
  return game.map(e => key[e])
}

function handleSave(err, model, res){
  if(err) return handleError(err, res)
  else return res.send({success: true, model})
}

function handleError(err, res){
  console.log(err)
  return res.send({success: false, msg: err})
}