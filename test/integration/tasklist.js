const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const assert = require('assert');

const Taskflow = require('../../../');
const Case = require('../../../lib/db/case');
const ActivityLog = require('../../../lib/db/activity-log');

const reset = require('../utils/reset-database');

const settings = require('../../../knexfile').test;
const id = '538a42c9-be67-4289-a8be-550c09a78b78';

describe('/tasks', () => {

  beforeEach(() => {
    this.flow = Taskflow({ db: settings.connection });
    this.app = express();
    this.app.use(this.flow);
    return Promise.resolve()
      .then(() => {
        return reset();
      })
      .then(() => {
        return Case.query(this.flow.db)
          .insert({
            id,
            status: 'new',
            data: {
              test: 'data'
            }
          });
      });
  });
});
