/*
 * ODE-FeatureService Authentification from file tests
 * Author: Joseph Allemandou
 */
'use strict';


var assert = require('assert');
var path = require('path');
var AuthFromHTPasswdFile = require('../../../lib/AuthFromHTPasswdFile');

describe('authentication-from-file lib', function () {

    var htpasswdFilePath = path.join(__dirname, '../../htpasswd');

    it('should fail with incorrect htpasswd path', function () {
        assert.throws(() => {
          new AuthFromHTPasswdFile('/fake/htpasswd/file/path');
        });
    });

    it('should authorize correct login/password', function () {
        let auth = new AuthFromHTPasswdFile(htpasswdFilePath);
        assert(auth.authorize('login', 'password'));
    });

    it('should NOT authorize incorrect login', function () {
        let auth = new AuthFromHTPasswdFile(htpasswdFilePath);
        assert.ifError(auth.authorize('alogin', 'password'));
    });

    it('should NOT authorize incorrect password', function () {
        let auth = new AuthFromHTPasswdFile(htpasswdFilePath);
        assert.ifError(auth.authorize('login', 'apassword'));
    });

});
