/*
 * Mocha Test setup
 * Copied Restbase
 */
'use strict';


// Run jshint as part of normal testing
require('mocha-jshint')();
// Run jscs as part of normal testing
require('mocha-jscs')();
// Run eslint as part of normal testing
require('mocha-eslint')(
    ['sys','lib','test','projects'],
    {
        formatter: 'compact',
        alwaysWarn: false,
        timeout: 1000,
        slow: 200,
        strict: true,
        contextName: 'eslint'
    }
);
