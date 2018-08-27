'use strict'

var path = require('path')
var cp = require(path.join(__dirname, 'cp.js'))


var editor = function () {
  var self = this

  cp('atom ' + self.dir)

}


module.exports = editor
