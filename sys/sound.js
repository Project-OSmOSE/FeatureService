/* Copyright (C) 2017 Project-ODE
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
 * ODE-FeatureService sound services
 * Author: Alexandre Degurse
 */

'use strict';

var HyperSwitch = require('hyperswitch');
var path = require('path');
var fileSystem = require('fs');
const HTTPError = HyperSwitch.HTTPError;

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'sound.yaml'));


class Sound {
    constructor(options) {
        this.options = options;
        this.wavBasePath = "../resources/annotator/wav";
    }

    getSound(hyper, req) {

        var filePath = path.join(__dirname, this.wavBasePath, req.params.soundId);

        var resquestExists = fileSystem.existsSync(filePath);

        if (!resquestExists) {
            // return 404 if requested wav doesn't exist
            throw new HTTPError({
                status: 404,
                body: {
                    type: 'ENOENT',
                    detail: 'no such file',
                }
            });
        }

        var stat = fileSystem.statSync(filePath);

        var response = {
            status: 200,
            headers: {
                'content-type': 'audio/x-wav',
                'content-length': stat.size
            },
            body: fileSystem.createReadStream(filePath)
        };

        return response;
    }

    listSound() {

        var dirPath = path.join(__dirname, this.wavBasePath);

        var files = fileSystem.readdirSync(dirPath);

        var response = {
            status: 200,
            body: files
        };

        return response;
    }
}

module.exports = function(options) {
    var sound = new Sound(options);

    return {
        spec: spec,
        operations: {
            getSound: sound.getSound.bind(sound),
            listSound: sound.listSound.bind(sound)
        }
    };
};
