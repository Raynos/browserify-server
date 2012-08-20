var isYarn = /\.yarn$/
    , path = require("path")

module.exports = ignore

function ignore(options) {
    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , bundlePath = path.join(staticPath, "bundle.js")
        , entryPath = path.join(staticPath, "entry")

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

        return false
    }
}