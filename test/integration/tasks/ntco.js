const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { ntco } = require('../../data/profiles');
const {
  returnedToApplicant,
  resolved,
  withNtco,
  awaitingEndorsement,
  withLicensing,
  endorsed,
  discardedByApplicant
} = require('../../../lib/flow/status');

const ids = require('../../data/ids');

describe('NTCO', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: ntco });
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

    it('can endorse a submitted pil application', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === withNtco.id)) // legacy status
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: endorsed.id,
              meta: {
                comment: 'endorsing a pil'
              }
            })
            .expect(200);
        });
    });

    it('endorsing a pil application moves it to "with licensing"', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === awaitingEndorsement.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: endorsed.id,
              meta: {
                meta: {
                  comment: 'endorsing a pil'
                }
              }
            })
            .expect(response => {
              assert.equal(response.body.data.status, withLicensing.id);
            });
        });
    });

    it('can return a submitted pil application to the applicant', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: returnedToApplicant.id,
              meta: {
                comment: 'returning a pil'
              }
            })
            .expect(200);
        });
    });

    it('an ntco cannot endorse their own pil', () => {
      return request(this.workflow)
        .put(`/${ids.task.pil.withNtcoOwnPil}/status`)
        .send({
          status: endorsed.id,
          meta: {
            comment: 'ntco endorsing own pil'
          }
        })
        .expect(400)
        .then(response => response.body)
        .then(error => {
          assert(error.message.includes('Invalid status change'));
        });
    });

  });

  describe('in progress tasks', () => {

    it('cannot discard a pil application they didn\'t create', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withLicensing.id && task.data.model === 'pil'))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: discardedByApplicant.id,
              meta: {
                comment: 'discarding a pil'
              }
            })
            .expect(400);
        });
    });

    it('cannot grant an endorsed pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withLicensing.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: resolved.id,
              meta: {
                comment: 'granting a pil'
              }
            })
            .expect(400);
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
