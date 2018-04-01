/*
 * ODE-FeatureService Authentification tests
 * Author: Erwan Keribin
 */
'use strict';


var assert = require('../../utils/assert.js');
var preq   = require('preq');
var server = require('../../utils/server.js');


describe('authentication-related endpoints', function () {
    this.timeout(20000);

    //Start server before running tests
    before(function () { return server.start(); });

    var endpointAuthenticate = '/authentication/authenticate';

    it('should return 200 with a none empty string', function () {
        return preq.post({
            uri: server.config.fsURL + endpointAuthenticate,
            headers: { 'content-type': 'multipart/form-data'},
            body: { username: 'login', password: 'password' }
        }).then(function(res) {
            assert.deepEqual(res.status, 200);
            assert.notDeepStrictEqual(res.body.token, '');
        });
    });

    it('should return 401', function () {
        return preq.post({
            uri: server.config.fsURL + endpointAuthenticate,
            headers: { 'content-type': 'multipart/form-data'},
            body: { username: 'alogin', password: 'password' }
        }).then(function() {
          throw 'Should not succeed'
        }).catch(function(res) {
            assert.deepEqual(res.status, 401);
        });
    });

    it('should return 401', function () {
        return preq.post({
            uri: server.config.fsURL + endpointAuthenticate,
            headers: { 'content-type': 'multipart/form-data'},
            body: { username: 'login', password: 'apassword' }
        }).then(function() {
          throw 'Should not succeed'
        }).catch(function(res) {
            assert.deepEqual(res.status, 401);
        });
    });

    var endpointToken = '/authentication/verify-token';

    it('should return 401 without token', function () {
        return preq.get({
            uri: server.config.fsURL + endpointToken
        }).then(function() {
          throw 'Should not succeed'
        }).catch(function(res) {
            assert.deepEqual(res.status, 401);
        });
    });

    it('should return 401 with a wrong token', function () {
        return preq.get({
            uri: server.config.fsURL + endpointToken,
            headers: {
              authorization: 'Bearer WrongBearer'
            }
        }).then(function() {
          throw 'Should not succeed'
        }).catch(function(res) {
            assert.deepEqual(res.status, 401);
        });
    });

    it('should return 200 with a correct token', function () {
        return preq.post({
            uri: server.config.fsURL + endpointAuthenticate,
            headers: { 'content-type': 'multipart/form-data'},
            body: { username: 'login', password: 'password' }
        }).then(function(res) {
            assert.deepEqual(res.status, 200);
            preq.get({
                uri: server.config.fsURL + endpointToken,
                headers: {
                  authorization: 'Bearer ' + res.body.token
                }
            }).then(function(res) {
              assert.deepEqual(res.status, 200);
            });
        });
    });

});
