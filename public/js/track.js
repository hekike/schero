define(["//connect.soundcloud.com/sdk.js"], function () {
    var trackModule = {
        stream: null,
        startWait: 4300,

        init: function(client_id) {
            SC.initialize({
                client_id: client_id
            });
        },

        play: function(trackID, startWait, callback) {
            trackModule.startWait = startWait;

            SC.get("/tracks/" + trackID, function(track){

                SC.stream(track.uri, function(stream){

                    trackModule.stream = stream;

                    // wait notes to arraive end
                    setTimeout(function() {
                        console.log('play');
                       trackModule.stream.play();
                    }, trackModule.startWait);

                    if(callback) {
                        callback(track);
                    }
                });
            });
        }

    };

    // public methods
    return {
       init: trackModule.init,
       play: trackModule.play
    };
});