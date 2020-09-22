const assert = require('assert');
const sinon = require('sinon');
const { awaitingEndorsement, withInspectorate } = require('../../../../lib/flow/status');
const { user101 } = require('../../../data/profiles');
const ids = require('../../../data/ids');
const hook = require('../../../../lib/hooks/endorsed/training-pil');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');

const settings = require('../../../helpers/database-settings');

describe('Training PIL endorsed hook', () => {
  before(() => {
    return Database(settings.db).init(fixtures.default, true)
      .then(models => {
        this.models = models;
        this.hook = hook({ models: this.models });
      });
  });

  beforeEach(() => {
    this.model = {
      data: {
        model: 'trainingPil',
        action: 'grant',
        data: {},
        changedBy: user101.id,
        establishmentId: 101
      },
      meta: {
        user: {
          profile: user101
        }
      },
      setStatus: sinon.stub(),
      patch: sinon.stub()
    };
  });

  after(() => {
    this.models.destroy();
  });

  describe('grant', () => {
    it('goes for endorsement at pil holding establishment if user has active pil elsewhere', () => {
      this.model.data.id = ids.model.trainingPil.hasPil;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledWith(awaitingEndorsement.id));
          assert.ok(this.model.patch.calledWith({ establishmentId: 100 }));
        });
    });

    it('goes for to inspector if no pil held elsewhere', () => {
      this.model.data.id = ids.model.trainingPil.noPil;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledWith(withInspectorate.id));
        });
    });
  });
});
