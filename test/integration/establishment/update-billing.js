const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const profiles = require('../../data/profiles');

describe('Update billing', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
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

  it('can be created even if an open task for the establishment exists', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'update-billing',
        id: 100,
        changedBy: profiles.asruAdmin.id
      })
      .expect(200);
  });

});
