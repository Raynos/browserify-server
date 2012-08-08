# browserify-server [![build status][1]][2]

Spin up a quick & easy browserify server

## Example CLI

```
$ browserify-server --folder=example/static --port=4000

browserify server listening on 4000 and serving folder example/static
```

You now have a HTTP server listening on port 8080 that will server the `index.html` file in the static folder when you got to `/` and server the index.js file browserified when you go to `/bundle.js`

## Example Server

``` js
var handler = require("browserify-server")("./static")
    , http = require("http")
    , server = http.createServer(handler).listen(8080)
```

No more browserify boilerplate ever again!

## Installation

`npm install browserify-server`

## Tests

`make test`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/browserify-server.png
  [2]: http://travis-ci.org/Raynos/browserify-server