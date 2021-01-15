const assert = require('assert');
const decorator = require('../../../lib/decorators/task-type');

describe('Task type', () => {

  it('if the action is transfer, then the type is transfer', () => {
    const task = {
      data: {
        action: 'transfer'
      }
    };
    assert.ok(decorator(task).type === 'transfer');
  });

  it('if the action is grant-ra, then the type is ra', () => {
    const task = {
      data: {
        action: 'grant-ra'
      }
    };
    assert.ok(decorator(task).type === 'ra');
  });

  it('if the action is revoke, then the type is revocation', () => {
    const task = {
      data: {
        action: 'revoke'
      }
    };
    assert.ok(decorator(task).type === 'revocation');
  });

  it('if action is grant, and the existing model status is not active, then the type is application', () => {
    const task = {
      data: {
        action: 'grant',
        model: 'pil',
        modelData: {
          status: 'inactive'
        }
      }
    };
    assert.ok(decorator(task).type === 'application');
  });

  it('otherwise defaults to amendment', () => {
    const task = {
      data: {
        action: 'grant',
        model: 'pil',
        modelData: {
          status: 'active'
        }
      }
    };
    assert.ok(decorator(task).type === 'amendment');

    const task2 = {
      data: {
        action: 'update',
        model: 'establishment',
        modelData: {
          status: 'active'
        }
      }
    };

    assert.ok(decorator(task2).type === 'amendment');
  });

});
