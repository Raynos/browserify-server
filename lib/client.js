var shoe = require("shoe")
    , stream = shoe("http://localhost:8081/shoe")

stream.on("data", ondata)

function ondata(data) {
    if (data === "reload") {
        document.location.reload()
    }
}