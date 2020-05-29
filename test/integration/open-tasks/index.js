const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const ids = require('../../data/ids');
const assertTasks = require('../../helpers/assert-tasks');

describe('Open tasks for a model', () => {
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

  describe('open tasks', () => {

    it('returns all open tasks for a specific model id', () => {
      const expected = [
        'pil with ntco',
        'ntco pil with ntco',
        'another with-ntco to test ordering'
      ];

      return request(this.workflow)
        .get(`/open-tasks/${ids.model.pil.applied}`)
        .expect(200)
        .expect(response => {
          assertTasks(expected, response.body.data);
        });
    });

  });

});
