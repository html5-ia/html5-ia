var http = require("http");
var connect = require("connect");
var mustache = require("mustache");
var WebSocketServer = require('websocket').server;

var template = '<!DOCTYPE html>\n'
             + '<html>\n'
             + '<head>\n'
             + '<title>Modules test</title>\n'
             + '</head>\n'
             + '<body>\n'
             + 'Connect is {{connect_status}}<br>\n'
             + 'Mustache is {{mustache_status}}<br>\n'
             + 'WebSocket-node is {{socket_status}}\n'
             + '</body>\n'
             + '</html>';

var dict = {
    'connect_status': connect.router ? 'working':'broken',
    'mustache_status': mustache.to_html ? 'working':'broken',
    'socket_status' : typeof WebSocketServer !== 'undefined' ? 'working':'broken'
};

var html = mustache.to_html(template,dict);

http.createServer(
    function(request, response) {
        response.writeHead(200);
        response.write(html);
        response.end();
    }
).listen(8080);