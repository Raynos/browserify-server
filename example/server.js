var path = require("path")
    , http = require("http")
    , browserifyServer = require("..")

var handler = browserifyServer(path.join(__dirname, "static"))

var server = http.createServer(handler).listen(8080)