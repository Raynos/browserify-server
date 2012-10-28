#!/usr/bin/env node

var argv = require("optimist").argv
    , path = require("path")
    , fs = require("fs")
    , filed = require("filed")

    , bundle = require("..")
    , server = require("../server")

    , help = argv.help || argv.h
    , index = argv.index || argv.i
    , bundle = argv.bundle || argv.b
    , server = argv.server || argv.s
    , output = argv.output || argv.o
    , port = argv.port || argv.p
    , input = argv._[0]

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else if (index) {
    filed(path.join(__dirname, "index.html")).pipe(process.stdout)
} else if (bundle) {
    var data = bundle(input, output)
    fs.writeFileSync(output, data, "utf-8")
    console.log("bundled", input, "to", output
        , "with env", process.env.NODE_ENV)
} else if (server) {
    server(argv._[0], port)
}
