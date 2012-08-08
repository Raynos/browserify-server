#!/usr/bin/env node

var path = require("path")
    , http = require("http")
    , argv = require("optimist").argv
    , browserifyServer = require("..")
    , folder = argv.folder || "static"

var handler = browserifyServer(path.join(process.cwd(), folder))

var server = http.createServer(handler).listen(argv.port || 8080, report)

function report() {
    var add = server.address()
    console.log("browserify server listening on", add.port,
        "and serving folder", argv.folder)
}