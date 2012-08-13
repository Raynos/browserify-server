var http = require("http")
    , browserify = require("browserify")
    , ecstatic = require("ecstatic")
    , Router = require("routes").Router
    , path = require("path")

createHandler.listen = listen

module.exports = createHandler

function createHandler(staticDir) {
    var httpRouter = new Router()
        , staticHandler = ecstatic(staticDir)

    httpRouter.addRoute("/", staticHandler)
    httpRouter.addRoute("/bundle.js", bundleBrowserify)
    httpRouter.addRoute("/*", staticHandler)

    return httpHandler

    function httpHandler(req, res) {
        var route = httpRouter.match(req.url)
        if (route) {
            return route.fn(req, res)
        }
        res.statusCode = 404
        res.end("not found " + req.url)
    }

    function bundleBrowserify(req, res) {
        var b = browserify({
            debug: true
        })
        res.setHeader("content-type", "application/json")
        res.statusCode = 200
        try {
            b.addEntry(path.join(staticDir, "index.js"))
            res.end(b.bundle())
        } catch (err) {
            res.statusCode = 500
            res.end(err.message)
        }
    }
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

    var handler = createHandler(path.join(dirname, "static"))
        , server = http.createServer(handler).listen(port)

    return server
}