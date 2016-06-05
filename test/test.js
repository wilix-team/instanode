/**
 * Created by Dmitry on 03.06.2016
 */
'use strict';
const should = require('should');
const assert = require('assert');
const _ = require('lodash');

const InstaNode = require('./../index.js');

const TEST_USERNAME = 'trash7778';
const TEST_PASSWORD = 'azsxdc';

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
      caption: 'WHatIamDoing???',
      userSignature: userSignature
    }, (err, result) => {
      result.should.has.property('status');
      result.status.should.equal('ok');
      upload_id = result.upload_id;
      done();
    });
  });
});