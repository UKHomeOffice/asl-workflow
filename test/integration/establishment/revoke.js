const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, inspector, holc103 } = require('../../data/profiles');
const { resolved } = require('../../../lib/flow/status');

const establishmentId = 103;

describe('Establishment revoke', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: licensing });
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

  it('holcs cannot revoke establishment licences', () => {
    this.workflow.setUser({ profile: holc103 });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'revoke',
        id: establishmentId,
        changedBy: holc103.id,
        data: {}
      })
      .expect(400)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU inspectors can revoke establishments');
      });
  });

  it('inspectors can revoke establishment licences', () => {
    this.workflow.setUser({ profile: inspector });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'revoke',
        id: establishmentId,
        changedBy: inspector.id,
        data: {}
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, resolved.id);
      });
  });

  it('licensing cannot revoke establishment licences', () => {
    this.workflow.setUser({ profile: licensing });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'revoke',
        id: establishmentId,
        changedBy: licensing.id,
        data: {}
      })
      .expect(400)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU inspectors can revoke establishments');
      });
  });

});
