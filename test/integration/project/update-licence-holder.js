const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('Project update licence holder', () => {
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

  it('autoresolves licence holder updates to stubs by a licensing officer', () => {
    this.workflow.setUser({ profile: licensing });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update',
        id: ids.model.project.updateStubLicenceHolder,
        changedBy: licensing.id,
        data: {
          establishmentId: 100,
          licenceHolderId: user.id
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, autoResolved.id);
      });
  });
});
