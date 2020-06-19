const assert = require('assert');
const sinon = require('sinon');
const { withLicensing, withInspectorate, resolved } = require('../../../../lib/flow/status');
const hook = require('../../../../lib/hooks/create/role');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');
const ids = require('../../../data/ids');

const settings = require('../../../helpers/database-settings');

const INSPECTOR_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d1';
const LICENSING_ID = 'a942ffc7-e7ca-4d76-a001-0b5048a057d2';
const PELH_ID = 'ae28fb31-d867-4371-9b4f-79019e71232f';

describe('Project create hook', () => {
  before(() => {
    return Database(settings.db).init(fixtures.default, true)
      .then(models => {
        this.models = models;
        this.hook = hook({ models });
      });
  });

  after(() => {
    this.models.destroy();
  });

  describe('revocation', () => {

    beforeEach(() => {
      this.model = {
        data: {
          action: 'revoke',
          model: 'project',
          id: ids.model.project.revoke,
          data: {},
          changedBy: PELH_ID
        },
        setStatus: sinon.stub()
      };
    });

    it('is sent to inspectorate if submitted by an establishment', () => {
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], withInspectorate.id);
        });
    });

    it('resolves if submitted by a licensing officer', () => {
      this.model.data.changedBy = LICENSING_ID;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledOnce);
          assert.equal(this.model.setStatus.lastCall.args[0], resolved.id);
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
});
