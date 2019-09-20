const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const ids = require('../../data/ids');
const assertTasks = require('../../helpers/assert-tasks');

describe('Tasks for a model', () => {
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

  describe('outstanding tasks', () => {

    it('sees tasks for a specific model id', () => {
      const expected = [
        'pil with ntco',
        'another with-ntco to test ordering'
      ];

      return request(this.workflow)
        .get(`/model-tasks/${ids.pil.applied}`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

});
