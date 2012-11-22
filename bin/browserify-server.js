#!/usr/bin/env node

var argv = require("optimist").argv
    , path = require("path")
    , fs = require("fs")
    , filed = require("filed")

    , Bundle = require("..")
    , Server = require("../server")
    , Example = require("../example")

    , help = argv.help || argv.h
    , index = argv.index || argv.i
    , bundle = argv.bundle || argv.b
    , server = argv.server || argv.s
    , output = argv.output || argv.o
    , port = argv.port || argv.p
    , example = argv.example || argv.e

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else if (index) {
    filed(path.join(__dirname, "index.html")).pipe(process.stdout)
} else if (bundle) {
    var data = Bundle(bundle, output)
    fs.writeFileSync(output, data, "utf-8")
    console.log("bundled", bundle, "to", output
        , "with env", process.env.NODE_ENV)
} else if (server) {
    Server(server, port)
} else if (example) {
    Example(example)
}
