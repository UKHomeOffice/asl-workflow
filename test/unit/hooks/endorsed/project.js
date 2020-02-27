const assert = require('assert');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/endorsed/project');

const runHook = hook({ StubMessager: () => Promise.resolve() });

describe('Endorse project', () => {
  describe('Transfer', () => {
    beforeEach(() => {
      this.model = {
        data: {
          model: 'project',
          action: 'transfer',
          data: {
            establishmentId: 8202
          },
          establishmentId: 8201,
          meta: {}
        },
        patch: sinon.stub(),
        setStatus: sinon.stub()
      };
    });

    describe('Before establishment updated', () => {
      it('updates the establishmentId to the receiving establishment', () => {
        return Promise.resolve()
          .then(() => runHook(this.model))
          .then(() => {
            assert.equal(this.model.patch.lastCall.args[0].establishmentId, 8202);
          });
      });

      it('sets the status to awaiting-endorsement', () => {
        return Promise.resolve()
          .then(() => runHook(this.model))
          .then(() => {
            assert.equal(this.model.setStatus.lastCall.args[0], 'awaiting-endorsement');
          });
      });
    });

    describe('after establishment updated', () => {
      beforeEach(() => {
        this.model.data.establishmentId = 8202;
      });

      it('sets authority to Yes', () => {
        return Promise.resolve()
          .then(() => runHook(this.model))
          .then(() => {
            assert.deepEqual(this.model.patch.lastCall.args[0].meta, { authority: 'Yes' });
          });
      });

      it('sets the status to with-inspectorate', () => {
        return Promise.resolve()
          .then(() => runHook(this.model))
          .then(() => {
            assert.equal(this.model.setStatus.lastCall.args[0], 'with-inspectorate');
          });
      });
    });
  });
});
