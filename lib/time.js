'use strict';

var moment = require('moment');

/**
 * Adjust 5 minutes for amesh upload timing
 */
var getAdjustedMoment = exports.getAdjustedMoment = function() {
  var m = moment();
  var minutes = +m.format('mm').substring(1, 2);
  var num = (function() {
    if (minutes === 0) {
      return -5;
    } else if ((1 <= minutes) && (minutes <= 5)) {
      return 0;
    } else {
      return 5;
    }
  })();
  m.add((num - minutes), 'minutes');
  return m;
};

/**
 * Returns specified format string
 */
exports.format = function(pattern) {
  var m = getAdjustedMoment();
  return m.format(pattern);
};
