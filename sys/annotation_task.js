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
 * ODE-FeatureService annotation tasks related functions
 * Author: Erwan Keribin
 */
'use strict';
const fs = require('fs');
var HyperSwitch = require('hyperswitch');
var path = require('path');
var fsUtil = require('../lib/FeatureServiceUtil');
const db = require('../db');

var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'annotation_task.yaml'));

class AnnotationTask {
    constructor(options) {
        this.options = options;
        this.spectroBasePath = path.join(__dirname, "../resources/annotator/png");
    }

    currentUserCampaignList(hyper, req) {
        let campaignID = req.params.id;
        return db.User.query().findOne('email', req.current_user).then(currentUser => {
            return db.AnnotationTask.query()
            .where('annotator_id', currentUser.id)
            .where('annotation_campaign_id', campaignID)
            .joinRelation('dataset_file')
            .join('audio_metadata', 'dataset_file.audio_metadata_id', 'audio_metadata.id')
            .join('datasets', 'dataset_file.dataset_id', 'datasets.id')
            .orderBy('annotation_tasks.id')
            .select(
                'annotation_tasks.id',
                'annotation_tasks.status',
                'filename',
                'name as dataset_name',
                'start',
                'end'
            ).then(annotationTasks => {
                if (annotationTasks.length === 0) {
                    return fsUtil.normalizeResponse({
                        status: 404,
                        body: {
                            detail: 'No tasks found for selected campaign and user'
                        }
                    });
                }
                return fsUtil.normalizeResponse({
                    status: 200,
                    body: annotationTasks
                });
            });
        });
    }

    audioAnnotator(hyper, req) {
        let taskID = req.params.id;
        return db.User.query().findOne('email', req.current_user).then(currentUser => {
            return db.AnnotationTask.query()
            .where('annotator_id', currentUser.id)
            .findOne('annotation_tasks.id', taskID)
            .joinRelation(
                '[dataset_file.[audio_metadata, dataset.[audio_metadata]], annotation_campaign]'
            )
            .select(
                'annotation_tasks.id',
                'filename',
                'annotation_set_id',
                'dataset_file.id as file_id',
                'dataset_file:audio_metadata.start as startTime',
                'dataset_file:audio_metadata.end as endTime',
                'dataset_file:audio_metadata.sample_rate_khz as fileSampleRate',
                'dataset_file:dataset:audio_metadata.sample_rate_khz as datasetSampleRate',
                'annotation_campaign_id as campaignId',
                'annotation_campaign.instructions_url as instructionsUrl'
            ).then(annotationTask => {
                if (!annotationTask) {
                    return fsUtil.normalizeResponse({
                        status: 404,
                        body: {
                            detail: 'Task not found for user'
                        }
                    });
                }
                let audioUrl = this.options.play_url.replace('$filename', annotationTask.filename);
                // Finding spectro tiles by readdirSync
                // Later we should either have this info in the DB or dynamically generate spectros
                let allSpectroUrls = [];
                let spectroFolder = path.join(this.spectroBasePath, String(annotationTask.file_id));
                try {
                    fs.readdirSync(spectroFolder).forEach(folder => {
                        let oneSpectroUrls = { urls: [] };
                        fs.readdirSync(path.join(spectroFolder, folder)).forEach(file => {
                            let url = this.options.spectro_url
                            + annotationTask.file_id + '/'
                            + encodeURIComponent(folder) + '/' // folder has special name
                            + file;
                            oneSpectroUrls.urls.push(url);
                        });
                        folder.split(' ').map(param => param.split('=')).forEach(([key, val]) => {
                            oneSpectroUrls[key] = val;
                        });
                        allSpectroUrls.push(oneSpectroUrls);
                    });
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        throw(Error('Annotation task is missing spectro data'));
                    }
                    throw(err);
                }
                // File sampleRate has priority over Dataset sampleRate
                let sampleRate = annotationTask.fileSampleRate || annotationTask.datasetSampleRate;
                return Promise.all([
                    db.AnnotationSet.query()
                    .findOne('id', annotationTask.annotation_set_id)
                    .then(annotationSet => {
                        return annotationSet.$relatedQuery('tags');
                    }),
                    annotationTask.$relatedQuery('results')
                    .joinRelation('tag')
                    .select(
                        'annotation_results.id',
                        'tag.name as annotation',
                        'startTime',
                        'endTime',
                        'startFrequency',
                        'endFrequency'
                    )
                ]).then(([tags, prevAnnotations]) => {
                    let res = {
                        status: 200,
                        body: {
                            task: {
                                campaignId: annotationTask.campaignId,
                                annotationTags: tags.map(tag => { return tag.name; }),
                                boundaries: {
                                    startTime: annotationTask.startTime,
                                    endTime: annotationTask.endTime,
                                    startFrequency: 0,
                                    endFrequency: sampleRate / 2
                                },
                                audioUrl: audioUrl,
                                audioRate: sampleRate,
                                spectroUrls: allSpectroUrls,
                                prevAnnotations: prevAnnotations
                            }
                        }
                    };
                    if (annotationTask.instructionsUrl) {
                        res.body.task.instructionsUrl = annotationTask.instructionsUrl;
                    }
                    return fsUtil.normalizeResponse(res);
                });
            });
        });
    }

    legacyAudioAnnotator(hyper, req) {
        let taskID = req.params.id;
        return db.User.query().findOne('email', req.current_user).then(currentUser => {
            return db.AnnotationTask.query()
            .where('annotator_id', currentUser.id)
            .findOne('annotation_tasks.id', taskID)
            .joinRelation('[dataset_file, annotation_campaign]')
            .select(
                'annotation_tasks.id',
                'filename',
                'annotation_set_id',
                'dataset_file.id as file_id'
            ).then(annotationTask => {
                if (!annotationTask) {
                    return fsUtil.normalizeResponse({
                        status: 404,
                        body: {
                            detail: 'Task not found for user'
                        }
                    });
                }
                let url = this.options.play_url.replace('$filename', annotationTask.filename);
                let spectroUrl = this.options.spectro_url + annotationTask.file_id;
                return db.AnnotationSet.query()
                .findOne('id', annotationTask.annotation_set_id)
                .then(annotationSet => {
                    return annotationSet.$relatedQuery('tags').then(tags => {
                        return fsUtil.normalizeResponse({
                            status: 200,
                            body: {
                                task: {
                                    feedback: 'none',
                                    visualization: 'spectrogram',
                                    proximityTag: [],
                                    annotationTag: tags.map(tag => { return tag.name; }),
                                    url: url,
                                    spectroUrl: spectroUrl,
                                    alwaysShowTags: true
                                }
                            }
                        });
                    });
                });
            });
        });
    }

    updateResults(hyper, req) {
        let taskID = req.params.id;
        return db.User.query().findOne('email', req.current_user).then(currentUser => {
            return db.AnnotationTask.query()
            .where('annotator_id', currentUser.id)
            .findOne('annotation_tasks.id', taskID)
            .joinRelation('annotation_campaign')
            .select(
                'annotation_tasks.id',
                'annotation_campaign.id as campaign_id',
                'annotation_set_id'
            )
            .then(annotationTask => {
                if (!annotationTask) {
                    return fsUtil.normalizeResponse({
                        status: 404,
                        body: {
                            detail: 'Task not found for user'
                        }
                    });
                }
                return db.AnnotationSet.query()
                .where('annotation_sets.id', annotationTask.annotation_set_id)
                .joinRelation('tags')
                .select('tags.id as id', 'tags.name as name')
                .then(tags => {
                    return tags.reduce((obj, tag) => {
                        obj[tag.name] = tag.id;
                        return obj;
                    }, {});
                }).then(tagsId => {
                    let results = req.body.annotations.map(annotation => {
                        let inputAnnotation = {
                            startTime: annotation.startTime,
                            endTime: annotation.endTime,
                            annotation_tag_id: tagsId[annotation.annotation],
                            annotation_task_id: annotationTask.id
                        };
                        if (annotation.startFrequency) {
                            inputAnnotation.startFrequency = annotation.startFrequency;
                        }
                        if (annotation.endFrequency) {
                            inputAnnotation.endFrequency = annotation.endFrequency;
                        }
                        return inputAnnotation;
                    });
                    let session = {
                        start: new Date(req.body.task_start_time),
                        end: new Date(req.body.task_end_time),
                        session_output: req.body,
                        annotation_task_id: annotationTask.id
                    };
                    return Promise.all([
                        annotationTask.$query().patch({ status: 2 }),
                        db.AnnotationSession.query().insert(session),
                        db.AnnotationResult.query()
                        .where('annotation_task_id', annotationTask.id)
                        .delete()
                        .then(() => {
                            return db.AnnotationResult.query().insert(results);
                        })
                    ]).then(() => {
                        return db.AnnotationTask.query()
                        .where('annotator_id', currentUser.id)
                        .where('annotation_campaign_id', annotationTask.campaign_id)
                        .where('status', '!=', 2)
                        .orderBy('id')
                        .findOne('id', '!=', annotationTask.id)
                        .then(nextAnnotationTask => {
                            if (!nextAnnotationTask) {
                                return fsUtil.normalizeResponse({
                                    status: 200,
                                    body: {
                                        next_task: null,
                                        campaign_id: annotationTask.campaign_id
                                    }
                                });
                            }
                            return fsUtil.normalizeResponse({
                                status: 200,
                                body: {
                                    next_task: nextAnnotationTask.id
                                }
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = function(options) {
    var task = new AnnotationTask(options);

    return {
        spec: spec,
        operations: {
            currentUserCampaignList: task.currentUserCampaignList.bind(task),
            audioAnnotator: task.audioAnnotator.bind(task),
            legacyAudioAnnotator: task.legacyAudioAnnotator.bind(task),
            updateResults: task.updateResults.bind(task)
        }
    };
};
