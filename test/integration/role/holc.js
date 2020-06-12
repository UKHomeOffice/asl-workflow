const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const ids = require('../../data/ids');
const { resolved } = require('../../../lib/flow/status');

describe('Add/remove HOLCs', () => {
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

  describe('create HOLC', () => {
    it('sets status to resolved', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'role',
          action: 'create',
          data: {
            type: 'holc'
          }
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, resolved.id);
        });
    });
  });

  describe('delete HOLC', () => {
    it('sets status to resolved', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'role',
          action: 'delete',
          id: ids.model.role.holc
        })
        .expect(200)
        .then(response => response.body.data)
        .then(task => {
          assert.equal(task.status, resolved.id);
        });
    });
  });

});
