#!/usr/bin/env node

/*
    --folder='static' The static folder to use
    --cwd='other/thing' Change the cwd
    --no-yarnify Disable yarnify feature
    --no-livereload Disable livereload
    --livereload-port=somePort Set the port for livereload server
    --port Set the port for HTTP server
    --help for help document
*/

var path = require("path")
    , http = require("http")
    , argv = require("optimist").argv
    , browserifyServer = require("..")
    , LiveReloadServer = browserifyServer.LiveReloadServer
    , folder = argv.folder || "static"
    , yarnify = !argv["no-yarnify"]
    , liveReload = !argv["no-livereload"]
    , help = argv.help || argv.h
    , filed = require("filed")
    , liveReloadPort = argv["livereload-port"] || 8081
    , cwd = argv.cwd || process.cwd()
    , port = argv.port || 8080

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else {
    var handler = browserifyServer({
        staticFolder: folder
        , cwd: cwd
        , yarnify: yarnify
    })

    if (liveReload) {
        var lrServer = LiveReloadServer({
            cwd: cwd
        })

        lrServer.listen(liveReloadPort, reportLiveReload)
    }

    var server = http.createServer(handler).listen(port, report)
}

function report() {
    var add = server.address()
    var message = [
        "browserify server listening on"
        , add.port
        , "\nand serving static folder"
        , folder
    ]

    if (yarnify) {
        message = message.concat([
            "\nand yarnifying folders from"
            , cwd
        ])
    }

    message.push("\n")

    console.log.apply(console, message)
}

function reportLiveReload() {
    var add = lrServer.address()
    console.log("livereload server listening on", add.port,
        "\nand reloading from", cwd, "\n")
}