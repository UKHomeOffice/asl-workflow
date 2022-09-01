const request = require('supertest');
const assert = require('assert');
const ids = require('../../data/ids');
const { holc, inspector, licensing } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');

describe('Project suspend', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
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

  it('external users cannot suspend a project', () => {
    this.workflow.setUser({ profile: holc });
    const params = {
      model: 'project',
      action: 'suspend',
      id: ids.model.project.suspend,
      changedBy: holc.id,
      data: {},
      establishmentId: 100
    };
    return request(this.workflow)
      .post('/')
      .send(params)
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only inspectors can suspend / reinstate licences');
      });
  });

  it('licensing cannot suspend a project', () => {
    this.workflow.setUser({ profile: licensing });
    const params = {
      model: 'project',
      action: 'suspend',
      id: ids.model.project.suspend,
      changedBy: licensing.id,
      data: {},
      establishmentId: 100
    };
    return request(this.workflow)
      .post('/')
      .send(params)
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only inspectors can suspend / reinstate licences');
      });
  });

  it('inspectors can suspend a project', () => {
    this.workflow.setUser({ profile: inspector });
    const params = {
      model: 'project',
      action: 'suspend',
      id: ids.model.project.suspend,
      changedBy: inspector.id,
      data: {},
      establishmentId: 100
    };
    return request(this.workflow)
      .post('/')
      .send(params)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.strictEqual(task.status, 'resolved', 'the task immediately resolves');
      });
  });
});
