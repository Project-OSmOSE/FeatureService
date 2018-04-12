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
 * ODE-FeatureService annotation functions
 * Author: Alexandre Degurse
 */

'use strict';

var HyperSwitch = require('hyperswitch');
var path = require('path');
var fileSystem = require('fs');
var fsUtil = require('../lib/FeatureServiceUtil');

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'annotation.yaml'));


class Annotation {
    constructor(options) {
        this.options = options;
        this.labelsBasePath = path.join(__dirname, "../resources/annotator/labels");
        this.tagsBasePath = path.join(__dirname, "../resources/annotator/tags");
    }

    listLabels() {
        return fsUtil.normalizeResponse({
            status: 200,
            body: fileSystem.readdirSync(this.labelsBasePath)
        });
    }

    getLabels(hyper, req) {

        var filePath = path.join(this.labelsBasePath, req.params.labelId);
        var resquestExists = fileSystem.existsSync(filePath);

        if (!resquestExists) {
            // return 404 if requested wav doesn't exist
            fsUtil.throwNotFoundIfNeeded("No such file");
        }

        var labels = fileSystem.readFileSync(filePath);

        return fsUtil.normalizeResponse({
            status: 200,
            body: JSON.parse(labels)
        });
    }

    listTags() {
        return fsUtil.normalizeResponse({
            status: 200,
            body: fileSystem.readdirSync(this.tagsBasePath)
        });
    }

    getTags(hyper, req) {

        var filePath = path.join(this.tagsBasePath, req.params.tagId);
        var resquestExists = fileSystem.existsSync(filePath);

        if (!resquestExists) {
            // return 404 if requested wav doesn't exist
            fsUtil.throwNotFoundIfNeeded("No such file");
        }

        var labels = fileSystem.readFileSync(filePath);

        return fsUtil.normalizeResponse({
            status: 200,
            body: JSON.parse(labels)
        });
    }

    addTags(hyper, req) {

        var filePath = path.join(this.tagsBasePath, req.params.tagId);
        var resquestExists = fileSystem.existsSync(filePath);

        var labels = req.body;

        if (resquestExists) {
            var existingLabels = JSON.parse(fileSystem.readFileSync(filePath));
            labels.annotation = Array.concat(req.body.annotations, existingLabels.annotations);
        }

        fileSystem.writeFileSync(filePath, JSON.stringify(labels));

        return fsUtil.normalizeResponse({
            status: 200
        });
    }
}

module.exports = function(options) {
    var annotation = new Annotation(options);

    return {
        spec: spec,
        operations: {
            getLabels: annotation.getLabels.bind(annotation),
            getTags: annotation.getTags.bind(annotation),
            listLabels: annotation.listLabels.bind(annotation),
            listTags: annotation.listTags.bind(annotation)
        }
    };
};