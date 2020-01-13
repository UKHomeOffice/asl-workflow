const assert = require('assert');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/meta/default');

describe('Meta default hook', () => {

  before(() => {
    this.hook = hook;
  });

  beforeEach(() => {
    this.model = {
      data: {
        action: 'create',
        subject: 'abc123',
        data: {}
      },
      patch: sinon.stub()
    };
  });

  describe('Establishment id is set correctly for query builder', () => {

    it('copies the establishment id for establishment tasks', () => {
      this.model.data = {
        ...this.model.data,
        id: 8201,
        model: 'establishment'
      };

      return Promise.resolve()
        .then(() => this.hook({}, this.model))
        .then(() => {
          assert.ok(this.model.patch.calledOnce);
          assert.equal(this.model.patch.lastCall.args[0].establishmentId, 8201);
        });
    });

    it('copies the establishment id for place tasks', () => {
      this.model.data = {
        ...this.model.data,
        model: 'place',
        data: {
          establishmentId: 8201
        }
      };

      return Promise.resolve()
        .then(() => this.hook({}, this.model))
        .then(() => {
          assert.ok(this.model.patch.calledOnce);
          assert.equal(this.model.patch.lastCall.args[0].establishmentId, 8201);
        });
    });

    it('copies the establishment id for role tasks', () => {
      this.model.data = {
        ...this.model.data,
        model: 'role',
        data: {
          establishmentId: 8201
        }
      };

      return Promise.resolve()
        .then(() => this.hook({}, this.model))
        .then(() => {
          assert.ok(this.model.patch.calledOnce);
          assert.equal(this.model.patch.lastCall.args[0].establishmentId, 8201);
        });
    });

  });

});
