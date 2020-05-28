const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { ntco, user, licensing } = require('../../data/profiles');
const { awaitingEndorsement, resolved, endorsed } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('PIL Review', () => {
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

  it('resolves if submitted by an NTCO', () => {
    this.workflow.setUser({ profile: ntco });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'review',
        id: ids.model.pil.active,
        changedBy: ntco.id,
        establishmentId: 100
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, resolved.id);
      });
  });

  it('resolves if submitted by an asru user', () => {
    this.workflow.setUser({ profile: licensing });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'review',
        id: ids.model.pil.active,
        changedBy: licensing.id,
        establishmentId: 100
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, resolved.id);
      });
  });

  it('is sent for endorsement if submitted by the licence holder, then resolves when endorsed by NTCO', () => {
    this.workflow.setUser({ profile: user });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'pil',
        action: 'review',
        id: ids.model.pil.active,
        changedBy: user.id,
        establishmentId: 100
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, awaitingEndorsement.id);
        this.workflow.setUser({ profile: ntco });
        return request(this.workflow)
          .put(`/${task.id}/status`)
          .send({
            status: endorsed.id,
            meta: {
              comment: 'endorsing a transfer'
            }
          })
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert(task.status, resolved.id);
          });
      });
  });
});
