define(["lib/jquery.min"], function () {
    var module = {
        waveData: [],
        track: null,
        notes: [],

        // init
        init: function(track, callback) {
            if(!track) console.log('track neccessary');

            module.track = track;
            var url = "http://waveformjs.org/w?callback=define&url=" + module.track.waveform_url;

            // get data from waveform
            $.ajax({
                url: url,
                crossDomain: true,
                dataType: 'jsonp',
                success: function(data){
                    module.waveData = data;
                    module.processWave();

                    if(callback) {
                        callback(module.notes);
                    }
                }
            });
        },

        // process wave
        processWave: function() {
            var millisBetweenWaves = module.track.duration / module.waveData.length;
            module.notes = [];
            var lastAddedNoteTime = -500;
            for(var i in module.waveData) {
                var wd = module.waveData[i];

                var noteType = 1;
                if(wd > 0.7 && wd < 0.8) {
                    noteType = 2;
                } else if (wd >= 0.9) {
                    noteType = 3;
                }

                var noteTime =  i * millisBetweenWaves;

                var note = {
                    time: noteTime,
                    type: noteType
                };

                if(noteTime - lastAddedNoteTime >= 500 && wd != 0) {
                    module.notes.push(note);
                    lastAddedNoteTime = noteTime;
                }

            }
        }

    };

    // public
    return {
        init: module.init
    };
});