/**
 * Created by Dmitry on 03.06.2016
 */
'use strict';
const crypto = require('crypto');
const path = require('path');
const _ = require('lodash');
const uuid = require('uuid');
const request = require('request');
const error = require('./error');

const ig_sig_key = '9b3b9e55988c954e51477da115c58ae82dcae7ac01c735b4443a3c5923cb593a';
const ig_sig_key_ver = 4;
const agent = 'Instagram 8.0.0 Android (18/4.3; 320dpi; 720x1280; Xiaomi; HM 1SW; armani; qcom; en_US)';
const apiUrl = 'https://i.instagram.com/api/v1';

this.apiCall = function(endPoint, post, cookies, callback) {
  var params = {
    method: 'GET',
    url: apiUrl + endPoint,
    headers: {
      'Connection': 'close',
      'Accept': '*/*',
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie2': '$Version=1',
      'Accept-Language': 'en-US',
      'User-Agent': agent
    }
  };
  if (typeof post === 'function') {
    callback = post;
    post = null;
  }
  
  if (post) {
    params.method = 'POST';
    params.form = post;
  }
  
  if (typeof cookies === 'function') {
    callback = cookies;
    cookies = null;
  }
  if (cookies) {
    params.headers['Cookie'] = this.encodeCookies(cookies);
  }
  this._makeRequest(params, callback);
};

this.sendFile = function(endPoint, data, userSignature, callback) {
  var params = {
    method: 'POST',
    url: apiUrl + endPoint,
    formData: data,
    headers: {
      'User-Agent': agent,
      'Cookie': this.encodeCookies(userSignature.cookies),
      'Connection': 'close',
      'Accept': '*/*',
      'Cookie2': '$Version=1',
      'Accept-Language': 'en-US',
      'Accept-Encoding': 'gzip'
    }
  };
  this._makeRequest(params, callback);
};

this._makeRequest = function(params, callback) {
  return request(params, (err, resp, body) => {
    if (err) {
      return callback && callback(new error(error.err.network, err), null, resp);
    }
    let response = null;
    try {
      response = JSON.parse(body);
    } catch (e) {
      response = null;
    }
    return callback && callback(null, response, resp);
  });
};

this.encodeCookies = function(cookies) {
  let str = '';
  _.forEach(cookies, (value, key) => {
    str += key + '=' + value + '; ';
  });
  return str.substr(0, str.length - 2);
};

this.generateUUID = function(type) {
  const ud = uuid.v4();
  return type ? ud : ud.replace('-', '');
};

this.generateDeviceId = function(seed) {
  return 'android-' + crypto.createHash('md5').update(seed+Date.now()).digest('hex').substr(16);
};

this.generateSignature = function(data) {
  const hash = crypto.createHmac('sha256', ig_sig_key).update(data).digest('hex');
  return  'ig_sig_key_version=' + ig_sig_key_ver + '&' +
      'signed_body=' + hash + '.' + encodeURIComponent(data);
};

this.getMicroTime = function() {
  return Date.now();
};

this.unicodeJson = function(json) {
  json  = json.replace(/[\u007F-\uFFFF]/g, function(chr) {
    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
  });
  return json;
};

module.exports = this;