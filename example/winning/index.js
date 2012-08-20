var yarn = require("./yarn")

module.exports = winning

function winning(text) {
    var elem = yarn('winning.html', ['winning.css'])
    elem.textContent = text

    return {
        appendTo: appendTo
    }

    function appendTo(parent) {
        parent.appendChild(elem)
    }
}