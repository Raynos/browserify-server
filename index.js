var http = require("http")
    , browserify = require("browserify")
    , ecstatic = require("ecstatic")
    , Router = require("routes").Router
    , path = require("path")

module.exports = createHandler

function createHandler(staticDir) {
    var httpRouter = new Router()
    httpRouter.addRoute("/", ecstatic(staticDir))
    httpRouter.addRoute("/bundle.js", bundleBrowserify)

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
        b.addEntry(path.join(staticDir, "index.js"))
        res.setHeader("content-type", "application/json")
        res.statusCode = 200
        try {
            res.end(b.bundle())
        } catch (err) {
            res.statusCode = 500
            res.end(err.message)
        }
    }
}