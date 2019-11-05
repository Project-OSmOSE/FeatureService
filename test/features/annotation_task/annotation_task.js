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
 * ODE-FeatureService annotation tasks related api tests
 * Author: Erwan Keribin
 */
'use strict';


var assert = require('../../utils/assert.js');
var preq   = require('preq');
var server = require('../../utils/server.js');
var db     = require('../../../db');
var mockAuth   = require('../../utils/mockAuth.js');

describe('annotation-task endpoints', function () {
    this.timeout(20000);

    // Start server and DB before running tests
    before(async function () {
        await server.start();
        await db.init();
    });

    var dcMockToken = mockAuth.get_token('dc@test.ode');
    var ekMockToken = mockAuth.get_token('ek@test.ode');

    var endpointList = '/annotation-task/campaign/1/my-list';

    it('should return 200 with a list of annotation tasks', function () {
        return preq.get({
            uri: server.config.fsURL + endpointList,
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            assert.deepEqual(res.status, 200);
            assert.deepEqual(res.body.length, 1);
            let annotation_task = res.body[0];
            assert.deepStrictEqual(annotation_task.id, 1);
            assert.deepStrictEqual(annotation_task.status, 1);
            assert.deepStrictEqual(annotation_task.filename, 'A32C0000.WAV');
            assert.deepStrictEqual(annotation_task.dataset_name, 'SPMAuralA2010');
            assert.deepStrictEqual(annotation_task.start, '2010-08-19T17:00:00.000Z');
            assert.deepStrictEqual(annotation_task.end, '2010-08-19T17:45:00.000Z');
        });
    });

    it('should return 404 for user without annotation tasks', function () {
        return preq.get({
            uri: server.config.fsURL + endpointList,
            headers: { authorization: 'Bearer ' + dcMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 404 for unknown campaign', function () {
        return preq.get({
            uri: server.config.fsURL + endpointList.replace('1', '2'),
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    var endpointAudioAnnotator = '/annotation-task/1';

    it('should return 200 with audio annotator input', function () {
        return preq.get({
            uri: server.config.fsURL + endpointAudioAnnotator,
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            assert.deepEqual(res.status, 200);
            let refKeys = ['campaignId', 'annotationTags', 'boundaries', 'audioUrl', 'audioRate', 'spectroUrls', 'prevAnnotations', 'instructionsUrl'];
            assert.deepEqual(Object.keys(res.body.task), refKeys);
            let annotationTask = res.body.task;
            assert.deepStrictEqual(annotationTask.annotationTags.length, 13);
            assert.deepStrictEqual(annotationTask.audioUrl, 'http://localhost:7231/data.ode.org/v1/test/sound/A32C0000.WAV/play');
            assert.deepStrictEqual(annotationTask.audioRate, 32768);
            assert.deepStrictEqual(annotationTask.instructionsUrl, 'https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon');
            let boundaryKeys = ['startTime', 'endTime', 'startFrequency', 'endFrequency'];
            assert.deepEqual(Object.keys(annotationTask.boundaries), boundaryKeys);
            assert.deepStrictEqual(annotationTask.boundaries.endFrequency, 16384);
            assert.deepStrictEqual(annotationTask.prevAnnotations.length, 2);
            let prevAnnotation = annotationTask.prevAnnotations[0];
            let annotationKeys =  ['id', 'annotation'].concat(boundaryKeys);
            assert.deepStrictEqual(Object.keys(prevAnnotation), annotationKeys);
            assert.deepStrictEqual(prevAnnotation.annotation, 'Humpback Whale');
        });
    });

    it('should return 404 for wrong user', function () {
        return preq.get({
            uri: server.config.fsURL + endpointAudioAnnotator,
            headers: { authorization: 'Bearer ' + dcMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 404 for unknown task', function () {
        return preq.get({
            uri: server.config.fsURL + endpointAudioAnnotator.replace('1', '8'),
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    var endpointLegacyAudioAnnotator = '/annotation-task/legacy/1';

    it('should return 200 with legacy audio annontator input', function () {
        return preq.get({
            uri: server.config.fsURL + endpointLegacyAudioAnnotator,
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            assert.deepEqual(res.status, 200);
            let ref_tags = ['feedback', 'visualization', 'proximityTag', 'annotationTag', 'url', 'spectroUrl', 'alwaysShowTags'];
            assert.deepEqual(Object.keys(res.body.task), ref_tags);
            let annotation_task = res.body.task;
            assert.deepStrictEqual(annotation_task.annotationTag.length, 13);
            assert.deepStrictEqual(annotation_task.url, 'http://localhost:7231/data.ode.org/v1/test/sound/A32C0000.WAV/play');
        });
    });

    it('should return 404 for wrong user', function () {
        return preq.get({
            uri: server.config.fsURL + endpointLegacyAudioAnnotator,
            headers: { authorization: 'Bearer ' + dcMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 404 for unknown task', function () {
        return preq.get({
            uri: server.config.fsURL + endpointLegacyAudioAnnotator.replace('1', '8'),
            headers: { authorization: 'Bearer ' + ekMockToken }
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    var endpointPostAudioAnnotator = '/annotation-task/1/update-results';
    var postData = {
        task_start_time: 1537369230225,
        task_end_time: 1537369245631,
        visualization: "spectrogram",
        annotations: [
            {id: "wavesurfer_tdae5d2bk6", startTime: 11.30747744015285, endTime: 18.30524529729571, annotation: "Humpback Whale"},
            {id: "wavesurfer_nvs1n4igdug", startTime: 29.521763154438563, endTime: 39.83426315443856, annotation: "Killer Whale"}
        ],
        deleted_annotations: [
            {id: "wavesurfer_tug8klmnr1c", startTime: 45.358816725867136, endTime: 48.13783458301, annotation: "Sperm Whale"}
        ],
        annotation_events: [
            {event: "start-to-create", time: 1537369231193, region_id: "wavesurfer_tdae5d2bk6"},
            {event: "offline-create", time: 1537369231343, region_id: "wavesurfer_tdae5d2bk6", region_start: 11.30747744015285, region_end: 18.30524529729571},
            {event: "add-annotation-label", time: 1537369232286, region_id: "wavesurfer_tdae5d2bk6", region_label: "Humpback Whale"},
            {event: "start-to-create", time: 1537369232743, region_id: "wavesurfer_nvs1n4igdug"},
            {event: "offline-create", time: 1537369232867, region_id: "wavesurfer_nvs1n4igdug", region_start: 29.521763154438563, region_end: 39.83426315443856},
            {event: "add-annotation-label", time: 1537369233775, region_id: "wavesurfer_nvs1n4igdug", region_label: "Killer Whale"},
            {event: "start-to-create", time: 1537369237726, region_id: "wavesurfer_tug8klmnr1c"},
            {event: "offline-create", time: 1537369238059, region_id: "wavesurfer_tug8klmnr1c", region_start: 45.358816725867136, region_end: 48.13783458301},
            {event: "add-annotation-label", time: 1537369240998, region_id: "wavesurfer_tug8klmnr1c", region_label: "Sperm Whale"},
            {event: "delete", time: 1537369244237, region_id: "wavesurfer_tug8klmnr1c"}
        ],
        play_events: [
            {event: "click-play", time: 1537369235088, audioSourceTime: 0},
            {event: "click-pause", time: 1537369236846, audioSourceTime: 1.7647165532879825}
        ],
        final_solution_shown: false
    };

    it('should return 200 with correct result for good request', function () {
        return Promise.all([
            db.AnnotationResult.query().where('annotation_task_id', 1).select('id'),
            db.AnnotationSession.query().where('annotation_task_id', 1).count().first()
        ]).then(([old_results, old_sessions]) => {
            assert.deepEqual(old_results.map(r => {return r.id;}), [1, 2]);
            assert.deepEqual(old_sessions.count, 1);
            return preq.post({
                uri: server.config.fsURL + endpointPostAudioAnnotator,
                headers: {
                    'content-type': 'application/json',
                    authorization: 'Bearer ' + ekMockToken
                },
                body: postData
            }).then(res => {
                assert.deepEqual(res.status, 200);
                assert.deepEqual(res.body, { next_task: null, campaign_id: 1 });
                // Testing old results were overwritten and a session was added
                return Promise.all([
                    db.AnnotationResult.query().joinRelation('tag').where('annotation_task_id', 1).select('annotation_results.id', 'name'),
                    db.AnnotationSession.query().where('annotation_task_id', 1).count().first()
                ]).then(([new_results, new_sessions]) => {
                    assert.deepEqual(new_results.map(r => {return r.id;}), [10, 11]);
                    assert.deepEqual(new_results.map(r => {return r.name;}), ["Humpback Whale", "Killer Whale"]);
                    assert.deepEqual(new_sessions.count, 2);
                });
            });
        });
    });

    it('should return 400 for request missing annotations', function () {
        let badPostData = Object.assign({}, postData);
        delete badPostData.annotations;
        return preq.post({
            uri: server.config.fsURL + endpointPostAudioAnnotator,
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer ' + ekMockToken
            },
            body: badPostData
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 400);
        });
    });

    it('should return 404 for wrong user', function () {
        return preq.post({
            uri: server.config.fsURL + endpointPostAudioAnnotator,
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer ' + dcMockToken
            },
            body: postData
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    it('should return 404 for unknown task', function () {
        return preq.post({
            uri: server.config.fsURL + endpointPostAudioAnnotator.replace('1', '8'),
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer ' + ekMockToken
            },
            body: postData
        }).then(res => {
            throw 'Should not succeed'
        }).catch(res => {
            assert.deepEqual(res.status, 404);
        });
    });

    after(function() {
        db.close();
        server.stop();
    });

});
