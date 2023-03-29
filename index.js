const express = require('express');
var cors = require('cors')
var gameLogic = require('./socketCalls');
const app = express();
app.use(cors({ origin: "https://chess-web-online.netlify.app"}));

const http = require('http').Server(app);
var io = require('socket.io')( http, {cors: {
    origin: "https://chess-web-online.netlify.app",
    methods: ["GET", "POST",'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ["Access-Control-Allow-Headers"],
    credentials: true
  }});

app.get('/',(req,res)=>{
    res.send('Hello server is running fine')
})

io.on('connection',function(socket){
    let i=0;
    gameLogic.initializeGame(io, socket)
})

// http.listen(3011,function(){
//     console.log('Server is running on Port successfully');
// })
http.listen(process.env.PORT ,function(){
    console.log('Server is running on Port successfully');
})