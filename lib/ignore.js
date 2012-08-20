var isYarn = /\.yarn$/
    , path = require("path")

module.exports = ignore

function ignore(options) {
    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , nodeModules = path.join(cwd, "node_modules")
        , bundlePath = path.join(staticPath, "bundle.js")
        , entryPath = path.join(staticPath, "entry")
        , nodeModulesLen = nodeModules.length

    return filterIgnored

    function filterIgnored(fileName) {
        if (isYarn.test(fileName)) {
            return true
        } else if (fileName === bundlePath) {
            return true
        }

        var dirname = path.dirname(fileName)

        if (dirname === entryPath) {
            return true
        }

        var start = fileName.substr(0, nodeModulesLen)

        if (start === nodeModules) {
            return true
        }

        return false
    }
}