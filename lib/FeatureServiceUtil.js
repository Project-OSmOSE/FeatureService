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
 * ODE-FeatureService utility functions
 * Author: Joseph Allemandou
 */
'use strict';

var HyperSwitch = require('hyperswitch');
var HTTPError = HyperSwitch.HTTPError;

var FeatureServiceUtil = {};


/**
 * Response normalizer, making sure standard header values are set
 */
FeatureServiceUtil.normalizeResponse = function(res) {
    // Set header if not yet done
    res.headers = res.headers || {};
    res.headers['content-type'] = 'application/json; charset=utf-8';
    return res;
};

/**
 * Response in case of authorisation error
 */
FeatureServiceUtil.authErrorResponse = function(error = '') {
    var body = { type: 'https://mediawiki.org/wiki/HyperSwitch/errors/unauthorized' };
    if (error !== '') {
        body.detail = error;
    }
    var res = new HyperSwitch.HTTPError({
        status: 401,
        body: body
    });
    return res;
};


/**
 * HTTPError wrapper in case of invalid parameters
 *
 * Throws
 *   HTTPError with error messages if errors passed in is not empty
 */
FeatureServiceUtil.throwIfNeeded = function(errors) {
    if (errors && errors.length) {
        throw new HTTPError({
            status: 400,
            body: {
                type: 'invalid_request',
                detail: errors,
            }
        });
    }
};


/*
 * Function parsing a datetime passed as parameter (in UTC)
 * Expect either a date YYYY-MM-DD or a datetime YYYY-MM-DDTHH:MM:SS
 *
 * Returns
 *  The Date in UTC zone if parsing is successful, undefined in case of error.
 *
 */
FeatureServiceUtil.parseDatetime = function(datetime) {

    // Check for size before trying to parse:
    // Exists - YYYY-MM-DD / YYYY-MM-DDTHH:MM:SS
    if (datetime && datetime.length !== 10 && datetime.length !== 19) {
        return undefined;
    }

    // Don't fail in case of exception
    try {
        // Force using UTC zone (add Z to date)
        // Date.parse returns NaN in case of invalid date
        var ts = Date.parse(datetime + 'Z');
        // NaN is false for boolean test
        if (ts) {
            return new Date(ts);
        } else {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
};

FeatureServiceUtil.esError = function(e) {
    if (e.status === 404) {
        if (e.body.error.type === 'index_not_found_exception') {
            return {
                status: 404,
                body: {
                    type: 'index_not_found_exception',
                    detail: 'The Elasticsearch index doesnt exist'
                }
            };
        } else if (e.body.error.type === 'fixture_not_found') {
            return {
                status: 200,
                body: e
            };
        }
    } else if (e.status === 400 && e.body.error.type === 'search_phase_execution_exception') {
        return {
            status: 400,
            body: {
                type: 'search_phase_execution_exception',
                detail: 'The Elasticsearch failed to execute search'
            }
        };
    } else {
        return new HTTPError({
            status: 520,
            body: {
                type: 'unknown_error',
                detail: 'An unknown TypeError occured !',
            }
        });
    }
};


/**
 * Validator of from and to date-times as request-parameters
 *
 * Returns
 *   Nothing, but has set validated and parsed values in
 *   requestParams.fromDate and requestParams.toDate
 *
 * Throws
 *   Invalid date-times format and values exceptions as HTTPErrorx
 */
FeatureServiceUtil.validateFromAndTo = function(requestParams) {
    var errors = [];
    var invalidMessage = 'is invalid. Should be YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS';

    var fromDate = FeatureServiceUtil.parseDatetime(requestParams.from);
    var toDate = FeatureServiceUtil.parseDatetime(requestParams.to);

    // Validate values
    if (!fromDate) {
        errors.push('from date-time ' + invalidMessage);
    }
    if (!toDate) {
        errors.push('to date-time ' + invalidMessage);
    }

    if (fromDate > toDate) {
        errors.push('from date-time should be before to date-time');
    }

    // Throw error if needed
    FeatureServiceUtil.throwIfNeeded(errors);

    // Set new requestParams with valid date-times
    requestParams.fromDate = fromDate;
    requestParams.toDate = toDate;

};

module.exports = FeatureServiceUtil;
