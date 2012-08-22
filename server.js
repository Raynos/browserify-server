var path = require("path")
    , http = require("http")
    , browserifyServer = require("./index")
    , ignore = require("./lib/ignore")
    , LiveReloadServer = require("live-reload")

module.exports = Server

function Server(options) {
    options = options || {}
    
    var liveReloadPort = options["livereload-port"] || 8081
        , cwd = options.cwd ? path.join(process.cwd(), options.cwd)
            : process.cwd()
        , port = options.port || 8080
        , liveReload = !options["no-livereload"]
        , yarnify = !options["no-yarnify"]
        , folder = options.folder || "static"


    var handler = browserifyServer({
        folder: folder
        , cwd: cwd
        , yarnify: yarnify
    })

    if (liveReload) {
        var lrServer = LiveReloadServer({
            cwd: cwd
            , ignore: ignore("reload", {
                cwd: cwd
                , folder: folder
            })
        })

        lrServer.listen(liveReloadPort, reportLiveReload)
    }

    var server = http.createServer(handler).listen(port, report)

    function report() {
        var add = server.address()
        var message = [
            "browserify server listening on"
            , add.port
            , "\nand serving static folder"
            , path.join(cwd, folder)
        ]

        message.push("\n")

        console.log.apply(console, message)
    }

    function reportLiveReload() {
        var add = lrServer.address()
        console.log("livereload server listening on", add.port,
            "\nand reloading from", cwd, "\n")
    }
}