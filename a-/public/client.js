var socket = io('https://enigmatic-hollows-35602.herokuapp.com');
      // confirmation connection côté client
      socket.on('message', function(message){
        console.log(message);
      });
      // on informe le joueur qu'une partie est en cours
      socket.on('gameFull', function(gameFull){
        alert(gameFull)
      });
      //affichage nom du joueur lorsqu'il saisie son pseudo
      $('#login').submit(function(event){
        event.preventDefault();
        var pseudo = $('#pseudo').val();
        $('#player').prepend('<ul><strong><em> Bienvenue </em></strong>'+ pseudo + '! </ul>');
        $('body').css('backgroundColor','white');
        $('form').css('display', 'none')
        socket.emit('newPlayer', pseudo);
        $('#pseudo').val('');
        return false;
      })
      // affichage nom adversaires connectés
      socket.on('newPlayer', function(pseudo){
        console.log(pseudo)
        $('#opponent').prepend( '<p>' + pseudo + '<strong><em> viens de se connecter ! </em></strong></p>')
        
      })
      //on informe les joueurs du début de la partie 
      socket.on('startGame', function(startGame){
        console.log(startGame);
      })

      //init timer côté client
          
      socket.on('timer', function(sec){
        console.log(sec)
        $('#timer').css('width', sec + '%')
        socket.emit('timeBar', sec)
        $('#timer-wrapper').css('display', 'block');
        $('#playerZone').css('display', 'block')
      })

      socket.on('target', function(data){
        let currentScore = 0;
        let currentOpponentScore = 0;
        let score = document.getElementById('score');
        let ennemyScore = document.getElementById('ennemy-score')
        let target = document.createElement(data.element);
        $('#playerZone').prepend(target);
        console.log(data)
        
        window.setInterval(function(){
          target.style.marginTop = parseInt(Math.random()*460) + 'px';
          target.style.marginLeft = parseInt(Math.random()*460) + 'px';
        },1000);
        target.style.width = data.width;
        target.style.height = data.height;
        target.style.backgroundColor = data.backgroundColor;
        target.style.display = data.display;
        target.style.display = data.position;
        
        target.addEventListener('click', function(e){
          console.log('click')
          currentScore += 1;
          score.innerHTML = currentScore;
          target.style.display = 'none';
          window.setTimeout(function(e){
            target.style.display = 'block'
          },2000)
          socket.emit('score', currentScore)
          socket.on('score', function(opponentScore){
            console.log('score adversaire', opponentScore)
            ennemyScore.innerHTML = opponentScore 
          }) 
        })
        
        socket.on('endOfGame', function(endOfGame){
          console.log(endOfGame)
          $('#end').prepend('<h2>' + endOfGame + '!</h2>')
          $('#end').css('display', 'block');
          $('#end').css('color', 'white');
          $('body').css('backgroundColor','black');
          $('#playerZone').css('display', 'none')
          
          if(parseInt(currentScore) > parseInt(currentOpponentScore)){
            console.log('gagné !!!')
          } else {
            console.log('perdu !!!')
          }
        })
      })


      