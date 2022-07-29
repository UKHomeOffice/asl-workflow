const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const assertTaskOrder = require('../../helpers/assert-task-order');
const workflowHelper = require('../../helpers/workflow');

const { holc } = require('../../data/profiles');

describe('Establishment Admin', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: holc });
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

  describe('outstanding tasks', () => {

    it('sees tasks for their establishment that require action', () => {
      const expected = [
        'pil returned',
        'place update returned',
        'Submitted by HOLC',
        'recalled ppl',
        'project awaiting endorsement',
        'recalled project transfer',
        'ppl with continuation',
        'project at Croydon',
        'holc owned project',
        'project application has deadline but returned',
        'ppl notified of intention to refuse - deadline not passed',
        'ppl notified of intention to refuse - deadline has passed'
      ];
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by newest first', () => {
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending');
        });
    });

  });

  describe('in-progress tasks', () => {

    it('sees tasks for their establishment', () => {
      const expected = [
        'pil with ntco',
        'ntco pil with ntco',
        'pil with licensing',
        'place update with licensing',
        'place update with inspector',
        'place update recommended',
        'place update recommend rejected',
        'establishment amendment',
        'another with-ntco to test ordering',
        'holc with multiple establishments',
        'project awaiting endorsement',
        'ppl submitted by HOLC for user',
        'project at Croydon',
        'holc pil with licensing',
        'trainingPil with ntco',
        'trainingPil at different establishment',
        'assigned to licensing',
        'assigned to inspector',
        'retrospective assessment submitted',
        'project application has deadline',
        'project amendment has deadline',
        'project application has deadline but RA',
        'project transfer in progress',
        'project amendment in progress',
        'project continuation in progress',
        'project revocation in progress',
        'project change of licence holder in progress',
        'ppl application submitted',
        'ppl notified of intention to refuse - resubmitted - deadline not passed',
        'ppl notified of intention to refuse - resubmitted - deadline has passed'
      ];
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by newest first', () => {
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending');
        });
    });

  });

  describe('completed tasks', () => {

    it('sees tasks for their establishment', () => {
      const expected = [
        'granted pil',
        'granted place update',
        'rejected pil',
        'discarded ppl',
        'discarded by asru',
        'profile update holc',
        'granted establishment update',
        'granted nio role at croydon',
        'project amendment initiated by asru',
        'legacy project amendment',
        'submitted rop',
        'Project amendment rejection'
      ];
      return request(this.workflow)
        .get('/?progress=completed')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

    it('sorts the tasks by newest first', () => {
      return request(this.workflow)
        .get('/?progress=completed')
        .expect(200)
        .expect(response => {
          assertTaskOrder(response.body.data, 'descending');
        });
    });

  });

});
