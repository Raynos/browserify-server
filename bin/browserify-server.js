#!/usr/bin/env node

var argv = require("optimist").argv
    , path = require("path")
    , filed = require("filed")

    , bundle = require("..")
    , server = require("../server")

    , help = argv.help || argv.h
    , index = argv.index || argv.i
    , bundle = argv.bundle || argv.b
    , server = argv.server || argv.s

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else if (index) {
    filed(path.join(__dirname, "index.html")).pipe(process.stdout)
} else if (bundle) {
    bundle(argv._[0], argv.o)
} else if (server) {
    server(argv._[0], argv.port)
}
