var path = require("path")
    , fs = require("fs")
    , browserify = require("browserify")

    , NODE_ENV = process.env.NODE_ENV

module.exports = bundle

function bundle(input, output) {
    var bundle = createBundle(input)

    try {
        var data = bundle.bundle()
        fs.writeFileSync(output, data, "utf-8")
        console.log("bundled", input, "to", output
            , "with env", NODE_ENV)
    } catch (err) {
        console.error("[BROWSERIFY-SERVER]", err)
    }
}

function createBundle(input) {
    var bundle = browserify({
        debug: true
    })

    bundle.register(".html", handleHtml)
    bundle.register(".svg", handleHtml)

    bundle.addEntry(path.join(__dirname, "other.js"), {
        body: "process.env.NODE_ENV = '" + NODE_ENV + "'\n"
    })
    bundle.addEntry(input)

    return bundle
}

function handleHtml(file, fileName) {
    return "module.exports = '" + file.replace(/\n/g, "\\n") + "'"
}
