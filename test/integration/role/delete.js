const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const ids = require('../../data/ids');
const { withInspectorate } = require('../../../lib/flow/status');

describe('Removing roles', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: holc });
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('assigns task to an inspector', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'role',
        action: 'delete',
        id: ids.model.role.nacwoClive,
        changedBy: holc.id
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, withInspectorate.id);
      });
  });

  it('includes model data on task', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'role',
        action: 'delete',
        id: ids.model.role.nacwoClive,
        changedBy: holc.id
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.data.modelData.type, 'nacwo');
      });
  });

});
