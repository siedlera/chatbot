'use strict'


var async = require('async')
var path = require('path')
var cp = require(path.join(__dirname, 'cp.js'))



/**
* install([[options,]callback])
*/
var install = function () {

  cp.apply(this, arguments)

}



module.exports = install
