var fs = require("fs")
    , browserify = require("browserify")
    , path = require("path")
    , ignore = require("./ignore")
    , mkdirp = require("mkdirp")
    , hound = require("hound")

module.exports = Browserify

function Browserify(fileName, outName, options) {
    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , outputPath = path.join(staticPath, outName)
        , inputPath = path.join(cwd, fileName)
        , filterIgnored = ignore("bundle", options)

    start()

    function start() {
        fs.stat(inputPath, function (err, stat) {
            if (err) {
                return setTimeout(start, 500)
            }

            var handler

            if (stat.isFile()) {
                handler = handleFile.bind(null, inputPath, outputPath)
            } else {
                prepFolder()
                handler = handleFolder
            }

            var watcher = hound.watch(cwd, handler)

            watcher.on("create", reload)
            watcher.on("delete", reload)
            watcher.on("change", reload)

            handler()

            function reload(fileName) {
                if (!filterIgnored(fileName)) {
                    handler()
                }
            }
        })
    }

    function handleFile(inputPath, outputPath) {
        var b = bundle(inputPath)

        if (b) {
            write(b, outputPath)
        }
    }

    function write(bundle, outputPath) {
        console.log("writing bundle to ", outputPath, new Date().toString())
        var text = bundle.bundle()
        fs.writeFile(outputPath, text, log)
    }

    function handleFolder() {
        fs.readdir(inputPath, function (err, files) {
            if (err) {
                return log(err)
            }

            files.forEach(function (fileName) {
                var input = path.join(inputPath, fileName)
                    , output = path.join(outputPath, fileName)

                handleFile(input, output)
            })
        })
    }

    function prepFolder() {
        mkdirp(path.join(staticPath, "entry"), log)
    }
}

function handleHtml(file, fileName) {
    return "module.exports = '" + file.replace(/\n/g, "\\n") + "'"
}

function bundle(entry) {
    var b = browserify({
            debug: true
        })
        , NODE_ENV = process.env.NODE_ENV
        , code = "var process = require.modules.__browserify_process();\n" +
            "process.env.NODE_ENV = '" + NODE_ENV + "'\n" +
            "require.modules.__browserify_process = function () {\n" +
            "   return process\n" +
            "}"
        , target = path.join(__dirname, "dummy.js")

    b.files[target] = {
        target: target
        , body: code
    }

    b.on("syntaxError", log)

    b.register(".html", handleHtml)
    b.register(".svg", handleHtml)

    try {
        b.addEntry(path.join(__dirname, "other.js"), {
            body: "require('" + target + "')"
        })
        b.addEntry(entry)
        return b
    } catch (err) {
        log(err)
    }
}

function log(err) {
    if (err) {
        console.error("[BROWSERIFY-SERVER]", err)
    }
}