require("live-reload")(8081)

var winning = require("./winning")
    , body = document.body

var widget = winning('winning!')
widget.appendTo(body)

console.log("hello???")