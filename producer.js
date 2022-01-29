
var zmq = require("zeromq");
var socket = zmq.socket("push");
// Just a helper function for logging to the console with a timestamp.
function logToConsole(message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function sendMessage(message) {
    logToConsole("Sending: " + message);
    socket.send(message);
}

// Begin listening for connections on all IP addresses on port 9998.
socket.bind("tcp://*:5555", function (error) {
    if (error) {
        logToConsole("Failed to bind socket: " + error.message);
        process.exit(0);
    }
    else {
        logToConsole("Server listening on port 5555");
        sendMessage(JSON.stringify({ recipient: "mulambiakaponda@gmail.com,mulambiakaponda@outlook.com", subject: "Test Email", body: "<b>Hello world </b>" }));
    }
});
