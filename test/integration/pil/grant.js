const request = require('supertest');
const assert = require('assert');
const ids = require('../../data/ids');
const { userAtMultipleEstablishments } = require('../../data/profiles');
const workflowHelper = require('../../helpers/workflow');

describe('PIL application', () => {
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

  it('adds training to the task on submit', () => {
    const params = {
      model: 'pil',
      action: 'grant',
      id: ids.model.pil.inactive,
      changedBy: userAtMultipleEstablishments.id,
      data: {
        profileId: userAtMultipleEstablishments.id
      },
      establishmentId: 100
    };
    return request(this.workflow)
      .post('/')
      .send(params)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.ok(task.data.certificates);
        assert.equal(task.data.certificates[0].id, ids.model.certificate.colinJackson);
      });
  });
});
