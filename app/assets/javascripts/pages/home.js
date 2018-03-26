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
      $("#info-board").prepend("<p class='text-secondary'>Successfully joined the room <b>" + room.name + "</b></p>");

      $('#username').prop( "disabled", true );
      $('#room-name').prop( "disabled", true );
      $('#connect-btn').hide();
      $('#disconnect-btn').show();

      const localParticipant = room.localParticipant;
      console.log('Connected to the Room as LocalParticipant "%s"', localParticipant.identity);

      // Display remote Participants video/audio

      room.participants.forEach(participant => {
        console.log('Participant "%s" is connected to the Room', participant.identity);
        $("#info-board").prepend("<p class='text-secondary'><b>" + participant.identity + "</b> is connected to the room</p>");

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        participant.on('trackAdded', track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });
      });

      // Remote Participant connected to the room

      room.on('participantConnected', function(participant) {
        console.log('A remote Participant connected: ', participant);
        $("#info-board").prepend("<p class='text-secondary'><b>" + participant.identity + "</b> has connected to the room</p>");

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
        $("#info-board").prepend("<p class='text-secondary'><b>" + participant.identity + "</b> has disconnected from the room</p>");
      });


      // Local Participant disconnected from room

      $('#disconnect-btn').click(function() {
        room.disconnect();
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

        $('#disconnect-btn').hide();
        $('#connect-btn').show();
        $('#username').prop( "disabled", false );
        $('#room-name').prop( "disabled", false );

        console.log('Disconnected from the Room "%s"', room.name);
        $("#info-board").prepend("<p class='text-secondary'>Disconnected from the room <b>" + room.name + "</b></p>");
      });

    }, function(error) {
      console.error('Unable to connect to Room: ' +  error.message);
      alert('Unable to connect to the room. If Username is filled, then there is probably some problems with access to your mic or camera.')
    });
  });
});
