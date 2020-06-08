const request = require('supertest');
const workflowHelper = require('../../helpers/workflow');
const profiles = require('../../data/profiles');

describe('Update conditions', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
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
        this.workflow.setUser({ profile: profiles.licensing });
        return request(this.workflow)
          .post('/')
          .send({
            model: 'establishment',
            action: 'update-conditions',
            id: 101,
            changedBy: profiles.licensing.id
          })
          .expect(200);
      });
  });

});
