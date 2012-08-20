var path = require("path")
    , htmlRegExp = /\.html$/
    , iterateFiles = require("iterate-files")
    , hound = require("hound")
    , yarnify = require("yarnify")
    , ignore = require("./ignore")
    , fs = require("fs")

module.exports = Yarnify

function Yarnify(options){
    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , len = staticPath.length
        , filterIgnored = ignore("yarn", options)

    iterateFiles(cwd, listenOnYarn, log, htmlRegExp)

    function listenOnYarn(fileName) {
        var start = fileName.substr(0, len)
        if (start === staticPath) {
            return
        }

        var dir = path.dirname(fileName)
            , watcher = hound.watch(dir, knitIt)

        watcher.on("create", checkIfRealChange)
        watcher.on("delete", checkIfRealChange)
        watcher.on("change", checkIfRealChange)

        checkIfRealChange(dir)

        function checkIfRealChange(fileName) {
            if(!filterIgnored(fileName)) {
                knitIt()
            }
        }

        function knitIt() {
            console.log("knitting", dir)
            yarnify.knit(dir, function (err, out) {
                fs.writeFile(path.join(dir, "yarn"), out.source , log)
            })
        }
    }
}

function log(err) {
    if (err) {
        console.error("[BROWSERIFY-SERVER]", err)
    }
}