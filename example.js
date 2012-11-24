var fs = require("fs")
    , read = fs.createReadStream
    , write = fs.createWriteStream
    , join = require("path").join
    , mkdirp = require("mkdirp")

    , resources = join(__dirname, "resources")
    , uris = [
        "Makefile"
        , "index.js"
        , ".rageignore"
        , "package.json"
        , join("static", "index.html")
    ]

module.exports = Example

function Example(uri) {
    var exampleDir = join(process.cwd(), "examples", uri)

    mkdirp(join(exampleDir, "static"), function (err) {
        if (err) {
            throw err
        }

        uris.forEach(function (file) {
            var target = file
            if (file === ".rageignore") {
                target = ".gitignore"
            }

            read(join(resources, file))
                .pipe(write(join(exampleDir, target)))
        })
    })
}
