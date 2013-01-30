var path = require("path")
var fs = require("fs")
var browserify = require("browserify")
var process = require("process")
var console = require("console")
var less = require("less")
var jade = require("jade")

var NODE_ENV = process.env.NODE_ENV

module.exports = bundle

function bundle(input, options) {
    var bundle = createBundle(input, options)

    bundle.on("syntaxError", function (err) {
        console.error("[BROWSERIFY-SERVER", err)
    })

    try {
        return bundle.bundle()
    } catch (err) {
        console.error("[BROWSERIFY-SERVER]", err)
    }
}

function createBundle(input, options) {
    var bundle = browserify(options)

    bundle.register(".html", handleHtml)
    bundle.register(".svg", handleHtml)
    bundle.register(".jade", handleJade)
    bundle.register(".less", handleLess)

    bundle.addEntry(path.join(__dirname, "other.js"), {
        body: "process.env.NODE_ENV = '" + NODE_ENV + "'\n"
    })
    bundle.addEntry(input)

    return bundle
}

function handleHtml(file, fileName) {
    return "module.exports = " +
        JSON.stringify(file)
}

function handleJade(file, fileName) {
    var source = jade.compile(file, {
        filename: fileName
    })()

    return handleHtml(source)
}

function handleLess(file, fileName) {
    var _css

    less.render(file, function(err, css) {
        if (err) {
            throw err
        }

        _css = css
    })

    return handleHtml(_css)
}
