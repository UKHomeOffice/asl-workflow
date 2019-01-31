const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { holc } = require('../../data/profiles');
const {
  returnedToApplicant,
  resubmitted,
  resolved,
  withNtco,
  ntcoEndorsed,
  withdrawnByApplicant
} = require('../../../lib/flow/status');

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
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  after(() => {
    return workflowHelper.destroy();
  });

  describe('outstanding tasks', () => {

    it('can withdraw a returned pil application', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === returnedToApplicant.id))
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
            .expect(200);
        });
    });

    it('can resubmit a returned pil application', () => {
      return request(this.workflow)
        .get('/')
        .then(response => response.body.data.find(task => task.status === returnedToApplicant.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: resubmitted.id,
              meta: {
                meta: {
                  comment: 'resubmitting a pil'
                }
              }
            })
            .expect(200);
        });
    });

  });

  describe('in-progress tasks', () => {

    it('cannot withdraw a pil application they didn\'t create', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
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

    it('cannot endorse a submitted pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: ntcoEndorsed.id,
              meta: {
                meta: {
                  comment: 'endorsing a submitted pil'
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
