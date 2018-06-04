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
 * ODE-FeatureService authentication functions
 * Author: Erwan Keribin
 */
'use strict';
const jwt = require('jsonwebtoken');

var HyperSwitch = require('hyperswitch');
var path = require('path');
var fsUtil = require('../lib/FeatureServiceUtil');
var AuthFromHTPasswdFile = require('../lib/AuthFromHTPasswdFile');

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'authentication.yaml'));


class Authentication {
    // Class that handles authentification requests

    constructor(options) {
        this.options = options;
        this.authService = new AuthFromHTPasswdFile(options.htpasswd);
        this.secret = options.secret;
        this.tokenLifetime = options.token_lifetime;
    }

    authenticate(hyper, req) {
        var requestParams = req.body;
        var authorized = this.authService.authorize(requestParams.username, requestParams.password);

        if (authorized) {
            var token = jwt.sign(
              { aud: requestParams.username },
              this.secret,
              { expiresIn: this.tokenLifetime }
            );
            return fsUtil.normalizeResponse({
                status: 200,
                body: {
                    token: token
                }
            });
        } else {
            return fsUtil.authErrorResponse();
        }
    }

    verifyToken(hyper, req) {
        // Authorization header should be in the form of "Bearer TOKEN", we directly take the token
        var token;
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ').pop();
        } else {
            return fsUtil.authErrorResponse("Authorization header not found");
        }
        var res;
        try {
            res = jwt.verify(token, this.secret);
        } catch (err) {
            return fsUtil.authErrorResponse(err);
        }
        return fsUtil.normalizeResponse({
                status: 200,
                body: {
                    token: res
                }
            });
    }
}

module.exports = function(options) {
    var tst = new Authentication(options);

    return {
        spec: spec,
        operations: {
            authenticate: tst.authenticate.bind(tst),
            verifyToken: tst.verifyToken.bind(tst)
        }
    };
};
