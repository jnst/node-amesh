'use strict';

var async = require('neo-async');
var image = require('./image');
var time = require('./time');

var mapUrl = 'http://tokyo-ame.jwa.or.jp/map/map000.jpg';
var mskUrl = 'http://tokyo-ame.jwa.or.jp/map/msk000.png';

/**
 * Save ame images
 * @param {string} dir - output directory
 * @param {string} name - output filename
 */
var save = exports.save = function(dir, name, callback) {
  image.mkdir('images');

  var getAmePath = function(done) {
    var current = time.format('YYYYMMDDHHmm');
    var ameUrl = 'http://tokyo-ame.jwa.or.jp/mesh/000/' + current + '.gif';
    image.save(dir + '/ame.gif', ameUrl, true, done);
  };
  var getMapPath = function(done) {
    image.save(dir + '/map.jpg', mapUrl, done);
  };
  var getMskPath = function(done) {
    image.save(dir + '/msk.png', mskUrl, done);
  };

  async.parallel({
    map: getMapPath,
    msk: getMskPath,
    ame: getAmePath
  }, function (err, paths) {
    if (err)
      return callback(err);

    var path = dir + name;
    image.compose(paths.map, paths.msk, paths.ame, path, function (err) {
      if (err)
        return callback(err);

      callback(null, path);
    });
  });
};

/**
 * Upload to imagur
 * @param {string=} clientId - imgur client id
 */
exports.upload = function(clientId, callback) {
  save('./images/', 'new.jpg', function(err, path) {
    image.upload(path, clientId, function(err, link) {
      if (err)
        return callback(err);

      callback(null, link);
    });
  });
};

/**
 * Get latest amesh time
 * @param {string} pattern - e.g. 'YYYY-MM-DD HH:mm:ss'
 */
exports.getTime = function(pattern) {
  return time.format(pattern);
};
