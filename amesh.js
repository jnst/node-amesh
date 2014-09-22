'use strict';

var fs = require('fs');
var gm = require('gm');
var async = require('async');
var request = require('request');
var moment = require('moment');

var mkdir = function(callback) {
  var path = 'images';
  fs.exists(path, function(exists) {
    if (exists)
      return callback(null, path);

    fs.mkdir('images', function(err) {
      if (err)
        return callback(err);

      callback(null, path);
    });
  });
};

var getAmeUrl = function() {
  var now = moment().format('YYYYMMDDHHmm');
  var head = now.substring(0, 11);
  var tail = now.substring(10, 11);
  tail = ((1 <= +tail) && (+tail <= 5)) ? 0 : 5;
  return 'http://tokyo-ame.jwa.or.jp/mesh/000/' + head + tail + '.gif';
};

var getImagePath = function(path, url, callback) {
  fs.exists(path, function(exists) {
    if (exists)
      return callback(null, path);

    request.get({ url: url, encoding: 'binary' }, function(err, response, body) {
      if (err)
        return callback(err);

      fs.writeFile(path, body, 'binary', function(err) {
        if (err)
          return callback(err);

        callback(null, path);
      });
    });
  });
};

var getAmePath = function(callback) {
  getImagePath('images/ame.gif', getAmeUrl(), callback);
};

var getMapPath = function(callback) {
  getImagePath('images/map.jpg', 'http://tokyo-ame.jwa.or.jp/map/map000.jpg', callback);
};

var getMskPath = function(callback) {
  getImagePath('images/msk.png', 'http://tokyo-ame.jwa.or.jp/map/msk000.png', callback);
};

mkdir(function(err) {
  if (err)
    return console.log(err);

  async.parallel({
    map: getMapPath,
    msk: getMskPath,
    ame: getAmePath
  }, function(err, results) {
    if (err)
      return console.log(err);

    gm()
      .in('-page', '+0+0')
      .in(results.map)
      .in('-page', '+0+0')
      .in(results.msk)
      .in('-page', '+0+0')
      .in(results.ame)
      .mosaic()
      .write('images/current.jpg', function(err) {
        if (err)
          console.log(err);
      });
  });
});
