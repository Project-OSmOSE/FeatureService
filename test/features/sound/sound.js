/*
 * ODE-FeatureService Examples tests
 * Author: Alexandre Degurse
 */
'use strict';


var assert = require('../../utils/assert.js');
var path = require('path');
var preq = require('preq');
var server = require('../../utils/server.js');
var fileSystem = require('fs');


describe('sound endpoints', function() {
    this.timeout(20000);

    //Start server before running tests
    before(function() { return server.start(); });

    var endpoint = '/test/sound';

    it('should return 200 with the requested wav file', function() {
        return preq.get({
            uri: server.config.fsURL + endpoint + '/paris.wav/play'
        }).then(function(res) {
            var sound = res.body;

            var filePath = path.join(__dirname, '../../../resources/annotator/wav/paris.wav');
            var expectedSound = fileSystem.readFileSync(filePath);

            assert.deepEqual(sound, expectedSound);
        });
    });

    it('should return 404 when requested wav file doesn\'t exist', function() {
        return preq.get({
            uri: server.config.fsURL + endpoint + '/wavFileThatDontExist.wav/play'
        }).then(function() {
            throw 'Should not succeed'
        }).catch(function(res) {
            assert.deepEqual(res.status, 404);
            assert.deepEqual(res.body.type, "https://mediawiki.org/wiki/HyperSwitch/errors/ENOENT");
        });
    });

    it('should return 200 with the list of wav files in FS', function() {
        return preq.get({
            uri: server.config.fsURL + endpoint + '/'
        }).then(function(res) {
            var soundList = res.body;

            // we now that FS contains at least these two wav files
            assert.deepEqual(soundList.includes("paris.wav"), true);
            assert.deepEqual(soundList.includes("spectrogram_demo_doorknock_mono.wav"), true);
        });
    });
});
