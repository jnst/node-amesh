'use strict';

var moment = require('moment');

/**
 * Adjust for amesh
 */
var getAdjustedMoment = exports.getAdjustedMoment = function() {
  var m = moment();
  var tail = m.format('mm').substring(1, 2);
  var num = ((1 <= +tail) && (+tail <= 5)) ? 0 : 5;
  m.add((num - tail), 'minutes');
  return m;
};

/**
 * Returns specified format string
 */
exports.format = function(pattern) {
  var m = getAdjustedMoment();
  return m.format(pattern);
};
