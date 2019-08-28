const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const workflowHelper = require('../../helpers/workflow');

const { licensing } = require('../../data/profiles');

describe('Licensing Officer', () => {

  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: licensing });
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

  describe('my tasks', () => {

    it('sees tasks with correct statuses and establishments', () => {
      const expected = [
        'place update with licensing - other establishment'
      ];
      return request(this.workflow)
        .get('/?progress=myTasks')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

  describe('outstanding tasks', () => {

    it('sees tasks with correct statuses', () => {
      const expected = [
        'pil with licensing',
        'place update with licensing',
        'place update with licensing - other establishment',
        'place update recommended',
        'place update recommend rejected'
      ];
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

  describe('in-progress tasks', () => {

    it('sees tasks that are with inspectors or returned to establishments', () => {
      const expected = [
        'pil returned',
        'place update with inspector',
        'conditions update',
        'Submitted by HOLC'
      ];
      return request(this.workflow)
        .get('/?progress=inProgress')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

  describe('completed tasks', () => {

    it('sees all closed tasks', () => {
      const expected = [
        'granted pil',
        'granted place update',
        'granted place update - other establishment',
        'rejected pil'
      ];
      return request(this.workflow)
        .get('/?progress=completed')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

});
