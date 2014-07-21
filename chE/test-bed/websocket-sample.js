var http = require("http");
var fs = require('fs');
var connect = require("connect");
var mustache = require("mustache");
var WebSocketServer = require('websocket').server;

function handler (req, res) {
    fs.readFile(__dirname + '/websocket-sample.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading websocket-sample.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

var app = http.createServer(handler);

app.listen(8080, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});

wsServer = new WebSocketServer({
    httpServer: app
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + " Connection accepted.");
    connection.on('message', function(message) {
        console.log("Received Message: " + message.utf8Data);
        connection.sendUTF(message.utf8Data);
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
});