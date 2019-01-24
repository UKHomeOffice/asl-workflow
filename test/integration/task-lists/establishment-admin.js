const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const workflowHelper = require('../../helpers/workflow');

const { holc } = require('../../data/profiles');

describe('Establishment Admin', () => {
  beforeEach(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
        this.workflow.setUser({ profile: holc });
      })
      .then(() => workflowHelper.resetDBs())
      .then(() => workflowHelper.seedTaskList());
  });

  afterEach(() => {
    return workflowHelper.destroy();
  });

  describe('outstanding tasks', () => {

    it('sees tasks for their establishment that require action', () => {
      const expected = [ 'pil returned' ];
      return request(this.workflow)
        .get('/')
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

  describe('in-progress tasks', () => {

    it('sees tasks for their establishment', () => {
      const expected = [
        'pil with ntco',
        'pil with licensing',
        'place update with licensing',
        'place update with inspector',
        'place update recommended',
        'place update recommend rejected'
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

    it('sees tasks for their establishment', () => {
      const expected = [
        'granted pil',
        'granted place update',
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
