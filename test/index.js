var test = require("tap").test
    , testServer = require("test-server")
    , browserifyServer = require("..")
    , path = require("path")

testServer(browserifyServer(path.join(__dirname, "static")), startTests)

function startTests(request, done) {
    test("request to / returns index.html", function (t) {
        request("/", function (err, res, body) {
            t.equal(res.statusCode, 200, "status code is wrong")

            t.ok(body.indexOf("bundle.js") > -1, "body is incorrect")

            t.end()
        })
    })

    test("request to /bundle.js returns index.js", function (t) {
        request("/bundle.js", function (err, res, body) {
            t.equal(res.statusCode, 200, "status code is wrong")

            t.ok(body.indexOf("o = 1") > -1, "body is incorrect")

            t.end()
        })
    })

    test("request to junk returns 404", function (t) {
        request("/junk", function (err, res, body) {
            t.equal(res.statusCode, 404, "status code is wrong")

            t.end()
        })
    })
}