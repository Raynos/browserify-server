var http = require("http")

module.exports = LiveReloadServer

function LiveReloadServer() {
    var server = http.createServer()

    return server
}