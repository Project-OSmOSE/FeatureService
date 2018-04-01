/*
 * ODE-FeatureService test server
 * Widely adapted from Restbase
 * Author: Joseph Allemandou
 */
'use strict';

// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

var ServiceRunner = require('service-runner');
var logStream = require('./logStream');
var fs        = require('fs');
var assert    = require('./assert');
var yaml      = require('js-yaml');
//var temp      = require('temp').track();

var hostPort  = 'http://localhost:7231';
var fsURL     = hostPort + '/data.ode.org/v1';

function loadConfig(path) {
    var confString = fs.readFileSync(path).toString();
    return yaml.safeLoad(confString);
}

var config = {
    hostPort: hostPort,
    fsURL : fsURL ,
    logStream: logStream(),
    conf: loadConfig(__dirname + '/../../config.test.yaml')
};

config.conf.num_workers = 0;

var stop    = function () {};
var isRunning;
var options = null;
var runner = new ServiceRunner();

function start(_options) {
    _options = _options || {};

    if (!assert.isDeepEqual(options, _options) || !isRunning) {
        console.log('server options changed; restarting');
        stop();
        options = _options;
        console.log('starting FeatureService in '
                + (options.offline ? 'OFFLINE' : 'ONLINE') + ' mode');
        config.conf.offline = options.offline || false;

        return runner.start(config.conf)
        .then(function(servers){
            var server = servers[0];
            isRunning = true;
            stop =
                function () {
                    console.log('stopping FeatureService');
                    isRunning = false;
                    server.close();
                    stop = function () {};
                };
            return true;
        });
    } else {
        return Promise.resolve();
    }
}

module.exports.config = config;
module.exports.start  = start;
module.exports.stop   = function() { stop() };
module.exports.loadConfig = loadConfig;
