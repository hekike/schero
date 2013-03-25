require(["gameview", "game", "track", "note", "lib/pubsub"], function (gameView, game, track, noteModule, PubSub) {
    var mainModule = {
        sc_client_id: "bc0d2f7770ec4f8a1779290f76f37096",
        viewContainer: document.getElementById('three-container'),
        scoreContainer: document.getElementById('score'),

        // init
        init: function() {

            // init view
            gameView.init(mainModule.viewContainer);

            // init game
            game.init(mainModule.scoreContainer);

            // init sound cloud api
            var sc_client_id = mainModule.sc_client_id;
            track.init(sc_client_id);

            // key listener
            var onKeyDown = function(event) {
                switch(event.keyCode) {
                    case 65 :
                        gameView.hitNote(1);
                        break;
                    case 83 :
                        gameView.hitNote(2);
                        break;
                    case 68 :
                        gameView.hitNote(3);
                        break;
                }
            };
            document.addEventListener('keydown', onKeyDown, false);

            // pub-sub

            // note
            var noteSubscriber = function( msg, note ){
                gameView.addNote(note.type);
            };
            PubSub.subscribe( 'game.note.add', noteSubscriber );

            // game hit
            var gameHitSubscriber = function( msg, data ) {
                game.hit(data.hit);
            };
            PubSub.subscribe( 'game.hit', gameHitSubscriber );
        },

        // start game
        startGame : function() {

            game.start();
        },

        // start
        start: function(track_id) {
            track.play(track_id, gameView.noteHitTime, function(track) {
                noteModule.init(track, mainModule.initNotes);

                mainModule.startGame();
            });
        },

        // init notes
        initNotes: function(notes) {
            for(var i in notes) {
                game.addNote(notes[i].type, notes[i].time);
            }
        }

    };

    // main
    var track_id = 70074494; // 83631496; //70074494;
    mainModule.init();
    mainModule.start(track_id);

});