$( document ).ready(function() {
  Twilio.Video.createLocalVideoTrack().then(track => {
    localMediaContainer = document.getElementById('local-media-ctr');
    localMediaContainer.appendChild(track.attach());
  });

  $("#connect-btn").click(function() {
    var token;
    var username = $('#username').val();
    var roomName = $('#room-name').val();

    $.ajax({
      type: 'POST',
      url: '/api/token',
      data: { identity: username },
      success: function( data ) {
        token = data.token;
      },
      async: false
    });

    Twilio.Video.connect(token, { audio: true, video: true, name: roomName }).then(function(room) {
      console.log('Successfully joined a Room: ', room);

      $('#connect-btn').hide();
      $('#disconnect-btn').show();

      const localParticipant = room.localParticipant;
      console.log('Connected to the Room as LocalParticipant "%s"', localParticipant.identity);

      // Display remote Participants video/audio

      room.participants.forEach(participant => {
        console.log('Participant "%s" is connected to the Room', participant.identity);

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        participant.on('trackAdded', track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });
      });

      // Remote Participant connected to the room

      room.once('participantConnected', participant => {
        console.log('Participant "%s" has connected to the Room', participant.identity);
      });

      room.on('participantConnected', function(participant) {
        console.log('A remote Participant connected: ', participant);

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        participant.on('trackAdded', track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });
      })

      // Remote Participant disconnected from room

      room.on('participantDisconnected', participant => {
        participant.tracks.forEach(track => {
          var attachedElements = track.detach();
          attachedElements.forEach(element => element.remove());
        });

        console.log('Participant "%s" has disconnected from Room', participant.identity);
      });


      // Local Participant disconnected from room

      $('#disconnect-btn').click(function() {
        room.disconnect();

        $(this).hide();
        $('#connect-btn').show();
      });

      room.on('disconnected', room => {
        room.localParticipant.tracks.forEach(track => {
          var attachedElements = track.detach();
          attachedElements.forEach(element => element.remove());
        });

        room.participants.forEach(participant => {
          participant.tracks.forEach(track => {
            var attachedElements = track.detach();
            attachedElements.forEach(element => element.remove());
          });
        });

        console.log('Disconnected from the Room "%s"', room.name);
      });

    }, function(error) {
      console.error('Unable to connect to Room: ' +  error.message);
      alert('Unable to connect to room. Probably some issues with access to your microfon or camera.')
    });
  });
});
