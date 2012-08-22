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

            handler()

            function reload(fileName) {
                console.log("file changed", fileName)
                if (!filterIgnored(fileName)) {
                    handler()
                }
            }
        })
    }

    function handleFile(inputPath, outputPath) {
        var b = bundle(inputPath)
        b.on("bundle", function () {
            write(b, outputPath)
        })

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
        , watch: true
    })

    b.register(".html", handleHtml)

    try {
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