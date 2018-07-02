/*
 * ODE-FeatureService Examples tests
 * Author: Alexandre Degurse
 */
'use strict';


var assert = require('../../utils/assert.js');
var preq = require('preq');
var server = require('../../utils/server.js');


describe('sound endpoints', function() {
    this.timeout(20000);

    //Start server before running tests
    before(function() { return server.start(); });

    var labelsEnpoint = '/test/annotation/labels';

    it('should return 200 with the list of all label files', function() {
        return preq.get({
            uri: server.config.fsURL + labelsEnpoint
        }).then(function(res) {
            var labelList = res.body;

            assert.deepEqual(labelList.includes("paris.json"), true);
        });
    });

    it('should return 200 with the labels associated with the given labelId', function() {
        return preq.get({
            uri: server.config.fsURL + labelsEnpoint + '/' + 'paris.json'
        }).then(function(res) {
            var labels = res.body;

            var expectedLabels = {
                "city": "Paris",
                "annotations": [{
                        "start": 0.000000,
                        "end": 1.810576,
                        "annotation": "vehicle brakes"
                    },
                    {
                        "start": 0.000000,
                        "end": 10.787662,
                        "annotation": "vehicle engine"
                    },
                    {
                        "start": 2.560070,
                        "end": 6.029638,
                        "annotation": "siren"
                    },
                    {
                        "start": 4.699075,
                        "end": 5.145403,
                        "annotation": "human voice"
                    }
                ]
            };

            assert.deepEqual(labels, expectedLabels);
        });
    });

    // Test tag endpoints

    var tagEnpoint = '/test/annotation/tags';

    it('should return 200 with the list of all tags files', function() {
        return preq.get({
            uri: server.config.fsURL + tagEnpoint
        }).then(function(res) {
            var labelList = res.body;

            assert.deepEqual(labelList.includes("sample-tags.json"), true);
        });
    });

    it('should return 200 with the tags associated with the given tagId', function() {
        return preq.get({
            uri: server.config.fsURL + tagEnpoint + '/' + 'sample-tags.json'
        }).then(function(res) {
            var tags = res.body;

            var expectedTags = {
                "task": {
                    "proximityTag": ["near", "far", "not sure"],
                    "annotationTag": ["horn honking", "dog barking", "knocking", "whistle", "engine idling",
                        "jackhammer drilling", "music playing", "people talking", "single footstep", "siren wailing",
                        "gun shooting", "industrial HVAC", "people shouting", "engine passing"
                    ]
                }
            };

            assert.deepEqual(tags, expectedTags);
        });
    });
});