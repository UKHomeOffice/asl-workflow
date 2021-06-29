const assert = require('assert');
const sinon = require('sinon');
const { withInspectorate, resolved, autoResolved } = require('../../../../lib/flow/status');
const hook = require('../../../../lib/hooks/create/establishment');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');

const settings = require('../../../helpers/database-settings');

const INSPECTOR_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';
const LICENSING_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d2';
const PELH_ID = 'ae28fb31-d867-4371-9b4f-79019e71232f';

describe('Establishment create hook', () => {
  before(() => {
    return Database(settings.db).init(fixtures.default, true)
      .then(models => {
        this.models = models;
        this.hook = hook({ models });
      });
  });

  beforeEach(() => {
    this.model = {
      data: {
        action: 'update',
        model: 'establishment',
        data: {}
      },
      setStatus: sinon.stub()
    };
  });

  after(() => {
    this.models.destroy();
  });

  it('is sent to inspectorate if submitted by an establishment user', () => {
    this.model.data.changedBy = PELH_ID;
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], withInspectorate.id);
      });
  });

  it('is sent to an inspector if submitted by a licensing officer', () => {
    this.model.data.changedBy = LICENSING_ID;
    this.model.data.data.a = 'b';
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], withInspectorate.id);
      });
  });

  it('resolves if submitted by an inspector', () => {
    this.model.data.changedBy = INSPECTOR_ID;
    this.model.data.data.a = 'b';
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], resolved.id);
      });
  });

  it('autoresolves if fields to be updated are in the unlicenced whitelist', () => {
    this.model.data.changedBy = INSPECTOR_ID;
    this.model.data.data.cjsmEmail = 'aaa@bbb.com';
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], autoResolved.id);
      });
  });
});
