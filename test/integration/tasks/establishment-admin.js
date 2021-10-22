const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const {
  returnedToApplicant,
  resubmitted,
  resolved,
  withNtco,
  awaitingEndorsement,
  endorsed,
  discardedByApplicant,
  recalledByApplicant
} = require('../../../lib/flow/status');

const ids = require('../../data/ids');

describe('Establishment Admin', () => {

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

  describe('outstanding tasks', () => {

    it('can discard a returned pil application', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === returnedToApplicant.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: discardedByApplicant.id,
              meta: {
                comment: 'discarding a pil'
              }
            })
            .expect(200);
        });
    });

    it('can resubmit a returned pil application', () => {
      return request(this.workflow)
        .put(`/${ids.task.pil.grant}/status`)
        .send({
          status: resubmitted.id,
          meta: {
            comment: 'resubmitting a pil'
          }
        })
        .expect(200)
        .then(response => {
          const task = response.body.data;
          assert.equal(task.status, awaitingEndorsement.id);
        });
    });

  });

  describe('in-progress tasks', () => {

    it('cannot endorse a submitted pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: endorsed.id,
              meta: {
                comment: 'endorsing a submitted pil'
              }
            })
            .expect(400);
        });
    });

    it('can recall a pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: recalledByApplicant.id,
              meta: {
                comment: 'recalling a pil'
              }
            })
            .expect(200);
        });
    });

    it('can discard a pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: discardedByApplicant.id,
              meta: {
                comment: 'recalling a pil'
              }
            })
            .expect(200);
        });
    });

  });

  describe('completed tasks', () => {

    it('cannot discard a granted pil application', () => {
      return request(this.workflow)
        .get('/?progress=completed')
        .then(response => response.body.data.find(task => task.status === resolved.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: discardedByApplicant.id,
              meta: {
                comment: 'discarding a granted pil'
              }
            })
            .expect(400);
        });
    });

  });

});
