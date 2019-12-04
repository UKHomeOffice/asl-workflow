const assert = require('assert');
const uuid = require('uuid/v4');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const {
  returnedToApplicant,
  resubmitted,
  resolved,
  withNtco,
  withInspectorate,
  discardedByApplicant,
  recalledByApplicant
} = require('../../../lib/flow/status');

const ids = require('../../data/ids');

const PELH_ID = 'ae28fb31-d867-4371-9b4f-79019e71232f';

describe('Applicant', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: user });
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

  describe('creating tasks', () => {

    it('will not allow opening a task if there is an existing open task for the same id', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'place',
          action: 'update',
          id: ids.place.applied
        })
        .expect(400);
    });

    it('will allow opening a task if only closed tasks for the same id exist', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'place',
          action: 'update',
          id: ids.place.resolved,
          changedBy: PELH_ID
        })
        .expect(200);
    });

    it('will allow opening a task if only autoresolved tasks for the same id exist', () => {
      return request(this.workflow)
        .post('/')
        .send({
          data: {
            firstName: 'Colin'
          },
          model: 'profile',
          action: 'update',
          id: user.id
        })
        .expect(200);
    });

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

    it('can resubmit a recalled ppl application', () => {
      const version = uuid();
      return request(this.workflow)
        .put(`/${ids.project.grant}/status`)
        .send({
          status: resubmitted.id,
          meta: {
            version,
            comment: 'resubmitting a pil'
          }
        })
        .expect(200)
        .expect(response => {
          assert.equal(response.body.data.status, withInspectorate.id);
          assert.equal(response.body.data.data.data.version, version);
        });
    });

  });

  describe('in progress tasks', () => {

    it('can discard a submitted pil application', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .then(response => response.body.data.find(task => task.status === withNtco.id))
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

    it('can recall a submitted pil application', () => {
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
