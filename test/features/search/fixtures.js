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
 * ODE-FeatureService fixtures used to test ES endpoints
 * Author: Alexandre Degurse
 *
 * fs stands for FeatureService
 */
'use strict';

var FixtureUtils = require('../fake_es/fixture_utils.js').FixtureUtils;



/******************************************************************************
                        Search fixtures
*****************************************************************************/

var getAllFixtures = [
    {
        describe: 'return 200 and results for get-all with sample ts',
        fsEndpoint: '/search/get-all',
        expectedEsQuery: {"size":10000,"query":{"match_all":{}}},
        expectedEsIndex: 'ode_data',
        esResult: FixtureUtils.fakeEsResponse(FixtureUtils.fakeTimeserie("2017-12-01T12:00:00.000Z",120,60),"ode_data"),
        expectedFSResult: {
            status: 200,
            body: FixtureUtils.fakeTimeserie("2017-12-01T12:00:00.000Z",120,60)
        }
    }

]

var rangeQueryFixtures = [
    {
        describe: 'return 200 and results for range-query with sample ts',
        fsEndpoint: '/search/range-query/2017-12-01T12:00:00.000Z/2017-12-01T20:00:00.000Z',
        expectedEsIndex: 'ode_data',
        expectedEsQuery: {
            size: 10000,
            query: {
                range: {
                    timestamp: {
                        gte: "2017-12-01T12:00:00.000Z",
                        lt: "2017-12-01T20:00:00.000Z"
                    }
                }
            },
            sort: [
                { timestamp: { order: "asc" } }
            ]
        },
        esResult: FixtureUtils.fakeEsResponse(FixtureUtils.fakeTimeserie("2017-12-01T12:00:00.000Z",120,60),"ode_data"),
        expectedFSResult: {
            status: 200,
            body: FixtureUtils.fakeTimeserie("2017-12-01T12:00:00.000Z",120,60)
        }
    },
    {
        describe: 'return 400 when no documents matches search parameters',
        fsEndpoint: '/search/range-query/2048-11-01T12:00:00.000Z/2048-11-01T20:00:00.000Z',
        expectedEsIndex: 'ode_data',
        expectedEsQuery: {
            size: 10000,
            query: {
                range: {
                    timestamp: {
                        gte: "2048-11-01T12:00:00.000Z",
                        lt: "2048-11-01T20:00:00.000Z"
                    }
                }
            },
            sort: [
                { timestamp: { order: "asc" } }
            ]
        },
        esResult: FixtureUtils.makeEsShardError(),
        expectedFSResult: {
                status: 400,
        }
    },
    {
        describe: 'return 404 when no the index doesnt exist',
        fsEndpoint: '/search/range-query/2049-11-01T12:00:00.000Z/2049-11-01T20:00:00.000Z',
        expectedEsIndex: 'ode_data',
        expectedEsQuery: {
            size: 10000,
            query: {
                range: {
                    timestamp: {
                        gte: "2049-11-01T12:00:00.000Z",
                        lt: "2049-11-01T20:00:00.000Z"
                    }
                }
            },
            sort: [
                { timestamp: { order: "asc" } }
            ]
        },
        esResult: FixtureUtils.makeEsIndexError(),
        expectedFSResult: {
                status: 404,
        }
    }
]


exports.values = []
    .concat(getAllFixtures)
    .concat(rangeQueryFixtures)
    ;
