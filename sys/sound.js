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
 * ODE-FeatureService sound functions
 * Author: Alexandre Degurse
 */

'use strict';

var HyperSwitch = require('hyperswitch');
var path = require('path');
var fileSystem = require('fs');
var stream = require('stream');
var fsUtil = require('../lib/FeatureServiceUtil');

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'sound.yaml'));


class Sound {
    constructor(options) {
        this.options = options;
    }

    getSound(hyper, req) {

        var filePath = path.join(__dirname, `../test/annotator/wav/${req.params.fileid}.wav`);
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
}

module.exports = function(options) {
    var sound = new Sound(options);

    return {
        spec: spec,
        operations: {
            getSound: sound.getSound.bind(sound)
        }
    };
};
