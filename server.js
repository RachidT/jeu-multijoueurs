const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
//const db = require('db/data-base.js');
let myDb;
let URL = 'mongodb://heroku_gm3t9sxc:eg07i2knrdt2ged1shj63bvm2o@ds113732.mlab.com:13732/heroku_gm3t9sxc';

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

const port = process.env.PORT || 5000;

MongoClient.connect(URL, function(err, client){
    if (err) {
        console.log('impossible de se connecter à la base de données')
        process.exit(1);
    } else {
        server.listen(port, function(){
            console.log('app running on port : ' + port);
        });
    }
})

app.post('/', (req, res, next) => {   
    let playerName = req.body.pseudo;
   console.log(playerName)
   myDb = db.get().db('multiplayersGame');
   var collection = myDb.collection('players');
   collection.insert({playerName});
   db.close();
});

let square = {
    element: 'div',
    width: 50 + 'px',
    height: 50 + 'px',
    posY: (Math.random()*10)*10 + 'px',
    posX: 600 + 'px',
    backgroundColor: 'red',
    display: 'inline-block',
    position: 'absolute'
}

const playersConnection = [];
io.on('connection', function (socket) {
    console.log('nouvelle connexion');
    playersConnection.push(socket);
    //envoie d'un message au 5e joueurs connectés lui indiquant qu'une partie et en cours
    if (playersConnection.length <= 2) {
        socket.emit('message', 'vous êtes bien connecté !');
    } else {
        socket.emit('gameFull', 'Désolé ! une partie est déjà en cours, réessayer dans quelques minutes :)')
    };


    if(playersConnection.length === 2) {
        
        socket.emit('startGame', 'la partie peut commencer')
        socket.broadcast.emit('startGame', 'la partie peut commencer')

        // init chorno
        let sec = 0, maxSec = 30
        setTimeout(()=> {
        let timer = setInterval(() => {
            socket.emit('timer', 100 - ((sec / maxSec) * 100))
            console.log(sec);
            sec ++
            if(sec > maxSec){
                clearInterval(timer);
                //envoie message indiquant la fin de la partie à tous les joueurs
                io.emit('endOfGame', 'fin de la partie')
                //socket.broadcast.emit('endOfGame', 'fin de la partie')
            }
            //envoie du timer à toutes les personnes connectés
            socket.on('timeBar', function(sec){
                socket.sec = sec;
                socket.broadcast.emit('timer', sec)
            })
            
        }, 1000)
        },5000)
        
    }

    socket.emit('target', square)
    
    //réception du nouveau joueur connecté côté serveur et communiquer arriver d'au nouveau joueur aux personnes connectées
    socket.on('newPlayer', function(pseudo){
        socket.pseudo = pseudo;
        socket.broadcast.emit('newPlayer', pseudo)
    })

    socket.on('score', function(opponentScore){
        socket.opponentScore = opponentScore;
        socket.broadcast.emit('score', opponentScore )
    })
    
});

