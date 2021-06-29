const assert = require('assert');
const sinon = require('sinon');
const { withInspectorate, resolved, awaitingEndorsement, endorsed } = require('../../../../lib/flow/status');
const ids = require('../../../data/ids');
const { ntco, user, inspector } = require('../../../data/profiles');
const hook = require('../../../../lib/hooks/create/training-pil');
const Database = require('../../../helpers/asl-db');
const fixtures = require('../../../data');

const settings = require('../../../helpers/database-settings');

let messagerStub;
let changelogModel = { modelId: ids.model.trainingPil.noPil, state: { profileId: user.id } };

describe('Training PIL create hook', () => {
  before(() => {
    return Database(settings.db).init(fixtures.default, true)
      .then(models => {
        this.models = models;
      });
  });

  beforeEach(() => {
    messagerStub = sinon.stub().returns(changelogModel);
    this.hook = hook({ models: this.models, StubMessager: messagerStub });
    this.model = {
      data: {
        model: 'trainingPil',
        establishmentId: 100,
        action: 'create',
        data: {},
        changedBy: user.id
      },
      meta: {
        user: {
          profile: user
        }
      },
      setStatus: sinon.stub(),
      patch: sinon.stub()
    };
  });

  after(() => {
    this.models.destroy();
  });

  describe('create', () => {

    it('creates a new TrainingPil model, patches the id, and sends for endorsement', () => {
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(messagerStub.called);
          assert.ok(this.model.patch.calledWithMatch({ id: changelogModel.modelId, subject: user.id }));
          assert.ok(this.model.setStatus.calledWith(awaitingEndorsement.id));
        });
    });

    it('sets status to endorsed if submitted by an ntco', () => {
      this.model.data.changedBy = ntco.id;
      this.model.meta.user.profile = ntco;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledWith(endorsed.id));
        });
    });
  });

  describe('revoke', () => {
    beforeEach(() => {
      this.model.data.action = 'revoke';
      this.model.data.id = ids.model.trainingPil.active;
    });

    it('is set to withInspectorate if submitted by a user', () => {
      this.model.data.changedBy = user.id;
      this.model.meta.user.profile = user;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledWith(withInspectorate.id));
        });
    });

    it('is set to resolved if submitted by an inspector', () => {
      this.model.data.changedBy = inspector.id;
      this.model.meta.user.profile = inspector;
      return Promise.resolve()
        .then(() => this.hook(this.model))
        .then(() => {
          assert.ok(this.model.setStatus.calledWith(resolved.id));
        });
    });
  });
});
