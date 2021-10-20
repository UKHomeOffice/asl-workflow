const sinon = require('sinon');
const assert = require('assert');
const hook = require('../../../../lib/hooks/task-search');

let fetchStub;
let runHook;

describe('Task search hook', () => {
  beforeEach(() => {
    fetchStub = sinon.stub(fetch);
    runHook = hook({ search: 'http://localhost:8090', fetch: fetchStub });
    this.model = {
      id: 'a11f8dca-c694-470c-aeaa-400c6678b255',
      status: 'awaiting-endorsement',
      meta: {
        previous: 'new',
        next: 'awaiting-endorsement',
        user: {
          access_token: 'foo'
        }
      },
      onSettled: cb => {
        console.log('in onSettled stub');
        cb();
      }
    };
  });

  it('triggers a call to the search API to refresh the task index', () => {
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.equal(fetchStub.called, true);
      });
  });

});
