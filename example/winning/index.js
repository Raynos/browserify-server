var html = require("./winning.html")
    , Fragment = require("fragment")

module.exports = winning

function winning(text) {
    var elem = Fragment(html)
    elem.firstChild.textContent = text

    return {
        appendTo: appendTo
    }

    function appendTo(parent) {
        parent.appendChild(elem)
    }
}

console.log("change??")