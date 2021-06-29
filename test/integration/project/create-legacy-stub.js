const request = require('supertest');
const assert = require('assert');
const workflowHelper = require('../../helpers/workflow');
const { inspector, user } = require('../../data/profiles');
const { autoResolved } = require('../../../lib/flow/status');

describe('Project create legacy stub', () => {
  before(() => {
    return workflowHelper.create()
      .then(workflow => {
        this.workflow = workflow;
      });
  });

  beforeEach(() => {
    return Promise.resolve()
      .then(() => this.workflow.resetDBs());
  });

  after(() => {
    return this.workflow.destroy();
  });

  it('prevents project stubs being created by external users', () => {
    this.workflow.setUser({ profile: user });

    return request(this.workflow)
      .post('/')
      .send({
        model: 'project',
        action: 'create',
        changedBy: user.id,
        data: {
          title: 'Digitised Paper Licence Stub',
          establishmentId: 8201,
          licenceHolderId: user.id,
          licenceNumber: 'XXX-123-XXX',
          issueDate: new Date('2018-08-15').toISOString(),
          isLegacyStub: true
        }
      })
      .expect(403)
      .then(response => response.body)
      .then(error => {
        assert.equal(error.message, 'Only ASRU inspectors can create legacy stubs');
      });
  });

  it('autoresolves creation of project stubs by an inspector', () => {
    this.workflow.setUser({ profile: inspector });

    const opts = {
      model: 'project',
      action: 'create',
      changedBy: inspector.id,
      data: {
        title: 'Digitised Paper Licence Stub',
        establishmentId: 8201,
        licenceHolderId: user.id,
        licenceNumber: 'XXX-123-XXX',
        issueDate: new Date('2018-08-15').toISOString(),
        isLegacyStub: true
      }
    };

    return request(this.workflow)
      .post('/')
      .send(opts)
      .expect(200)
      .then(response => response.body.data)
      .then(task => {
        assert.equal(task.status, autoResolved.id);
      });
  });

});
