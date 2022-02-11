const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { inspector, licensing, user, userAtMultipleEstablishments } = require('../../data/profiles');
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
      .then(() => this.workflow.resetDBs())
      .then(() => this.workflow.seedTaskList());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('sets the subject to the current licence holder', () => {
    const params = {
      model: 'project',
      action: 'update',
      id: ids.model.project.transfer,
      changedBy: userAtMultipleEstablishments.id,
      data: {
        establishmentId: 100,
        licenceHolderId: user.id
      }
    };
    return request(this.workflow)
      .post('/')
      .send(params)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.data.subject.id, userAtMultipleEstablishments.id);
      });
  });

  it('autoresolves licence holder updates to stubs by an inspector', () => {
    this.workflow.setUser({ profile: inspector });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update',
        id: ids.model.project.updateStubLicenceHolder,
        changedBy: inspector.id,
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

  it('does not allow licence holder updates to stubs by a non-inspector', () => {
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
      .expect(403);
  });
});
