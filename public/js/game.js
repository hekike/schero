define(["lib/pubsub"], function (PubSub) {
    var gameModule = {

        startTime: new Date(),
        notes: [],

        // score
        score: 0,
        withoutMiss: 0,
        multiplier: 1,
        scoreContainer: null,

        // init
        init: function(scoreContainer) {
            gameModule.scoreContainer = scoreContainer;
        },

        // add note
        addNote: function(type, time) {
            gameModule.notes.push({
                time: time,
                type: type
            });
        },

        // start game
        start: function() {
            gameModule.startTime = new Date();
            gameModule.noteFlowControl();
        },

        // note flow control
        noteFlowControl: function() {
            window.requestAnimationFrame(gameModule.noteFlowControl);

            var playTime = new Date().getTime() - gameModule.startTime.getTime();
            for(var i in gameModule.notes) {
                var note = gameModule.notes[i];

                if(playTime >= note.time) {
                    if((playTime - note.time) < 25) {
                        PubSub.publish( 'game.note.add', note);
                    }
                    gameModule.notes.splice(i,1);

                    break;
                }
            }
        },

        // hit
        hit: function(isHit) {
            if(isHit) {
                gameModule.withoutMiss++;

                if(gameModule.withoutMiss % 10 == 0 && gameModule.multiplier < 4) {
                    gameModule.multiplier++;
                }

                gameModule.score += gameModule.multiplier * 10;
                gameModule.scoreContainer.innerHTML = gameModule.score + ' pt';

            } else {
                gameModule.withoutMiss = 0;
                gameModule.multiplier = 1;
            }
        }
    };

    // public methods
    return {
        init: gameModule.init,
        addNote: gameModule.addNote,
        start: gameModule.start,
        hit: gameModule.hit
    };
});