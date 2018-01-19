/* Copyright (C) 2017 Project-EBDO
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
 * EBDO-FeatureService fake-ES related tests
 * Author: Alexandre Degurse
 */
'use strict';

var assertBase = require('assert');
var assert = require('../../utils/assert.js');
var preq   = require('preq');
var server = require('../../utils/server.js');

var fixtures = require('./fixtures.js');


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
                    assertBase.strictEqual(res.status, fixture.expectedFSResult.status);
                    assert.deepEqual(res.body, fixture.expectedFSResult.body);
                }
            }).catch(res => {
                if (fixture.expectedFSResult) {
                    assertBase.strictEqual(res.status, fixture.expectedFSResult.status);
                }
            });
        });
    }

    for (var i in fixtures.values) {
        makeTest(fixtures.values[i]);
    }

});
