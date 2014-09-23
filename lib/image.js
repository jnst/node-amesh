'use strict';

var fs = require('fs');
var gm = require('gm');
var request = require('request');
var imgur = require('imgur-upload');
var config = require('./config');

/**
 * Make directory
 * @param {string} path - path
 */
exports.mkdir = function(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

/**
 * Save image to local directory
 * @param {string} path - path to save
 * @param {string} url - target url
 * @param {boolean=} overwrite - overwrite flag
 */
exports.save = function(path, url, overwrite, callback) {
  if (typeof overwrite === 'function') {
    callback = overwrite;
    overwrite = false;
  }
  if (!overwrite && fs.existsSync(path))
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
};

/**
 * Composite by GraphicsMagick
 */
exports.compose = function(mapPath, mskPath, amePath, outputPath, callback) {
  gm()
    .in('-page', '+0+0')
    .in(mapPath)
    .in('-page', '+0+0')
    .in(mskPath)
    .in('-page', '+0+0')
    .in(amePath)
    .quality(90)
    .mosaic()
    .write(outputPath, function(err) {
      if (err)
        callback(err);

      callback(null, true);
    });
};

/**
 * Upload to imgur
 * @param {string} path - image path
 * @param {string=} clientId - imgur client id
 */
exports.upload = function(path, clientId, callback) {
  if (typeof clientId === 'function') {
    callback = clientId;
    clientId = null;
  }

  clientId = clientId || config.imgur.client_id;
  if (clientId.length !== 15)
    return callback(new Error('Client Id will be 15 characters'));

  imgur.setClientID(clientId);
  imgur.upload(path, function(err, res) {
    if (err)
      return callback(err);

    var data = res.data;
    if (!data || !data.link)
      return callback(new Error('Invalid Client Id'));

    callback(null, data.link);
  });
};
