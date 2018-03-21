$( document ).ready(function() {
  navigator.getMedia = (navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia);

  var userVideo;
  var userAudio;

  navigator.getMedia({video: true}, function() {
    userVideo = true;
  }, function() {
    userVideo = false;
  });

  navigator.getMedia({audio: true}, function() {
    userAudio = true;
  }, function() {
    userAudio = false;
  });

  $('#camera-preview').click(function() {
    if (userVideo == true) {
      Twilio.Video.createLocalVideoTrack().then(track => {
        var localMediaContainer = document.getElementById('local-media-ctr');
        localMediaContainer.appendChild(track.attach());
      });
    } else {
      alert('No camera found')
    };
  });

  function addParticipantRemoteTrack (participant) {
    participant.on('trackAdded', track => {
      document.getElementById('remote-media-div').appendChild(track.attach());
    });
  };

  $("#connect").click(function() {
    var token = $('#token').val();

    Twilio.Video.connect(token, { audio: userAudio, video: userVideo }).then(function(room) {
      console.log('Successfully joined a Room: ', room);

      const localParticipant = room.localParticipant;

      console.log('Connected to the Room as LocalParticipant "%s"', localParticipant.identity);

      room.participants.forEach(participant => {
        console.log('Participant "%s" is connected to the Room', participant.identity);

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        addParticipantRemoteTrack(participant);
      });

      room.once('participantConnected', participant => {
        console.log('Participant "%s" has connected to the Room', participant.identity);
      });

      room.on('participantConnected', function(participant) {
        console.log('A remote Participant connected: ', participant);

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        addParticipantRemoteTrack(participant);
      })

      room.on('participantDisconnected', participant => {
        console.log('Participant "%s" has disconnected from Room', participant.identity);
      });

      room.on('disconnected', room => {
        // Detach the local media elements
        room.localParticipant.tracks.forEach(track => {
          var attachedElements = track.detach();
          attachedElements.forEach(element => element.remove());
        });
      });

      $('#disconnect-btn').click(function() {
        room.disconnect();
      });

    }, function(error) {
      console.error('Unable to connect to Room: ' +  error.message);
    });
  });
});
