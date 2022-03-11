const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { asruSuper } = require('../../data/profiles');
const { resolved } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('ROPs resubmission', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: asruSuper });
      })
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('can submit a rop', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'rop',
        action: 'submit',
        id: ids.model.rop.draft,
        changedBy: asruSuper.id,
        data: {
          projectId: ids.model.project.revoke
        },
        meta: {
          comment: 'first submission'
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepStrictEqual(task.status, resolved.id);
      });
  });

  it('can unsubmit a rop', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'rop',
        action: 'unsubmit',
        id: ids.model.rop.submitted,
        data: {
          projectId: ids.model.project.revoke
        },
        changedBy: asruSuper.id
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepStrictEqual(task.status, resolved.id);
      });
  });

  it('flags as a resubmission if the ROP was previously submitted', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'rop',
        action: 'submit',
        id: ids.model.rop.submitted,
        changedBy: asruSuper.id,
        data: {
          projectId: ids.model.project.revoke
        },
        meta: {
          comment: 'resubmission'
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.deepStrictEqual(task.status, resolved.id);
        assert.deepStrictEqual(task.data.meta.comment, 'resubmission', 'existing meta should not be overwritten');
        assert.deepStrictEqual(task.data.meta.resubmission, true, 'the task should be flagged as a resubmission');
      });
  });

});
