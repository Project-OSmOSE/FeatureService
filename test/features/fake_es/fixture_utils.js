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
 * ODE-FeatureService fixtures utils used to build the test data
 * Author: Alexandre Degurse
 *
 * fs stands for FeatureService
 */

'use strict';


/******************************************************************************
                    Generic fixtures utils class
*****************************************************************************/

class FixtureUtils {

    static fakeTimeserie(from,steps,stepDuration) {
        /* Generates a sample timeserie filled with random values
        Parameters:
            - from: start date of the timeserie, format:  ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
            - steps: length of the timeserie (int)
            - stepDuration: time in seconds that seperates 2 consecutive values.
        */
        const fromDate = new Date(from);
        return { items: [...Array(steps).keys()].map(idx => {
                return {
                    timestamp: (new Date(fromDate.getTime() +
                        (idx * stepDuration * 1000))).toISOString(),
                    val: idx
                };
            })
        }
    }

    static makeid() {
        // Generates a fake elasticsearch id
        var id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
        for (var i = 0; i < 16; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
    }

    static makeEsShardError() {
        return {
            name: 'HTTPError',
            message: '400',
            status: 400,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
            body: {
                error: {
                    root_cause: [ {
                        type: 'query_shard_exception',
                        reason: 'Some reason',
                        index_uuid: FixtureUtils.makeid(),
                        index: 'ode_data' } ],
                    type: 'search_phase_execution_exception',
                    reason: 'all shards failed',
                    phase: 'query',
                    grouped: true,
                    failed_shards: [{
                        shard: 0,
                        index: 'ode_data',
                        node: FixtureUtils.makeid(),
                        reason: [{
                            type: 'query_shard_exception',
                            reason: 'Some reason'
                        }]
                    }]
                },
                status: 400
            }
        };
    }

    static makeEsIndexError() {
        return {
            name: 'HTTPError',
            message: '404',
            status: 404,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
            body: {
                "error" : {
                    "root_cause" : [
                        {
                            "type" : "index_not_found_exception",
                            "reason" : "no such index",
                            "resource.type" : "index_or_alias",
                            "resource.id" : "aatestfake",
                            "index_uuid" : "_na_",
                            "index" : "aatestfake"
                        }
                    ],
                    "type" : "index_not_found_exception",
                    "reason" : "no such index",
                    "resource.type" : "index_or_alias",
                    "resource.id" : "aatestfake",
                    "index_uuid" : "_na_",
                    "index" : "aatestfake"
                },
                "status" : 404
            }
        };
    }

    static fakeTimeserieTob(from,steps,stepDuration) {
        /* Generates a sample timeserie filled with arrays of random values
        Parameters:
            - from: start date of the timeserie, format:  ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
            - steps: length of the timeserie (int)
            - stepDuration: time in seconds that seperates 2 consecutive values.
        */
        var fromDate = new Date(from);
        return { items: [...Array(steps).keys()].map(idx => {
                return {
                    timestamp: (new Date(fromDate.getTime() +
                        (idx * stepDuration * 1000))).toISOString(),
                    val: [...Array(50)].map( () => Math.random())
                };
            })
        }
    }

    static fakeEsResponse(timeSerie,esIndex) {
        /* Generates a standard Elasticsearch response filled with the given timeserie.
        Parameters:
            - timeSerie: Object in which items is an array that contains each value of the timeserie
            - esIndex: string, the index where the timeserie is supposed to be stored
        */

        // standard ES response scheme, incomplete though
        var esRes = {
            status: 200,
            body: {
                took : 5,
                timed_out : false,
                _shards : {
                    total : 5,
                    successful : 5,
                    skipped : 0,
                    failed : 0
                },
                hits : {
                    total : timeSerie.items.length,
                    max_score : 1.0,
                    hits : [
                    ]
                }
            }
        };

        // fills the response with the elements of timeSerie
        timeSerie.items.forEach(function(tsItem) {
            var hit = {
                _index : esIndex,
                _type : "data",
                _id : FixtureUtils.makeid(), // random id is put for each documents
                _score : 1.0,
                _source : {
                    timestamp : tsItem.timestamp,
                    val : tsItem.val
                }
            };
            esRes.body.hits.hits.push(hit);
        });

        return esRes;
    }
}

module.exports.FixtureUtils = FixtureUtils;
