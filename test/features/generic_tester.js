/* Copyright (C) 2017-2018 Project-ODE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


 /*
    The test data (fixtures) is imported by generic-fake-es-tester to
    run the tests and fake-es to test the FeatureService's esQuery and
    return the esResult to FeatureService.

    Fixture structure and how it is used in test / fake-es:
    {
        describe: 'The test description for pretty printing',
        fsEndpoint: 'The endpoint that is supposed to request this data',
        expectedEsQuery: "The Elasticsearch query FeatureService is expected to send",
        esResult: "The response of Elasticsearch to this query"
        makeFsRes: "The makes the expected result of FeatureService"
    }

    The Test data flow:

    1] test_file(this file) ---> sends get to FS at fsEndpoint
    2] FS builds esQuery                 ---> fake-es [esQuery === expectedEsQuery]
    3] fake-es returns druidResult       ---> FS
    4] FS returns fsResult              ---> test_file [fsResult === expectedFsResult]

    To add more tests, you need to :
    1) add a test data file in "module to test"/fixtures.js
    2) import new fixtures in this file and in fake-es.js, i.e. add each new
        fixture to the fixture array

 */

/*
 * ODE-FeatureService fake-ES generic tester
 * Author: Alexandre Degurse
 */
'use strict';

var assertBase = require('assert');
var assert = require('../utils/assert.js');
var preq   = require('preq');
var server = require('../utils/server.js');

var searchFixtures = require('./search/fixtures.js');


describe('search endpoints', function () {
    this.timeout(20000);

    //Start server before running tests
    before(function () { return server.start(); });


    var makeTest = function(fixture) {
        it(fixture.describe, () => {
            var uri = server.config.fsURL + fixture.fsEndpoint;
            return preq.get({
                uri: uri
            }).then(res => {
                if (fixture.expectedFSResult) {
                    assert.deepEqual(res.status, fixture.expectedFSResult.status);
                    assert.deepEqual(res.body, fixture.expectedFSResult.body);
                }
            }).catch(res => {
                if (fixture.expectedFSResult) {
                    assertBase.strictEqual(res.status, fixture.expectedFSResult.status);
                }
            });
        });
    }

    var fixtures = []
        .concat(searchFixtures.values)
        ;

    for (var i in fixtures) {
        makeTest(fixtures[i]);
    }

});
