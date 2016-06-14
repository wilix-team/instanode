/**
 * Created by Dmitry on 03.06.2016
 */
'use strict';
const should = require('should');
const assert = require('assert');
const _ = require('lodash');

const InstaNode = require('./../index.js');

const TEST_USERNAME = process.env.USERNAME || '';
const TEST_PASSWORD = process.env.PASSWORD || '';

describe('Posting API', () => {
  let userSignature = {};
  let upload_id;
  let instanode = new InstaNode(TEST_USERNAME, TEST_PASSWORD);

  it('Should login to Instagram', (done) => {
    instanode.login((err, result) => {
      result.should.has.property('uuid');
      result.should.has.property('token');
      result.should.has.property('cookies');
      userSignature = result;
      done();
    });
  });
  
  it('Should upload photo', (done) => {
    instanode.uploadPhoto(__dirname + '/assets/test.jpg', {
      caption: 'Русский текст?',
      userSignature: userSignature
    }, (err, result) => {
      result.should.has.property('status');
      result.status.should.equal('ok');
      upload_id = result.upload_id;
      done();
    });
  });

  it('Should return recent activity', (done) => {
    instanode.getTimelineFeed(userSignature, (err, result) => {
      result.should.has.property('status');
      result.status.should.equal('ok');
      result.should.has.property('items');
      result.items[0].caption.text.should.equal('Русский текст?');
      done();
    });
  });

  it('Should return recent user activity', (done) => {
    instanode.getUserFeed(userSignature, null, (err, result) => {
      result.should.has.property('status');
      result.status.should.equal('ok');
      result.should.has.property('items');
      result.items[0].caption.text.should.equal('Русский текст?');
      done();
    });
  });
});