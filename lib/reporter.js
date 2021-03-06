'use strict';
var createPluginError, defaultReporter, failOnWarningReporter, failReporter, reporter, stylish, through2;

through2 = require('through2');

stylish = require('coffeelint-stylish');

createPluginError = require('./utils').createPluginError;

defaultReporter = function() {
  return through2.obj(function(file, enc, cb) {
    var c, ref;
    c = file.coffeelint;
    if (!c || (c.errorCount === (ref = c.warningCount) && ref === 0)) {
      this.push(file);
      return cb();
    }
    stylish.reporter(file.relative, file.coffeelint.results);
    this.push(file);
    return cb();
  });
};

failReporter = function() {
  return through2.obj(function(file, enc, cb) {
    if (!file.coffeelint || file.coffeelint.success) {
      this.push(file);
      return cb();
    }
    this.emit('error', createPluginError("CoffeeLint failed for " + file.relative));
    return cb();
  });
};

failOnWarningReporter = function() {
  return through2.obj(function(file, enc, cb) {
    var c, ref;
    c = file.coffeelint;
    if (!c || (c.errorCount === (ref = c.warningCount) && ref === 0)) {
      this.push(file);
      return cb();
    }
    this.emit('error', createPluginError("CoffeeLint failed for " + file.relative));
    return cb();
  });
};

reporter = function(type) {
  if (type == null) {
    type = 'default';
  }
  if (type === 'default') {
    return defaultReporter();
  }
  if (type === 'fail') {
    return failReporter();
  }
  if (type === 'failOnWarning') {
    return failOnWarningReporter();
  }
  throw createPluginError(type + " is not a valid reporter");
};

module.exports = reporter;
