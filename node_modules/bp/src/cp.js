'use strict'


var async = require('async')
var events = require('events')
var child_process = require('child_process')


/**
* cp(command[,options][,callback])
*
* command: String or Object
*
* command (Object):
*   command: String
*   args: Array[String]
*/
var cp = function () {
  var emmitter = new events.EventEmitter()
  var command = '', options = {}, callback = function () {}
  var actionsExec = true

  if (arguments.length == 3) {
    command  = arguments[0]
    options  = arguments[1]
    callback = arguments[2]
  } else if (arguments.length == 2) {
    command  = arguments[0]
    if (typeof arguments[1] == 'function') {
      callback = arguments[1]
    } else if (typeof arguments[1] == 'object') {
      options = arguments[1]
    }
  } else {
    command  = arguments[0]
  }

  // Eventos Defecto
  emmitter.on('end', function (err, ret) {
    callback(err, ret)
  })

  // Genera la

  if (typeof command == 'string') {
    var child = child_process.exec(command, options)
  } else if (typeof command == 'object') {
    if (command.com && command.args) {
      var child = child_process.spawn(command.com, command.args, options)
    } else {
      emmitter.emit('end', {
        message: "Error command.",
      }, null)
      actionsExec = false
    }
  } else {
    emmitter.emit('end', {
      message: "Command type is no String or Object",
    }, null)
    actionsExec = false
  }

  if (actionsExec) {
    child.stdout.on('data', function (data) {
      process.stdout.write(data.toString())
    })

    child.stderr.on('data', function (data) {
      process.stdout.write(data.toString())
    })

    child.on('close', function (err, ret) {
      emmitter.emit('end', err, ret)
    })
  }

  emmitter.end = function (cb) {
    emmitter.on('end', cb)
  }

  return emmitter
}



module.exports = cp
