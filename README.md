# browserify-server

Spin up a quick & easy browserify server

## Example CLI

`$ browserify-server`

outputs

```
livereload server listening on 8081 
and reloading from <CWD>

browserify server listening on 8080 
and serving static folder static 
and yarnifying folders from <CWD>
```

`$ browserify-server --help`

outputs the help document

`$ browserify-server --index`

outputs the boilerplate index.html

It starts a browserify server. It's basically a static HTTP server that handles browserifing files, yarnifying files and does live reloading

By default `browserify-server` will serve static content from <CWD>/static.

It will serve the <CWD>/index.js as a browserified bundle at `/bundle.js`.

It will serve any other entries from <CWD>/entry/x.js as a browserified bundle at `/entry/x.js`

It will automatically yarnify any .html and .css files it finds outside the static directory into a yarn file in that directory.

It will also start a live reload server which serves a js file from `http://localhost:8081/` which makes the browser refresh if any files changes. (it opens a websocket connection to the live reload server)

## CLI options

```
--cwd=somePath : set the cwd. This is used by yarnify & live reload
--folder=somePath : set the static folder to server content from.
    Defaults to "static". It's a relative path to the cwd option
--no-yarnify : set this option to turn of yarnify features
--no-livereload : set this option to turn of live reload features
--livereload-port=somePort : set the live reload server port
    Defaults to port 8081
--port=somePort : set the http static server port
    Defaults to port 8080
--index : outputs a boilerplate index.html
--help : your looking at it
```


## Installation

`npm install browserify-server`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/browserify-server.png
  [2]: http://travis-ci.org/Raynos/browserify-server