const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const {
  returnedToApplicant,
  resubmitted,
  resolved,
  withLicensing,
  withdrawnByApplicant
} = require('../../../lib/flow/status');

describe('Applicant', () => {
  beforeEach(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: user });
      })
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  afterEach(() => {
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
                comment: 'withdrawing a pil'
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
                comment: 'resubmitting a pil'
              }
            })
            .expect(200);
        });
    });

  });

  describe('in progress tasks', () => {

    it('can withdraw a submitted pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withLicensing.id))
        .then(task => {
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: withdrawnByApplicant.id,
              meta: {
                comment: 'withdrawing a pil'
              }
            })
            .expect(200);
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
                comment: 'withdrawing a granted pil'
              }
            })
            .expect(400);
        });
    });

  });

});
