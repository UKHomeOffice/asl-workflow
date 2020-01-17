const assert = require('assert');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/create/project');
const { autoResolved } = require('../../../../lib/flow/status');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');

const settings = {
  host: process.env.ASL_DATABASE_HOST || 'localhost',
  database: process.env.ASL_DATABASE_NAME || 'asl-test',
  user: process.env.ASL_DATABASE_USERNAME || 'postgres'
};

const LICENSING_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';
const INSPECTOR_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d2';
const PPLH_ID = 'f0835b01-00a0-4c7f-954c-13ed2ef7efd9';

describe('Project create hook', () => {
  before(() => {
    return Database(settings).init(fixtures.default, true)
      .then(models => {
        this.models = models;
        this.hook = hook({ models });
      });
  });

  beforeEach(() => {
    this.model = {
      data: {
        action: 'create',
        data: {}
      },
      setStatus: sinon.stub()
    };
  });

  after(() => {
    this.models.destroy();
  });

  describe('Update issue date', () => {
    beforeEach(() => {
      this.model.data.action = 'update-issue-date';
      this.model.data.id = 'fa73305f-125e-4e20-bc41-a9bf8cfb3558'; // Test project 4
    });

    it('autoresolves if submitted by a licensing officer', () => {
      this.model.data.changedBy = LICENSING_ID;

      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], autoResolved.id);
        });
    });

    it('throws an error if attempted by an inspector', () => {
      this.model.data.changedBy = INSPECTOR_ID;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .catch(err => {
          console.log(err); // todo
        });
    });

    it('throws an error if attempted by the licence holder', () => {
      this.model.data.changedBy = PPLH_ID;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .catch(err => {
          console.log(err); // todo
        });
    });

  });

});
