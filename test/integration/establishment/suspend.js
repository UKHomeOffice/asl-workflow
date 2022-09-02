const request = require('supertest');
const assert = require('assert');
const { holc, inspector, licensing } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');

describe('Establishment suspend', () => {
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

  it('external users cannot suspend an establishment', () => {
    this.workflow.setUser({ profile: holc });
    const params = {
      model: 'establishment',
      action: 'suspend',
      id: 103,
      changedBy: holc.id,
      data: {}
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

  it('licensing cannot suspend an establishment', () => {
    this.workflow.setUser({ profile: licensing });
    const params = {
      model: 'establishment',
      action: 'suspend',
      id: 103,
      changedBy: licensing.id,
      data: {}
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

  it('inspectors can suspend a establishment', () => {
    this.workflow.setUser({ profile: inspector });
    const params = {
      model: 'establishment',
      action: 'suspend',
      id: 103,
      changedBy: inspector.id,
      data: {}
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
