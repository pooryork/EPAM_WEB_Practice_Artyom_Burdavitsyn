var io = require("socket.io-client");
const heroku = 'https://voicy-speaker.herokuapp.com/';
const local = 'http://localhost:3000';
var socket = io.connect(local);

socket.on('connect', function () {
    console.log("Connection to the server is successfull!");
});

//#region All voices
$('#voices').click(function () {
    console.log('All messages');
    $('#response').empty()
    $('#response').html('Active: all messages');
    getAllVoices();
})

async function getAllVoices() {
    console.log('Getting all voices ...');

    $('#response').empty();
    $('#response').append(
        jQuery('<ul/>', {
            id: 'messages',
            text: 'Loading messages ...'
        })
    );

    console.log('Request sent, waiting 4 result ...');
    const response = await fetch(local + "/voices");
    const data = await response.json();
    $('#messages').text('Recent messages:');
    console.log(data);

    for (let i = 0; i < data.length; i++) {
        $('#messages').append(
            jQuery('<li/>', {
                id: 'msg' + i,
                text: `Voice: ${data[i].timeStamp}`
            })
        )
        const audioBlob = new Blob([new Uint8Array(data[i].audioBlob[0].data).buffer]);

        $('#msg' + i).click(function () {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        })
    };
}
//#endregion

//#region Microphone
$('#microphone').click(function () {
    $('#response').empty()
    $('#response').html("Active: speaker-mode");
    $('#response').append(
        jQuery('<br>'),
        jQuery('<button/>', {
            id: 'start',
            class: 'record',
            text: 'Start recording'
        }),
        jQuery('<button/>', {
            id: 'stop',
            class: 'record',
            text: 'Stop recording'
        }),
    )
    $('#start').click(function () {
        recordAndSend();
    })
})

function recordAndSend() {
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then((mediaStream) => {
        const mediaRecorder = new MediaRecorder(mediaStream);
        var audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", function (event) {
            audioChunks.push(event.data);
            socket.emit("audioMessage", audioChunks);
            console.log("Message sent!");
        });


        mediaRecorder.start();

        $('#stop').click(function () {
            mediaRecorder.stop();
        })
    });
}
//#endregion

//#region Stream
$('#stream').click(function () {
    console.log('Stream!');
    $('#response').html('Active: all messages');
    stream();
})

function stream() {
    socket.on("audioMessage", function (audioChunks) {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        console.log("Message streamed!");
    });
}
//#endregion