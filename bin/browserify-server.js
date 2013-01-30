#!/usr/bin/env node

var argv = require("optimist").argv
var path = require("path")
var fs = require("fs")
var filed = require("filed")
var process = require("process")
var console = require("console")

var Bundle = require("..")
var Server = require("../server")
var Example = require("../example")

var help = argv.help || argv.h
var index = argv.index || argv.i
var bundle = argv.bundle || argv.b
var bundleTarget = typeof bundle === "string" ? bundle : argv._[0]
var server = argv.server || argv.s
var output = argv.output || argv.o
var port = argv.port || argv.p
var example = argv.example || argv.e

argv.debug = argv.debug || argv.d

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else if (index) {
    filed(path.join(__dirname, "index.html")).pipe(process.stdout)
} else if (bundle) {
    var data = Bundle(bundleTarget, argv)
    if (output) {
        fs.writeFileSync(output, data, "utf-8")
    } else {
        process.stdout.write(data)
    }
} else if (server) {
    Server(server, port)
} else if (example) {
    Example(example)
}
