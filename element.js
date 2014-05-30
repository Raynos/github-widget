var mercury = require('mercury');
var document = require('global/document');
var Widget = require('./index.js');

module.exports = GithubElement

function GithubElement(userName) {
    var elem = document.createElement('div');

    var widget = Widget(userName);
    mercury.app(elem, widget.state, Widget.render);

    return elem;
}
