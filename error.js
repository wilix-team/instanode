/**
 * Created by Dmitry on 03.06.2016
 */
'use strict';
const debug = true;

class ErrorWrapper {
  constructor (error, originalError) {
    this.error = error;
    this.originalError = originalError;
    if (process.env.DEBUG || debug) {
      console.error(error, originalError);
    }
  }
  getCode() {
    return this.error.code;
  }
  getMessage() {
    return this.error.description;
  }
}

ErrorWrapper.err = {
  internal: {
    code: 100,
    description: 'Internal module error'
  },
  network: {
    code: 101,
    description: 'Network problem'
  },
  api: {
    code: 102,
    description: 'Instagram error'
  },
  wrong_user_credentials: {
    code: 103,
    description: 'Wrong or empty user credentials'
  }
};

module.exports = ErrorWrapper;