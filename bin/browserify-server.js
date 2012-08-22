#!/usr/bin/env node

/*
    --folder='static' The static folder to use
    --cwd='other/thing' Change the cwd
    --no-yarnify Disable yarnify feature
    --no-livereload Disable livereload
    --livereload-port=somePort Set the port for livereload server
    --port Set the port for HTTP server
    --index Outputs a boilerplate index.html
    --help for help document
*/

var argv = require("optimist").argv
    , path = require("path")
    , help = argv.help || argv.h
    , index = argv.index || argv.i
    , make = argv.make || argv.m
    , filed = require("filed")
    , Server = require("../server")

if (help) {
    filed(path.join(__dirname, "usage.txt")).pipe(process.stdout)
} else if (index) {
    filed(path.join(__dirname, "index.html")).pipe(process.stdout)
} else if (make) {
    filed(path.join(__dirname, "Makefile")).pipe(process.stdout)
} else {
    Server(argv)
}