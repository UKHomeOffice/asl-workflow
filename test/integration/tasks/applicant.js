const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user, licensing, holc } = require('../../data/profiles');
const {
  returnedToApplicant,
  resubmitted,
  resolved,
  withNtco,
  withInspectorate,
  discardedByApplicant,
  recalledByApplicant,
  awaitingEndorsement,
  endorsed
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
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('creating tasks', () => {

    it('will not allow opening a task if there is an existing open task for the same id', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'place',
          action: 'update',
          id: ids.model.place.applied
        })
        .expect(400);
    });

    it('will allow opening a task if only closed tasks for the same id exist', () => {
      return request(this.workflow)
        .post('/')
        .send({
          model: 'place',
          action: 'update',
          id: ids.model.place.resolved,
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
          id: user.id,
          changedBy: user.id
        })
        .expect(200);
    });

    it('will update the task with asruInitiated: true if created by an ASRU user', () => {
      return request(this.workflow)
        .post('/')
        .send({
          data: {
            firstName: 'Colin'
          },
          model: 'profile',
          action: 'update',
          id: user.id,
          changedBy: licensing.id
        })
        .expect(200)
        .expect(response => {
          assert.equal(response.body.data.data.initiatedByAsru, true);
        });
    });

    it('will update the task with asruInitiated: false if created by an establishment user', () => {
      return request(this.workflow)
        .post('/')
        .send({
          data: {
            firstName: 'Colin'
          },
          model: 'profile',
          action: 'update',
          id: user.id,
          changedBy: user.id
        })
        .expect(200)
        .expect(response => {
          assert.equal(response.body.data.data.initiatedByAsru, false);
        });
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

    it('can resubmit a recalled ppl application', () => {
      return request(this.workflow)
        .put(`/${ids.task.project.grant}/status`)
        .send({
          status: resubmitted.id,
          meta: {
            version: ids.model.projectVersion.grant2,
            comment: 'resubmitting a pil'
          }
        })
        .expect(200)
        .then(response => {
          const task = response.body.data;
          assert.equal(task.status, awaitingEndorsement.id);

          this.workflow.setUser({ profile: holc });
          return request(this.workflow)
            .put(`/${task.id}/status`)
            .send({
              status: endorsed.id,
              meta: {
                comment: 'endorsed by pelh',
                awerb: true
              }
            })
            .expect(200);
        })
        .then(response => {
          assert.equal(response.body.data.status, withInspectorate.id);
          assert.equal(response.body.data.data.data.version, ids.model.projectVersion.grant2);
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

    it('can recall a ppl application submitted by someone else on their behalf', () => {
      return request(this.workflow)
        .put(`/${ids.task.project.submittedByHolc}/status`)
        .send({
          status: recalledByApplicant.id,
          meta: {
            comment: 'applicant recalling a PPL submitted by HOLC'
          }
        })
        .expect(200);
    });

    it('can discard a ppl application submitted by someone else on their behalf', () => {
      return request(this.workflow)
        .put(`/${ids.task.project.submittedByHolc}/status`)
        .send({
          status: discardedByApplicant.id,
          meta: {
            comment: 'applicant discarding a PPL submitted by HOLC'
          }
        })
        .expect(200);
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
