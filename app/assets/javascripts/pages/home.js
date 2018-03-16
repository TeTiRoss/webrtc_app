$( document ).ready(function() {
  $( "#twilio_form" ).submit(function( event ) {
    event.preventDefault();

    var token = $('#token').val();

    var room_name = $('#room').val();

    Twilio.Video.connect(token, {name: room_name}).then(function(room) {
      console.log('Successfully joined a Room: ', room);

      const localParticipant = room.localParticipant;
      console.log('Connected to the Room as LocalParticipant "%s"', localParticipant.identity);

      room.on('participantConnected', function(participant) {
        console.log('A remote Participant connected: ', participant);

        participant.tracks.forEach(track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });

        participant.on('trackAdded', track => {
          document.getElementById('remote-media-div').appendChild(track.attach());
        });
      })

      room.on('participantDisconnected', participant => {
        console.log('Participant "%s" has disconnected from Room', participant.identity);
      });


    }, function(error) {
        console.error('Unable to connect to Room: ' +  error.message);
    });
  });
});
