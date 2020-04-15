const sinon = require('sinon');
const assert = require('assert');
const hook = require('../../../../lib/hooks/discard');

let messagerStub;
let runHook;

describe('Discard hook', () => {
  describe('Projects', () => {

    beforeEach(() => {
      messagerStub = sinon.stub();
      runHook = hook({ StubMessager: messagerStub });
      this.model = {
        data: {
          model: 'project',
          action: 'grant',
          data: {
            establishmentId: 8202
          },
          establishmentId: 8201,
          meta: {}
        }
      };
    });

    it('discards the draft if project grant task is discarded', () => {
      return Promise.resolve()
        .then(() => runHook(this.model))
        .then(() => {
          assert.equal(messagerStub.called, true);
          assert.deepEqual(messagerStub.getCall(0).args[0], { ...this.model.data, action: 'delete-amendments' });
        });
    });

    it('discards the draft if project transfer task is discarded', () => {
      this.model.data.action = 'transfer';
      return Promise.resolve()
        .then(() => runHook(this.model))
        .then(() => {
          assert.equal(messagerStub.called, true);
          assert.deepEqual(messagerStub.getCall(0).args[0], { ...this.model.data, action: 'delete-amendments' });
        });
    });
  });
});
