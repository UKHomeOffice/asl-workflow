const request = require('supertest');
const assert = require('assert');
const ids = require('../../data/ids');
const { holc, inspector, licensing } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');

describe('PIL reinstate', () => {
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

  it('external users cannot reinstate a pil', () => {
    this.workflow.setUser({ profile: holc });
    const params = {
      model: 'pil',
      action: 'reinstate',
      id: ids.model.pil.active,
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

  it('licensing cannot reinstate a pil', () => {
    this.workflow.setUser({ profile: licensing });
    const params = {
      model: 'pil',
      action: 'reinstate',
      id: ids.model.pil.active,
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

  it('inspectors can reinstate a pil', () => {
    this.workflow.setUser({ profile: inspector });
    const params = {
      model: 'pil',
      action: 'reinstate',
      id: ids.model.pil.active,
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
