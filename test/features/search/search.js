/*
 * EBDO-FeatureService Search tests
 * Author: Alexandre Degurse
 */
'use strict';


var assert = require('../../utils/assert.js');
var preq   = require('preq');
var server = require('../../utils/server.js');


describe('search endpoints', function () {
    this.timeout(20000);

    //Start server before running tests
    before(function () { return server.start(); });

    var endpoint = '/search/get-all';

    it('should return 404 when index doesnt exist ', function () {
        return preq.get({
            uri: server.config.fsURL + endpoint + "/wrongIndex"}).
        catch(function(res) {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 200 with fake random data stored at given index ', function () {
        return preq.get({
            uri: server.config.fsURL + endpoint + "/fakeIndex"})
        .then(function(res) {
            assert.deepStrictEqual(res.status, 200);
            assert.deepStrictEqual(res.body.items.length, 120);
            assert.deepStrictEqual(res.body.items[0].timestamp, "2017-12-01T12:00:00.000Z");
            assert.deepStrictEqual(res.body.items[119].timestamp, "2017-12-01T13:59:00.000Z");
            assert.deepStrictEqual(typeof(res.body.items[0].val), 'number');
            assert.deepStrictEqual(res.body.items.map((item) =>
                assert.isDeepEqual(typeof(item.val),'number') ).reduce( (p,n) => n*p) , 1 );
            assert.deepStrictEqual(res.body.items.map((item) => 0 < item.val && item.val < 1 )
                .reduce( (p,n) => n*p) , 1 );
            assert.deepStrictEqual(0 < res.body.items[0].val && res.body.items[0].val < 1, true);
        });
    });


    var endpointQR = '/search/range-query';

    it('should return 404 when the date range is not specified ', function () {
        return preq.get({
            uri: server.config.fsURL + endpointQR + "/wrongIndex"
        }).catch(function(res) {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 404 when date range is wrong ', function () {
        return preq.get({
            uri: server.config.fsURL + endpointQR + "/fakeTobIndex" + "/2017-12-01T12:00:00.000Z" + "/2016-12-01T20:00:00.000Z"
        }).catch(function(res) {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 200 with fake random data stored at given index within date range  ', function () {
        return preq.get({
            uri: server.config.fsURL + endpointQR + "/fakeTobIndex" + "/2017-12-01T12:00:00.000Z" + "/2017-12-01T20:00:00.000Z"})
        .then(function(res) {
            assert.deepStrictEqual(res.status, 200);
            assert.deepStrictEqual(res.body.items.length, 120);
            assert.deepStrictEqual(res.body.items[0].timestamp, "2017-12-01T12:00:00.000Z");
            assert.deepStrictEqual(res.body.items[119].timestamp, "2017-12-01T13:59:00.000Z");
            assert.deepStrictEqual(typeof(res.body.items[0].val), 'object');
            assert.deepStrictEqual(res.body.items
                .map((item) => item.val
                    .map((elem) => assert.isDeepEqual(typeof(elem),'number'))
                    .reduce( (p,n) => n*p ))
                .reduce( (p,n) => n*p )
            , 1);

            assert.deepStrictEqual(res.body.items
                .map((item) => item.val
                    .map((elem) => 0 < elem && elem < 1)
                    .reduce( (p,n) => n*p ))
                .reduce( (p,n) => n*p )
            , 1);
        });
    });



});
