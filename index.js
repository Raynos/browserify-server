var http = require("http")
    , browserify = require("browserify")
    , ecstatic = require("ecstatic")
    , Router = require("routes").Router
    , path = require("path")
    , iterateFiles = require("iterate-files")
    , forEach = require("iterators").forEach
    , LiveReloadServer = require("./lib/liveReloadServer")
    , yarnify = require("yarnify")
    , fs = require("fs")
    , htmlRegexp = /\.html$/

createHandler.listen = listen
createHandler.LiveReloadServer = LiveReloadServer

module.exports = createHandler

function createHandler(options) {
    if (typeof options === "string") {
        options = {
            staticFolder: options
        }
    }

    var httpRouter = new Router()
        , cwd = options.cwd
        , staticPath = path.join(cwd, options.staticFolder)
        , shouldYarnify = options.yarnify
        , staticHandler = ecstatic(staticPath)

    httpRouter.addRoute("/", staticHandler)
    httpRouter.addRoute("/bundle.js", bundleBrowserify)
    httpRouter.addRoute("/entry/:fileName", bundleEntries)
    httpRouter.addRoute("/*", staticHandler)

    return httpHandler

    function httpHandler(req, res) {
        var route = httpRouter.match(req.url)
        if (route) {
            return route.fn(req, res, route.params)
        }
        res.statusCode = 404
        res.end("not found " + req.url)
    }

    function bundleEntries(req, res, params) {
        if (shouldYarnify) {
            handleYarnify(next)
        } else {
            next()
        }

        function next() {
            var b = bundle(path.join(cwd, "entry", params.fileName))
            sendBundle(b, res)
        }
    }

    function bundleBrowserify(req, res) {
        if (shouldYarnify) {
            handleYarnify(next)
        } else {
            next()
        }

        function next() {
            var b = bundle(path.join(cwd, "index.js"))
            sendBundle(b, res)
        }
    }

    function handleYarnify(next) {
        var len = staticPath.length
            , toYarn = {}

        iterateFiles(cwd, addToYarn, yarnThem, htmlRegexp)

        function addToYarn(fileName) {
            var start = fileName.substr(0, len)
            if (start === staticPath) {
                return
            }

            var dir = path.dirname(fileName)
            toYarn[dir] = true
        }

        function yarnThem(err) {
            forEach(toYarn, yarnIt, next)
        }

        function yarnIt(uselessBool, directoryName, callback) {
            yarnify.knit(directoryName, function (err, out) {
                fs.writeFile(path.join(directoryName, "yarn")
                    , out.source , callback)
            })
        }
    }

    function sendBundle(bundle, res) {
        res.setHeader("content-type", "application/json")
        res.statusCode = 200
        res.end(bundle)
    }

    function bundle(entry) {
        var b = browserify({
            debug: true
        })

        try {
            b.addEntry(entry)
            return b.bundle()
        } catch (err) {
            console.error("[BROWSERIFY-SERVER]", err)
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

    var handler = createHandler({
            cwd: dirname
            , staticFolder: "static"
        })
        , server = http.createServer(handler).listen(port)

    return server
}