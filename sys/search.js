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

 * ODE-FeatureService Search functions
 * Author: Alexandre Degurse
 */
'use strict';

var HyperSwitch = require('hyperswitch');
var path = require('path');
var fsUtil = require('../lib/FeatureServiceUtil.js');
const HTTPError = HyperSwitch.HTTPError;
var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'search.yaml'));



class Search {
    // Class meant to provide internal endpoints able to query Elasticsearch

    constructor(options) {
        this.options = options;
        this.elasticSearch = options.elasticSearch;
    }

    static requestURI(elasticSearch) {
        // Generate an incomplete uri that points to Elasticsearch
        if (elasticSearch) {
            const scheme = (elasticSearch.scheme) ? `${elasticSearch.scheme}://` : '';
            const host = elasticSearch.host || '';
            const port = (elasticSearch.port) ? `:${elasticSearch.port}` : '';
            const path = elasticSearch.path || '';

            return `${scheme}${host}${port}${path}`;
        } else { // Fail with 500 if elasticSearch conf is not set
            throw new HTTPError({
                status: 500,
                body: {
                    type: 'internal_error',
                    detail: 'Elasticsearch configuration not set',
                }
            });
        }
    }

    buildRequest(index,query) {
        // Generate a http request to Elasticsearch
        return {
            uri: `${Search.requestURI(this.elasticSearch)}/${index}/_search`,
            headers: { "Content-Type": "application/json" },
            body: query
        };
    }

    getAll(hyper) {
        // Requests Elasticsearch with an empty search at a given index
        // ie: gets all documents at the default ode index

        var query = JSON.stringify({
            size: this.elasticSearch.maximumSize,
            query: {
                    match_all: {}
                }
        });

        return hyper.get(
                            this.buildRequest(this.elasticSearch.index,query))
            .then((res) => {
                            res.body = { items: res.body.hits.hits.map((hit) => hit._source) };
                            return res;
                        }
            )
            .catch(fsUtil.esError);
    }

    rangeQuery(hyper,req) {
        // Requests Elasticsearch with a time based range query on default ES index

        var query = JSON.stringify({
            size: this.elasticSearch.maximumSize,
            query: {
                range: {
                    timestamp: {
                        gte: req.params.from,
                        lt: req.params.to
                    }
                }
            },
            sort: [
                { timestamp: { order: "asc" } }
            ]
        });

        return hyper.get(
                            this.buildRequest(this.elasticSearch.index,query))

            .then((res) => {
                            res.body = { items: res.body.hits.hits.map((hit) => hit._source) };
                            return res;
                        })
            .catch(fsUtil.esError);
    }
}


module.exports = function(options) {
    var search = new Search(options);

    return {
        spec: spec,
        operations: {
            getAll: search.getAll.bind(search),
            rangeQuery: search.rangeQuery.bind(search)
        }
    };
};
