'use strict'

var homedir = require('homedir')
var async = require('async')
var fs = require('fs')
var path = require('path')
var events = require('events')

var config = require(path.join(__dirname, 'config.js'))


var bp = function (options) {
  options = (options || {})

  // Get Path's
  this.dir = (options.dir) ? path.resolve(options.dir) : process.cwd()
  this.homedir = (options.homedir) ? path.resolve(options.homedir) : homedir()

  // Create path to file '.bp_profile.json' and 'bp.json' of project
  this.bp_profile = path.join(this.homedir, (options.bp_profile || ".bp_profile.json"))
  this.bpname = path.join(this.dir, (options.bpname || 'bp.json'))

  // Gestor de Eventos
  this._eventEmitter = new events.EventEmitter()

  var self = this

  this.options = new config({
    local  : self.bpname,
    global : self.bp_profile,
  })
}

bp.prototype.on = function() {
  this._eventEmitter.on.apply(this._eventEmitter, arguments)
}

module.exports = bp
