var http = require("http")
    , ecstatic = require("ecstatic")
    , path = require("path")
    , Browserify = require("./lib/browserify")
    , Yarnify = require("./lib/yarnify")

createHandler.listen = listen

module.exports = createHandler

function createHandler(options) {
    if (typeof options === "string") {
        options = {
            staticFolder: options
        }
    }

    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , shouldYarnify = options.yarnify
        , mount = ecstatic(staticPath)

    Browserify("index.js", "bundle.js", options)
    Browserify("entry", "entry", options)

    return mount
}

function listen(dirname, port) {
    if (typeof dirname === "number") {
        port = dirname
        dirname = null
    }

    if (!port) {
        port = 8080
    }
    if (!dirname) {
        dirname = process.cwd()
    }

    var handler = createHandler({
            cwd: dirname
            , staticFolder: "static"
        })
        , server = http.createServer(handler).listen(port)

    return server
}