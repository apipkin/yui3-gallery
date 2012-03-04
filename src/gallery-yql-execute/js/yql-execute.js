/**
* This module Executes Javascript remotely.
* @module gallery-yql-execute.
*/

(function (Y) {
    'use strict';
    
    Y.YQL.execute = function (code, callbackFunction, params, opts) {
        Y.YQL("SELECT * FROM execute WHERE code = '" + code.replace(/'/g, '\\\'') + "'", callbackFunction, params, opts);
    };
    
    Y.YQL.execute.getResult = function (result) {
        result = result && result.query;
        result = result && result.results;
        return result && result.result;
    };
}(Y));