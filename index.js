
const express = require('express')
const cors = require('cors')

const bodyParser = require('body-parser')
const massive = require('massive')
const session = require('express-session')
const socket = require('socket.io')
require('dotenv').config()

const {SERVER_PORT} = process.env
const {CONNECTION_STRING} = process.env

const controller = require('./controller')
// const app = express()
var http = require('http')




// var app = require('express')();

// var server = require('http').Server(app);
// var io = require('socket.io')(server);



var app = express();

app.use(bodyParser.json())
app.use(cors())

var server = app.listen(3020);
var io = require('socket.io').listen(server);

io.set('transports', ['websocket']);








// massive(CONNECTION_STRING).then(db=>{
//     app.set('db',db)
//     const io = socket(
//         server.listen(SERVER_PORT, ()=>{
//             console.log(`listening on port ${SERVER_PORT}`)
//         })
//     )
// })



app.get('/dylan', (req, res) => {
    res.status(200).send('You just hit my remote server, Dylan. Wadddup.')
})



 ///SOCKETS///////

    

 io.on('connection', socket => {
    console.log('user joined!')

    socket.on('disconnect', function(){
        console.log('user left :(')
    })

    socket.on('fire', function(){
        console.log('we here')
    })

    socket.on('join-room', data => {
        socket.join(data.room)
        socket.emit('new-player', {
            message: 'new player!'
        })
        socket.in(data.room).broadcast.emit('get-me-players')
    
    })

    socket.on('here-are-players', data =>{
        io.in(data.room).emit('add-players', {data})
    })

    socket.on('add-user', data =>{
        io.in(data.room).emit('user-added', {
            user : data.userName, userPic: data.userPic, judge: false, score: data.score
        })
    })

    socket.on('ready-player', data => {
        io.in(data.room).emit('ready-player-added', data.players)
    })

    socket.on('receive-ready-players', data => {
        socket.in(data.room).broadcast.emit('readied-players')
    })

    socket.on('readyPlayers-array', data => {
        console.log('ry-players', data, data.players)
        socket.in(data.room).broadcast.emit
        ('here-are-readyPlayers', data.players)
    })

    socket.on('join-room-generic', data => {
        socket.join(data.room)
    })

    socket.on('updateQCard', data => {
        socket.join(data.room)
        io.in(data.room).emit('getQCard', {qCard: data.qCard})
    })

    socket.on('added-scard', data => {
        socket.join(data.room)
        io.in(data.room).emit('total-scards', data.sCards)

    })
    
    socket.on('user-with-points', data => {
        io.in(data.room).emit('updated-users', data.users)
        io.in(data.room).emit('updated-users-pending', data.users)
    })

    socket.on('going-to-next-round', data =>{
        io.in(data.room).emit('lets-go-to-next-round')
    })

    socket.on('next-judge', data => {
        
        io.in(data.room).emit('heres-your-next-judge', data.users)
    })
})





/////////////


////ENDPOINTS/////

//Receives a number on the body and returns an array of that number of 'answer' cards {id, name, description}

app.get('/api/testnative', (req, res) => {
console.log('something')
res.status(200).send('potatoes')
})


app.post('/api/getacard', controller.getACard)

//Returns and array with one 'question' card {id, name, description}
app.get('/api/getqcard', controller.getQCard)

//Receives username and returns an array with 1 object {id, username} - id is the session ID
app.post('/api/newplayer', controller.newPlayer)

//Needs a real comment
app.delete('/api/deleteplayer/:id', controller.deletePlayer)

app.post('/api/addroom', controller.addRoom)

app.get('/api/checkroom/:name', controller.checkRoom)

app.put('/api/lockroom', controller.lockRoom)




