const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const assertTaskOrder = require('../../helpers/assert-task-order');
const workflowHelper = require('../../helpers/workflow');

const { user } = require('../../data/profiles');

describe('Applicant', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    this.workflow.setUser({ profile: user });

    return Promise.resolve()
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  describe('outstanding tasks', () => {

    it('sees tasks for which they are the subject', () => {
      const expected = [
        'pil returned',
        'Submitted by HOLC',
        'recalled ppl',
        'recalled project transfer'
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

    it('does not see any tasks at blocked establishments', () => {
      const blockedUser = {
        ...user,
        establishments: [
          { id: 100, role: 'blocked' }
        ]
      };

      this.workflow.setUser({ profile: blockedUser });

      const expected = [];

      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

  describe('in progress tasks', () => {

    it('sees tasks for which they are the subject', () => {
      const expected = [
        'pil with licensing',
        'pil with ntco',
        'another with-ntco to test ordering',
        'project awaiting endorsement',
        'ppl submitted by HOLC for user',
        'trainingPil with ntco'
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

    it('can filter by licence type of pil', () => {
      const pilTasks = [
        'pil with licensing',
        'pil with ntco',
        'another with-ntco to test ordering'
      ];

      return request(this.workflow)
        .get('/?progress=inProgress&filters%5Blicence%5D%5B0%5D=pil')
        .expect(200)
        .expect(response => {
          assertTasks(pilTasks, response.body.data);
        });
    });

  });

  describe('completed tasks', () => {

    it('sees tasks for which they are the subject', () => {
      const expected = [
        'granted pil',
        'discarded ppl',
        'profile update'
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

    it('can filter by licence type of ppl', () => {
      const projectTasks = [
        'discarded ppl'
      ];

      return request(this.workflow)
        .get('/?progress=completed&filters%5Blicence%5D%5B0%5D=ppl')
        .expect(200)
        .expect(response => {
          assertTasks(projectTasks, response.body.data);
        });
    });

  });

});
