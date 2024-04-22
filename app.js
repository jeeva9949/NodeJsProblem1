const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null
const initailisingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3001, () => {
      console.log('server is started')
    })
  } catch (error) {
    console.log(`the Error is ${error.message}`)
    process.exit(1)
  }
}

initailisingDBAndServer()

// Returns a list of all players in the team

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getListOfPlayers = `select * from cricket_team`
  const resultAllPlayers = await db.all(getListOfPlayers)
  response.send(
    resultAllPlayers.map(eachplayer =>
      convertDbObjectToResponseObject(eachplayer),
    ),
  )
})

// Creates a new player in the team (database). `player_id` is auto-incremented

app.post('/players/', async (request, response) => {
  const playerDeatils = request.body
  const {playerName, jerseyNumber, role} = playerDeatils
  const addPlayer = `INSERT INTO cricket_team
  (player_name, jersey_number, role)
  VALUES (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  ) `
  const dbResponse = await db.run(addPlayer)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

// Returns a player based on a player ID

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `select * from cricket_team WHERE player_id = ${playerId}`
  const playerResponse = await db.get(getPlayerDetails)
  response.send(playerResponse)
})

// Updates the details of a player in the team (database) based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerDetails = `update cricket_team set
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId} `
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

// Deletes a player from the team (database) based on the player ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `delete from cricket_team where player_id = ${playerId}`
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app



// https://github.com/jeeva9949/NodeJsProblem1.git