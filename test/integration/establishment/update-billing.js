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
    return Promise.resolve()
      .then(() => {
        return request(this.workflow)
          .post('/')
          .send({
            model: 'establishment',
            action: 'update',
            id: 101,
            data: {
              address: '123 nowhere street'
            },
            changedBy: profiles.holc101.id
          })
          .expect(200);
      })
      .then(() => {
        return request(this.workflow)
          .post('/')
          .send({
            model: 'establishment',
            action: 'update-billing',
            id: 101,
            changedBy: profiles.holc101.id
          })
          .expect(200);
      });
  });

});
