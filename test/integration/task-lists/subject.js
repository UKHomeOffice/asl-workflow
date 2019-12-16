const request = require('supertest');

const assertTasks = require('../../helpers/assert-tasks');
const workflowHelper = require('../../helpers/workflow');

const { user } = require('../../data/profiles');

describe('Subject', () => {
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

  it('returns open tasks for the subject', () => {
    const expected = [
      'recalled ppl',
      'pil returned',
      'pil with ntco',
      'pil with licensing',
      'another with-ntco to test ordering',
      'project awaiting endorsement'
    ];
    return request(this.workflow)
      .get(`/profile-tasks/${user.id}`)
      .expect(200)
      .expect(response => {
        assertTasks(expected, response.body.data);
      });
  });

});
