'use strict';

var fs = require('fs');
var gm = require('gm');
var async = require('async');
var request = require('request');
var moment = require('moment');
var imgur = require('imgur-upload');

/**
 * Save to local directory ('./images/current.jpg')
 */
var save = exports.save = function(callback) {

  var mkdir = function(done) {
    var path = 'images';
    fs.exists(path, function(exists) {
      if (exists)
        return done(null, path);

      fs.mkdir('images', function(err) {
        if (err)
          return done(err);

        done(null, path);
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

  var getImagePath = function(path, url, done) {
    fs.exists(path, function(exists) {
      if (exists)
        return done(null, path);

      request.get({ url: url, encoding: 'binary' }, function(err, response, body) {
        if (err)
          return done(err);

        fs.writeFile(path, body, 'binary', function(err) {
          if (err)
            return done(err);

          done(null, path);
        });
      });
    });
  };

  var getAmePath = function(done) {
    getImagePath('images/ame.gif', getAmeUrl(), done);
  };
  var getMapPath = function(done) {
    getImagePath('images/map.jpg', 'http://tokyo-ame.jwa.or.jp/map/map000.jpg', done);
  };
  var getMskPath = function(done) {
    getImagePath('images/msk.png', 'http://tokyo-ame.jwa.or.jp/map/msk000.png', done);
  };

  var compositeImages = function(paths, done) {
    var path = 'images/current.jpg';
    gm()
      .in('-page', '+0+0')
      .in(paths.map)
      .in('-page', '+0+0')
      .in(paths.msk)
      .in('-page', '+0+0')
      .in(paths.ame)
      .quality(90)
      .mosaic()
      .write(path, function(err) {
        if (err)
          callback(err);

        done(null, path);
      });
  };

  mkdir(function(err) {
    if (err)
      return console.log(err);

    async.parallel({
      map: getMapPath,
      msk: getMskPath,
      ame: getAmePath
    }, function(err, paths) {
      if (err)
        return callback(err);

      compositeImages(paths, callback);
    });
  });

};

/**
 * Upload to imagur
 */
exports.upload = function(clientId, callback) {
  save(function(err, path) {
    imgur.setClientID(clientId);
    imgur.upload(path, function(err, res) {
      if (err)
        return callback(err);

      var data = res.data;
      if (!data)
        return callback(new Error('Invalid Client Id'));

      callback(null, data.link);
    });
  });
};
