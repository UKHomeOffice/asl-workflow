const request = require('supertest');
const assert = require('assert');

const workflowHelper = require('../../helpers/workflow');

const { user } = require('../../data/profiles');

describe('Task list error states', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  before(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('returns an empty list if no profile is found', () => {
    this.workflow.setUser({ profile: null });
    return request(this.workflow)
      .get('/')
      .expect(200)
      .expect(response => {
        assert.deepEqual(response.body.data, []);
      });
  });

  it('returns an empty list if non-existent progress state is provided', () => {
    this.workflow.setUser({ profile: user });
    return request(this.workflow)
      .get('/?progress=junk')
      .expect(200)
      .expect(response => {
        assert.deepEqual(response.body.data, []);
      });
  });
});
