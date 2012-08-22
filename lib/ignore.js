var isYarn = /\.yarn$/
    , isCss = /\.css$/
    , path = require("path")

module.exports = ignore

function ignore(type, options) {
    var cwd = options.cwd
        , staticPath = path.join(cwd, options.folder)
        , nodeModules = path.join(cwd, "node_modules")
        , bundlePath = path.join(staticPath, "bundle.js")
        , entryPath = path.join(staticPath, "entry")
        , nodeModulesLen = nodeModules.length

    return filterIgnored

    function filterIgnored(fileName) {
        if (type === "yarn" && isYarn.test(fileName)) {
            return true
        } else if (type === "bundle" && fileName === bundlePath) {
            return true
        }

        var dirname = path.dirname(fileName)

        if (type === "bundle" && dirname === entryPath) {
            return true
        }

        var start = fileName.substr(0, nodeModulesLen)

        if (type === "yarn" && start === nodeModules) {
            return true
        }

        if (type === "reload" &&
            (dirname !== entryPath &&
                fileName !== bundlePath &&
                !isCss.test(fileName))
        ) {
            return true
        }

        return false
    }
}