const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { user } = require('../../data/profiles');
const { withInspectorate } = require('../../../lib/flow/status');

const establishmentId = 102;

describe('Establishment grant', () => {
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

  it('sends grant requests to the inspectorate', () => {
    return request(this.workflow)
      .post('/')
      .send({
        model: 'establishment',
        action: 'grant',
        id: establishmentId,
        changedBy: user.id,
        data: {}
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, withInspectorate.id);
      });
  });

});
