const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { ntco } = require('../../data/profiles');
const {
  returnedToApplicant,
  resolved,
  withNtco,
  withLicensing,
  ntcoEndorsed,
  withdrawnByApplicant
} = require('../../../lib/flow/status');

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
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  describe('outstanding tasks', () => {

    it('can endorse a submitted pil application', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: ntcoEndorsed.id,
              meta: {
                meta: {
                  comment: 'endorsing a pil'
                }
              }
            })
            .expect(200);
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
                meta: {
                  comment: 'returning a pil'
                }
              }
            })
            .expect(200);
        });
    });

  });

  describe('in progress tasks', () => {

    it('cannot withdraw a pil application they didn\'t create', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withLicensing.id && task.data.model === 'pil'))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: withdrawnByApplicant.id,
              meta: {
                meta: {
                  comment: 'withdrawing a pil'
                }
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
                meta: {
                  comment: 'granting a pil'
                }
              }
            })
            .expect(400);
        });
    });

  });

  describe('completed tasks', () => {

    it('cannot withdraw a granted pil application', () => {
      return request(this.workflow)
        .get('/?progress=completed')
        .then(response => response.body.data.find(task => task.status === resolved.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: withdrawnByApplicant.id,
              meta: {
                meta: {
                  comment: 'withdrawing a granted pil'
                }
              }
            })
            .expect(400);
        });
    });

  });

});
