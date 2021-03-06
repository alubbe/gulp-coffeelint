'use strict';
var Args, coffeelint, coffeelintPlugin, configfinder, createPluginError, formatOutput, fs, isLiterate, ref, reporter, through2;

fs = require('fs');

through2 = require('through2');

Args = require('args-js');

coffeelint = require('coffeelint');

configfinder = require('coffeelint/lib/configfinder');

reporter = require('./lib/reporter');

ref = require('./lib/utils'), isLiterate = ref.isLiterate, createPluginError = ref.createPluginError, formatOutput = ref.formatOutput;

coffeelintPlugin = function() {
  var e, literate, opt, optFile, params, ref1, rules;
  params = [
    {
      optFile: Args.STRING | Args.Optional
    }, {
      opt: Args.OBJECT | Args.Optional
    }, {
      literate: Args.BOOL | Args.Optional
    }, {
      rules: Args.ARRAY | Args.Optional,
      _default: []
    }
  ];
  try {
    ref1 = Args(params, arguments), opt = ref1.opt, optFile = ref1.optFile, literate = ref1.literate, rules = ref1.rules;
  } catch (_error) {
    e = _error;
    throw createPluginError(e);
  }
  if (Array.isArray(opt)) {
    rules = opt;
    opt = void 0;
  }
  rules.map(function(rule) {
    if (typeof rule !== 'function') {
      throw createPluginError("Custom rules need to be of type function, not " + (typeof rule));
    }
    return coffeelint.registerRule(rule);
  });
  if (toString.call(optFile) === '[object String]') {
    try {
      opt = JSON.parse(fs.readFileSync(optFile).toString());
    } catch (_error) {
      e = _error;
      throw createPluginError("Could not load config from file: " + e);
    }
  }
  return through2.obj(function(file, enc, cb) {
    var fileLiterate, fileOpt, output, results;
    fileOpt = opt;
    fileLiterate = literate;
    results = null;
    output = null;
    if (file.isNull()) {
      this.push(file);
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', createPluginError('Streaming not supported'));
      return cb();
    }
    if (fileOpt === void 0) {
      fileOpt = configfinder.getConfig(file.path);
    }
    if (fileLiterate === void 0) {
      fileLiterate = isLiterate(file.path);
    }
    results = coffeelint.lint(file.contents.toString(), fileOpt, fileLiterate);
    output = formatOutput(results, fileOpt, fileLiterate);
    file.coffeelint = output;
    this.push(file);
    return cb();
  });
};

coffeelintPlugin.reporter = reporter;

module.exports = coffeelintPlugin;
