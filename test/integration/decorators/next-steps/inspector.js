const assert = require('assert');
const request = require('supertest');
const workflowHelper = require('../../../helpers/workflow');
const { inspector } = require('../../../data/profiles');
const ids = require('../../../data/ids');

describe('Next steps for inspector', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: inspector });
      });
  });

  before(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('Projects', () => {

    describe('Submitted', () => {

      it('Applications can be granted, returned or notified of intention to refuse', () => {
        const expectedSteps = ['resolved', 'intention-to-refuse', 'returned-to-applicant'];

        return request(this.workflow)
          .get(`/${ids.task.project.refuseSubmitted}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert.deepEqual(task.nextSteps.map(s => s.id), expectedSteps, 'Intention to refuse option should be available');
          });
      });

    });

    describe('Notified of intention to refuse', () => {

      it('Applications cannot be refused before the deadline has passed', () => {
        const expectedSteps = [];

        return request(this.workflow)
          .get(`/${ids.task.project.refuseDeadlineFutureWithUser}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert.deepEqual(task.nextSteps.map(s => s.id), expectedSteps, 'The task should not be actionable by inspectors');
          });
      });

      it('Applications can be refused even when with the user once the deadline has passed', () => {
        const expectedSteps = ['refused'];

        return request(this.workflow)
          .get(`/${ids.task.project.refuseDeadlinePassedWithUser}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert.deepEqual(task.nextSteps.map(s => s.id), expectedSteps, 'The task should be actionable by inspectors');
          });
      });

    });

    describe('Resubmitted', () => {

      it('Applications cannot be refused before the deadline has passed', () => {
        const expectedSteps = ['resolved', 'returned-to-applicant'];

        return request(this.workflow)
          .get(`/${ids.task.project.refuseDeadlineFutureWithAsru}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert.deepEqual(task.nextSteps.map(s => s.id), expectedSteps, 'The task should only be able to be granted or returned');
          });
      });

      it('Applications can be refused once the deadline has passed', () => {
        const expectedSteps = ['refused', 'resolved', 'returned-to-applicant'];

        return request(this.workflow)
          .get(`/${ids.task.project.refuseDeadlinePassedWithAsru}`)
          .expect(200)
          .then(response => response.body.data)
          .then(task => {
            assert.deepEqual(task.nextSteps.map(s => s.id), expectedSteps, 'The task should be actionable by inspectors');
          });
      });

    });

  });

});
