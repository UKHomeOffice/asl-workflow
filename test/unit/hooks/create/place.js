const assert = require('assert');
const sinon = require('sinon');
const { withLicensing, withInspectorate, autoResolved } = require('../../../../lib/flow/status');
const hook = require('../../../../lib/hooks/create/place');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');

const settings = require('../../../helpers/database-settings');

const INSPECTOR_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';
const LICENSING_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d2';
const PELH_ID = 'ae28fb31-d867-4371-9b4f-79019e71232f';

describe('Place create hook', () => {
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
        action: 'create',
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

  it('autoresolves if submitted by a licensing officer', () => {
    this.model.data.changedBy = LICENSING_ID;
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], autoResolved.id);
      });
  });

  it('is sent to licensing if submitted by an inspector', () => {
    this.model.data.changedBy = INSPECTOR_ID;
    return Promise.resolve()
      .then(() => this.hook(this.model))
      .then(() => {
        assert.ok(this.model.setStatus.calledOnce);
        assert.equal(this.model.setStatus.lastCall.args[0], withLicensing.id);
      });
  });
});
