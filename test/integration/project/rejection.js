const { get } = require('lodash');
const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { inspector, asruAdmin } = require('../../data/profiles');
const ids = require('../../data/ids');

describe('Project amendment', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: inspector });
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

  it('cannot recover as inspector', () => {
    const payload = {
      status: 'recovered'
    };
    return request(this.workflow)
      .put(`/${ids.task.project.rejection}/status`)
      .send(payload)
      .expect(400)
      .then(res => {
        assert.equal(res.body.message, 'Invalid status change: rejected:recovered');
      });
  });

  it('can recover as asruadmin, autoForwarding to with-inspectorate', () => {
    this.workflow.setUser({ profile: asruAdmin });
    const payload = {
      status: 'recovered'
    };
    return request(this.workflow)
      .put(`/${ids.task.project.rejection}/status`)
      .send(payload)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, 'with-inspectorate');
        assert.equal(get(task, 'activityLog[0].eventName'), 'status:rejected:recovered');
      });
  });
});
