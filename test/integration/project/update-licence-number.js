const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { licensing, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');
const ids = require('../../data/ids');

describe('Project stub update licence number', () => {
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

  it('prevents licence number being updated by the licence holder', () => {
    this.workflow.setUser({ profile: user });
    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-licence-number',
        id: ids.model.project.updateLicenceNumber,
        changedBy: user.id,
        data: {
          licenceNumber: '9876-XYZ'
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU can change this project property');
      });
  });

  it('autoresolves licence number updates to stubs by a licensing officer', () => {
    this.workflow.setUser({ profile: licensing });
    const newLicenceNumber = '9876-XYZ';

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'update-licence-number',
        id: ids.model.project.updateLicenceNumber,
        changedBy: licensing.id,
        data: {
          licenceNumber: newLicenceNumber
        }
      })
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, autoResolved.id);
      });
  });

});
