var http = require("http")
    , shoe = require("shoe")
    , hound = require("hound")
    , path = require("path")
    , filed = require("filed")
    , ignoreRegexp = /yarn$/
    , openStreams = []

module.exports = LiveReloadServer

function LiveReloadServer(options) {
    var server = http.createServer(serveClient)
        , sock = shoe(handleStream)
        , cwd = options.cwd || process.cwd()
        , ignore = options.ignore || ignoreRegexp
        , watcher = hound.watch(cwd)

    watcher.on("create", reload)
    watcher.on("change", reload)
    watcher.on("delete", reload)

    sock.install(server, "/shoe")

    return server

    function serveClient(req, res) {
        filed(path.join(__dirname, "bundle.js")).pipe(res)
    }

    function handleStream(stream) {
        openStreams.push(stream)

        stream.on("end", remove)

        function remove() {
            var index = openStreams.indexOf(stream)
            if (index !== -1) {
                openStreams.splice(index, 1)
            }
        }
    }

    function reload(fileName) {
        if (!ignoreRegexp.test(fileName)) {
            openStreams.forEach(sendMessage)
        }
    }

    function sendMessage(stream) {
        stream.write("reload")
    }
}